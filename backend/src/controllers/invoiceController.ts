import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

const INVOICE_INCLUDE = {
  patient:  { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
  items:    { include: { service: { select: { id: true, name: true } } } },
  payments: true,
};

// Генерация номера счёта: INV-2026-00001
const generateInvoiceNumber = async (clinicId: string): Promise<string> => {
  const year  = new Date().getFullYear();
  const count = await prisma.invoice.count({ where: { clinicId } });
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
};

// ============================================================
// Invoices
// ============================================================

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { status, patientId, from, to } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId, isDeleted: false };
    if (status)    where.status    = status;
    if (patientId) where.patientId = patientId;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to)   where.createdAt.lte = new Date(to   as string);
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: INVOICE_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return R.paginated(res, invoices, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const invoice = await prisma.invoice.findFirst({
      where: { id, clinicId, isDeleted: false },
      include: {
        ...INVOICE_INCLUDE,
        appointment: { select: { id: true, startTime: true } },
        createdBy:   { select: { id: true, name: true } },
      },
    });

    if (!invoice) return R.error(res, 'Invoice not found', 404);
    return R.ok(res, invoice);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const clinicId      = req.user!.clinicId;
    const createdByUserId = req.user!.userId;
    const { patientId, appointmentId, items, dueDate } = req.body;

    if (!patientId)       return R.error(res, 'patientId is required');
    if (!items?.length)   return R.error(res, 'At least one item is required');

    // Считаем суммы
    let totalAmount    = 0;
    let discountAmount = 0;
    for (const item of items) {
      const lineTotal    = item.price * item.quantity;
      const lineDiscount = item.discount ?? 0;
      totalAmount    += lineTotal - lineDiscount;
      discountAmount += lineDiscount;
    }

    const invoiceNumber = await generateInvoiceNumber(clinicId);

    const invoice = await prisma.invoice.create({
      data: {
        clinicId,
        createdByUserId,
        patientId,
        appointmentId:  appointmentId || null,
        invoiceNumber,
        totalAmount,
        discountAmount,
        dueDate: dueDate ? new Date(dueDate) : null,
        items: {
          create: items.map((item: any) => ({
            serviceId: item.serviceId || null,
            name:      item.name,
            quantity:  item.quantity ?? 1,
            price:     item.price,
            discount:  item.discount ?? 0,
          })),
        },
      },
      include: INVOICE_INCLUDE,
    });

    return R.created(res, invoice);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.invoice.findFirst({
      where: { id, clinicId, isDeleted: false },
    });
    if (!existing) return R.error(res, 'Invoice not found', 404);
    if (existing.status === 'PAID') return R.error(res, 'Cannot edit a paid invoice');

    const { items, dueDate } = req.body;

    if (items?.length) {
      let totalAmount    = 0;
      let discountAmount = 0;
      for (const item of items) {
        totalAmount    += item.price * item.quantity - (item.discount ?? 0);
        discountAmount += item.discount ?? 0;
      }

      // Удаляем старые позиции и создаём новые
      await prisma.$transaction([
        prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
        prisma.invoice.update({
          where: { id },
          data: {
            totalAmount,
            discountAmount,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            items: {
              create: items.map((item: any) => ({
                serviceId: item.serviceId || null,
                name:      item.name,
                quantity:  item.quantity ?? 1,
                price:     item.price,
                discount:  item.discount ?? 0,
              })),
            },
          },
        }),
      ]);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: INVOICE_INCLUDE,
    });

    return R.ok(res, invoice);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const cancelInvoice = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.invoice.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Invoice not found', 404);
    if (existing.status === 'PAID') return R.error(res, 'Cannot cancel a paid invoice');

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: INVOICE_INCLUDE,
    });

    return R.ok(res, invoice);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Payments
// ============================================================

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { id }         = req.params; // invoiceId
    const clinicId       = req.user!.clinicId;
    const receivedByUserId = req.user!.userId;
    const { amount, method, balanceCashUsed = 0, balanceCardUsed = 0 } = req.body;

    if (!amount || !method) return R.error(res, 'amount and method are required');

    const invoice = await prisma.invoice.findFirst({
      where: { id, clinicId, isDeleted: false },
    });
    if (!invoice) return R.error(res, 'Invoice not found', 404);
    if (invoice.status === 'CANCELLED') return R.error(res, 'Invoice is cancelled');
    if (invoice.status === 'PAID')      return R.error(res, 'Invoice already paid');

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: id,
          amount,
          method,
          balanceCashUsed,
          balanceCardUsed,
          receivedByUserId,
        },
      });

      const newPaidAmount = Number(invoice.paidAmount) + Number(amount);
      const newStatus     = newPaidAmount >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIAL';

      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data:  { paidAmount: newPaidAmount, status: newStatus },
        include: INVOICE_INCLUDE,
      });

      return { payment, invoice: updatedInvoice };
    });

    return R.created(res, result);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const invoice = await prisma.invoice.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!invoice) return R.error(res, 'Invoice not found', 404);

    const payments = await prisma.payment.findMany({
      where: { invoiceId: id, isDeleted: false },
      include: { receivedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return R.ok(res, payments);
  } catch (err) {
    return R.serverError(res, err);
  }
};

import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

// ============================================================
// Lab Technicians
// ============================================================

export const getTechnicians = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const technicians = await prisma.labTechnician.findMany({
      where: { clinicId, isActive: true },
      include: { _count: { select: { orders: true } } },
      orderBy: { name: 'asc' },
    });
    return R.ok(res, technicians);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getTechnicianById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const technician = await prisma.labTechnician.findFirst({
      where: { id, clinicId },
      include: {
        priceItems: { where: { isActive: true }, orderBy: { name: 'asc' } },
        toothColors: { orderBy: { colorCode: 'asc' } },
      },
    });

    if (!technician) return R.error(res, 'Lab technician not found', 404);
    return R.ok(res, technician);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createTechnician = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, type, contactPerson, phone, email, address, notes } = req.body;
    if (!name) return R.error(res, 'Name is required');

    const technician = await prisma.labTechnician.create({
      data: { clinicId, name, type: type ?? 'LAB', contactPerson, phone, email, address, notes },
    });
    return R.created(res, technician);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateTechnician = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { name, type, contactPerson, phone, email, address, notes, isActive } = req.body;

    const existing = await prisma.labTechnician.findFirst({ where: { id, clinicId } });
    if (!existing) return R.error(res, 'Lab technician not found', 404);

    const technician = await prisma.labTechnician.update({
      where: { id },
      data: { name: name ?? undefined, type: type ?? undefined, contactPerson: contactPerson ?? undefined, phone: phone ?? undefined, email: email ?? undefined, address: address ?? undefined, notes: notes ?? undefined, isActive: isActive ?? undefined },
    });
    return R.ok(res, technician);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// Lab Price Items
export const upsertPriceItem = async (req: Request, res: Response) => {
  try {
    const { id: technicianId } = req.params;
    const clinicId = req.user!.clinicId;
    const { name, price } = req.body;

    if (!name || price === undefined) return R.error(res, 'name and price are required');

    const technician = await prisma.labTechnician.findFirst({ where: { id: technicianId, clinicId } });
    if (!technician) return R.error(res, 'Lab technician not found', 404);

    const item = await prisma.labPriceItem.create({
      data: { clinicId, technicianId, name, price },
    });
    return R.created(res, item);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Lab Orders
// ============================================================

export const getOrders = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { patientId, technicianId, status, from, to } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId, isDeleted: false };
    if (patientId) where.patientId = patientId;
    if (technicianId) where.technicianId = technicianId;
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const [orders, total] = await Promise.all([
      prisma.labOrder.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
          technician: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { stages: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.labOrder.count({ where }),
    ]);

    return R.paginated(res, orders, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const order = await prisma.labOrder.findFirst({
      where: { id, clinicId, isDeleted: false },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
        technician: { select: { id: true, name: true } },
        appointment: { select: { id: true, startTime: true } },
        createdBy: { select: { id: true, name: true } },
        stages: {
          include: {
            workItems: { include: { priceItem: { select: { id: true, name: true } } } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        invoices: true,
      },
    });

    if (!order) return R.error(res, 'Lab order not found', 404);
    return R.ok(res, order);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { patientId, technicianId, appointmentId, orderNumber, toothColor, dueDate, notes, stages } = req.body;

    if (!patientId || !technicianId) return R.error(res, 'patientId and technicianId are required');

    const order = await prisma.labOrder.create({
      data: {
        clinicId,
        patientId,
        technicianId,
        appointmentId: appointmentId || null,
        orderNumber: orderNumber || null,
        toothColor: toothColor || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        createdByUserId: userId,
        stages: stages && Array.isArray(stages) ? {
          create: stages.map((stage: any, idx: number) => ({
            name: stage.name,
            dueDate: stage.dueDate ? new Date(stage.dueDate) : null,
            sortOrder: stage.sortOrder ?? idx,
            notes: stage.notes || null,
            workItems: stage.workItems && Array.isArray(stage.workItems) ? {
              create: stage.workItems.map((wi: any) => ({
                priceItemId: wi.priceItemId || null,
                name: wi.name,
                quantity: wi.quantity ?? 1,
                price: wi.price,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        stages: {
          include: { workItems: true },
          orderBy: { sortOrder: 'asc' },
        },
        patient: { select: { id: true, firstName: true, lastName: true } },
        technician: { select: { id: true, name: true } },
      },
    });

    return R.created(res, order);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.labOrder.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Lab order not found', 404);

    const { status, toothColor, dueDate, notes, orderNumber } = req.body;

    const order = await prisma.labOrder.update({
      where: { id },
      data: {
        status: status ?? undefined,
        toothColor: toothColor ?? undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        notes: notes ?? undefined,
        orderNumber: orderNumber ?? undefined,
      },
    });

    return R.ok(res, order);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.labOrder.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Lab order not found', 404);

    await prisma.labOrder.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return R.ok(res, { id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// Complete a stage
export const completeStage = async (req: Request, res: Response) => {
  try {
    const { id, stageId } = req.params;
    const clinicId = req.user!.clinicId;

    const order = await prisma.labOrder.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!order) return R.error(res, 'Lab order not found', 404);

    const stage = await prisma.labOrderStage.update({
      where: { id: stageId },
      data: { completedAt: new Date() },
    });

    return R.ok(res, stage);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Lab Invoices (payments to technicians)
// ============================================================

export const getLabInvoices = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { technicianId, status } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId };
    if (technicianId) where.technicianId = technicianId;
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.labInvoice.findMany({
        where,
        include: {
          technician: { select: { id: true, name: true } },
          order: { select: { id: true, orderNumber: true } },
        },
        orderBy: { invoiceDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.labInvoice.count({ where }),
    ]);

    return R.paginated(res, invoices, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createLabInvoice = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { technicianId, orderId, invoiceNumber, totalAmount, invoiceDate, notes } = req.body;

    if (!technicianId || totalAmount === undefined || !invoiceDate) {
      return R.error(res, 'technicianId, totalAmount, and invoiceDate are required');
    }

    const invoice = await prisma.labInvoice.create({
      data: {
        clinicId,
        technicianId,
        orderId: orderId || null,
        invoiceNumber: invoiceNumber || null,
        totalAmount,
        invoiceDate: new Date(invoiceDate),
        notes: notes || null,
        createdByUserId: userId,
      },
      include: { technician: { select: { id: true, name: true } } },
    });

    return R.created(res, invoice);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const payLabInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { amount } = req.body;

    if (amount === undefined) return R.error(res, 'amount is required');

    const existing = await prisma.labInvoice.findFirst({ where: { id, clinicId } });
    if (!existing) return R.error(res, 'Lab invoice not found', 404);

    const newPaid = Number(existing.paidAmount) + Number(amount);
    const total = Number(existing.totalAmount);
    const newStatus = newPaid >= total ? 'PAID' : 'PARTIAL';

    const invoice = await prisma.labInvoice.update({
      where: { id },
      data: { paidAmount: newPaid, status: newStatus },
    });

    return R.ok(res, invoice);
  } catch (err) {
    return R.serverError(res, err);
  }
};

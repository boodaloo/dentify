import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as R from '../utils/response';

const prisma = new PrismaClient();

// GET /appointments/:id/visit — full visit data
export const getVisitData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const appointment = await prisma.appointment.findFirst({
      where: { id, clinicId, isDeleted: false },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, middleName: true, phone: true, birthDate: true, allergies: true } },
        doctor:  { select: { id: true, name: true } },
        branch:  { select: { id: true, name: true } },
        services: {
          include: { service: { select: { id: true, name: true, price: true, duration: true } } },
        },
        invoices: {
          where: { isDeleted: false },
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        medicalRecord: {
          include: { diagnoses: { include: { diagnosis: true } } },
        },
      },
    });

    if (!appointment) return R.notFound(res, 'Appointment not found');

    // Fetch dental chart for patient
    const dentalChart = await prisma.dentalChart.findMany({
      where: { clinicId, patientId: appointment.patientId },
      orderBy: { toothNumber: 'asc' },
    });

    return R.ok(res, { appointment, dentalChart });
  } catch (err) { return R.serverError(res, err); }
};

// PUT /appointments/:id/services — upsert appointment services + sync invoice
export const upsertAppointmentServices = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { services } = req.body;
    // services: [{ serviceId, quantity, price, discount }]

    const appointment = await prisma.appointment.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!appointment) return R.notFound(res, 'Appointment not found');

    await prisma.$transaction(async (tx) => {
      // Replace all services for this appointment
      await tx.appointmentService.deleteMany({ where: { appointmentId: id } });
      if (services?.length) {
        await tx.appointmentService.createMany({
          data: services.map((s: any) => ({
            appointmentId: id,
            serviceId:  s.serviceId,
            quantity:   s.quantity  ?? 1,
            price:      s.price,
            discount:   s.discount  ?? 0,
          })),
        });
      }

      // Auto-sync invoice: find or create pending invoice for this appointment
      const totalAmount = (services ?? []).reduce((sum: number, s: any) => {
        return sum + (Number(s.price) * (s.quantity ?? 1)) - Number(s.discount ?? 0);
      }, 0);

      const existingInvoice = await tx.invoice.findFirst({
        where: { appointmentId: id, clinicId, isDeleted: false, status: { not: 'CANCELLED' } },
      });

      if (existingInvoice) {
        // Update invoice total + replace items
        await tx.invoiceItem.deleteMany({ where: { invoiceId: existingInvoice.id } });
        if (services?.length) {
          await tx.invoiceItem.createMany({
            data: services.map((s: any) => ({
              invoiceId: existingInvoice.id,
              serviceId: s.serviceId,
              name:      s.name ?? s.serviceId,
              quantity:  s.quantity ?? 1,
              price:     s.price,
              discount:  s.discount ?? 0,
            })),
          });
        }
        await tx.invoice.update({
          where: { id: existingInvoice.id },
          data: { totalAmount, discountAmount: (services ?? []).reduce((d: number, s: any) => d + Number(s.discount ?? 0), 0) },
        });
      } else if (services?.length && totalAmount > 0) {
        // Create new invoice
        const invoice = await tx.invoice.create({
          data: {
            clinicId,
            patientId:      appointment.patientId,
            appointmentId:  id,
            totalAmount,
            discountAmount: (services ?? []).reduce((d: number, s: any) => d + Number(s.discount ?? 0), 0),
            paidAmount:     0,
            status:         'PENDING',
            createdByUserId: req.user!.userId,
          },
        });
        await tx.invoiceItem.createMany({
          data: services.map((s: any) => ({
            invoiceId: invoice.id,
            serviceId: s.serviceId,
            name:      s.name ?? s.serviceId,
            quantity:  s.quantity ?? 1,
            price:     s.price,
            discount:  s.discount ?? 0,
          })),
        });
      }
    });

    return R.ok(res, { ok: true });
  } catch (err) { return R.serverError(res, err); }
};

// PUT /appointments/:id/medical-record — upsert medical record
export const upsertMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { complaints, anamnesis, treatmentPlan, notes } = req.body;

    const appointment = await prisma.appointment.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!appointment) return R.notFound(res, 'Appointment not found');

    const existing = await prisma.medicalRecord.findFirst({ where: { appointmentId: id, clinicId } });

    const record = existing
      ? await prisma.medicalRecord.update({
          where: { id: existing.id },
          data: { complaints, anamnesis, treatmentPlan, notes },
        })
      : await prisma.medicalRecord.create({
          data: {
            clinicId,
            patientId:       appointment.patientId,
            appointmentId:   id,
            recordType:      'EXAMINATION',
            complaints,
            anamnesis,
            treatmentPlan,
            notes,
            createdByUserId: req.user!.userId,
          },
        });

    return R.ok(res, record);
  } catch (err) { return R.serverError(res, err); }
};

// POST /appointments/:id/complete — mark appointment as completed
export const completeAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    await prisma.appointment.updateMany({
      where: { id, clinicId, isDeleted: false },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    return R.ok(res, { ok: true });
  } catch (err) { return R.serverError(res, err); }
};

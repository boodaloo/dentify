import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

const APPOINTMENT_INCLUDE = {
  patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true,
    contacts: { where: { type: 'PHONE' as const, isPrimary: true } } } },
  doctor:  { select: { id: true, name: true, avatarUrl: true } },
  branch:  { select: { id: true, name: true } },
  room:    { select: { id: true, name: true } },
  services:{ include: { service: { select: { id: true, name: true } } } },
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { start, end, doctorId, branchId, status, q } = req.query;

    const where: any = { clinicId, isDeleted: false };
    if (start)    where.startTime = { ...where.startTime, gte: new Date(start as string) };
    if (end)      where.startTime = { ...where.startTime, lte: new Date(end   as string) };
    if (doctorId) where.doctorId  = doctorId;
    if (branchId) where.branchId  = branchId;
    if (status)   where.status    = status;
    if (q) {
      const qStr = (q as string).trim();
      where.patient = {
        OR: [
          { firstName: { contains: qStr, mode: 'insensitive' } },
          { lastName:  { contains: qStr, mode: 'insensitive' } },
          { contacts: { some: { value: { contains: qStr } } } },
        ],
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: APPOINTMENT_INCLUDE,
      orderBy: { startTime: q ? 'desc' : 'asc' },
      ...(q ? { take: 150 } : {}),
    });

    return R.ok(res, appointments);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const appt = await prisma.appointment.findFirst({
      where: { id, clinicId, isDeleted: false },
      include: { ...APPOINTMENT_INCLUDE, medicalRecord: true, files: true, invoices: true },
    });

    if (!appt) return R.error(res, 'Appointment not found', 404);
    return R.ok(res, appt);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const clinicId      = req.user!.clinicId;
    const createdByUserId = req.user!.userId;
    const { patientId, doctorId, branchId, roomId, startTime, endTime, notes, color, source } = req.body;

    if (!patientId || !doctorId || !branchId || !startTime || !endTime) {
      return R.error(res, 'patientId, doctorId, branchId, startTime, endTime are required');
    }

    const appt = await prisma.appointment.create({
      data: {
        clinicId,
        createdByUserId,
        patientId,
        doctorId,
        branchId,
        roomId:    roomId || null,
        startTime: new Date(startTime),
        endTime:   new Date(endTime),
        notes:     notes  || null,
        color:     color  || null,
        source:    source || 'MANUAL',
      },
      include: APPOINTMENT_INCLUDE,
    });

    // Auto-create DoctorSchedule for this day-of-week if none exists yet
    // This records that the doctor works on this weekday (fire-and-forget)
    if (doctorId) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const apptStart = new Date(startTime);
      const apptEnd   = new Date(endTime);
      const jsDay  = apptStart.getDay();                       // 0=Sun..6=Sat
      const schedDay = jsDay === 0 ? 6 : jsDay - 1;           // Mon=0 convention
      const startHH  = `${pad(apptStart.getHours())}:${pad(apptStart.getMinutes())}`;
      const endHH    = `${pad(apptEnd.getHours())}:${pad(apptEnd.getMinutes())}`;

      prisma.doctorSchedule.findUnique({
        where: { doctorId_branchId_dayOfWeek: { doctorId, branchId, dayOfWeek: schedDay } },
      }).then(existing => {
        if (!existing) {
          return prisma.doctorSchedule.create({
            data: { clinicId, doctorId, branchId, dayOfWeek: schedDay, startTime: startHH, endTime: endHH, isWorking: true },
          });
        }
      }).catch(() => {}); // non-critical — do not block response
    }

    return R.created(res, appt);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.appointment.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Appointment not found', 404);

    const { startTime, endTime, status, notes, color, roomId, cancellationReason } = req.body;

    const data: any = {};
    if (startTime)          data.startTime = new Date(startTime);
    if (endTime)            data.endTime   = new Date(endTime);
    if (status)             data.status    = status;
    if (notes !== undefined)data.notes     = notes;
    if (color !== undefined)data.color     = color;
    if (roomId !== undefined)data.roomId   = roomId;
    if (cancellationReason) data.cancellationReason = cancellationReason;

    // Автоматически простаавляем временные метки статусов
    if (status === 'CONFIRMED')  data.confirmedAt  = new Date();
    if (status === 'IN_PROGRESS')data.startedAt    = new Date();
    if (status === 'COMPLETED')  data.completedAt  = new Date();

    const appt = await prisma.appointment.update({ where: { id }, data, include: APPOINTMENT_INCLUDE });
    return R.ok(res, appt);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.appointment.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Appointment not found', 404);

    await prisma.appointment.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
    return R.ok(res, { id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

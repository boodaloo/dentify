import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

export const getPatients = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { search } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId, isDeleted: false };
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName:  { contains: search as string, mode: 'insensitive' } },
        { middleName:{ contains: search as string, mode: 'insensitive' } },
        { patientNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          contacts: { where: { isPrimary: true } },
          appointments: { where: { isDeleted: false }, orderBy: { startTime: 'desc' }, take: 1 },
        },
        orderBy: { lastName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);

    const items = patients.map((p) => ({
      ...p,
      phone:     p.contacts.find((c) => c.type === 'PHONE')?.value ?? null,
      email:     p.contacts.find((c) => c.type === 'EMAIL')?.value ?? null,
      lastVisit: p.appointments[0]?.startTime ?? null,
    }));

    return R.paginated(res, items, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const patient = await prisma.patient.findFirst({
      where: { id, clinicId, isDeleted: false },
      include: {
        contacts:   true,
        relatives:  true,
        insurances: { include: { company: true } },
        groupMemberships: { include: { group: true } },
        doctors:    { include: { specialization: true } },
        appointments: {
          where: { isDeleted: false },
          orderBy: { startTime: 'desc' },
          include: { branch: true, services: { include: { service: true } } },
        },
        dentalChart:   true,
        invoices:      { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } },
        treatmentPlans:{ where: { isDeleted: false } },
        balance:       true,
        bonuses:       true,
      },
    });

    if (!patient) return R.error(res, 'Patient not found', 404);
    return R.ok(res, patient);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const clinicId      = req.user!.clinicId;
    const createdByUserId = req.user!.userId;
    const { firstName, lastName, middleName, phone, email, birthDate, gender, allergies, notes, referralSource } = req.body;

    if (!firstName || !lastName) return R.error(res, 'First and last name are required');

    // Генерируем patientNumber
    const count = await prisma.patient.count({ where: { clinicId } });
    const patientNumber = `P-${String(count + 1).padStart(5, '0')}`;

    const patient = await prisma.patient.create({
      data: {
        clinicId,
        createdByUserId,
        patientNumber,
        firstName,
        lastName,
        middleName:    middleName    || null,
        birthDate:     birthDate     ? new Date(birthDate) : null,
        gender:        gender        || null,
        allergies:     allergies     || null,
        notes:         notes         || null,
        referralSource:referralSource|| null,
        contacts: {
          create: [
            ...(phone ? [{ type: 'PHONE' as const, value: phone, isPrimary: true, clinicId }] : []),
            ...(email ? [{ type: 'EMAIL' as const, value: email, isPrimary: true, clinicId }] : []),
          ],
        },
      },
      include: { contacts: true },
    });

    return R.created(res, patient);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;
    const { firstName, lastName, middleName, birthDate, gender, allergies, notes, snils, inn, referralSource } = req.body;

    const existing = await prisma.patient.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Patient not found', 404);

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        firstName,
        lastName,
        middleName:    middleName    ?? undefined,
        birthDate:     birthDate     ? new Date(birthDate) : undefined,
        gender:        gender        ?? undefined,
        allergies:     allergies     ?? undefined,
        notes:         notes         ?? undefined,
        snils:         snils         ?? undefined,
        inn:           inn           ?? undefined,
        referralSource:referralSource?? undefined,
      },
    });

    return R.ok(res, patient);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getUpcomingBirthdays = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const days = parseInt(req.query.days as string) || 7;

    const patients = await prisma.patient.findMany({
      where: { clinicId, isDeleted: false, birthDate: { not: null } },
      include: { contacts: { where: { type: 'PHONE', isPrimary: true } } },
      take: 2000,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const withDays = patients
      .map((p) => {
        const bd = new Date(p.birthDate!);
        let next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (next < today) next = new Date(today.getFullYear() + 1, bd.getMonth(), bd.getDate());
        const daysUntil = Math.round((next.getTime() - today.getTime()) / 86400000);
        const age = today.getFullYear() - bd.getFullYear();
        return {
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.contacts[0]?.value ?? null,
          birthDate: p.birthDate,
          daysUntil,
          age,
        };
      })
      .filter((p) => p.daysUntil >= 0 && p.daysUntil <= days)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return R.ok(res, withDays);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.patient.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Patient not found', 404);

    await prisma.patient.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
    return R.ok(res, { id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

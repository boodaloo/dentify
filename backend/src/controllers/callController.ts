import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

export const getCalls = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { page, limit, skip } = getPagination(req);
    const { search, date } = req.query as Record<string, string>;

    const where: any = { clinicId };

    if (date) {
      const d = new Date(date);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end   = new Date(d); end.setHours(23, 59, 59, 999);
      where.calledAt = { gte: start, lte: end };
    }

    if (search) {
      where.OR = [
        { phone: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName:  { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.call.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          user:    { select: { id: true, name: true } },
        },
        orderBy: { calledAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.call.count({ where }),
    ]);

    return R.paginated(res, items, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createCall = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { patientId, phone, direction, result, durationSeconds, notes, calledAt } = req.body;

    const call = await prisma.call.create({
      data: {
        clinicId,
        patientId:       patientId || null,
        userId:          req.user!.userId,
        phone,
        direction,
        result,
        durationSeconds: durationSeconds != null ? parseInt(durationSeconds) : null,
        notes:           notes || null,
        calledAt:        calledAt ? new Date(calledAt) : new Date(),
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        user:    { select: { id: true, name: true } },
      },
    });

    return R.created(res, call);
  } catch (err) {
    return R.serverError(res, err);
  }
};

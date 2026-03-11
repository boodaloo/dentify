import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { page, limit, skip } = getPagination(req);
    const { search } = req.query as Record<string, string>;

    const where: any = { clinicId };

    if (search) {
      where.OR = [
        { docType: { contains: search, mode: 'insensitive' } },
        { patient: { firstName: { contains: search, mode: 'insensitive' } } },
        { patient: { lastName:  { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.issuedDocument.findMany({
        where,
        include: {
          patient:   { select: { id: true, firstName: true, lastName: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { issuedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.issuedDocument.count({ where }),
    ]);

    return R.paginated(res, items, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { patientId, docType, docNumber, validTo, notes } = req.body;

    const doc = await prisma.issuedDocument.create({
      data: {
        clinicId,
        patientId:       patientId || null,
        createdByUserId: req.user!.userId,
        docType,
        docNumber:       docNumber || null,
        validTo:         validTo ? new Date(validTo) : null,
        notes:           notes || null,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return R.created(res, doc);
  } catch (err) {
    return R.serverError(res, err);
  }
};

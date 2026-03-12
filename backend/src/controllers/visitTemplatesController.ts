import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as R from '../utils/response';

const prisma = new PrismaClient();

const DEFAULT_DOCTOR_BLOCKS = [
  { type: 'NOTES',            order: 1, visible: true, required: false, label: 'Doctor Notes' },
  { type: 'DENTAL_CHART',     order: 2, visible: true, required: false, label: 'Dental Chart' },
  { type: 'SERVICES',         order: 3, visible: true, required: false, label: 'Services' },
  { type: 'INVOICE',          order: 4, visible: true, required: false, label: 'Invoice' },
  { type: 'NEXT_APPOINTMENT', order: 5, visible: true, required: false, label: 'Next Appointment' },
];

const DEFAULT_ADMIN_BLOCKS = [
  { type: 'SERVICES',         order: 1, visible: true, required: false, label: 'Services' },
  { type: 'INVOICE',          order: 2, visible: true, required: false, label: 'Invoice' },
  { type: 'NEXT_APPOINTMENT', order: 3, visible: true, required: false, label: 'Next Appointment' },
  { type: 'NOTES',            order: 4, visible: true, required: false, label: 'Notes' },
];

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    let templates = await prisma.visitFormTemplate.findMany({ where: { clinicId }, orderBy: { createdAt: 'asc' } });

    // Auto-seed defaults if none exist
    if (!templates.length) {
      await prisma.visitFormTemplate.createMany({
        data: [
          { clinicId, name: 'Doctor Visit', role: 'DOCTOR', isDefault: true, blocks: DEFAULT_DOCTOR_BLOCKS as any },
          { clinicId, name: 'Admin Visit',  role: 'ADMIN',  isDefault: true, blocks: DEFAULT_ADMIN_BLOCKS  as any },
        ],
      });
      templates = await prisma.visitFormTemplate.findMany({ where: { clinicId }, orderBy: { createdAt: 'asc' } });
    }

    return R.ok(res, templates);
  } catch (err) { return R.serverError(res, err); }
};

export const upsertTemplate = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { id } = req.params;
    const { name, role, isDefault, blocks } = req.body;

    const template = await prisma.visitFormTemplate.upsert({
      where: { id: id ?? '' },
      create: { clinicId, name, role, isDefault: !!isDefault, blocks },
      update: { name, role, isDefault: !!isDefault, blocks },
    });

    return R.ok(res, template);
  } catch (err) { return R.serverError(res, err); }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { id } = req.params;
    await prisma.visitFormTemplate.deleteMany({ where: { id, clinicId } });
    return R.ok(res, { ok: true });
  } catch (err) { return R.serverError(res, err); }
};

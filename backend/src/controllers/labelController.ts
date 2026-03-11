import { Request, Response } from 'express';
import prisma from '../prisma';
import * as R from '../utils/response';

// ── Clinic labels CRUD ────────────────────────────────────────────────────────

export const getLabels = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const labels   = await prisma.patientLabel.findMany({
      where:   { clinicId },
      orderBy: { name: 'asc' },
    });
    return R.ok(res, labels);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createLabel = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, color, textColor } = req.body;

    if (!name?.trim()) return R.error(res, 'name is required');

    const label = await prisma.patientLabel.create({
      data: { clinicId, name: name.trim(), color: color ?? '#14919B', textColor: textColor ?? '#ffffff' },
    });
    return R.created(res, label);
  } catch (err: any) {
    if (err?.code === 'P2002') return R.error(res, 'Label with this name already exists');
    return R.serverError(res, err);
  }
};

export const updateLabel = async (req: Request, res: Response) => {
  try {
    const clinicId     = req.user!.clinicId;
    const { labelId }  = req.params;
    const { name, color, textColor } = req.body;

    const existing = await prisma.patientLabel.findFirst({ where: { id: labelId, clinicId } });
    if (!existing) return R.error(res, 'Label not found', 404);

    const data: any = {};
    if (name      !== undefined) data.name      = name.trim();
    if (color     !== undefined) data.color     = color;
    if (textColor !== undefined) data.textColor = textColor;

    const label = await prisma.patientLabel.update({ where: { id: labelId }, data });
    return R.ok(res, label);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteLabel = async (req: Request, res: Response) => {
  try {
    const clinicId    = req.user!.clinicId;
    const { labelId } = req.params;

    const existing = await prisma.patientLabel.findFirst({ where: { id: labelId, clinicId } });
    if (!existing) return R.error(res, 'Label not found', 404);

    await prisma.patientLabel.delete({ where: { id: labelId } });
    return R.ok(res, { id: labelId });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ── Patient label assignments ─────────────────────────────────────────────────

export const getPatientLabels = async (req: Request, res: Response) => {
  try {
    const clinicId      = req.user!.clinicId;
    const { patientId } = req.params;

    const assignments = await prisma.patientLabelAssignment.findMany({
      where:   { clinicId, patientId },
      include: { label: true },
      orderBy: { assignedAt: 'asc' },
    });
    return R.ok(res, assignments.map(a => a.label));
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const assignLabel = async (req: Request, res: Response) => {
  try {
    const clinicId      = req.user!.clinicId;
    const { patientId } = req.params;
    const { labelId }   = req.body;

    if (!labelId) return R.error(res, 'labelId is required');

    const label = await prisma.patientLabel.findFirst({ where: { id: labelId, clinicId } });
    if (!label) return R.error(res, 'Label not found', 404);

    await prisma.patientLabelAssignment.upsert({
      where:  { patientId_labelId: { patientId, labelId } },
      create: { clinicId, patientId, labelId },
      update: {},
    });

    return R.ok(res, label);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const unassignLabel = async (req: Request, res: Response) => {
  try {
    const clinicId      = req.user!.clinicId;
    const { patientId, labelId } = req.params;

    const existing = await prisma.patientLabelAssignment.findFirst({
      where: { patientId, labelId, clinicId },
    });
    if (!existing) return R.error(res, 'Assignment not found', 404);

    await prisma.patientLabelAssignment.delete({ where: { id: existing.id } });
    return R.ok(res, { labelId });
  } catch (err) {
    return R.serverError(res, err);
  }
};

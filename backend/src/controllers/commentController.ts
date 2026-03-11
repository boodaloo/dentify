import { Request, Response } from 'express';
import prisma from '../prisma';
import * as R from '../utils/response';

export const getComments = async (req: Request, res: Response) => {
  try {
    const clinicId   = req.user!.clinicId;
    const { patientId } = req.params;

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const comments = await prisma.patientComment.findMany({
      where:   { clinicId, patientId },
      include: { author: { select: { id: true, name: true } } },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    return R.ok(res, comments);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const clinicId   = req.user!.clinicId;
    const authorId   = req.user!.userId;
    const { patientId } = req.params;
    const { content, isPinned } = req.body;

    if (!content?.trim()) return R.error(res, 'content is required');

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const comment = await prisma.patientComment.create({
      data:    { clinicId, patientId, authorId, content: content.trim(), isPinned: isPinned ?? false },
      include: { author: { select: { id: true, name: true } } },
    });

    return R.created(res, comment);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { patientId, commentId } = req.params;
    const { content, isPinned } = req.body;

    const existing = await prisma.patientComment.findFirst({ where: { id: commentId, patientId, clinicId } });
    if (!existing) return R.error(res, 'Comment not found', 404);

    const data: any = {};
    if (content   !== undefined) data.content  = content.trim();
    if (isPinned  !== undefined) data.isPinned = isPinned;

    const comment = await prisma.patientComment.update({
      where:   { id: commentId },
      data,
      include: { author: { select: { id: true, name: true } } },
    });

    return R.ok(res, comment);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { patientId, commentId } = req.params;

    const existing = await prisma.patientComment.findFirst({ where: { id: commentId, patientId, clinicId } });
    if (!existing) return R.error(res, 'Comment not found', 404);

    await prisma.patientComment.delete({ where: { id: commentId } });
    return R.ok(res, { id: commentId });
  } catch (err) {
    return R.serverError(res, err);
  }
};

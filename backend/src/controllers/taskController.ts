import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { status, priority, assignedToId, patientId } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId, isDeleted: false };
    if (status) where.status = status as string;
    if (priority) where.priority = priority as string;
    if (assignedToId) where.assignedToId = assignedToId as string;
    if (patientId) where.patientId = patientId as string;

    const [tasks, total] = await Promise.all([
      prisma.clinicTask.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, name: true, avatarUrl: true } },
          createdBy: { select: { id: true, name: true } },
          patient: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.clinicTask.count({ where }),
    ]);

    return R.paginated(res, tasks, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const task = await prisma.clinicTask.findFirst({
      where: { id, clinicId, isDeleted: false },
      include: {
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
        createdBy: { select: { id: true, name: true } },
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!task) return R.notFound(res, 'Task not found');
    return R.ok(res, task);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { title, description, priority, dueDate, assignedToId, patientId, appointmentId } = req.body;

    if (!title) return R.error(res, 'Title is required');

    const task = await prisma.clinicTask.create({
      data: {
        clinicId,
        title,
        description: description || undefined,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedToId: assignedToId || undefined,
        createdByUserId: userId,
        patientId: patientId || undefined,
        appointmentId: appointmentId || undefined,
      },
      include: {
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
        createdBy: { select: { id: true, name: true } },
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return R.created(res, task);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.clinicTask.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.notFound(res, 'Task not found');

    const { title, description, priority, status, dueDate, assignedToId, patientId, appointmentId } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'DONE' && !existing.completedAt) {
        updateData.completedAt = new Date();
      } else if (status !== 'DONE') {
        updateData.completedAt = null;
      }
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;
    if (patientId !== undefined) updateData.patientId = patientId || null;
    if (appointmentId !== undefined) updateData.appointmentId = appointmentId || null;

    const task = await prisma.clinicTask.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
        createdBy: { select: { id: true, name: true } },
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return R.ok(res, task);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.clinicTask.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.notFound(res, 'Task not found');

    await prisma.clinicTask.update({ where: { id }, data: { isDeleted: true } });
    return R.ok(res, { message: 'Task deleted' });
  } catch (err) {
    return R.serverError(res, err);
  }
};

import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

// ============================================================
// Notification Templates
// ============================================================

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const templates = await prisma.notificationTemplate.findMany({
      where: { clinicId },
      orderBy: [{ eventType: 'asc' }, { channel: 'asc' }],
    });
    return R.ok(res, templates);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { eventType, channel, name, body } = req.body;

    if (!eventType || !name || !body) return R.error(res, 'eventType, name, and body are required');

    const template = await prisma.notificationTemplate.create({
      data: { clinicId, eventType, channel: channel ?? 'SMS', name, body },
    });
    return R.created(res, template);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { name, body, isActive } = req.body;

    const existing = await prisma.notificationTemplate.findFirst({ where: { id, clinicId } });
    if (!existing) return R.error(res, 'Template not found', 404);

    const template = await prisma.notificationTemplate.update({
      where: { id },
      data: { name: name ?? undefined, body: body ?? undefined, isActive: isActive ?? undefined },
    });
    return R.ok(res, template);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Notification Log
// ============================================================

export const getNotificationLogs = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { patientId, status, channel, from, to } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId };
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (channel) where.channel = channel;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from as string);
      if (to) where.createdAt.lte = new Date(to as string);
    }

    const [logs, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          template: { select: { id: true, name: true, eventType: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notificationLog.count({ where }),
    ]);

    return R.paginated(res, logs, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Reminders
// ============================================================

export const getReminders = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { isDone, patientId } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId, userId }; // users see only their own reminders
    if (patientId) where.patientId = patientId;
    if (isDone !== undefined) where.isDone = isDone === 'true';

    const [reminders, total] = await Promise.all([
      prisma.reminder.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
        },
        orderBy: { remindAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.reminder.count({ where }),
    ]);

    return R.paginated(res, reminders, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createReminder = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { text, remindAt, patientId } = req.body;

    if (!text || !remindAt) return R.error(res, 'text and remindAt are required');

    const reminder = await prisma.reminder.create({
      data: {
        clinicId,
        userId,
        text,
        remindAt: new Date(remindAt),
        patientId: patientId || null,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return R.created(res, reminder);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { text, remindAt, isDone } = req.body;

    const existing = await prisma.reminder.findFirst({ where: { id, clinicId, userId } });
    if (!existing) return R.error(res, 'Reminder not found', 404);

    const reminder = await prisma.reminder.update({
      where: { id },
      data: {
        text: text ?? undefined,
        remindAt: remindAt ? new Date(remindAt) : undefined,
        isDone: isDone ?? undefined,
        doneAt: isDone === true && !existing.isDone ? new Date() : undefined,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return R.ok(res, reminder);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;

    const existing = await prisma.reminder.findFirst({ where: { id, clinicId, userId } });
    if (!existing) return R.error(res, 'Reminder not found', 404);

    await prisma.reminder.delete({ where: { id } });
    return R.ok(res, { id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

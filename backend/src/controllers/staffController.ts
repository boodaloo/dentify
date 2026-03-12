import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

// ============================================================
// Staff (UserClinic)
// ============================================================

export const getStaff = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { role, search, branchId } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId, isDeleted: false };
    if (role) where.role = role;

    const staffMembers = await prisma.userClinic.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true, title: true, lastLoginAt: true },
        },
        specialization: { select: { id: true, name: true } },
      },
      skip,
      take: limit,
    });

    // Фильтр по поиску на уровне приложения (имя, email)
    let items = staffMembers;
    if (search) {
      const q = (search as string).toLowerCase();
      items = staffMembers.filter((m) =>
        m.user.name.toLowerCase().includes(q) || m.user.email.toLowerCase().includes(q)
      );
    }

    // Фильтр по филиалу
    if (branchId) {
      const branches = await prisma.userBranch.findMany({ where: { branchId: branchId as string } });
      const branchUserIds = new Set(branches.map((b) => b.userId));
      items = items.filter((m) => branchUserIds.has(m.userId));
    }

    const total = await prisma.userClinic.count({ where });

    return R.paginated(res, items, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params; // userId
    const clinicId = req.user!.clinicId;

    const member = await prisma.userClinic.findUnique({
      where: { userId_clinicId: { userId: id, clinicId } },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, title: true, birthDate: true, lastLoginAt: true } },
        specialization: { select: { id: true, name: true } },
      },
    });

    if (!member || member.isDeleted) return R.error(res, 'Staff member not found', 404);

    const branches = await prisma.userBranch.findMany({
      where: { userId: id },
      include: { branch: { select: { id: true, name: true } } },
    });

    return R.ok(res, { ...member, branches });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// Создание нового сотрудника (создаём User глобально + привязываем к клинике)
export const createStaff = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { email, password, name, phone, title, role, specializationId, branchIds, color } = req.body;

    if (!email || !password || !name || !role) {
      return R.error(res, 'email, password, name, role are required');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Проверяем — есть ли уже такой пользователь глобально
      let user = await tx.user.findUnique({ where: { email } });

      if (user) {
        // Пользователь уже существует — проверяем нет ли уже в этой клинике
        const existing = await tx.userClinic.findUnique({
          where: { userId_clinicId: { userId: user.id, clinicId } },
        });
        if (existing && !existing.isDeleted) {
          throw new Error('User already exists in this clinic');
        }
      } else {
        const hashed = await bcrypt.hash(password, 10);
        user = await tx.user.create({
          data: { email, password: hashed, name, phone: phone || null, title: title || null },
        });
      }

      const userClinic = await tx.userClinic.upsert({
        where: { userId_clinicId: { userId: user.id, clinicId } },
        create: { userId: user.id, clinicId, role, specializationId: specializationId || null, color: color || null, isActive: true },
        update: { role, specializationId: specializationId || null, color: color || null, isActive: true, isDeleted: false, deletedAt: null },
      });

      // Привязываем к филиалам
      if (branchIds?.length) {
        await tx.userBranch.deleteMany({ where: { userId: user.id } });
        await tx.userBranch.createMany({
          data: branchIds.map((bId: string, i: number) => ({
            userId: user!.id, branchId: bId, isDefault: i === 0,
          })),
        });
      }

      return { user, userClinic };
    });

    return R.created(res, {
      userId:         result.user.id,
      name:           result.user.name,
      email:          result.user.email,
      role:           result.userClinic.role,
      specializationId: result.userClinic.specializationId,
    });
  } catch (err: any) {
    if (err.message === 'User already exists in this clinic') return R.error(res, err.message);
    return R.serverError(res, err);
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params; // userId
    const clinicId = req.user!.clinicId;

    const member = await prisma.userClinic.findUnique({
      where: { userId_clinicId: { userId: id, clinicId } },
    });
    if (!member || member.isDeleted) return R.error(res, 'Staff member not found', 404);

    const { name, phone, title, role, specializationId, color, isActive, branchIds } = req.body;

    await prisma.$transaction(async (tx) => {
      if (name || phone !== undefined || title !== undefined) {
        await tx.user.update({
          where: { id },
          data: { name: name ?? undefined, phone: phone ?? undefined, title: title ?? undefined },
        });
      }

      await tx.userClinic.update({
        where: { userId_clinicId: { userId: id, clinicId } },
        data: {
          role:            role            ?? undefined,
          specializationId:specializationId?? undefined,
          color:           color           ?? undefined,
          isActive:        isActive        ?? undefined,
        },
      });

      if (branchIds) {
        await tx.userBranch.deleteMany({ where: { userId: id } });
        if (branchIds.length) {
          await tx.userBranch.createMany({
            data: branchIds.map((bId: string, i: number) => ({
              userId: id, branchId: bId, isDefault: i === 0,
            })),
          });
        }
      }
    });

    return R.ok(res, { userId: id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deactivateStaff = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const member = await prisma.userClinic.findUnique({
      where: { userId_clinicId: { userId: id, clinicId } },
    });
    if (!member || member.isDeleted) return R.error(res, 'Staff member not found', 404);
    if (member.isOwner) return R.error(res, 'Cannot deactivate clinic owner');

    await prisma.userClinic.update({
      where: { userId_clinicId: { userId: id, clinicId } },
      data: { isActive: false, isDeleted: true, deletedAt: new Date() },
    });

    return R.ok(res, { userId: id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Doctor Schedule
// ============================================================

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params; // userId
    const clinicId = req.user!.clinicId;
    const { branchId } = req.query;

    const where: any = { clinicId, doctorId: id };
    if (branchId) where.branchId = branchId;

    const schedules = await prisma.doctorSchedule.findMany({
      where,
      include: {
        breaks: true,
        branch: { select: { id: true, name: true } },
      },
      orderBy: [{ branchId: 'asc' }, { dayOfWeek: 'asc' }],
    });

    return R.ok(res, schedules);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// Bulk upsert расписания врача (массив по дням недели)
export const upsertSchedule = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;
    const { branchId, days } = req.body;
    // days: [{ dayOfWeek, startTime, endTime, isWorking, breaks: [{startTime, endTime}] }]

    if (!branchId || !days?.length) return R.error(res, 'branchId and days are required');

    await prisma.$transaction(async (tx) => {
      for (const day of days) {
        const schedule = await tx.doctorSchedule.upsert({
          where: { doctorId_branchId_dayOfWeek: { doctorId: id, branchId, dayOfWeek: day.dayOfWeek } },
          create: { clinicId, doctorId: id, branchId, dayOfWeek: day.dayOfWeek, startTime: day.startTime, endTime: day.endTime, isWorking: day.isWorking ?? true },
          update: { startTime: day.startTime, endTime: day.endTime, isWorking: day.isWorking ?? true },
        });

        if (day.breaks !== undefined) {
          await tx.doctorScheduleBreak.deleteMany({ where: { scheduleId: schedule.id } });
          if (day.breaks.length) {
            await tx.doctorScheduleBreak.createMany({
              data: day.breaks.map((b: any) => ({ scheduleId: schedule.id, startTime: b.startTime, endTime: b.endTime })),
            });
          }
        }
      }
    });

    return R.ok(res, { doctorId: id, branchId });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Schedule Exceptions (отгулы, больничные, доп. дни)
// ============================================================

export const getExceptions = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;
    const { from, to } = req.query;

    const where: any = { clinicId, doctorId: id };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from as string);
      if (to)   where.date.lte = new Date(to   as string);
    }

    const exceptions = await prisma.scheduleException.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return R.ok(res, exceptions);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createException = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;
    const { branchId, date, isAvailable, startTime, endTime, reason, type } = req.body;

    if (!date) return R.error(res, 'date is required');

    const exception = await prisma.scheduleException.create({
      data: {
        clinicId,
        doctorId:    id,
        branchId:    branchId    || null,
        date:        new Date(date),
        isAvailable: isAvailable ?? false,
        type:        type || 'CUSTOM_HOURS',
        startTime:   startTime   || null,
        endTime:     endTime     || null,
        reason:      reason      || null,
      },
    });

    return R.created(res, exception);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteException = async (req: Request, res: Response) => {
  try {
    const { id, exceptionId } = req.params;
    const clinicId            = req.user!.clinicId;

    const existing = await prisma.scheduleException.findFirst({
      where: { id: exceptionId, doctorId: id, clinicId },
    });
    if (!existing) return R.error(res, 'Exception not found', 404);

    await prisma.scheduleException.delete({ where: { id: exceptionId } });
    return R.ok(res, { id: exceptionId });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Specializations
// ============================================================

export const getSpecializations = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const specs = await prisma.specialization.findMany({
      where: { clinicId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return R.ok(res, specs);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createSpecialization = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, sortOrder } = req.body;
    if (!name) return R.error(res, 'Name is required');

    const spec = await prisma.specialization.create({
      data: { clinicId, name, sortOrder: sortOrder ?? 0 },
    });
    return R.created(res, spec);
  } catch (err) {
    return R.serverError(res, err);
  }
};

import { Request, Response } from 'express';
import prisma from '../prisma';
import * as R from '../utils/response';

// ============================================================
// Branches
// ============================================================

const DEFAULT_WORKING_HOURS = (branchId: string) =>
  [0, 1, 2, 3, 4, 5, 6].map(day => ({
    branchId,
    dayOfWeek: day,
    isOpen:    day < 5,
    startTime: '09:00',
    endTime:   '21:00',
  }));

export const getBranches = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;

    let branches = await prisma.branch.findMany({
      where: { clinicId, isDeleted: false },
      include: {
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        _count: { select: { rooms: true, appointments: true } },
      },
      orderBy: [{ isMain: 'desc' }, { name: 'asc' }],
    });

    // Auto-create a default branch if the clinic has none yet
    if (branches.length === 0) {
      const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
      const created = await prisma.branch.create({
        data: { clinicId, name: clinic?.name ?? 'Main', shortCode: 'MAIN', isMain: true },
        include: {
          workingHours: true,
          _count: { select: { rooms: true, appointments: true } },
        },
      });
      branches = [created];
    }

    // Lazily seed default working hours for any branch that has none yet
    const branchesWithoutHours = branches.filter(b => b.workingHours.length === 0);
    if (branchesWithoutHours.length > 0) {
      await prisma.branchWorkingHours.createMany({
        data: branchesWithoutHours.flatMap(b => DEFAULT_WORKING_HOURS(b.id)),
        skipDuplicates: true,
      });
      // Re-fetch to include the newly created hours
      branches = await prisma.branch.findMany({
        where: { clinicId, isDeleted: false },
        include: {
          workingHours: { orderBy: { dayOfWeek: 'asc' } },
          _count: { select: { rooms: true, appointments: true } },
        },
        orderBy: [{ isMain: 'desc' }, { name: 'asc' }],
      });
    }

    return R.ok(res, branches);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getBranchById = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const branch = await prisma.branch.findFirst({
      where: { id, clinicId, isDeleted: false },
      include: {
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        rooms: { where: { isActive: true } },
      },
    });

    if (!branch) return R.error(res, 'Branch not found', 404);
    return R.ok(res, branch);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createBranch = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, shortCode, address, phone, color, isMain } = req.body;

    if (!name) return R.error(res, 'Name is required');

    // Если isMain=true — сбрасываем у других
    if (isMain) {
      await prisma.branch.updateMany({ where: { clinicId }, data: { isMain: false } });
    }

    const branch = await prisma.branch.create({
      data: { clinicId, name, shortCode: shortCode || null, address: address || null, phone: phone || null, color: color || null, isMain: isMain ?? false },
    });

    // Создаём дефолтное расписание (Пн-Пт 9:00-21:00, Сб-Вс выходной)
    await prisma.branchWorkingHours.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        branchId:  branch.id,
        dayOfWeek: day,
        isOpen:    day < 5,
        startTime: '09:00',
        endTime:   '21:00',
      })),
    });

    return R.created(res, branch);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.branch.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Branch not found', 404);

    const { name, shortCode, address, phone, color, isMain, isActive } = req.body;

    if (isMain) {
      await prisma.branch.updateMany({ where: { clinicId }, data: { isMain: false } });
    }

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        name:      name      ?? undefined,
        shortCode: shortCode ?? undefined,
        address:   address   ?? undefined,
        phone:     phone     ?? undefined,
        color:     color     ?? undefined,
        isMain:    isMain    ?? undefined,
        isActive:  isActive  ?? undefined,
      },
    });

    return R.ok(res, branch);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.branch.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Branch not found', 404);
    if (existing.isMain) return R.error(res, 'Cannot delete main branch');

    await prisma.branch.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });
    return R.ok(res, { id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Working Hours
// ============================================================

export const upsertWorkingHours = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;
    const { hours } = req.body;
    // hours: [{ dayOfWeek, isOpen, startTime, endTime }]

    if (!hours?.length) return R.error(res, 'hours array is required');

    const existing = await prisma.branch.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Branch not found', 404);

    const result = await prisma.$transaction(
      hours.map((h: any) =>
        prisma.branchWorkingHours.upsert({
          where: { branchId_dayOfWeek: { branchId: id, dayOfWeek: h.dayOfWeek } },
          create: { branchId: id, dayOfWeek: h.dayOfWeek, isOpen: h.isOpen ?? true, startTime: h.startTime ?? '09:00', endTime: h.endTime ?? '21:00' },
          update: { isOpen: h.isOpen ?? true, startTime: h.startTime ?? '09:00', endTime: h.endTime ?? '21:00' },
        })
      )
    );

    return R.ok(res, result);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Rooms
// ============================================================

export const getRooms = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;

    const rooms = await prisma.room.findMany({
      where: { branchId: id, clinicId, isActive: true },
      orderBy: { name: 'asc' },
    });

    return R.ok(res, rooms);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const clinicId = req.user!.clinicId;
    const { name } = req.body;

    if (!name) return R.error(res, 'Name is required');

    const branch = await prisma.branch.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!branch) return R.error(res, 'Branch not found', 404);

    const room = await prisma.room.create({ data: { clinicId, branchId: id, name } });
    return R.created(res, room);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id, roomId } = req.params;
    const clinicId       = req.user!.clinicId;
    const { name, isActive } = req.body;

    const existing = await prisma.room.findFirst({ where: { id: roomId, branchId: id, clinicId } });
    if (!existing) return R.error(res, 'Room not found', 404);

    const room = await prisma.room.update({
      where: { id: roomId },
      data: { name: name ?? undefined, isActive: isActive ?? undefined },
    });

    return R.ok(res, room);
  } catch (err) {
    return R.serverError(res, err);
  }
};

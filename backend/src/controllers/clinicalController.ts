import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

// ============================================================
// Diagnoses
// ============================================================

export const getDiagnosisCategories = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const categories = await prisma.diagnosisCategory.findMany({
      where: { clinicId, isActive: true, parentId: null },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        _count: { select: { diagnoses: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return R.ok(res, categories);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getDiagnoses = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { search, categoryId } = req.query;

    const where: any = { clinicId, isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (search) where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { code: { contains: search as string, mode: 'insensitive' } },
    ];

    const diagnoses = await prisma.diagnosis.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    });

    return R.ok(res, diagnoses);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createDiagnosis = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, code, categoryId } = req.body;
    if (!name) return R.error(res, 'Name is required');

    const diagnosis = await prisma.diagnosis.create({
      data: { clinicId, name, code: code || null, categoryId: categoryId || null },
      include: { category: { select: { id: true, name: true } } },
    });
    return R.created(res, diagnosis);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Treatment Plans
// ============================================================

export const getTreatmentPlans = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { patientId, doctorId, status } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId, isDeleted: false };
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;

    const [plans, total] = await Promise.all([
      prisma.treatmentPlan.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
          doctor: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.treatmentPlan.count({ where }),
    ]);

    return R.paginated(res, plans, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getTreatmentPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const plan = await prisma.treatmentPlan.findFirst({
      where: { id, clinicId, isDeleted: false },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
        doctor: { select: { id: true, name: true } },
        items: {
          include: { service: { select: { id: true, name: true } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!plan) return R.error(res, 'Treatment plan not found', 404);
    return R.ok(res, plan);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createTreatmentPlan = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { patientId, doctorId, name, status, startDate, endDate, notes, items } = req.body;

    if (!patientId || !doctorId || !name) return R.error(res, 'patientId, doctorId, and name are required');

    const plan = await prisma.treatmentPlan.create({
      data: {
        clinicId,
        patientId,
        doctorId,
        name,
        status: status ?? 'DRAFT',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
        items: items && Array.isArray(items) ? {
          create: items.map((item: any, idx: number) => ({
            serviceId: item.serviceId,
            toothNumber: item.toothNumber ?? null,
            quantity: item.quantity ?? 1,
            price: item.price,
            discount: item.discount ?? 0,
            sortOrder: item.sortOrder ?? idx,
          })),
        } : undefined,
      },
      include: {
        items: { include: { service: { select: { id: true, name: true } } }, orderBy: { sortOrder: 'asc' } },
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, name: true } },
      },
    });

    return R.created(res, plan);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateTreatmentPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.treatmentPlan.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Treatment plan not found', 404);

    const { name, status, startDate, endDate, notes, items } = req.body;

    const plan = await prisma.$transaction(async (tx) => {
      if (items && Array.isArray(items)) {
        await tx.treatmentPlanItem.deleteMany({ where: { planId: id } });
        await tx.treatmentPlanItem.createMany({
          data: items.map((item: any, idx: number) => ({
            planId: id,
            serviceId: item.serviceId,
            toothNumber: item.toothNumber ?? null,
            quantity: item.quantity ?? 1,
            price: item.price,
            discount: item.discount ?? 0,
            isDone: item.isDone ?? false,
            doneAt: item.isDone ? new Date() : null,
            sortOrder: item.sortOrder ?? idx,
          })),
        });
      }

      return tx.treatmentPlan.update({
        where: { id },
        data: {
          name: name ?? undefined,
          status: status ?? undefined,
          startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
          endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
          notes: notes ?? undefined,
        },
        include: {
          items: { include: { service: { select: { id: true, name: true } } }, orderBy: { sortOrder: 'asc' } },
        },
      });
    });

    return R.ok(res, plan);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteTreatmentPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.treatmentPlan.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Treatment plan not found', 404);

    await prisma.treatmentPlan.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return R.ok(res, { id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// Mark single item as done
export const markPlanItemDone = async (req: Request, res: Response) => {
  try {
    const { id, itemId } = req.params;
    const clinicId = req.user!.clinicId;
    const { isDone } = req.body;

    const plan = await prisma.treatmentPlan.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!plan) return R.error(res, 'Treatment plan not found', 404);

    const item = await prisma.treatmentPlanItem.update({
      where: { id: itemId },
      data: { isDone: isDone ?? true, doneAt: isDone ? new Date() : null },
    });

    return R.ok(res, item);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Medical Records
// ============================================================

export const getMedicalRecords = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { patientId, appointmentId, recordType } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId, isDeleted: false };
    if (patientId) where.patientId = patientId;
    if (appointmentId) where.appointmentId = appointmentId;
    if (recordType) where.recordType = recordType;

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
          appointment: { select: { id: true, startTime: true } },
          createdBy: { select: { id: true, name: true } },
          diagnoses: {
            include: { diagnosis: { select: { id: true, name: true, code: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.medicalRecord.count({ where }),
    ]);

    return R.paginated(res, records, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getMedicalRecordById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const record = await prisma.medicalRecord.findFirst({
      where: { id, clinicId, isDeleted: false },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
        appointment: { select: { id: true, startTime: true } },
        createdBy: { select: { id: true, name: true } },
        diagnoses: {
          include: { diagnosis: { include: { category: { select: { id: true, name: true } } } } },
        },
      },
    });

    if (!record) return R.error(res, 'Medical record not found', 404);
    return R.ok(res, record);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { patientId, appointmentId, recordType, complaints, anamnesis, treatmentPlan, notes, diagnoses } = req.body;

    if (!patientId) return R.error(res, 'patientId is required');

    const record = await prisma.medicalRecord.create({
      data: {
        clinicId,
        patientId,
        appointmentId: appointmentId || null,
        recordType: recordType ?? 'EXAMINATION',
        complaints: complaints || null,
        anamnesis: anamnesis || null,
        treatmentPlan: treatmentPlan || null,
        notes: notes || null,
        createdByUserId: userId,
        diagnoses: diagnoses && Array.isArray(diagnoses) ? {
          create: diagnoses.map((d: any) => ({
            diagnosisId: d.diagnosisId,
            isPrimary: d.isPrimary ?? false,
          })),
        } : undefined,
      },
      include: {
        diagnoses: { include: { diagnosis: { select: { id: true, name: true, code: true } } } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return R.created(res, record);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.medicalRecord.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Medical record not found', 404);

    const { recordType, complaints, anamnesis, treatmentPlan, notes, diagnoses } = req.body;

    const record = await prisma.$transaction(async (tx) => {
      if (diagnoses && Array.isArray(diagnoses)) {
        await tx.medicalRecordDiagnosis.deleteMany({ where: { medicalRecordId: id } });
        await tx.medicalRecordDiagnosis.createMany({
          data: diagnoses.map((d: any) => ({
            medicalRecordId: id,
            diagnosisId: d.diagnosisId,
            isPrimary: d.isPrimary ?? false,
          })),
        });
      }

      return tx.medicalRecord.update({
        where: { id },
        data: {
          recordType: recordType ?? undefined,
          complaints: complaints ?? undefined,
          anamnesis: anamnesis ?? undefined,
          treatmentPlan: treatmentPlan ?? undefined,
          notes: notes ?? undefined,
        },
        include: {
          diagnoses: { include: { diagnosis: { select: { id: true, name: true, code: true } } } },
        },
      });
    });

    return R.ok(res, record);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteMedicalRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.medicalRecord.findFirst({ where: { id, clinicId, isDeleted: false } });
    if (!existing) return R.error(res, 'Medical record not found', 404);

    await prisma.medicalRecord.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return R.ok(res, { id });
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Dental Chart
// ============================================================

export const getDentalChart = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.user!.clinicId;

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const chart = await prisma.dentalChart.findMany({
      where: { patientId },
      orderBy: { toothNumber: 'asc' },
    });

    return R.ok(res, chart);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const upsertToothStatus = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { toothNumber, status, buccalStatus, mesialStatus, distalStatus, occlusalStatus, lingualStatus, toothColor, mobility, hasSensitivity, notes } = req.body;

    if (!toothNumber || !status) return R.error(res, 'toothNumber and status are required');

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    // Get existing for history
    const existing = await prisma.dentalChart.findUnique({
      where: { patientId_toothNumber: { patientId, toothNumber } },
    });

    const tooth = await prisma.$transaction(async (tx) => {
      const updated = await tx.dentalChart.upsert({
        where: { patientId_toothNumber: { patientId, toothNumber } },
        create: {
          clinicId,
          patientId,
          toothNumber,
          status,
          buccalStatus: buccalStatus || null,
          mesialStatus: mesialStatus || null,
          distalStatus: distalStatus || null,
          occlusalStatus: occlusalStatus || null,
          lingualStatus: lingualStatus || null,
          toothColor: toothColor || null,
          mobility: mobility ?? null,
          hasSensitivity: hasSensitivity ?? null,
          notes: notes || null,
          updatedByUserId: userId,
        },
        update: {
          status,
          buccalStatus: buccalStatus ?? undefined,
          mesialStatus: mesialStatus ?? undefined,
          distalStatus: distalStatus ?? undefined,
          occlusalStatus: occlusalStatus ?? undefined,
          lingualStatus: lingualStatus ?? undefined,
          toothColor: toothColor ?? undefined,
          mobility: mobility ?? undefined,
          hasSensitivity: hasSensitivity ?? undefined,
          notes: notes ?? undefined,
          updatedByUserId: userId,
        },
      });

      // Record history if status changed
      if (!existing || existing.status !== status) {
        await tx.dentalChartHistory.create({
          data: {
            dentalChartId: updated.id,
            oldStatus: existing?.status ?? 'HEALTHY',
            newStatus: status,
            notes: notes || null,
            changedByUserId: userId,
          },
        });
      }

      return updated;
    });

    return R.ok(res, tooth);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getDentalChartHistory = async (req: Request, res: Response) => {
  try {
    const { patientId, toothNumber } = req.params;
    const clinicId = req.user!.clinicId;

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const tooth = await prisma.dentalChart.findUnique({
      where: { patientId_toothNumber: { patientId, toothNumber: Number(toothNumber) } },
    });
    if (!tooth) return R.error(res, 'Tooth record not found', 404);

    const history = await prisma.dentalChartHistory.findMany({
      where: { dentalChartId: tooth.id },
      orderBy: { createdAt: 'desc' },
    });

    return R.ok(res, history);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Patient Diary
// ============================================================

export const getDiaryEntries = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.user!.clinicId;
    const { page, limit, skip } = getPagination(req);

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const [entries, total] = await Promise.all([
      prisma.patientDiary.findMany({
        where: { patientId, clinicId },
        include: { doctor: { select: { id: true, name: true } } },
        orderBy: { recordDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.patientDiary.count({ where: { patientId, clinicId } }),
    ]);

    return R.paginated(res, entries, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createDiaryEntry = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { content, recordDate, appointmentId } = req.body;

    if (!content || !recordDate) return R.error(res, 'content and recordDate are required');

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const entry = await prisma.patientDiary.create({
      data: {
        clinicId,
        patientId,
        doctorId: userId,
        content,
        recordDate: new Date(recordDate),
        appointmentId: appointmentId || null,
      },
      include: { doctor: { select: { id: true, name: true } } },
    });

    return R.created(res, entry);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateDiaryEntry = async (req: Request, res: Response) => {
  try {
    const { patientId, entryId } = req.params;
    const clinicId = req.user!.clinicId;
    const { content, recordDate } = req.body;

    const entry = await prisma.patientDiary.findFirst({
      where: { id: entryId, patientId, clinicId },
    });
    if (!entry) return R.error(res, 'Diary entry not found', 404);

    const updated = await prisma.patientDiary.update({
      where: { id: entryId },
      data: {
        content: content ?? undefined,
        recordDate: recordDate ? new Date(recordDate) : undefined,
      },
      include: { doctor: { select: { id: true, name: true } } },
    });

    return R.ok(res, updated);
  } catch (err) {
    return R.serverError(res, err);
  }
};

// ============================================================
// Treatment Plan Templates
// ============================================================

export const getTreatmentPlanTemplates = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const templates = await prisma.treatmentPlanTemplate.findMany({
      where: { clinicId, isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          include: {
            items: { include: { service: { select: { id: true, name: true, price: true } } }, orderBy: { sortOrder: 'asc' } },
          },
          orderBy: { sortOrder: 'asc' },
        },
        items: { include: { service: { select: { id: true, name: true, price: true } } }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return R.ok(res, templates);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const createTreatmentPlanTemplate = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { name, parentId, isFolder, sortOrder, items } = req.body;
    if (!name) return R.error(res, 'Name is required');

    const template = await prisma.treatmentPlanTemplate.create({
      data: {
        clinicId,
        name,
        parentId: parentId || null,
        isFolder: isFolder ?? false,
        sortOrder: sortOrder ?? 0,
        items: !isFolder && items && Array.isArray(items) ? {
          create: items.map((item: any, idx: number) => ({
            serviceId: item.serviceId,
            quantity: item.quantity ?? 1,
            sortOrder: item.sortOrder ?? idx,
          })),
        } : undefined,
      },
      include: {
        items: { include: { service: { select: { id: true, name: true, price: true } } }, orderBy: { sortOrder: 'asc' } },
      },
    });

    return R.created(res, template);
  } catch (err) {
    return R.serverError(res, err);
  }
};

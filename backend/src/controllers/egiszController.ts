import { Request, Response } from 'express';
import prisma from '../prisma';
import { getPagination } from '../utils/pagination';
import * as R from '../utils/response';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const settings = await prisma.egiszSettings.findUnique({ where: { clinicId } });
    return R.ok(res, settings ?? { clinicId, isEnabled: false });
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const upsertSettings = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { isEnabled, orgOid, orgName, apiUrl, apiLogin, apiPassword } = req.body;

    const settings = await prisma.egiszSettings.upsert({
      where: { clinicId },
      update: {
        isEnabled: isEnabled ?? false,
        orgOid: orgOid ?? null,
        orgName: orgName ?? null,
        apiUrl: apiUrl ?? null,
        apiLogin: apiLogin ?? null,
        apiPassword: apiPassword ?? null,
      },
      create: {
        clinicId,
        isEnabled: isEnabled ?? false,
        orgOid: orgOid ?? null,
        orgName: orgName ?? null,
        apiUrl: apiUrl ?? null,
        apiLogin: apiLogin ?? null,
        apiPassword: apiPassword ?? null,
      },
    });

    return R.ok(res, settings);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { status, patientId, docType } = req.query;
    const { page, limit, skip } = getPagination(req);

    const where: any = { clinicId };
    if (status) where.status = status as string;
    if (patientId) where.patientId = patientId as string;
    if (docType) where.docType = docType as string;

    const [documents, total] = await Promise.all([
      prisma.egiszDocument.findMany({
        where,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, snils: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.egiszDocument.count({ where }),
    ]);

    return R.paginated(res, documents, total, page, limit);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const generateDocument = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const userId = req.user!.userId;
    const { patientId, docType, appointmentId } = req.body;

    if (!patientId) return R.error(res, 'patientId is required');
    if (!docType) return R.error(res, 'docType is required');

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId, isDeleted: false },
    });
    if (!patient) return R.notFound(res, 'Patient not found');

    const docId = require('crypto').randomUUID();
    const date = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const snils = patient.snils ?? '';

    const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument>
  <id root="${docId}"/>
  <code code="${docType}"/>
  <effectiveTime value="${date}"/>
  <patient snils="${snils}"/>
</ClinicalDocument>`;

    const doc = await prisma.egiszDocument.create({
      data: {
        clinicId,
        patientId,
        appointmentId: appointmentId || undefined,
        docType,
        status: 'DRAFT',
        xmlPayload,
        createdByUserId: userId,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, snils: true } },
      },
    });

    return R.created(res, doc);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const updateDocumentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;
    const { status } = req.body;

    if (!status) return R.error(res, 'status is required');

    const existing = await prisma.egiszDocument.findFirst({ where: { id, clinicId } });
    if (!existing) return R.notFound(res, 'Document not found');

    const updateData: any = { status };
    if (status === 'SENT') updateData.sentAt = new Date();
    if (status === 'ACCEPTED') updateData.acceptedAt = new Date();

    const doc = await prisma.egiszDocument.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return R.ok(res, doc);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clinicId = req.user!.clinicId;

    const existing = await prisma.egiszDocument.findFirst({ where: { id, clinicId } });
    if (!existing) return R.notFound(res, 'Document not found');

    await prisma.egiszDocument.delete({ where: { id } });
    return R.ok(res, { message: 'Document deleted' });
  } catch (err) {
    return R.serverError(res, err);
  }
};

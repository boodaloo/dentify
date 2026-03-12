import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import * as R from '../utils/response';

// Allowed image MIME types
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/dicom'];

export const getPatientFiles = async (req: Request, res: Response) => {
  try {
    const clinicId   = req.user!.clinicId;
    const { patientId } = req.params;
    const { fileType } = req.query;

    // Verify patient belongs to clinic
    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const where: any = { clinicId, patientId, deletedAt: null };
    if (fileType) where.fileType = fileType;

    const files = await prisma.file.findMany({
      where,
      include: { uploadedBy: { select: { id: true, name: true } }, appointment: { select: { id: true, startTime: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Attach public URL
    const base = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
    const result = files.map(f => ({
      ...f,
      url: `${base}/uploads/${f.s3Key}`,
    }));

    return R.ok(res, result);
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const uploadPatientFile = async (req: Request, res: Response) => {
  try {
    const clinicId   = req.user!.clinicId;
    const uploaderId = req.user!.userId;
    const { patientId } = req.params;

    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId, isDeleted: false } });
    if (!patient) return R.error(res, 'Patient not found', 404);

    const file = (req as any).file;
    if (!file) return R.error(res, 'No file uploaded');

    const { fileType = 'OTHER', appointmentId, description } = req.body;

    const record = await prisma.file.create({
      data: {
        clinicId,
        patientId,
        appointmentId: appointmentId || null,
        fileType:      fileType as any,
        originalName:  file.originalname,
        s3Key:         file.filename,   // local filename, replace with S3 key later
        mimeType:      file.mimetype,
        sizeBytes:     file.size,
        uploadedByUserId: uploaderId,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    const base = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
    return R.created(res, { ...record, url: `${base}/uploads/${record.s3Key}` });
  } catch (err) {
    return R.serverError(res, err);
  }
};

export const deletePatientFile = async (req: Request, res: Response) => {
  try {
    const clinicId = req.user!.clinicId;
    const { patientId, fileId } = req.params;

    const file = await prisma.file.findFirst({ where: { id: fileId, patientId, clinicId, deletedAt: null } });
    if (!file) return R.error(res, 'File not found', 404);

    // Soft-delete
    await prisma.file.update({ where: { id: fileId }, data: { deletedAt: new Date() } });

    // Remove from disk
    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath  = path.join(uploadDir, file.s3Key);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return R.ok(res, { id: fileId });
  } catch (err) {
    return R.serverError(res, err);
  }
};

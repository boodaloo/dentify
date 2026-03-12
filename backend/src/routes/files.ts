import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { auth } from '../middleware/auth';
import { getPatientFiles, uploadPatientFile, deletePatientFile } from '../controllers/fileController';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadDir),
  filename:    (_req: any, file: any, cb: any) => {
    const ext  = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = /jpeg|jpg|png|webp|gif|pdf|dcm/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

const router = Router();
router.use(auth);

router.get( '/:patientId/files',           getPatientFiles);
router.post('/:patientId/files',           upload.single('file'), uploadPatientFile);
router.delete('/:patientId/files/:fileId', deletePatientFile);

export default router;

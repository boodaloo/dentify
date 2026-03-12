import { Router } from 'express';
import { getSettings, upsertSettings, getDocuments, generateDocument, updateDocumentStatus, deleteDocument } from '../controllers/egiszController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);
router.get('/settings',             getSettings);
router.put('/settings',             upsertSettings);
router.get('/documents',            getDocuments);
router.post('/documents',           generateDocument);
router.put('/documents/:id/status', updateDocumentStatus);
router.delete('/documents/:id',     deleteDocument);
export default router;

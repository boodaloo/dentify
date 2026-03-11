import { Router } from 'express';
import { getDocuments, createDocument } from '../controllers/documentController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/',  getDocuments);
router.post('/', createDocument);

export default router;

import { Router } from 'express';
import { getTemplates, upsertTemplate, deleteTemplate } from '../controllers/visitTemplatesController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(auth);

router.get('/',       getTemplates);
router.put('/:id',    requireRole('OWNER', 'ADMIN'), upsertTemplate);
router.post('/',      requireRole('OWNER', 'ADMIN'), upsertTemplate);
router.delete('/:id', requireRole('OWNER', 'ADMIN'), deleteTemplate);

export default router;

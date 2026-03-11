import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getLabels, createLabel, updateLabel, deleteLabel } from '../controllers/labelController';
import { getPatientLabels, assignLabel, unassignLabel } from '../controllers/labelController';
import { getComments, createComment, updateComment, deleteComment } from '../controllers/commentController';

// ── Clinic-wide label management (mounted at /api/labels) ─────────────────────
export const clinicLabelRouter = Router();
clinicLabelRouter.use(auth);
clinicLabelRouter.get   ('/',          getLabels);
clinicLabelRouter.post  ('/',          createLabel);
clinicLabelRouter.put   ('/:labelId',  updateLabel);
clinicLabelRouter.delete('/:labelId',  deleteLabel);

// ── Patient-specific: label assignments + comments (mounted at /api/patients) ─
const router = Router();
router.use(auth);

router.get   ('/:patientId/labels',              getPatientLabels);
router.post  ('/:patientId/labels',              assignLabel);
router.delete('/:patientId/labels/:labelId',     unassignLabel);

router.get   ('/:patientId/comments',            getComments);
router.post  ('/:patientId/comments',            createComment);
router.put   ('/:patientId/comments/:commentId', updateComment);
router.delete('/:patientId/comments/:commentId', deleteComment);

export default router;

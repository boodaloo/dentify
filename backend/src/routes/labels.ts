import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getLabels, createLabel, updateLabel, deleteLabel } from '../controllers/labelController';
import { getPatientLabels, assignLabel, unassignLabel } from '../controllers/labelController';
import { getComments, createComment, updateComment, deleteComment } from '../controllers/commentController';

const router = Router();
router.use(auth);

// Clinic-wide label management
router.get   ('/labels',                   getLabels);
router.post  ('/labels',                   createLabel);
router.put   ('/labels/:labelId',          updateLabel);
router.delete('/labels/:labelId',          deleteLabel);

// Patient label assignments
router.get   ('/:patientId/labels',              getPatientLabels);
router.post  ('/:patientId/labels',              assignLabel);
router.delete('/:patientId/labels/:labelId',     unassignLabel);

// Patient comments
router.get   ('/:patientId/comments',            getComments);
router.post  ('/:patientId/comments',            createComment);
router.put   ('/:patientId/comments/:commentId', updateComment);
router.delete('/:patientId/comments/:commentId', deleteComment);

export default router;

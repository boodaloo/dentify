import { Router } from 'express';
import {
  getTemplates, createTemplate, updateTemplate,
  getNotificationLogs,
  getReminders, createReminder, updateReminder, deleteReminder,
} from '../controllers/notificationController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();
router.use(auth);

// Notification Templates
router.get('/templates',        getTemplates);
router.post('/templates',       requireRole('OWNER', 'ADMIN'), createTemplate);
router.put('/templates/:id',    requireRole('OWNER', 'ADMIN'), updateTemplate);

// Logs (read-only)
router.get('/logs', getNotificationLogs);

// Reminders (personal — users manage their own)
router.get('/reminders',        getReminders);
router.post('/reminders',       createReminder);
router.put('/reminders/:id',    updateReminder);
router.delete('/reminders/:id', deleteReminder);

export default router;

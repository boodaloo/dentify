import { Router } from 'express';
import { getVisitData, upsertAppointmentServices, upsertMedicalRecord, completeAppointment } from '../controllers/visitController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/:id/visit',          getVisitData);
router.put('/:id/services',       upsertAppointmentServices);
router.put('/:id/medical-record', upsertMedicalRecord);
router.post('/:id/complete',      completeAppointment);

export default router;

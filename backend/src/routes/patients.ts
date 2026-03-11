import { Router } from 'express';
import { getPatients, createPatient, getPatientById, updatePatient, deletePatient, getUpcomingBirthdays } from '../controllers/patientController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/',            getPatients);
router.get('/birthdays',   getUpcomingBirthdays);
router.post('/',           createPatient);
router.get('/:id',         getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;

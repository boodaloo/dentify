import { Router } from 'express';
import { getPatients, createPatient, getPatientById, updatePatient, deletePatient, getUpcomingBirthdays, addInsurance, updateInsurance, deleteInsurance, addRelative, updateRelative, deleteRelative } from '../controllers/patientController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/',            getPatients);
router.get('/birthdays',   getUpcomingBirthdays);
router.post('/',           createPatient);
router.get('/:id',         getPatientById);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

// Insurance
router.post('/:id/insurance', addInsurance);
router.put('/:id/insurance/:insuranceId', updateInsurance);
router.delete('/:id/insurance/:insuranceId', deleteInsurance);

// Relatives
router.post('/:id/relatives', addRelative);
router.put('/:id/relatives/:relativeId', updateRelative);
router.delete('/:id/relatives/:relativeId', deleteRelative);

export default router;

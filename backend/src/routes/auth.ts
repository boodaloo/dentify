import { Router } from 'express';
import { login, register, switchClinic, me } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/register',      register);
router.post('/login',         login);
router.post('/switch-clinic', auth, switchClinic);
router.get('/me',             auth, me);

export default router;

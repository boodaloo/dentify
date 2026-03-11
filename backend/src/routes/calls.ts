import { Router } from 'express';
import { getCalls, createCall } from '../controllers/callController';
import { auth } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/',  getCalls);
router.post('/', createCall);

export default router;

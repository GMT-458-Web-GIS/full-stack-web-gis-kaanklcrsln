import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = Router();

router.get('/me', verifyAuth, userController.getProfile);
router.patch('/me', verifyAuth, userController.updateProfile);

export default router;

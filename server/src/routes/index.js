import { Router } from 'express';
import eventRoutes from './eventRoutes.js';
import chatRoutes from './chatRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/events', eventRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);

export default router;

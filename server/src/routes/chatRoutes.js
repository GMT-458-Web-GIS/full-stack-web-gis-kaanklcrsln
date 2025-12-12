import { Router } from 'express';
import * as chatController from '../controllers/chatController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = Router();

router.get('/rooms/:roomId/messages', chatController.getMessages);
router.post('/rooms/:roomId/messages', verifyAuth, chatController.postMessage);

export default router;

import { Router } from 'express';
import * as eventController from '../controllers/eventController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', eventController.listEvents);
router.get('/nearby', eventController.getNearby);
router.get('/:id', eventController.getEvent);
router.post('/', verifyAuth, eventController.createEvent);

export default router;

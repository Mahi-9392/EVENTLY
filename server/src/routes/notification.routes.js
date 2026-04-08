import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { listMyNotifications, markAllRead } from '../controllers/notification.controller.js';

const router = Router();

router.get('/me', authenticate, listMyNotifications);
router.post('/me/read-all', authenticate, markAllRead);

export default router;


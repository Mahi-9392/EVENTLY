import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { getStats, listAllEventsForAdmin } from '../controllers/admin.controller.js';

const router = Router();

router.get('/stats', authenticate, requireRole('admin'), getStats);
router.get('/events', authenticate, requireRole('admin'), listAllEventsForAdmin);

export default router;


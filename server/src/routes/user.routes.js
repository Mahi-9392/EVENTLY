import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { listUsers, setBlocked, validateUserIdParam } from '../controllers/user.controller.js';

const router = Router();

router.get('/', authenticate, requireRole('admin'), listUsers);
router.patch(
	'/:id/block',
	authenticate,
	requireRole('admin'),
	validateUserIdParam,
	[body('isBlocked').isBoolean()],
	setBlocked
);

export default router;


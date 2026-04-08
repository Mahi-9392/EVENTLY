import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { createCheckout } from '../controllers/payment.controller.js';

const router = Router();

router.post(
	'/create-checkout-session',
	authenticate,
	requireRole('user'),
	[body('bookingId').isMongoId()],
	createCheckout
);

export default router;


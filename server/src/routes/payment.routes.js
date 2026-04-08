import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { createCheckout, getCheckoutStatus } from '../controllers/payment.controller.js';

const router = Router();

router.post(
	'/create-checkout-session',
	authenticate,
	requireRole('user'),
	[body('bookingId').isMongoId()],
	createCheckout
);
router.get('/session-status/:sessionId', authenticate, requireRole('user'), getCheckoutStatus);

export default router;


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
// Must be accessible right after Stripe redirect (token may be unavailable in some browsers).
router.get('/session-status/:sessionId', getCheckoutStatus);

export default router;


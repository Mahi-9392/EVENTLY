import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { createBooking, getUserBookings, cancelBooking } from '../controllers/booking.controller.js';

const router = Router();

router.post(
	'/',
	authenticate,
	requireRole('user'),
	[body('eventId').isMongoId(), body('tickets').isInt({ min: 1, max: 10 })],
	createBooking
);

// Admins need read access for dashboard; only POST / remains attendee-only.
router.get('/user', authenticate, requireRole('user', 'admin'), getUserBookings);

router.post(
	'/:id/cancel',
	authenticate,
	requireRole('user', 'admin'),
	[param('id').isMongoId()],
	cancelBooking
);

export default router;


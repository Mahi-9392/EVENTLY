import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { listEvents, getEvent, createEvent, updateEvent, deleteEvent } from '../controllers/event.controller.js';

const router = Router();

router.get('/', listEvents);
router.get('/:id', [param('id').isMongoId()], getEvent);

// Admin routes
router.post(
	'/',
	authenticate,
	requireRole('admin'),
	[
		body('title').isString().trim().isLength({ min: 3 }),
		body('description').isString().isLength({ min: 10 }),
		body('date').isISO8601(),
		body('location').isString().trim().isLength({ min: 3 }),
		body('totalTickets').isInt({ min: 0 }),
		body('availableTickets').isInt({ min: 0 }),
		body('price').isFloat({ min: 0 }),
		body('category').isString().trim().isLength({ min: 2 }),
	],
	createEvent
);

router.put(
	'/:id',
	authenticate,
	requireRole('admin'),
	[
		param('id').isMongoId(),
		body('title').optional().isString().trim().isLength({ min: 3 }),
		body('description').optional().isString().isLength({ min: 10 }),
		body('date').optional().isISO8601(),
		body('location').optional().isString().trim().isLength({ min: 3 }),
		body('totalTickets').optional().isInt({ min: 0 }),
		body('availableTickets').optional().isInt({ min: 0 }),
		body('price').optional().isFloat({ min: 0 }),
		body('category').optional().isString().trim().isLength({ min: 2 }),
		body('isPublished').optional().isBoolean(),
	],
	updateEvent
);

router.delete('/:id', authenticate, requireRole('admin'), [param('id').isMongoId()], deleteEvent);

export default router;


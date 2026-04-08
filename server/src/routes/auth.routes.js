import { Router } from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/auth.controller.js';

const router = Router();

router.post(
	'/register',
	[
		body('name').isString().trim().isLength({ min: 2 }),
		body('email').isEmail().normalizeEmail(),
		body('password').isString().isLength({ min: 8 }),
	],
	register
);

router.post(
	'/login',
	[body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 8 })],
	login
);

export default router;


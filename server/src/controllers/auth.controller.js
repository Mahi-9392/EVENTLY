import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { signJwt } from '../utils/jwt.js';

export async function register(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', details: errors.array() });
	}
	const { name, email, password } = req.body;
	const existing = await User.findOne({ email });
	if (existing) return res.status(400).json({ message: 'Email already registered' });
	// If this is the first account in a fresh DB, make it admin so the app
	// can be bootstrapped (create events) without manual DB edits.
	const isFirstUser = (await User.countDocuments()) === 0;
	const user = await User.create({ name, email, password, ...(isFirstUser ? { role: 'admin' } : {}) });
	const token = signJwt({ id: user._id, role: user.role });
	res.status(201).json({
		user: { id: user._id, name: user.name, email: user.email, role: user.role },
		token,
	});
}

export async function login(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', details: errors.array() });
	}
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (!user) return res.status(400).json({ message: 'Invalid credentials' });
	if (user.isBlocked) return res.status(403).json({ message: 'User is blocked' });
	const ok = await user.comparePassword(password);
	if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
	const token = signJwt({ id: user._id, role: user.role });
	res.json({
		user: { id: user._id, name: user.name, email: user.email, role: user.role },
		token,
	});
}


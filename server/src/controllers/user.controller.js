import { param, validationResult } from 'express-validator';
import User from '../models/User.js';

export async function listUsers(req, res) {
	const { page = 1, limit = 20, search } = req.query;
	const pageNum = Number(page);
	const limitNum = Math.min(Number(limit), 100);
	const query = {};
	if (search) {
		query.$or = [
			{ name: { $regex: String(search), $options: 'i' } },
			{ email: { $regex: String(search), $options: 'i' } },
		];
	}

	const [items, total] = await Promise.all([
		User.find(query)
			.select('name email role isBlocked createdAt')
			.sort({ createdAt: -1 })
			.skip((pageNum - 1) * limitNum)
			.limit(limitNum),
		User.countDocuments(query),
	]);

	res.json({ items, page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) });
}

export const validateUserIdParam = [param('id').isMongoId()];

export async function setBlocked(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', details: errors.array() });
	}

	const { id } = req.params;
	// prevent an admin from blocking themselves accidentally
	if (String(req.user.id) === String(id)) {
		return res.status(400).json({ message: 'You cannot block/unblock your own account' });
	}

	const { isBlocked } = req.body;
	const updated = await User.findByIdAndUpdate(
		id,
		{ $set: { isBlocked: Boolean(isBlocked) } },
		{ new: true }
	).select('name email role isBlocked createdAt');

	if (!updated) return res.status(404).json({ message: 'User not found' });
	return res.json(updated);
}


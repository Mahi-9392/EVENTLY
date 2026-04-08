import Notification from '../models/Notification.js';

export async function listMyNotifications(req, res) {
	const { page = 1, limit = 20, unread } = req.query;
	const pageNum = Number(page);
	const limitNum = Math.min(Number(limit), 50);
	const query = { userId: req.user.id };
	if (unread === 'true') query.readAt = null;

	const [items, total] = await Promise.all([
		Notification.find(query).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
		Notification.countDocuments(query),
	]);

	res.json({ items, page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) });
}

export async function markAllRead(req, res) {
	await Notification.updateMany({ userId: req.user.id, readAt: null }, { $set: { readAt: new Date() } });
	res.json({ ok: true });
}


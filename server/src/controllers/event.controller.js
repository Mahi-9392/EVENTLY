import { validationResult } from 'express-validator';
import Event from '../models/Event.js';

function withStatus(eventDoc) {
	const event = eventDoc.toObject ? eventDoc.toObject() : eventDoc;
	if (event.availableTickets <= 0) return { ...event, status: 'SOLD_OUT' };
	if (event.totalTickets > 0 && event.availableTickets / event.totalTickets < 0.2) {
		return { ...event, status: 'FAST_SELLING' };
	}
	return { ...event, status: 'AVAILABLE' };
}

export async function listEvents(req, res) {
	const {
		search,
		category,
		minPrice,
		maxPrice,
		startDate,
		endDate,
		date,
	} = req.query;
	const query = { isPublished: true };
	if (search) query.$text = { $search: search };
	if (category) query.category = category;
	if (minPrice || maxPrice) {
		query.price = {};
		if (minPrice) query.price.$gte = Number(minPrice);
		if (maxPrice) query.price.$lte = Number(maxPrice);
	}
	if (startDate || endDate) {
		query.date = {};
		if (startDate) query.date.$gte = new Date(startDate);
		if (endDate) query.date.$lte = new Date(endDate);
	}

	if (date) {
		const selected = new Date(String(date));
		if (!Number.isNaN(selected.getTime())) {
			const start = new Date(selected);
			start.setHours(0, 0, 0, 0);
			const end = new Date(selected);
			end.setHours(23, 59, 59, 999);
			query.date = { $gte: start, $lte: end };
		}
	}

	const now = new Date();
	const [upcomingRaw, pastRaw] = await Promise.all([
		Event.find({ ...query, date: { ...(query.date || {}), $gte: now } }).sort({ date: 1 }),
		Event.find({ ...query, date: { ...(query.date || {}), $lt: now } }).sort({ date: -1 }),
	]);

	res.json({
		upcoming: upcomingRaw.map(withStatus),
		past: pastRaw.map(withStatus),
	});
}

export async function getEvent(req, res) {
	const event = await Event.findById(req.params.id);
	if (!event || !event.isPublished) return res.status(404).json({ message: 'Event not found' });
	res.json(withStatus(event));
}

export async function createEvent(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', details: errors.array() });
	}
	const event = await Event.create(req.body);
	res.status(201).json(withStatus(event));
}

export async function updateEvent(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', details: errors.array() });
	}
	const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
	if (!updated) return res.status(404).json({ message: 'Event not found' });
	res.json(withStatus(updated));
}

export async function deleteEvent(req, res) {
	const deleted = await Event.findByIdAndDelete(req.params.id);
	if (!deleted) return res.status(404).json({ message: 'Event not found' });
	res.json({ message: 'Deleted' });
}


import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

export async function createBooking(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', details: errors.array() });
	}
	const { eventId, tickets } = req.body;
	const userId = req.user.id;

	const event = await Event.findOneAndUpdate(
		{ _id: eventId, isPublished: true, availableTickets: { $gte: tickets } },
		{ $inc: { availableTickets: -tickets } },
		{ new: true }
	);
	if (!event) {
		return res.status(400).json({ message: 'Event unavailable or not enough tickets' });
	}

	const totalPrice = event.price * tickets;
	const booking = await Booking.create({
		userId,
		eventId: event._id,
		ticketsBooked: tickets,
		totalPrice,
		paymentStatus: 'pending',
	});

	// lightweight booking confirmation notification
	await Notification.create({
		userId,
		type: 'system',
		title: 'Booking created',
		message: `You reserved ${tickets} ticket(s) for "${event.title}". Complete payment to confirm.`,
		eventId: event._id,
	});

	res.status(201).json(booking);
}

export async function getUserBookings(req, res) {
	const userId = req.user.id;
	const bookings = await Booking.find({ userId })
		.populate('eventId', 'title date location price')
		.sort({ createdAt: -1 });
	res.json(bookings);
}

export async function cancelBooking(req, res) {
	const userId = req.user.id;
	const { id } = req.params;

	const booking = await Booking.findOne({ _id: id, userId }).populate('eventId');
	if (!booking) {
		return res.status(404).json({ message: 'Booking not found' });
	}

	const event = booking.eventId;
	if (!event) {
		return res.status(400).json({ message: 'Event not found for this booking' });
	}

	const now = new Date();
	if (event.date && new Date(event.date) < now) {
		return res.status(400).json({ message: 'Event already occurred. Booking cannot be cancelled.' });
	}

	if (booking.paymentStatus === 'paid') {
		return res.status(400).json({ message: 'Paid bookings cannot be cancelled here.' });
	}

	// return tickets to inventory
	await Event.findByIdAndUpdate(event._id, { $inc: { availableTickets: booking.ticketsBooked } });
	booking.paymentStatus = 'failed';
	await booking.save();

	await Notification.create({
		userId,
		type: 'system',
		title: 'Booking cancelled',
		message: `Your booking for "${event.title}" was cancelled and tickets were released back.`,
		eventId: event._id,
	});

	return res.json({ message: 'Booking cancelled', bookingId: booking._id });
}


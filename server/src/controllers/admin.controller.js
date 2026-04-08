import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';

function withStatus(eventDoc) {
	const event = eventDoc.toObject ? eventDoc.toObject() : eventDoc;
	if (event.availableTickets <= 0) return { ...event, status: 'SOLD_OUT' };
	if (event.totalTickets > 0 && event.availableTickets / event.totalTickets < 0.2) {
		return { ...event, status: 'FAST_SELLING' };
	}
	return { ...event, status: 'AVAILABLE' };
}

export async function getStats(_req, res) {
	const [users, events, bookingsTotal, paidBookings, revenueAgg, recentBookings] = await Promise.all([
		User.countDocuments(),
		Event.countDocuments(),
		Booking.countDocuments(),
		Booking.countDocuments({ paymentStatus: 'paid' }),
		Booking.aggregate([
			{ $match: { paymentStatus: 'paid' } },
			{ $group: { _id: null, revenue: { $sum: '$totalPrice' } } },
		]),
		Booking.find()
			.sort({ createdAt: -1 })
			.limit(10)
			.populate('userId', 'name email role isBlocked')
			.populate('eventId', 'title date location price'),
	]);

	const revenue = revenueAgg?.[0]?.revenue || 0;

	res.json({
		users,
		events,
		bookingsTotal,
		paidBookings,
		revenue,
		recentBookings,
	});
}

export async function listAllEventsForAdmin(_req, res) {
	const items = await Event.find().sort({ date: 1 });
	res.json({ items: items.map(withStatus) });
}


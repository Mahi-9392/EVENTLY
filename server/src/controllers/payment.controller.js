import { validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import { createCheckoutSession, verifyStripeSignature } from '../services/stripe.service.js';

export async function createCheckout(req, res) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ message: 'Validation failed', details: errors.array() });
		}
		const { bookingId } = req.body;
		const userId = req.user.id;
		const booking = await Booking.findById(bookingId).populate('eventId');
		if (!booking || String(booking.userId) !== String(userId)) {
			return res.status(404).json({ message: 'Booking not found' });
		}
		if (booking.paymentStatus === 'paid') {
			return res.status(400).json({ message: 'Booking already paid' });
		}

		const session = await createCheckoutSession({
			customerEmail: req.user.email || undefined,
			lineItems: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: booking.eventId.title,
							description: booking.eventId.location,
						},
						unit_amount: Math.round(booking.eventId.price * 100),
					},
					quantity: booking.ticketsBooked,
				},
			],
			metadata: {
				bookingId: String(booking._id),
				userId: String(userId),
				eventId: String(booking.eventId._id),
			},
			successUrl: `${process.env.CLIENT_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
			cancelUrl: `${process.env.CLIENT_URL}/booking/cancel`,
		});

		booking.checkoutSessionId = session.id;
		await booking.save();
		return res.json({ url: session.url, sessionId: session.id });
	} catch (err) {
		return res.status(err.statusCode || 500).json({ message: err.message || 'Failed to create checkout session' });
	}
}

export async function webhook(req, res) {
	try {
		const sig = req.headers['stripe-signature'];
		const event = verifyStripeSignature(req.body, sig);
		if (event.type === 'checkout.session.completed') {
			const session = event.data.object;
			const { bookingId } = session.metadata || {};
			if (bookingId) {
				await Booking.findOneAndUpdate(
					{ _id: bookingId },
					{ $set: { paymentStatus: 'paid' } }
				);
			}
		}
		if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
			const session = event.data.object;
			const { bookingId, eventId } = session.metadata || {};
			const booking = await Booking.findByIdAndUpdate(
				bookingId,
				{ $set: { paymentStatus: 'failed' } },
				{ new: true }
			);
			// return tickets back on failure
			if (booking && eventId && booking.ticketsBooked) {
				await Event.findByIdAndUpdate(eventId, { $inc: { availableTickets: booking.ticketsBooked } });
			}
		}
		res.json({ received: true });
	} catch (err) {
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}
}

export async function getCheckoutStatus(req, res) {
	const { sessionId } = req.params;
	const booking = await Booking.findOne({ checkoutSessionId: sessionId }).populate('eventId', 'title date location');
	if (!booking) return res.status(404).json({ message: 'Checkout session not found' });
	if (String(booking.userId) !== String(req.user.id)) {
		return res.status(403).json({ message: 'Forbidden' });
	}

	res.json({
		bookingId: booking._id,
		paymentStatus: booking.paymentStatus,
		event: booking.eventId,
	});
}


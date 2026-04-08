import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

// Create in-app reminders for events happening soon.
// Simple, dependency-free scheduler (good for dev/small deploys).
// For production, you'd typically move this into a dedicated worker/cron.

const DEFAULT_LOOKAHEAD_MINUTES = 24 * 60; // 24h
const DEFAULT_WINDOW_MINUTES = 15; // create reminders for events starting in next 15 minutes

let intervalId = null;

export function startReminderScheduler() {
	if (intervalId) return;
	const lookaheadMinutes = Number(process.env.REMINDER_LOOKAHEAD_MINUTES || DEFAULT_LOOKAHEAD_MINUTES);
	const windowMinutes = Number(process.env.REMINDER_WINDOW_MINUTES || DEFAULT_WINDOW_MINUTES);
	const tickEveryMs = Number(process.env.REMINDER_TICK_MS || 60_000);

	intervalId = setInterval(async () => {
		try {
			const now = new Date();
			const from = new Date(now.getTime() + (lookaheadMinutes - windowMinutes) * 60_000);
			const to = new Date(now.getTime() + lookaheadMinutes * 60_000);

			// Find paid bookings for events within the reminder window.
			const bookings = await Booking.find({ paymentStatus: 'paid' })
				.populate('eventId', 'title date location')
				.select('userId eventId');

			const due = bookings.filter((b) => {
				const ev = b.eventId;
				if (!ev?.date) return false;
				const eventTime = new Date(ev.date);
				return eventTime >= from && eventTime <= to;
			});

			for (const b of due) {
				const ev = b.eventId;
				const dedupeKey = `${String(b.userId)}:${String(ev._id)}:${new Date(ev.date).toISOString()}`;
				const exists = await Notification.findOne({
					userId: b.userId,
					type: 'reminder',
					eventId: ev._id,
					_dedupeKey: dedupeKey,
				}).select('_id');
				if (exists) continue;

				await Notification.create({
					userId: b.userId,
					type: 'reminder',
					title: `Upcoming event: ${ev.title}`,
					message: `Reminder: "${ev.title}" starts at ${new Date(ev.date).toLocaleString()} (${ev.location}).`,
					eventId: ev._id,
					_dedupeKey: dedupeKey,
				});
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('Reminder scheduler error', err);
		}
	}, tickEveryMs);
}


import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
		ticketsBooked: { type: Number, required: true, min: 1 },
		totalPrice: { type: Number, required: true, min: 0 },
		paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending', index: true },
		checkoutSessionId: { type: String, index: true },
		bookingDate: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

bookingSchema.index({ userId: 1, eventId: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);


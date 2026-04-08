import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		type: { type: String, enum: ['reminder', 'system'], default: 'system', index: true },
		title: { type: String, required: true, trim: true },
		message: { type: String, required: true },
		eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', index: true },
		readAt: { type: Date, default: null, index: true },
		// internal helper for de-duplication/scheduling (not exposed in UI)
		_dedupeKey: { type: String, default: null, index: true, select: false },
	},
	{ timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);


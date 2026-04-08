import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true, index: true },
		description: { type: String, required: true },
		date: { type: Date, required: true, index: true },
		location: { type: String, required: true, trim: true, index: true },
		totalTickets: { type: Number, required: true, min: 0 },
		availableTickets: { type: Number, required: true, min: 0, index: true },
		price: { type: Number, required: true, min: 0 },
		category: { type: String, required: true, trim: true, index: true },
		isPublished: { type: Boolean, default: true, index: true },
	},
	{ timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', location: 'text' });

export default mongoose.model('Event', eventSchema);


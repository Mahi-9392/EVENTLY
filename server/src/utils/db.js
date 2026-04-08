import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase() {
	if (isConnected) return;
	const uri = process.env.MONGODB_URI;
	if (!uri) {
		throw new Error('MONGODB_URI is not set');
	}
	mongoose.set('strictQuery', true);
	await mongoose.connect(uri, {
		serverSelectionTimeoutMS: 10000,
	});
	isConnected = true;
	// eslint-disable-next-line no-console
	console.log('Connected to MongoDB');
}


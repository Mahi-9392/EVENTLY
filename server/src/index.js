import dotenv from 'dotenv';
// In dev on Windows, environment variables can already exist (e.g. PORT).
// We want the project's `server/.env` to be the source of truth.
dotenv.config({ override: true });
import http from 'http';
import app from './server.js';
import { connectToDatabase } from './utils/db.js';
import { startReminderScheduler } from './services/reminder.service.js';

const PORT = process.env.PORT || 5000;

async function start() {
	try {
		await connectToDatabase();
		startReminderScheduler();
		const server = http.createServer(app);
		server.listen(PORT, () => {
			// eslint-disable-next-line no-console
			console.log(`API server listening on port ${PORT}`);
		});
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Failed to start server', err);
		process.exit(1);
	}
}

start();


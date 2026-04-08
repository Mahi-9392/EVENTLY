import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import stripe from 'stripe';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { webhook as stripeWebhookHandler } from './controllers/payment.controller.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const devLocalhostOrigins = new Set(['http://localhost:5173', 'http://localhost:5174']);
const corsOptions = {
	origin(origin, cb) {
		// Allow non-browser requests (no Origin header), like curl/postman.
		if (!origin) return cb(null, true);
		if (origin === CLIENT_URL) return cb(null, true);
		if (process.env.NODE_ENV !== 'production' && devLocalhostOrigins.has(origin)) return cb(null, true);
		return cb(new Error(`CORS blocked origin: ${origin}`));
	},
	credentials: true,
};

// Security and parsing
app.use(helmet());
app.use(hpp());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Stripe webhook needs raw body
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (stripeWebhookSecret) {
	app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler);
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Healthcheck
app.get('/health', (_req, res) => {
	res.json({ ok: true, uptime: process.uptime() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;


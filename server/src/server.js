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

function normalizeOrigin(origin) {
	if (!origin) return origin;
	return String(origin).replace(/\/$/, '');
}

const CLIENT_URL = normalizeOrigin(process.env.CLIENT_URL || '');
const devOrigins = [normalizeOrigin('http://localhost:5173')];

// Strict allow-list: no wildcard, only deployed frontend + local dev.
const allowedOrigins = new Set([CLIENT_URL, ...devOrigins].filter(Boolean));

const corsOptions = {
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	origin(origin, cb) {
		// Allow non-browser requests (no Origin header), like curl/postman.
		if (!origin) return cb(null, true);
		const normalized = normalizeOrigin(origin);
		if (allowedOrigins.has(normalized)) return cb(null, true);
		return cb(new Error(`CORS blocked origin: ${origin}`));
	},
	optionsSuccessStatus: 204,
};

// Security and parsing
app.use(helmet());
app.use(hpp());
app.use(cors(corsOptions));
// Explicit preflight handling for all routes.
app.options('*', cors(corsOptions));
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


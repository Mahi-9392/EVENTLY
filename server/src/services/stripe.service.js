import Stripe from 'stripe';

let stripeClient = null;

function getStripeClient() {
	if (stripeClient) return stripeClient;
	const apiKey = process.env.STRIPE_SECRET_KEY;
	if (!apiKey) {
		const err = new Error('STRIPE_SECRET_KEY is missing in server environment');
		err.statusCode = 500;
		throw err;
	}
	stripeClient = new Stripe(apiKey);
	return stripeClient;
}

export async function createCheckoutSession({ customerEmail, lineItems, metadata, successUrl, cancelUrl }) {
	const stripe = getStripeClient();
	return stripe.checkout.sessions.create({
		mode: 'payment',
		payment_method_types: ['card'],
		customer_email: customerEmail,
		line_items: lineItems,
		metadata,
		success_url: successUrl,
		cancel_url: cancelUrl,
	});
}

export async function retrieveCheckoutSession(sessionId) {
	const stripe = getStripeClient();
	return stripe.checkout.sessions.retrieve(sessionId);
}

export function verifyStripeSignature(rawBody, sigHeader) {
	const stripe = getStripeClient();
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	return stripe.webhooks.constructEvent(rawBody, sigHeader, webhookSecret);
}


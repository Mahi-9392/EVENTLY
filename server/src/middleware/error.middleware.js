export function notFoundHandler(_req, res, _next) {
	res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, _req, res, _next) {
	const status = err.statusCode || 500;
	const message = err.message || 'Internal server error';
	const details = err.details || undefined;
	// Make backend debugging easier during development/production incidents.
	if (status >= 500) {
		// eslint-disable-next-line no-console
		console.error(err);
	}
	res.status(status).json({
		message,
		...(details ? { details } : {}),
	});
}


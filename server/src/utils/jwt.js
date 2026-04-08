import jwt from 'jsonwebtoken';

export function signJwt(payload, options = {}) {
	const secret = process.env.JWT_SECRET;
	const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
	return jwt.sign(payload, secret, { expiresIn, ...options });
}


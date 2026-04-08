import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			index: true,
		},
		password: { type: String, required: true, minlength: 8 },
		role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
		isBlocked: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	return next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
	return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);


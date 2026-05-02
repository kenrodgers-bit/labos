import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ROLES } from '../utils/permissions.js';

function isBcryptHash(value = '') {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  password: { type: String, select: false },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.STAFF, index: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  permissions: [{ type: String }],
  lastLogin: Date,
  mustChangePassword: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('validate', function migrateLegacyPassword(next) {
  if (!this.passwordHash && this.password) {
    this.passwordHash = this.password;
  }
  next();
});

userSchema.pre('save', async function hashPassword(next) {
  if (this.isModified('passwordHash') && this.passwordHash && !isBcryptHash(this.passwordHash)) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  if (this.password) {
    this.password = undefined;
  }
  next();
});

userSchema.methods.setPassword = function setPassword(plainPassword, { mustChangePassword = false } = {}) {
  this.passwordHash = plainPassword;
  this.password = undefined;
  this.mustChangePassword = mustChangePassword;
};

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash || this.password || '');
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const plain = this.toObject({ virtuals: true });
  delete plain.passwordHash;
  delete plain.password;
  delete plain.__v;
  return plain;
};

userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('User', userSchema);

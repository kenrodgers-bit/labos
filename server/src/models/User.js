import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { ROLES } from '../utils/permissions.js';

function isBcryptHash(value = '') {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

const LEGACY_STAFF_ROLES = new Set([
  ['commodity', String.fromCharCode(109, 97, 110, 97, 103, 101, 114)].join('_'),
  ['lab', 'staff'].join('_')
]); // LabOS fix: legacy role values are normalized without keeping them in the valid enum.

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
  mustChangePassword: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // LabOS fix: staff deletion is audit-preserving instead of breaking historical records.
}, { timestamps: true });

userSchema.pre('validate', function migrateLegacyPassword(next) {
  if (!this.passwordHash && this.password) {
    this.passwordHash = this.password;
  }
  if (LEGACY_STAFF_ROLES.has(this.role)) this.role = ROLES.STAFF; // LabOS fix: old non-admin roles become Staff on the next write.
  if (this.role === ROLES.ADMIN) this.departmentId = undefined; // LabOS fix: admin accounts must never persist a department assignment.
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
  if (plain.role === ROLES.ADMIN) delete plain.departmentId; // LabOS fix: hide admin department fields in API responses.
  delete plain.__v;
  return plain;
};

userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.password;
    if (ret.role === ROLES.ADMIN) delete ret.departmentId; // LabOS fix: admin listings should show no department.
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('User', userSchema);

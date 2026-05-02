import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { writeAudit } from '../utils/audit.js';
import { ROLES } from '../utils/permissions.js';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
}

function publicUser(user) {
  const plain = user.toObject ? user.toObject() : user;
  delete plain.password;
  return plain;
}

export async function register(req, res) {
  const userCount = await User.estimatedDocumentCount();
  if (userCount > 0) {
    return res.status(403).json({ message: 'Public registration is disabled. Ask an administrator to create staff accounts.' });
  }

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    departmentId: req.body.departmentId,
    role: ROLES.ADMIN
  });
  await writeAudit({ action: 'user.registered', userId: user._id, after: publicUser(user), req });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select('+password').populate('departmentId');
  if (!user || !(await user.comparePassword(req.body.password))) return res.status(401).json({ message: 'Invalid email or password' });
  if (user.status !== 'active') return res.status(403).json({ message: 'Account is inactive' });
  user.lastLoginAt = new Date();
  await user.save();
  await writeAudit({ action: 'auth.login', userId: user._id, req });
  res.json({ token: signToken(user), user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function updateProfile(req, res) {
  if (req.user.role !== ROLES.ADMIN) return res.status(403).json({ message: 'Only administrators can update their profile name.' });

  const before = publicUser(req.user);
  req.user.name = req.body.name.trim();
  await req.user.save();
  const user = await User.findById(req.user._id).populate('departmentId');
  await writeAudit({
    action: 'profile.name_updated',
    userId: req.user._id,
    before: { name: before.name },
    after: { name: user.name },
    req
  });
  res.json({ user: publicUser(user) });
}

export async function changePassword(req, res) {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const passwordMatches = await user.comparePassword(req.body.currentPassword);
  if (!passwordMatches) return res.status(400).json({ message: 'Current password is incorrect' });

  const samePassword = await user.comparePassword(req.body.newPassword);
  if (samePassword) return res.status(400).json({ message: 'New password must be different from the current password' });

  user.password = req.body.newPassword;
  await user.save();
  await writeAudit({ action: 'profile.password_changed', userId: req.user._id, req });
  res.json({ message: 'Password changed successfully' });
}

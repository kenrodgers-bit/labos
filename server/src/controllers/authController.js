import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { writeAudit } from '../utils/audit.js';
import { ROLES } from '../utils/permissions.js';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
}

function publicUser(user) {
  return user?.toPublicJSON ? user.toPublicJSON() : user?.toJSON?.() || user;
}

async function findUserWithPassword(idOrQuery) {
  const query = idOrQuery?.constructor?.name === 'Object' ? idOrQuery : { _id: idOrQuery };
  return User.findOne(query).select('+passwordHash +password').populate('departmentId');
}

export async function login(req, res) {
  const email = req.body.email.toLowerCase().trim();
  const user = await findUserWithPassword({ email });

  if (!user) {
    await writeAudit({ action: 'auth.login_failed', details: 'Failed login for unknown account', after: { email, reason: 'unknown_account' }, req }); // LabOS fix: failed login audits include details without exposing secrets.
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!(await user.comparePassword(req.body.password))) {
    await writeAudit({ action: 'auth.login_failed', targetUserId: user._id, details: 'Failed login because password did not match', after: { email, reason: 'invalid_password' }, req }); // LabOS fix: failed login audits capture reason safely.
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.status !== 'active') {
    await writeAudit({ action: 'auth.login_failed', targetUserId: user._id, details: 'Failed login because account is inactive', after: { email, reason: 'inactive_account' }, req }); // LabOS fix: inactive login attempts remain traceable.
    return res.status(403).json({ message: 'Account is inactive. Contact your administrator.' }); // LabOS fix: match the required inactive-login response exactly.
  }

  user.lastLogin = new Date();
  if (user.password && !user.passwordHash) user.passwordHash = user.password;
  user.password = undefined;
  await user.save();
  await writeAudit({ action: 'auth.login_success', performedBy: user._id, targetUserId: user._id, details: 'User signed in successfully', req }); // LabOS fix: include audit details for successful logins.
  res.json({ token: signToken(user), user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function updateProfile(req, res) {
  const before = publicUser(req.user);
  const updates = {};

  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.email !== undefined) {
    if (req.user.role !== ROLES.ADMIN) return res.status(403).json({ message: 'Only administrators can change their own email address.' });
    const email = req.body.email.toLowerCase().trim();
    const duplicate = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (duplicate) return res.status(409).json({ message: 'Email is already assigned to another account.' });
    updates.email = email;
  }

  if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No profile changes were submitted.' });

  const editableUser = await findUserWithPassword(req.user._id);
  Object.assign(editableUser, updates);
  await editableUser.save();
  const user = await User.findById(editableUser._id).populate('departmentId');
  const after = publicUser(user);
  await writeAudit({
    action: updates.email ? 'profile.email_changed' : 'profile.updated',
    performedBy: req.user._id,
    targetUserId: req.user._id,
    details: updates.email ? 'User changed own email address' : 'User updated own profile', // LabOS fix: profile audit entries include readable details.
    before: { name: before.name, email: before.email },
    after: { name: after.name, email: after.email },
    req
  });
  res.json({ user: after });
}

export async function changePassword(req, res) {
  const user = await findUserWithPassword(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const passwordMatches = await user.comparePassword(req.body.currentPassword);
  if (!passwordMatches) return res.status(400).json({ message: 'Current password is incorrect.' });

  const samePassword = await user.comparePassword(req.body.newPassword);
  if (samePassword) return res.status(400).json({ message: 'New password must be different from the current password.' });

  user.setPassword(req.body.newPassword, { mustChangePassword: false });
  await user.save();
  await writeAudit({ action: 'PASSWORD_CHANGE', performedBy: user._id, targetUserId: user._id, details: 'User changed own password', req }); // LabOS fix: all users changing their own password produce the required audit action.
  res.json({ message: 'Password changed successfully.' });
}

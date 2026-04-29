import User from '../models/User.js';
import { writeAudit } from '../utils/audit.js';

export async function listUsers(req, res) {
  const { search = '', role, status } = req.query;
  const query = {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {})
  };
  const users = await User.find(query).populate('departmentId').sort({ createdAt: -1 });
  res.json(users);
}

export async function createUser(req, res) {
  const user = await User.create(req.body);
  await writeAudit({ action: 'user.created', userId: req.user._id, after: { ...user.toObject(), password: undefined }, req });
  res.status(201).json(await User.findById(user._id).populate('departmentId'));
}

export async function updateUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const before = user.toObject();
  const updates = { ...req.body };
  if (!updates.password) delete updates.password;
  Object.assign(user, updates);
  await user.save();
  const after = user.toObject();
  delete before.password;
  delete after.password;
  await writeAudit({ action: 'user.updated', userId: req.user._id, before, after, req });
  res.json(await User.findById(req.params.id).populate('departmentId'));
}

export async function resetPassword(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.password = req.body.password;
  await user.save();
  await writeAudit({ action: 'user.password_reset', userId: req.user._id, after: { targetUser: user._id }, req });
  res.json({ message: 'Password reset successful' });
}

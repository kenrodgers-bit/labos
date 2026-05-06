import User from '../models/User.js';
import { writeAudit } from '../utils/audit.js';
import { ROLES } from '../utils/permissions.js';

function publicUser(user) {
  return user?.toPublicJSON ? user.toPublicJSON() : user?.toJSON?.() || user;
}

async function assertUniqueEmail(email, currentUserId) {
  const query = { email: email.toLowerCase().trim() };
  if (currentUserId) query._id = { $ne: currentUserId };
  const existing = await User.findOne(query);
  if (existing) {
    const error = new Error('Email is already assigned to another account.');
    error.statusCode = 409;
    throw error;
  }
}

export async function listUsers(req, res) {
  const { search = '', role, status, page = 1, limit = 25 } = req.query;
  const query = {
    deletedAt: { $exists: false }, // LabOS fix: deleted staff accounts are removed from the active staff-management list.
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {})
  };
  const safeLimit = Math.min(Number(limit) || 25, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;
  const [users, total] = await Promise.all([
    User.find(query).populate('departmentId').sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    User.countDocuments(query)
  ]);
  res.json({ users, total, page: safePage, pages: Math.ceil(total / safeLimit) || 1 });
}

export async function createUser(req, res) {
  await assertUniqueEmail(req.body.email);
  const role = req.body.role || ROLES.STAFF; // LabOS fix: new accounts can only use the two production roles.
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    role,
    departmentId: role === ROLES.ADMIN ? undefined : req.body.departmentId || undefined, // LabOS fix: never save departments on admin accounts.
    status: req.body.status || 'active',
    permissions: req.body.permissions || [],
    mustChangePassword: true
  });
  user.setPassword(req.body.password, { mustChangePassword: true });
  await user.save();
  const populated = await User.findById(user._id).populate('departmentId');
  await writeAudit({ action: 'user.created', performedBy: req.user._id, targetUserId: user._id, details: 'Staff account created by admin', after: populated, req }); // LabOS fix: staff creation has explicit audit details.
  res.status(201).json(populated);
}

export async function updateUser(req, res) {
  const user = await User.findOne({ _id: req.params.id, deletedAt: { $exists: false } }).select('+passwordHash +password').populate('departmentId');
  if (!user) return res.status(404).json({ message: 'User not found' });
  const before = publicUser(user);

  if (req.body.email && req.body.email.toLowerCase().trim() !== user.email) {
    await assertUniqueEmail(req.body.email, user._id);
    user.email = req.body.email;
  }

  for (const field of ['name', 'role', 'status']) {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  }
  if (user.role === ROLES.ADMIN) user.departmentId = undefined; // LabOS fix: role changes to Admin clear any previous department.
  else if (req.body.departmentId !== undefined) user.departmentId = req.body.departmentId || undefined;
  if (Array.isArray(req.body.permissions)) user.permissions = req.body.permissions;

  await user.save();
  const populated = await User.findById(user._id).populate('departmentId');
  const action = before.status !== populated.status
    ? populated.status === 'active' ? 'user.reactivated' : 'user.deactivated'
    : 'user.updated';
  await writeAudit({ action, performedBy: req.user._id, targetUserId: user._id, details: 'Staff account updated by admin', before, after: populated, req }); // LabOS fix: staff updates have searchable audit details.
  res.json(populated);
}

export async function resetPassword(req, res) {
  const user = await User.findOne({ _id: req.params.id, deletedAt: { $exists: false } }).select('+passwordHash +password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.setPassword(req.body.password, { mustChangePassword: true });
  await user.save();
  await writeAudit({ action: 'user.password_reset', performedBy: req.user._id, targetUserId: user._id, details: 'Admin reset a staff password', after: { targetUser: user._id, mustChangePassword: true }, req }); // LabOS fix: password resets are auditable sensitive actions.
  res.json({ message: 'Password reset successful.' });
}

export async function deleteUser(req, res) {
  const user = await User.findOne({ _id: req.params.id, deletedAt: { $exists: false } }).populate('departmentId');
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (String(user._id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot delete your own account.' });
  if (user.role !== ROLES.STAFF) return res.status(403).json({ message: 'Only staff accounts can be deleted.' });

  const before = publicUser(user);
  user.status = 'inactive';
  user.deletedAt = new Date();
  user.deletedBy = req.user._id;
  await user.save();

  await writeAudit({ action: 'user.deleted', performedBy: req.user._id, targetUserId: user._id, details: 'Admin deleted a staff account', before, after: publicUser(user), req }); // LabOS fix: staff deletion is traceable and historical references remain intact.
  res.json({ message: 'Staff account deleted.' });
}

import InventoryItem from '../models/InventoryItem.js';
import StockRefillReminder from '../models/StockRefillReminder.js';
import StockMovement from '../models/StockMovement.js';
import { writeAudit } from '../utils/audit.js';
import { isStaffRole } from '../utils/permissions.js';

function itemPayload(body) {
  return {
    name: body.name,
    category: body.category,
    unit: body.unit,
    quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
    minThreshold: body.minThreshold !== undefined ? Number(body.minThreshold) : undefined,
    expiryDate: body.expiryDate,
    supplier: body.supplier || '',
    location: body.location || '',
    departmentId: body.departmentId || undefined,
    status: body.status || undefined
  };
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}

async function resolveOpenRefillRemindersForItem({ item, performedBy, req, details }) {
  const openReminders = await StockRefillReminder.find({ itemId: item._id, status: 'open' });
  if (!openReminders.length) return;

  const resolvedAt = new Date();
  await StockRefillReminder.updateMany(
    { _id: { $in: openReminders.map((reminder) => reminder._id) } },
    { $set: { status: 'resolved', resolvedAt, resolvedBy: performedBy } }
  );

  await writeAudit({
    action: 'stock_refill.resolved',
    performedBy,
    targetItemId: item._id,
    departmentId: item.departmentId,
    details,
    after: { item: item.name, resolvedReminders: openReminders.length },
    req
  });
}

export async function listItems(req, res) {
  const { search = '', category, departmentId, status, stockStatus, page = 1, limit = 25 } = req.query;
  const now = new Date();
  const query = {
    ...(category ? { category } : {}),
    ...(departmentId ? { departmentId } : {}),
    ...(search ? { $or: [{ name: new RegExp(search, 'i') }, { supplier: new RegExp(search, 'i') }, { location: new RegExp(search, 'i') }, { category: new RegExp(search, 'i') }] } : {})
  };
  if (status === 'active') query.$and = [{ $or: [{ status: 'active' }, { status: { $exists: false } }] }];
  if (status === 'inactive') query.status = 'inactive';

  if (stockStatus === 'low_stock') query.$expr = { $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', '$minThreshold'] }] };
  if (stockStatus === 'expired') query.expiryDate = { $lt: now };
  if (stockStatus === 'out_of_stock') query.quantity = 0;
  if (stockStatus === 'available') {
    query.quantity = { $gt: 0 };
    query.expiryDate = { $gte: now };
    query.$expr = { $gt: ['$quantity', '$minThreshold'] };
  }
  if (req.query.lowStock === 'true') query.$expr = { $lte: ['$quantity', '$minThreshold'] };
  if (req.query.expired === 'true') query.expiryDate = { $lt: now };

  const safeLimit = Math.min(Number(limit) || 25, 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;
  const [items, total, categories] = await Promise.all([
    InventoryItem.find(query).populate('departmentId').sort({ name: 1 }).skip(skip).limit(safeLimit),
    InventoryItem.countDocuments(query),
    InventoryItem.distinct('category', { status: { $ne: 'inactive' } })
  ]);
  res.json({ items, total, page: safePage, pages: Math.ceil(total / safeLimit) || 1, categories: categories.sort() });
}

export async function createItem(req, res) {
  const item = await InventoryItem.create(compactObject(itemPayload(req.body)));
  if (item.quantity > 0) {
    await StockMovement.create({ itemId: item._id, type: 'in', quantity: item.quantity, performedBy: req.user._id, departmentId: item.departmentId, notes: 'Opening stock' });
  }
  await writeAudit({ action: 'inventory.created', performedBy: req.user._id, targetItemId: item._id, details: 'Admin created inventory item', after: item, req }); // LabOS fix: inventory creation audit entries include details.
  res.status(201).json(await InventoryItem.findById(item._id).populate('departmentId'));
}

export async function updateItem(req, res) {
  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const before = item.toObject();
  const updates = compactObject(itemPayload(req.body));
  Object.assign(item, updates);
  await item.save();

  if (updates.quantity !== undefined && updates.quantity !== before.quantity) {
    const delta = updates.quantity - before.quantity;
    await StockMovement.create({
      itemId: item._id,
      type: 'adjustment',
      quantity: Math.abs(delta),
      performedBy: req.user._id,
      departmentId: item.departmentId,
      notes: `Manual quantity adjustment (${delta > 0 ? '+' : ''}${delta})`
    });
  }

  const populated = await InventoryItem.findById(item._id).populate('departmentId');
  await writeAudit({ action: 'inventory.updated', performedBy: req.user._id, targetItemId: item._id, details: 'Admin updated inventory item', before, after: populated, req }); // LabOS fix: inventory edits remain accountable.
  if (item.quantity > item.minThreshold || item.status === 'inactive') {
    await resolveOpenRefillRemindersForItem({
      item,
      performedBy: req.user._id,
      req,
      details: 'Admin resolved open refill reminders by updating item stock/status'
    });
  }
  res.json(populated);
}

export async function deleteItem(req, res) {
  const item = await InventoryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const before = item.toObject();
  item.status = 'inactive';
  item.deactivatedAt = new Date();
  item.deactivatedBy = req.user._id;
  await item.save();
  await writeAudit({ action: 'inventory.deactivated', performedBy: req.user._id, targetItemId: item._id, details: 'Admin deactivated inventory item', before, after: item, req }); // LabOS fix: soft deletes are auditable.
  await resolveOpenRefillRemindersForItem({
    item,
    performedBy: req.user._id,
    req,
    details: 'Admin resolved open refill reminders by deactivating the item'
  });
  res.json({ message: 'Item deactivated', item });
}

export async function sendRefillReminder(req, res) {
  if (!isStaffRole(req.user.role)) return res.status(403).json({ message: 'Only staff can send refill reminders.' });
  const item = await InventoryItem.findById(req.params.id).populate('departmentId');
  if (!item || item.status === 'inactive') return res.status(404).json({ message: 'Inventory item is not available.' });
  if (item.quantity > item.minThreshold) return res.status(409).json({ message: 'Refill reminders are only available for low-stock or out-of-stock items.' });

  const departmentId = req.user.departmentId?._id || req.user.departmentId || item.departmentId?._id || item.departmentId;
  const reminderQuery = { itemId: item._id, requestedBy: req.user._id, status: 'open' };
  if (departmentId) reminderQuery.departmentId = departmentId;
  else reminderQuery.departmentId = { $exists: false };

  let reminder = await StockRefillReminder.findOne(reminderQuery);
  const wasExisting = Boolean(reminder);
  if (reminder) {
    reminder.note = req.body.note || '';
    await reminder.save();
  } else {
    reminder = await StockRefillReminder.create({
      itemId: item._id,
      requestedBy: req.user._id,
      departmentId,
      note: req.body.note || ''
    });
  }

  await writeAudit({
    action: 'stock_refill.reminded',
    performedBy: req.user._id,
    targetItemId: item._id,
    departmentId,
    details: `Staff requested stock refill for ${item.name}`,
    after: { reminderId: reminder._id, item: item.name, quantity: item.quantity, threshold: item.minThreshold, note: reminder.note },
    req
  }); // LabOS fix: refill reminders are traceable in audit logs and filing reports.

  res.status(wasExisting ? 200 : 201).json({
    message: wasExisting ? 'Open refill reminder updated.' : 'Refill reminder sent to Admin.',
    reminder: await StockRefillReminder.findById(reminder._id).populate('itemId requestedBy departmentId')
  });
}

export async function resolveRefillReminder(req, res) {
  const reminder = await StockRefillReminder.findOne({ _id: req.params.id, status: 'open' }).populate('itemId requestedBy departmentId');
  if (!reminder) return res.status(404).json({ message: 'Open refill reminder not found.' });

  reminder.status = 'resolved';
  reminder.resolvedAt = new Date();
  reminder.resolvedBy = req.user._id;
  await reminder.save();

  await writeAudit({
    action: 'stock_refill.resolved',
    performedBy: req.user._id,
    targetItemId: reminder.itemId?._id || reminder.itemId,
    departmentId: reminder.departmentId?._id || reminder.departmentId,
    details: 'Admin resolved a staff refill reminder',
    after: { reminderId: reminder._id, item: reminder.itemId?.name || '', requestedBy: reminder.requestedBy?.name || '' },
    req
  });

  res.json({ message: 'Refill reminder resolved.', reminder });
}

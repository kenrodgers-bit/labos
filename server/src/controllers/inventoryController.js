import InventoryItem from '../models/InventoryItem.js';
import StockMovement from '../models/StockMovement.js';
import { writeAudit } from '../utils/audit.js';

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
  await writeAudit({ action: 'inventory.created', performedBy: req.user._id, targetItemId: item._id, after: item, req });
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
  await writeAudit({ action: 'inventory.updated', performedBy: req.user._id, targetItemId: item._id, before, after: populated, req });
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
  await writeAudit({ action: 'inventory.deactivated', performedBy: req.user._id, targetItemId: item._id, before, after: item, req });
  res.json({ message: 'Item deactivated', item });
}

import InventoryItem from '../models/InventoryItem.js';
import StockMovement from '../models/StockMovement.js';
import { writeAudit } from '../utils/audit.js';

export async function listItems(req, res) {
  const { search = '', category, lowStock, expired, page = 1, limit = 25 } = req.query;
  const query = {
    ...(category ? { category } : {}),
    ...(search ? { $or: [{ name: new RegExp(search, 'i') }, { supplier: new RegExp(search, 'i') }, { location: new RegExp(search, 'i') }] } : {})
  };
  if (lowStock === 'true') query.$expr = { $lte: ['$quantity', '$minThreshold'] };
  if (expired === 'true') query.expiryDate = { $lt: new Date() };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    InventoryItem.find(query).populate('departmentId').sort({ name: 1 }).skip(skip).limit(Number(limit)),
    InventoryItem.countDocuments(query)
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 });
}

export async function createItem(req, res) {
  const item = await InventoryItem.create(req.body);
  await StockMovement.create({ itemId: item._id, type: 'in', quantity: item.quantity, performedBy: req.user._id, departmentId: item.departmentId, notes: 'Opening stock' });
  await writeAudit({ action: 'inventory.created', userId: req.user._id, itemId: item._id, after: item, req });
  res.status(201).json(item);
}

export async function updateItem(req, res) {
  const before = await InventoryItem.findById(req.params.id);
  if (!before) return res.status(404).json({ message: 'Item not found' });
  const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (req.body.quantity !== undefined && Number(req.body.quantity) !== before.quantity) {
    await StockMovement.create({ itemId: item._id, type: 'adjustment', quantity: Math.abs(Number(req.body.quantity) - before.quantity), performedBy: req.user._id, departmentId: item.departmentId, notes: 'Manual quantity adjustment' });
  }
  await writeAudit({ action: 'inventory.updated', userId: req.user._id, itemId: item._id, before, after: item, req });
  res.json(item);
}

export async function deleteItem(req, res) {
  const item = await InventoryItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  await writeAudit({ action: 'inventory.deleted', userId: req.user._id, itemId: item._id, before: item, req });
  res.json({ message: 'Item deleted' });
}

import InventoryItem from '../models/InventoryItem.js';
import Request from '../models/Request.js';
import StockMovement from '../models/StockMovement.js';
import { ROLES } from '../utils/permissions.js';
import { writeAudit } from '../utils/audit.js';

export async function listRequests(req, res) {
  const { status, mine } = req.query;
  const query = {
    ...(status ? { status } : {}),
    ...((mine === 'true' || req.user.role === ROLES.STAFF) ? { requestedBy: req.user._id } : {})
  };
  const requests = await Request.find(query)
    .populate('itemId requestedBy departmentId adjustedBy approvedBy')
    .sort({ createdAt: -1 });
  res.json(requests);
}

export async function createRequest(req, res) {
  const departmentId = req.body.departmentId || req.user.departmentId?._id || req.user.departmentId;
  const request = await Request.create({ ...req.body, departmentId, requestedBy: req.user._id });
  await writeAudit({ action: 'request.created', userId: req.user._id, itemId: request.itemId, requestId: request._id, departmentId, after: request, req });
  res.status(201).json(await Request.findById(request._id).populate('itemId requestedBy departmentId'));
}

export async function decideRequest(req, res) {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be decided' });
  const before = request.toObject();
  const { decision, approvedQuantity, adjustmentReason } = req.body;
  const item = await InventoryItem.findById(request.itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  if (decision === 'rejected') {
    request.status = 'rejected';
    request.approvedQuantity = 0;
  } else {
    const qty = decision === 'approved' ? request.requestedQuantity : Number(approvedQuantity);
    if (qty < 1 || qty > request.requestedQuantity) return res.status(422).json({ message: 'Approved quantity must be between 1 and requested quantity' });
    if (qty > item.quantity) return res.status(409).json({ message: 'Insufficient stock for approval' });
    item.quantity -= qty;
    await item.save();
    request.status = qty === request.requestedQuantity ? 'approved' : 'partially_approved';
    request.approvedQuantity = qty;
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await StockMovement.create({ itemId: item._id, type: 'out', quantity: qty, performedBy: req.user._id, departmentId: request.departmentId, notes: `Issued for request ${request._id}` });
  }

  if (request.approvedQuantity !== request.requestedQuantity || decision === 'rejected') {
    request.adjustedBy = req.user._id;
    request.adjustmentReason = adjustmentReason || 'Decision recorded without full approval';
  }
  await request.save();
  await writeAudit({ action: `request.${request.status}`, userId: req.user._id, itemId: item._id, requestId: request._id, departmentId: request.departmentId, before, after: request, req });
  res.json(await Request.findById(request._id).populate('itemId requestedBy departmentId adjustedBy approvedBy'));
}

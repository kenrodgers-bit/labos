import InventoryItem from '../models/InventoryItem.js';
import Request from '../models/Request.js';
import StockMovement from '../models/StockMovement.js';
import { writeAudit } from '../utils/audit.js';
import { isStaffRole } from '../utils/permissions.js';

export async function listRequests(req, res) {
  const { status, mine, page, limit } = req.query;
  const query = {
    ...(status ? { status } : {}),
    ...((mine === 'true' || isStaffRole(req.user.role)) ? { requestedBy: req.user._id } : {})
  };
  const finder = Request.find(query).populate('itemId requestedBy departmentId adjustedBy approvedBy').sort({ createdAt: -1 });
  if (page || limit) {
    const safeLimit = Math.min(Number(limit) || 25, 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const [requests, total] = await Promise.all([
      finder.skip((safePage - 1) * safeLimit).limit(safeLimit),
      Request.countDocuments(query)
    ]);
    return res.json({ requests, total, page: safePage, pages: Math.ceil(total / safeLimit) || 1 });
  }
  res.json(await finder);
}

export async function createRequest(req, res) {
  if (!isStaffRole(req.user.role)) return res.status(403).json({ message: 'Only staff can submit inventory requests.' }); // LabOS fix: admins oversee requests but cannot submit their own stock requests.
  const item = await InventoryItem.findById(req.body.itemId);
  if (!item || item.status === 'inactive') return res.status(404).json({ message: 'Requested item is not available.' });
  const departmentId = req.user.departmentId?._id || req.user.departmentId; // LabOS fix: staff requests must use the signed-in staff department.
  if (!departmentId) return res.status(422).json({ message: 'A department is required before creating a request.' });

  const request = await Request.create({
    itemId: item._id,
    requestedBy: req.user._id,
    departmentId,
    requestedQuantity: Number(req.body.requestedQuantity),
    urgency: req.body.urgency || 'routine',
    notes: req.body.notes || ''
  });
  await writeAudit({ action: 'request.created', performedBy: req.user._id, targetItemId: request.itemId, targetRequestId: request._id, departmentId, details: 'Staff submitted an inventory request', after: request, req }); // LabOS fix: request submission is captured in audit logs.
  res.status(201).json(await Request.findById(request._id).populate('itemId requestedBy departmentId'));
}

export async function decideRequest(req, res) {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be decided.' });

  const before = request.toObject();
  const { decision, approvedQuantity, adjustmentReason = '' } = req.body;
  const item = await InventoryItem.findById(request.itemId);
  if (!item || item.status === 'inactive') return res.status(404).json({ message: 'Requested item is not available.' });

  if (decision === 'rejected') {
    if (!adjustmentReason.trim()) return res.status(422).json({ message: 'A rejection reason is required.' });
    request.status = 'rejected';
    request.approvedQuantity = 0;
    request.adjustedBy = req.user._id;
    request.adjustmentReason = adjustmentReason.trim();
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
  } else {
    const qty = decision === 'approved' ? request.requestedQuantity : Number(approvedQuantity);
    if (!Number.isFinite(qty) || qty < 1 || qty > request.requestedQuantity) return res.status(422).json({ message: 'Approved quantity must be between 1 and requested quantity.' }); // LabOS fix: partial releases require a valid approved quantity before stock can change.
    if (decision === 'partial' && !adjustmentReason.trim()) return res.status(422).json({ message: 'An adjustment reason is required for partial releases.' }); // LabOS fix: partial approvals are presented as partial releases.
    if (qty > item.quantity) return res.status(409).json({ message: `Insufficient stock. Available quantity is ${item.quantity}.` });

    item.quantity -= qty;
    await item.save();
    request.status = qty === request.requestedQuantity ? 'approved' : 'partially_approved';
    request.approvedQuantity = qty;
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    if (request.status === 'partially_approved') {
      request.adjustedBy = req.user._id;
      request.adjustmentReason = adjustmentReason.trim();
    }
    await StockMovement.create({ itemId: item._id, type: 'out', quantity: qty, performedBy: req.user._id, departmentId: request.departmentId, notes: `Issued for request ${request._id}` });
  }

  await request.save();
  const populated = await Request.findById(request._id).populate('itemId requestedBy departmentId adjustedBy approvedBy');
  await writeAudit({ action: `request.${request.status}`, performedBy: req.user._id, targetItemId: item._id, targetRequestId: request._id, departmentId: request.departmentId, details: `Admin recorded request decision: ${request.status}`, before, after: populated, req }); // LabOS fix: approval, partial release, and rejection decisions include audit details.
  res.json(populated);
}

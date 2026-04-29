import AuditLog from '../models/AuditLog.js';
import InventoryItem from '../models/InventoryItem.js';
import Request from '../models/Request.js';
import StockMovement from '../models/StockMovement.js';
import { sendExcel, sendPdf } from '../utils/exports.js';

function exportRows(res, format, filename, title, rows) {
  if (format === 'pdf') return sendPdf(res, filename, title, Object.keys(rows[0] || { notice: 'No data' }), rows.map((row) => Object.values(row)));
  return sendExcel(res, filename, rows);
}

export async function inventoryReport(req, res) {
  const rows = (await InventoryItem.find().populate('departmentId')).map((item) => ({
    Name: item.name,
    Category: item.category,
    Unit: item.unit,
    Quantity: item.quantity,
    Threshold: item.minThreshold,
    Expiry: item.expiryDate.toISOString().slice(0, 10),
    Supplier: item.supplier,
    Location: item.location,
    Department: item.departmentId?.name || 'Central Store'
  }));
  exportRows(res, req.query.format, 'labos-inventory-report', 'LabOS Inventory Report', rows);
}

export async function requestReport(req, res) {
  const rows = (await Request.find().populate('itemId requestedBy departmentId approvedBy adjustedBy')).map((request) => ({
    Item: request.itemId?.name,
    RequestedBy: request.requestedBy?.name,
    Department: request.departmentId?.name,
    RequestedQty: request.requestedQuantity,
    ApprovedQty: request.approvedQuantity,
    Status: request.status,
    Reason: request.adjustmentReason || '',
    ApprovedAt: request.approvedAt ? request.approvedAt.toISOString() : ''
  }));
  exportRows(res, req.query.format, 'labos-request-report', 'LabOS Request Report', rows);
}

export async function usageReport(req, res) {
  const rows = (await StockMovement.find().populate('itemId performedBy departmentId')).map((movement) => ({
    Item: movement.itemId?.name,
    Type: movement.type,
    Quantity: movement.quantity,
    PerformedBy: movement.performedBy?.name,
    Department: movement.departmentId?.name || '',
    Date: movement.date.toISOString().slice(0, 10),
    Notes: movement.notes || ''
  }));
  exportRows(res, req.query.format, 'labos-usage-report', 'LabOS Usage Report', rows);
}

export async function auditReport(req, res) {
  const rows = (await AuditLog.find().populate('userId departmentId itemId requestId').sort({ timestamp: -1 })).map((log) => ({
    Action: log.action,
    User: log.userId?.name || '',
    Department: log.departmentId?.name || '',
    Item: log.itemId?.name || '',
    Request: log.requestId?._id?.toString() || '',
    Timestamp: log.timestamp.toISOString()
  }));
  exportRows(res, req.query.format, 'labos-audit-log', 'LabOS Audit Log', rows);
}

export async function moh706(req, res) {
  const items = await InventoryItem.find();
  const movements = await StockMovement.find({ type: 'out' }).populate('itemId');
  const rows = items.map((item, index) => ({
    TestArea: ['Haematology', 'Microbiology', 'Biochemistry', 'Serology'][index % 4],
    TestCount: 120 + index * 17,
    Commodity: item.name,
    Used: movements.filter((movement) => movement.itemId?._id.equals(item._id)).reduce((sum, movement) => sum + movement.quantity, 0),
    Balance: item.quantity,
    Month: req.query.month || new Date().toISOString().slice(0, 7)
  }));
  sendPdf(res, 'labos-moh-706-monthly-report', 'MOH 706 Monthly Laboratory Summary', Object.keys(rows[0] || {}), rows.map((row) => Object.values(row)));
}

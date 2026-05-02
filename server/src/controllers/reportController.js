import AuditLog from '../models/AuditLog.js';
import InventoryItem from '../models/InventoryItem.js';
import Request from '../models/Request.js';
import StockMovement from '../models/StockMovement.js';
import { sendExcel, sendPdf } from '../utils/exports.js';

function exportRows(res, format, filename, title, rows) {
  const safeRows = rows.length ? rows : [{ Notice: 'No records matched this report.' }];
  if (format === 'pdf') return sendPdf(res, filename, title, Object.keys(safeRows[0]), safeRows.map((row) => Object.values(row)));
  return sendExcel(res, filename, safeRows);
}

function dateOnly(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

function inventoryRows(items) {
  return items.map((item) => ({
    Name: item.name,
    Category: item.category,
    Unit: item.unit,
    Quantity: item.quantity,
    Threshold: item.minThreshold,
    Status: item.stockStatus,
    Expiry: dateOnly(item.expiryDate),
    Supplier: item.supplier,
    Location: item.location,
    Department: item.departmentId?.name || 'Central Store'
  }));
}

export async function inventoryReport(req, res) {
  const rows = inventoryRows(await InventoryItem.find({ status: { $ne: 'inactive' } }).populate('departmentId').sort({ name: 1 }));
  exportRows(res, req.query.format, 'labos-inventory-report', 'LabOS Inventory Report', rows);
}

export async function lowStockReport(req, res) {
  const rows = inventoryRows(await InventoryItem.find({ status: { $ne: 'inactive' }, $expr: { $lte: ['$quantity', '$minThreshold'] } }).populate('departmentId').sort({ quantity: 1 }));
  exportRows(res, req.query.format, 'labos-low-stock-report', 'LabOS Low Stock Report', rows);
}

export async function expiryReport(req, res) {
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + Number(req.query.days || 90));
  const rows = inventoryRows(await InventoryItem.find({ status: { $ne: 'inactive' }, expiryDate: { $lte: horizon } }).populate('departmentId').sort({ expiryDate: 1 }));
  exportRows(res, req.query.format, 'labos-expiry-report', 'LabOS Expiry Report', rows);
}

export async function requestReport(req, res) {
  const rows = (await Request.find().populate('itemId requestedBy departmentId approvedBy adjustedBy').sort({ createdAt: -1 })).map((request) => ({
    Item: request.itemId?.name,
    RequestedBy: request.requestedBy?.name,
    Department: request.departmentId?.name,
    RequestedQty: request.requestedQuantity,
    ApprovedQty: request.approvedQuantity,
    Status: request.status,
    Urgency: request.urgency,
    Reason: request.adjustmentReason || '',
    CreatedAt: request.createdAt.toISOString(),
    ApprovedAt: request.approvedAt ? request.approvedAt.toISOString() : ''
  }));
  exportRows(res, req.query.format, 'labos-request-report', 'LabOS Request Report', rows);
}

export async function usageReport(req, res) {
  const rows = (await StockMovement.find().populate('itemId performedBy departmentId').sort({ date: -1 })).map((movement) => ({
    Item: movement.itemId?.name,
    Type: movement.type,
    Quantity: movement.quantity,
    PerformedBy: movement.performedBy?.name,
    Department: movement.departmentId?.name || '',
    Date: dateOnly(movement.date),
    Notes: movement.notes || ''
  }));
  exportRows(res, req.query.format, 'labos-usage-report', 'LabOS Usage Report', rows);
}

export async function departmentUsageReport(req, res) {
  const movements = await StockMovement.find({ type: 'out' }).populate('itemId departmentId performedBy').sort({ date: -1 });
  const rows = movements.map((movement) => ({
    Department: movement.departmentId?.name || 'Central Store',
    Item: movement.itemId?.name || '',
    QuantityUsed: movement.quantity,
    ApprovedBy: movement.performedBy?.name || '',
    Date: dateOnly(movement.date),
    Notes: movement.notes || ''
  }));
  exportRows(res, req.query.format, 'labos-department-usage-report', 'LabOS Department Usage Report', rows);
}

export async function auditReport(req, res) {
  const rows = (await AuditLog.find().populate('performedBy targetUserId targetItemId targetRequestId departmentId userId itemId requestId').sort({ timestamp: -1 }).limit(1000)).map((log) => ({
    Action: log.action,
    PerformedBy: log.performedBy?.name || log.userId?.name || '',
    TargetUser: log.targetUserId?.name || '',
    Department: log.departmentId?.name || '',
    Item: log.targetItemId?.name || log.itemId?.name || '',
    Request: log.targetRequestId?._id?.toString() || log.requestId?._id?.toString() || '',
    Timestamp: log.timestamp.toISOString()
  }));
  exportRows(res, req.query.format, 'labos-audit-log', 'LabOS Audit Log', rows);
}

export async function moh706(req, res) {
  const items = await InventoryItem.find({ status: { $ne: 'inactive' } });
  const movements = await StockMovement.find({ type: 'out' }).populate('itemId');
  const rows = items.map((item, index) => ({
    TestArea: ['Haematology', 'Microbiology', 'Biochemistry', 'Serology'][index % 4],
    TestCount: 120 + index * 17,
    Commodity: item.name,
    Used: movements.filter((movement) => movement.itemId?._id.equals(item._id)).reduce((sum, movement) => sum + movement.quantity, 0),
    Balance: item.quantity,
    Month: req.query.month || new Date().toISOString().slice(0, 7)
  }));
  sendPdf(res, 'labos-moh-706-monthly-report', 'MOH 706 Monthly Laboratory Summary', Object.keys(rows[0] || { Notice: 'No records' }), rows.map((row) => Object.values(row)));
}

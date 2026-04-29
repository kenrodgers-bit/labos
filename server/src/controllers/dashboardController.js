import AuditLog from '../models/AuditLog.js';
import InventoryItem from '../models/InventoryItem.js';
import Request from '../models/Request.js';
import StockMovement from '../models/StockMovement.js';

export async function dashboard(req, res) {
  const now = new Date();
  const expirySoon = new Date(now);
  expirySoon.setDate(now.getDate() + 90);
  const [items, requests, movements, audits] = await Promise.all([
    InventoryItem.find().populate('departmentId'),
    Request.find().populate('itemId departmentId requestedBy'),
    StockMovement.find().populate('itemId departmentId').sort({ date: -1 }).limit(12),
    AuditLog.find().populate('userId departmentId').sort({ timestamp: -1 }).limit(8)
  ]);
  const stockTotal = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStock = items.filter((item) => item.quantity <= item.minThreshold);
  const expired = items.filter((item) => item.expiryDate < now);
  const expiringSoon = items.filter((item) => item.expiryDate >= now && item.expiryDate <= expirySoon);
  const statusCounts = requests.reduce((acc, request) => ({ ...acc, [request.status]: (acc[request.status] || 0) + 1 }), {});
  const stockByDepartment = items.reduce((acc, item) => {
    const name = item.departmentId?.name || 'Central Store';
    acc[name] = (acc[name] || 0) + item.quantity;
    return acc;
  }, {});
  res.json({
    kpis: { stockTotal, itemCount: items.length, lowStock: lowStock.length, expired: expired.length, pending: statusCounts.pending || 0 },
    statusCounts,
    stockByDepartment: Object.entries(stockByDepartment).map(([name, quantity]) => ({ name, quantity })),
    alerts: [
      ...lowStock.map((item) => ({ type: 'low_stock', message: `${item.name} is below threshold`, item })),
      ...expired.map((item) => ({ type: 'expired', message: `${item.name} has expired`, item })),
      ...expiringSoon.map((item) => ({ type: 'expiry', message: `${item.name} expires soon`, item })),
      ...requests.filter((request) => request.status === 'pending').map((request) => ({ type: 'pending', message: `${request.itemId?.name} awaiting approval`, request }))
    ].slice(0, 20),
    recentMovements: movements,
    recentAudits: audits
  });
}

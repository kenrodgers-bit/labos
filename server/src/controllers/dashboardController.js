import AuditLog from '../models/AuditLog.js';
import InventoryItem from '../models/InventoryItem.js';
import Request from '../models/Request.js';
import StockMovement from '../models/StockMovement.js';
import User from '../models/User.js';
import { ROLES } from '../utils/permissions.js';

function countByStatus(requests) {
  return requests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});
}

export async function dashboard(req, res) {
  const now = new Date();
  const expirySoon = new Date(now);
  expirySoon.setDate(now.getDate() + 90);
  const requestQuery = req.user.role === ROLES.STAFF ? { requestedBy: req.user._id } : {};

  const [items, requests, movements, audits, totalUsers, activeStaff] = await Promise.all([
    InventoryItem.find({ status: { $ne: 'inactive' } }).populate('departmentId'),
    Request.find(requestQuery).populate('itemId departmentId requestedBy approvedBy adjustedBy').sort({ createdAt: -1 }),
    StockMovement.find().populate('itemId departmentId performedBy').sort({ date: -1 }).limit(12),
    AuditLog.find().populate('performedBy targetUserId targetItemId targetRequestId departmentId userId').sort({ timestamp: -1 }).limit(8),
    User.countDocuments(),
    User.countDocuments({ status: 'active' })
  ]);

  const stockTotal = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStock = items.filter((item) => item.quantity > 0 && item.quantity <= item.minThreshold);
  const outOfStock = items.filter((item) => item.quantity === 0);
  const expired = items.filter((item) => item.expiryDate < now);
  const expiringSoon = items.filter((item) => item.expiryDate >= now && item.expiryDate <= expirySoon);
  const statusCounts = countByStatus(requests);
  const stockByDepartment = items.reduce((acc, item) => {
    const name = item.departmentId?.name || 'Central Store';
    acc[name] = (acc[name] || 0) + item.quantity;
    return acc;
  }, {});
  const requestItemCounts = requests.reduce((acc, request) => {
    const name = request.itemId?.name;
    if (name) acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const commonKpis = {
    stockTotal,
    itemCount: items.length,
    lowStock: lowStock.length,
    expired: expired.length,
    outOfStock: outOfStock.length,
    pending: statusCounts.pending || 0
  };
  const roleKpis = req.user.role === ROLES.ADMIN
    ? { totalUsers, activeStaff, ...commonKpis }
    : req.user.role === ROLES.MANAGER
      ? { pendingApprovals: statusCounts.pending || 0, lowStock: lowStock.length, outOfStock: outOfStock.length, recentDecisions: requests.filter((request) => request.status !== 'pending').length, stockMovements: movements.length }
      : { myRequests: requests.length, pendingRequests: statusCounts.pending || 0, approvedRequests: statusCounts.approved || 0, rejectedRequests: statusCounts.rejected || 0, partialRequests: statusCounts.partially_approved || 0 };

  res.json({
    role: req.user.role,
    kpis: roleKpis,
    statusCounts,
    stockByDepartment: Object.entries(stockByDepartment).map(([name, quantity]) => ({ name, quantity })),
    frequentlyRequestedItems: Object.entries(requestItemCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    alerts: [
      ...outOfStock.map((item) => ({ type: 'out_of_stock', message: `${item.name} is out of stock`, item })),
      ...lowStock.map((item) => ({ type: 'low_stock', message: `${item.name} is below threshold`, item })),
      ...expired.map((item) => ({ type: 'expired', message: `${item.name} has expired`, item })),
      ...expiringSoon.map((item) => ({ type: 'expiry', message: `${item.name} expires soon`, item })),
      ...requests.filter((request) => request.status === 'pending').map((request) => ({ type: 'pending', message: `${request.itemId?.name} awaiting approval`, request }))
    ].slice(0, 20),
    recentMovements: movements,
    recentAudits: audits,
    recentRequests: requests.slice(0, 8)
  });
}

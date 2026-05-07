import AuditLog from '../models/AuditLog.js';
import InventoryItem from '../models/InventoryItem.js';
import Request from '../models/Request.js';
import StockRefillReminder from '../models/StockRefillReminder.js';
import StockMovement from '../models/StockMovement.js';
import User from '../models/User.js';
import { isStaffRole, normalizedRole, ROLES } from '../utils/permissions.js';

function countByStatus(requests) {
  return requests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1;
    return acc;
  }, {});
}

export async function dashboard(req, res) {
  const now = new Date();
  const expirySoon = new Date(now);
  expirySoon.setDate(now.getDate() + 30); // LabOS fix: dashboard expiry alerts use the required 30-day horizon.
  const isAdmin = req.user.role === ROLES.ADMIN; // LabOS fix: dashboard payloads separate Admin oversight from Staff self-service.
  const requestQuery = isStaffRole(req.user.role) ? { requestedBy: req.user._id } : {};

  const [items, requests, movements, audits, refillReminders, totalUsers, activeStaff] = await Promise.all([
    InventoryItem.find({ status: { $ne: 'inactive' } }).populate('departmentId'),
    Request.find(requestQuery).populate('itemId departmentId requestedBy approvedBy adjustedBy').sort({ createdAt: -1 }),
    isAdmin ? StockMovement.find().populate('itemId departmentId performedBy').sort({ date: -1 }).limit(12) : Promise.resolve([]),
    isAdmin ? AuditLog.find().populate('performedBy targetUserId targetItemId targetRequestId departmentId userId').sort({ timestamp: -1 }).limit(8) : Promise.resolve([]),
    isAdmin ? StockRefillReminder.find({ status: 'open' }).populate('itemId requestedBy departmentId').sort({ createdAt: -1 }).limit(10) : Promise.resolve([]),
    User.countDocuments(),
    User.countDocuments({ status: 'active', role: ROLES.STAFF }) // LabOS fix: active staff excludes admin accounts.
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
    : { myRequests: requests.length, pendingRequests: statusCounts.pending || 0, approvedRequests: statusCounts.approved || 0, rejectedRequests: statusCounts.rejected || 0, partialRequests: statusCounts.partially_approved || 0 }; // LabOS fix: staff dashboards are self-service only.

  res.json({
    role: normalizedRole(req.user.role),
    kpis: roleKpis,
    statusCounts,
    stockByDepartment: Object.entries(stockByDepartment).map(([name, quantity]) => ({ name, quantity })),
    frequentlyRequestedItems: Object.entries(requestItemCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    alerts: [
      ...outOfStock.map((item) => ({ type: 'out_of_stock', message: `${item.name} is out of stock`, item })),
      ...lowStock.map((item) => ({ type: 'low_stock', message: `${item.name} is below threshold`, item })),
      ...expired.map((item) => ({ type: 'expired', message: `${item.name} has expired`, item })),
      ...expiringSoon.map((item) => ({ type: 'expiry', message: `${item.name} expires soon`, item })),
      ...refillReminders.map((reminder) => ({ type: 'stock_refill_reminder', message: `${reminder.requestedBy?.name || 'Staff'} requested refill for ${reminder.itemId?.name || 'an item'}`, reminder })),
      ...requests.filter((request) => request.status === 'pending').map((request) => ({ type: 'pending', message: `${request.itemId?.name} awaiting approval`, request }))
    ].slice(0, 20), // LabOS fix: Admin dashboard includes Staff refill reminders alongside stock alerts.
    recentMovements: movements,
    recentAudits: audits,
    recentRequests: requests.slice(0, 8)
  });
}

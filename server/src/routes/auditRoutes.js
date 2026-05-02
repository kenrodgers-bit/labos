import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect, authorize(ROLES.ADMIN, ROLES.MANAGER));
router.get('/', asyncHandler(async (req, res) => {
  const { search = '', action, from, to, page = 1, limit = 50 } = req.query;
  const query = {
    ...(action ? { action } : {}),
    ...(from || to ? { timestamp: { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) } } : {})
  };
  const safeLimit = Math.min(Number(limit) || 50, 250);
  const safePage = Math.max(Number(page) || 1, 1);
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('performedBy targetUserId targetItemId targetRequestId departmentId userId itemId requestId')
      .sort({ timestamp: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    AuditLog.countDocuments(query)
  ]);
  const filtered = search
    ? logs.filter((log) => JSON.stringify(log).toLowerCase().includes(search.toLowerCase()))
    : logs;
  res.json({ logs: filtered, total, page: safePage, pages: Math.ceil(total / safeLimit) || 1 });
}));

export default router;

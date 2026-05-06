import express from 'express';
import AuditLog from '../models/AuditLog.js';
import InventoryItem from '../models/InventoryItem.js';
import StockMovement from '../models/StockMovement.js';
import SystemSettings from '../models/SystemSettings.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect, authorize(ROLES.ADMIN)); // LabOS fix: audit logs are admin-only.
router.get('/', asyncHandler(async (req, res) => {
  const { search = '', action, from, to, page = 1, limit = 50 } = req.query;
  const dateRange = from || to ? { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) } : null;
  const query = {
    ...(action ? { action } : {}),
    ...(dateRange ? { timestamp: dateRange } : {})
  };
  const safeLimit = Math.min(Number(limit) || 50, 250);
  const safePage = Math.max(Number(page) || 1, 1);
  const [logs, total, stockOutEvents, stockOutQuantity, currentOutOfStockItems, settings] = await Promise.all([
    AuditLog.find(query)
      .populate('performedBy targetUserId targetItemId targetRequestId departmentId userId itemId requestId')
      .sort({ timestamp: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    AuditLog.countDocuments(query),
    StockMovement.countDocuments({ type: 'out', ...(dateRange ? { date: dateRange } : {}) }),
    StockMovement.aggregate([
      { $match: { type: 'out', ...(dateRange ? { date: dateRange } : {}) } },
      { $group: { _id: null, quantity: { $sum: '$quantity' } } }
    ]),
    InventoryItem.countDocuments({ status: { $ne: 'inactive' }, quantity: 0 }),
    SystemSettings.findOne()
  ]);
  const filtered = search
    ? logs.filter((log) => JSON.stringify(log).toLowerCase().includes(search.toLowerCase()))
    : logs;
  res.json({
    logs: filtered,
    total,
    page: safePage,
    pages: Math.ceil(total / safeLimit) || 1,
    summary: {
      facility: settings ? {
        hospitalName: settings.hospitalName,
        facilityCode: settings.facilityCode,
        county: settings.county,
        subCounty: settings.subCounty
      } : {},
      period: { from: from || '', to: to || '' },
      stockOutEvents,
      stockOutQuantity: stockOutQuantity[0]?.quantity || 0,
      currentOutOfStockItems,
      generatedAt: new Date().toISOString()
    }
  }); // LabOS fix: audit filing responses include stock-out counts and facility metadata.
}));

export default router;

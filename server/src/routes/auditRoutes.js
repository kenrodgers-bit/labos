import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authorize, protect } from '../middleware/auth.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect, authorize(ROLES.ADMIN, ROLES.MANAGER));
router.get('/', async (req, res) => {
  const { search = '', action, from, to } = req.query;
  const query = {
    ...(action ? { action } : {}),
    ...(from || to ? { timestamp: { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) } } : {})
  };
  const logs = await AuditLog.find(query).populate('userId itemId requestId departmentId').sort({ timestamp: -1 }).limit(250);
  const filtered = search
    ? logs.filter((log) => JSON.stringify(log).toLowerCase().includes(search.toLowerCase()))
    : logs;
  res.json(filtered);
});

export default router;

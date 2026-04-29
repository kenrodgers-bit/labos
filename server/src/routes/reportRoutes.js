import express from 'express';
import { auditReport, inventoryReport, moh706, requestReport, usageReport } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/inventory', inventoryReport);
router.get('/requests', requestReport);
router.get('/usage', usageReport);
router.get('/audit', auditReport);
router.get('/moh706', moh706);

export default router;

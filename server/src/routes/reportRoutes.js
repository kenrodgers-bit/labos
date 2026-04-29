import express from 'express';
import { auditReport, inventoryReport, moh706, requestReport, usageReport } from '../controllers/reportController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/inventory', asyncHandler(inventoryReport));
router.get('/requests', asyncHandler(requestReport));
router.get('/usage', asyncHandler(usageReport));
router.get('/audit', asyncHandler(auditReport));
router.get('/moh706', asyncHandler(moh706));

export default router;

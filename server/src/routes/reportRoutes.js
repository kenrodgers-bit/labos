import express from 'express';
import { auditReport, departmentUsageReport, expiryReport, inventoryReport, lowStockReport, moh706, requestReport, usageReport } from '../controllers/reportController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect, authorize(ROLES.ADMIN)); // LabOS fix: report exports are admin-only.
router.get('/inventory', asyncHandler(inventoryReport));
router.get('/low-stock', asyncHandler(lowStockReport));
router.get('/expiry', asyncHandler(expiryReport));
router.get('/requests', asyncHandler(requestReport));
router.get('/usage', asyncHandler(usageReport));
router.get('/department-usage', asyncHandler(departmentUsageReport));
router.get('/audit', asyncHandler(auditReport));
router.get('/moh706', asyncHandler(moh706));

export default router;

import express from 'express';
import { listStockMovements } from '../controllers/stockMovementController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect, authorize(ROLES.ADMIN)); // LabOS fix: stock movement registers are admin-only operational records.
router.get('/', asyncHandler(listStockMovements));

export default router;

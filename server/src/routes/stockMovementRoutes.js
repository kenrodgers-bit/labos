import express from 'express';
import { listStockMovements } from '../controllers/stockMovementController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/', asyncHandler(listStockMovements));

export default router;

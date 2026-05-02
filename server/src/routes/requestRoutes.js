import express from 'express';
import { body } from 'express-validator';
import { createRequest, decideRequest, listRequests } from '../controllers/requestController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect);
router.get('/', asyncHandler(listRequests));
router.post('/', [
  body('itemId').notEmpty(),
  body('requestedQuantity').isInt({ min: 1 }),
  body('urgency').optional().isIn(['routine', 'urgent', 'critical'])
], validate, asyncHandler(createRequest));
router.patch('/:id/decision', authorize(ROLES.ADMIN, ROLES.MANAGER), [
  body('decision').isIn(['approved', 'rejected', 'partial']),
  body('approvedQuantity').optional().isInt({ min: 1 }),
  body('adjustmentReason').optional().trim().isLength({ max: 500 })
], validate, asyncHandler(decideRequest));

export default router;

import express from 'express';
import { body } from 'express-validator';
import { getSystemSettings, updateSystemSettings } from '../controllers/systemSettingsController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();

router.use(protect);
router.get('/', asyncHandler(getSystemSettings));
router.put('/', authorize(ROLES.ADMIN), [
  body('hospitalName').optional().trim().isLength({ min: 2, max: 120 }),
  body('contactEmail').optional({ checkFalsy: true }).isEmail(),
  body('lowStockAlertMode').optional().isIn(['threshold', 'threshold_or_zero'])
], validate, asyncHandler(updateSystemSettings));

export default router;

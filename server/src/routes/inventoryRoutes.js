import express from 'express';
import { body } from 'express-validator';
import { createItem, deleteItem, listItems, updateItem } from '../controllers/inventoryController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect);
router.get('/', asyncHandler(listItems));
router.post('/', authorize(ROLES.ADMIN), [
  body('name').notEmpty(),
  body('category').notEmpty(),
  body('unit').notEmpty(),
  body('quantity').isFloat({ min: 0 }),
  body('minThreshold').isFloat({ min: 0 }),
  body('expiryDate').isISO8601(),
  body('status').optional().isIn(['active', 'inactive'])
], validate, asyncHandler(createItem));
router.put('/:id', authorize(ROLES.ADMIN), [
  body('name').optional().notEmpty(),
  body('category').optional().notEmpty(),
  body('unit').optional().notEmpty(),
  body('quantity').optional().isFloat({ min: 0 }),
  body('minThreshold').optional().isFloat({ min: 0 }),
  body('expiryDate').optional().isISO8601(),
  body('status').optional().isIn(['active', 'inactive'])
], validate, asyncHandler(updateItem));
router.delete('/:id', authorize(ROLES.ADMIN), asyncHandler(deleteItem));

export default router;

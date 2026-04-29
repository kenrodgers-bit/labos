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
  body('quantity').isNumeric(),
  body('minThreshold').isNumeric(),
  body('expiryDate').isISO8601()
], validate, asyncHandler(createItem));
router.put('/:id', authorize(ROLES.ADMIN), asyncHandler(updateItem));
router.delete('/:id', authorize(ROLES.ADMIN), asyncHandler(deleteItem));

export default router;

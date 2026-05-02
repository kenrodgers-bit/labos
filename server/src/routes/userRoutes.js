import express from 'express';
import { body } from 'express-validator';
import { createUser, listUsers, resetPassword, updateUser } from '../controllers/userController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect, authorize(ROLES.ADMIN));
router.get('/', asyncHandler(listUsers));
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email').isEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters.'),
  body('role').isIn(Object.values(ROLES)).withMessage('Choose a valid staff role.'),
  body('status').optional().isIn(['active', 'inactive'])
], validate, asyncHandler(createUser));
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email').optional().isEmail().withMessage('Enter a valid email address.'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Choose a valid staff role.'),
  body('status').optional().isIn(['active', 'inactive'])
], validate, asyncHandler(updateUser));
router.patch('/:id/password', [
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters.')
], validate, asyncHandler(resetPassword));

export default router;

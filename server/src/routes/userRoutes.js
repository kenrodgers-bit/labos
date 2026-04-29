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
router.post('/', [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 8 })], validate, asyncHandler(createUser));
router.put('/:id', asyncHandler(updateUser));
router.patch('/:id/password', [body('password').isLength({ min: 8 })], validate, asyncHandler(resetPassword));

export default router;

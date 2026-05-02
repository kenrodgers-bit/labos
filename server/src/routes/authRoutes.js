import express from 'express';
import { body } from 'express-validator';
import { changePassword, login, me, register, updateProfile } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], validate, asyncHandler(register));
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, asyncHandler(login));
router.get('/me', protect, asyncHandler(me));
router.patch('/me/profile', protect, [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters')
], validate, asyncHandler(updateProfile));
router.patch('/me/password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8, max: 128 }).withMessage('New password must be between 8 and 128 characters')
], validate, asyncHandler(changePassword));

export default router;

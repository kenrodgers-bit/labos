import express from 'express';
import { body } from 'express-validator';
import { login, me, register } from '../controllers/authController.js';
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

export default router;

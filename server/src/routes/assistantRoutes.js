import express from 'express';
import { body } from 'express-validator';
import { chat } from '../controllers/assistantController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);
router.post('/chat', [
  body('message').trim().isLength({ min: 1, max: 600 }).withMessage('Message must be between 1 and 600 characters.')
], validate, asyncHandler(chat));

export default router;

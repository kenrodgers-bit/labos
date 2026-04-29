import express from 'express';
import { body } from 'express-validator';
import { listDepartments, upsertDepartment } from '../controllers/departmentController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect);
router.get('/', asyncHandler(listDepartments));
router.post('/', authorize(ROLES.ADMIN), [body('name').notEmpty()], validate, asyncHandler(upsertDepartment));
router.put('/:id', authorize(ROLES.ADMIN), asyncHandler(upsertDepartment));

export default router;

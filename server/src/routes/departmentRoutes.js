import express from 'express';
import { body } from 'express-validator';
import { listDepartments, upsertDepartment } from '../controllers/departmentController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect);
router.get('/', listDepartments);
router.post('/', authorize(ROLES.ADMIN), [body('name').notEmpty()], validate, upsertDepartment);
router.put('/:id', authorize(ROLES.ADMIN), upsertDepartment);

export default router;

import express from 'express';
import { body } from 'express-validator';
import { createLabReport, exportLabReportPdf, getLabReport, labReportAnalytics, labReportTemplate, listLabReports, updateLabReport } from '../controllers/labReportController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utils/permissions.js';

const router = express.Router();
router.use(protect, authorize(ROLES.ADMIN, ROLES.STAFF));

const reportValidators = [
  body('periodMonth').optional().matches(/^\d{4}-\d{2}$/).withMessage('Report month must use YYYY-MM format.'),
  body('entries').optional().isArray(),
  body('status').optional().isIn(['draft', 'submitted'])
];

router.get('/', asyncHandler(listLabReports));
router.get('/template', asyncHandler(labReportTemplate));
router.get('/analytics', asyncHandler(labReportAnalytics));
router.post('/', reportValidators, validate, asyncHandler(createLabReport));
router.get('/:id', asyncHandler(getLabReport));
router.put('/:id', reportValidators, validate, asyncHandler(updateLabReport));
router.get('/:id/export', asyncHandler(exportLabReportPdf));

export default router;

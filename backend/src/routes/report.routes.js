import { Router } from 'express';
import { balanceSheet, profitAndLoss, budgetReport } from '../controllers/report.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { budgetReportQuerySchema } from '../validators/budget.schema.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN', 'ACCOUNTANT'));

router.get('/balance-sheet', balanceSheet);
router.get('/profit-and-loss', profitAndLoss);
router.get('/budget', validate(budgetReportQuerySchema, 'query'), budgetReport);

export default router;

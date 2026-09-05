import { Router } from 'express';
import { balanceSheet, profitLoss, budgetReport } from '../controllers/report.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { budgetReportQuerySchema } from '../validators/budget.schema.js';
import { z } from 'zod';

const router = Router();

const balanceSheetQuerySchema = z.object({
  date: z.coerce.date().optional(),
});

const profitLossQuerySchema = z.object({
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
});

router.use(authenticate);
router.use(requireRole('ADMIN', 'ACCOUNTANT'));

router.get('/balance-sheet', validate(balanceSheetQuerySchema, 'query'), balanceSheet);
router.get('/profit-loss', validate(profitLossQuerySchema, 'query'), profitLoss);
router.get('/budget', validate(budgetReportQuerySchema, 'query'), budgetReport);

export default router;

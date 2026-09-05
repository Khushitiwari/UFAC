import { Router } from 'express';
import {
  listBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budget.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdParamSchema,
  listBudgetsQuerySchema,
} from '../validators/budget.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'ACCOUNTANT'), validate(listBudgetsQuerySchema, 'query'), listBudgets);
router.get('/:id', requireRole('ADMIN', 'ACCOUNTANT'), validate(budgetIdParamSchema, 'params'), getBudget);
router.post(
  '/',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createBudgetSchema),
  createBudget,
);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(budgetIdParamSchema, 'params'),
  validate(updateBudgetSchema),
  updateBudget,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(budgetIdParamSchema, 'params'),
  deleteBudget,
);

export default router;

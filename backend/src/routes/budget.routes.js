import { Router } from 'express';
import { listBudgets, createBudget } from '../controllers/budget.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createBudgetSchema } from '../validators/budget.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'ACCOUNTANT'), listBudgets);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validate(createBudgetSchema), createBudget);

export default router;

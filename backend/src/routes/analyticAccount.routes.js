import { Router } from 'express';
import {
  listAnalyticAccounts,
  getAnalyticAccount,
  createAnalyticAccount,
  updateAnalyticAccount,
  deleteAnalyticAccount,
} from '../controllers/analyticAccount.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createAnalyticAccountSchema,
  updateAnalyticAccountSchema,
  analyticAccountIdParamSchema,
  listAnalyticAccountsQuerySchema,
} from '../validators/analyticAccount.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listAnalyticAccountsQuerySchema, 'query'), listAnalyticAccounts);
router.get('/:id', validate(analyticAccountIdParamSchema, 'params'), getAnalyticAccount);
router.post(
  '/',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createAnalyticAccountSchema),
  createAnalyticAccount,
);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(analyticAccountIdParamSchema, 'params'),
  validate(updateAnalyticAccountSchema),
  updateAnalyticAccount,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(analyticAccountIdParamSchema, 'params'),
  deleteAnalyticAccount,
);

export default router;

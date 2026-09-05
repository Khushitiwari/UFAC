import { Router } from 'express';
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/account.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createAccountSchema,
  updateAccountSchema,
  accountIdParamSchema,
  listAccountsQuerySchema,
} from '../validators/account.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listAccountsQuerySchema, 'query'), listAccounts);
router.get('/:id', validate(accountIdParamSchema, 'params'), getAccount);
router.post(
  '/',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createAccountSchema),
  createAccount,
);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(accountIdParamSchema, 'params'),
  validate(updateAccountSchema),
  updateAccount,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(accountIdParamSchema, 'params'),
  deleteAccount,
);

export default router;

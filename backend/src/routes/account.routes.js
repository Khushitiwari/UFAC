import { Router } from 'express';
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
} from '../controllers/account.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createAccountSchema,
  updateAccountSchema,
  accountIdParamSchema,
} from '../validators/account.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', listAccounts);
router.get('/:id', validate(accountIdParamSchema, 'params'), getAccount);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validate(createAccountSchema), createAccount);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(accountIdParamSchema, 'params'),
  validate(updateAccountSchema),
  updateAccount,
);

export default router;

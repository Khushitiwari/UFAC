import { Router } from 'express';
import {
  listCustomerInvoices,
  getCustomerInvoice,
  createCustomerInvoice,
  createCustomerInvoiceFromSalesOrder,
  updateCustomerInvoice,
  deleteCustomerInvoice,
} from '../controllers/customerInvoice.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createCustomerInvoiceSchema,
  createCustomerInvoiceFromSOSchema,
  updateCustomerInvoiceSchema,
  customerInvoiceIdParamSchema,
  listCustomerInvoicesQuerySchema,
} from '../validators/customerInvoice.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listCustomerInvoicesQuerySchema, 'query'), listCustomerInvoices);
router.get('/:id', validate(customerInvoiceIdParamSchema, 'params'), getCustomerInvoice);
router.post(
  '/from-sales-order',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createCustomerInvoiceFromSOSchema),
  createCustomerInvoiceFromSalesOrder,
);
router.post(
  '/',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createCustomerInvoiceSchema),
  createCustomerInvoice,
);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(customerInvoiceIdParamSchema, 'params'),
  validate(updateCustomerInvoiceSchema),
  updateCustomerInvoice,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(customerInvoiceIdParamSchema, 'params'),
  deleteCustomerInvoice,
);

export default router;

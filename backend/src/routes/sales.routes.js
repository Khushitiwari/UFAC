import { Router } from 'express';
import {
  listSalesOrders,
  listCustomerInvoices,
  createSalesOrder,
  createCustomerInvoice,
} from '../controllers/sales.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createSalesOrderSchema,
  createCustomerInvoiceSchema,
} from '../validators/sales.schema.js';

const router = Router();

router.use(authenticate);

router.get('/orders', listSalesOrders);
router.get('/invoices', listCustomerInvoices);
router.post(
  '/orders',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createSalesOrderSchema),
  createSalesOrder,
);
router.post(
  '/invoices',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createCustomerInvoiceSchema),
  createCustomerInvoice,
);

export default router;

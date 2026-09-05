import { Router } from 'express';
import {
  listPurchaseOrders,
  listVendorBills,
  createPurchaseOrder,
  createVendorBill,
} from '../controllers/purchase.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createPurchaseOrderSchema,
  createVendorBillSchema,
} from '../validators/purchase.schema.js';

const router = Router();

router.use(authenticate);

router.get('/orders', listPurchaseOrders);
router.get('/bills', listVendorBills);
router.post(
  '/orders',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createPurchaseOrderSchema),
  createPurchaseOrder,
);
router.post(
  '/bills',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createVendorBillSchema),
  createVendorBill,
);

export default router;

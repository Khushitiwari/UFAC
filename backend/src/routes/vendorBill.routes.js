import { Router } from 'express';
import {
  listVendorBills,
  getVendorBill,
  createVendorBill,
  createVendorBillFromPurchaseOrder,
  updateVendorBill,
  deleteVendorBill,
} from '../controllers/vendorBill.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createVendorBillSchema,
  createVendorBillFromPOSchema,
  updateVendorBillSchema,
  vendorBillIdParamSchema,
  listVendorBillsQuerySchema,
} from '../validators/vendorBill.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listVendorBillsQuerySchema, 'query'), listVendorBills);
router.get('/:id', validate(vendorBillIdParamSchema, 'params'), getVendorBill);
router.post(
  '/from-purchase-order',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createVendorBillFromPOSchema),
  createVendorBillFromPurchaseOrder,
);
router.post(
  '/',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createVendorBillSchema),
  createVendorBill,
);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(vendorBillIdParamSchema, 'params'),
  validate(updateVendorBillSchema),
  updateVendorBill,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(vendorBillIdParamSchema, 'params'),
  deleteVendorBill,
);

export default router;

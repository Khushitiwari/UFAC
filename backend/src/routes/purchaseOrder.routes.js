import { Router } from 'express';
import {
  listPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from '../controllers/purchaseOrder.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  purchaseOrderIdParamSchema,
  listPurchaseOrdersQuerySchema,
} from '../validators/purchaseOrder.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listPurchaseOrdersQuerySchema, 'query'), listPurchaseOrders);
router.get('/:id', validate(purchaseOrderIdParamSchema, 'params'), getPurchaseOrder);
router.post(
  '/',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createPurchaseOrderSchema),
  createPurchaseOrder,
);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(purchaseOrderIdParamSchema, 'params'),
  validate(updatePurchaseOrderSchema),
  updatePurchaseOrder,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(purchaseOrderIdParamSchema, 'params'),
  deletePurchaseOrder,
);

export default router;

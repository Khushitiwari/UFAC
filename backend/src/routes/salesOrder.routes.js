import { Router } from 'express';
import {
  listSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
} from '../controllers/salesOrder.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createSalesOrderSchema,
  updateSalesOrderSchema,
  salesOrderIdParamSchema,
  listSalesOrdersQuerySchema,
} from '../validators/salesOrder.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listSalesOrdersQuerySchema, 'query'), listSalesOrders);
router.get('/:id', validate(salesOrderIdParamSchema, 'params'), getSalesOrder);
router.post(
  '/',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createSalesOrderSchema),
  createSalesOrder,
);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(salesOrderIdParamSchema, 'params'),
  validate(updateSalesOrderSchema),
  updateSalesOrder,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(salesOrderIdParamSchema, 'params'),
  deleteSalesOrder,
);

export default router;

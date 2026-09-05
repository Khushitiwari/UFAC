import { Router } from 'express';
import {
  listPayments,
  getPayment,
  createPayment,
  deletePayment,
} from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createPaymentSchema,
  paymentIdParamSchema,
  listPaymentsQuerySchema,
} from '../validators/payment.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listPaymentsQuerySchema, 'query'), listPayments);
router.get('/:id', validate(paymentIdParamSchema, 'params'), getPayment);
router.post(
  '/',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createPaymentSchema),
  createPayment,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(paymentIdParamSchema, 'params'),
  deletePayment,
);

export default router;

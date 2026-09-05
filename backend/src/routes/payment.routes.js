import { Router } from 'express';
import { listPayments, createPayment, getMyPayments } from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createPaymentSchema } from '../validators/payment.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'ACCOUNTANT'), listPayments);
router.get('/mine', requireRole('CONTACT'), getMyPayments);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validate(createPaymentSchema), createPayment);

export default router;

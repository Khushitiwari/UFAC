import { Router } from 'express';
import authRoutes from './auth.routes.js';
import contactRoutes from './contact.routes.js';
import productRoutes from './product.routes.js';
import accountRoutes from './account.routes.js';
import journalRoutes from './journal.routes.js';
import purchaseOrderRoutes from './purchaseOrder.routes.js';
import vendorBillRoutes from './vendorBill.routes.js';
import salesOrderRoutes from './salesOrder.routes.js';
import customerInvoiceRoutes from './customerInvoice.routes.js';
import paymentRoutes from './payment.routes.js';
import analyticAccountRoutes from './analyticAccount.routes.js';
import budgetRoutes from './budget.routes.js';
import reportRoutes from './report.routes.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'ufac-api' } });
});

router.use('/auth', authRateLimiter, authRoutes);
router.use('/contacts', contactRoutes);
router.use('/products', productRoutes);
router.use('/accounts', accountRoutes);
router.use('/journals', journalRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/vendor-bills', vendorBillRoutes);
router.use('/sales-orders', salesOrderRoutes);
router.use('/customer-invoices', customerInvoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytic-accounts', analyticAccountRoutes);
router.use('/budgets', budgetRoutes);
router.use('/reports', reportRoutes);

export default router;

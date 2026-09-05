import { Router } from 'express';
import authRoutes from './auth.routes.js';
import contactRoutes from './contact.routes.js';
import productRoutes from './product.routes.js';
import accountRoutes from './account.routes.js';
import journalRoutes from './journal.routes.js';
import purchaseRoutes from './purchase.routes.js';
import salesRoutes from './sales.routes.js';
import paymentRoutes from './payment.routes.js';
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
router.use('/purchases', purchaseRoutes);
router.use('/sales', salesRoutes);
router.use('/payments', paymentRoutes);
router.use('/budgets', budgetRoutes);
router.use('/reports', reportRoutes);

export default router;

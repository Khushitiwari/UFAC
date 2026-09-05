import { Router } from 'express';
import { summary } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN', 'ACCOUNTANT'));

router.get('/summary', summary);

export default router;

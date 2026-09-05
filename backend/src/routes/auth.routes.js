import { Router } from 'express';
import { z } from 'zod';
import { login, me } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', authRateLimiter, validate(loginSchema), login);
router.get('/me', authenticate, me);

export default router;

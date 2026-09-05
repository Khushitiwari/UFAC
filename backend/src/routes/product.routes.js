import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  listProductsQuerySchema,
} from '../validators/product.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listProductsQuerySchema, 'query'), listProducts);
router.get('/:id', validate(productIdParamSchema, 'params'), getProduct);
router.post(
  '/',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(createProductSchema),
  createProduct,
);
router.put(
  '/:id',
  requireRole('ADMIN', 'ACCOUNTANT'),
  validate(productIdParamSchema, 'params'),
  validate(updateProductSchema),
  updateProduct,
);
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate(productIdParamSchema, 'params'),
  deleteProduct,
);

export default router;

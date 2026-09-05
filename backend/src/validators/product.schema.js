import { z } from 'zod';
import { recordStatusEnum } from './contact.schema.js';

export const productTypeEnum = z.enum(['GOODS', 'SERVICE', 'COMBO']);

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: productTypeEnum.default('GOODS'),
  salesPrice: z.coerce.number().nonnegative(),
  cost: z.coerce.number().nonnegative().default(0),
  category: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  status: recordStatusEnum.optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  id: z.string().min(1, 'Invalid product id'),
});

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  type: productTypeEnum.optional(),
  status: recordStatusEnum.optional(),
});

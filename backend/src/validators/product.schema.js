import { z } from 'zod';
import { recordStatusEnum } from './contact.schema.js';

export const createProductSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  unitPrice: z.coerce.number().nonnegative(),
  costPrice: z.coerce.number().nonnegative().default(0),
  incomeAccountId: z.string().cuid().optional().nullable(),
  expenseAccountId: z.string().cuid().optional().nullable(),
  status: recordStatusEnum.optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productIdParamSchema = z.object({
  id: z.string().cuid(),
});

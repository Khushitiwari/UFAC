import { z } from 'zod';
import { recordStatusEnum } from './contact.schema.js';

export const analyticAccountTypeEnum = z.enum(['INCOME', 'EXPENSE']);

export const createAnalyticAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: analyticAccountTypeEnum,
  status: recordStatusEnum.optional(),
});

export const updateAnalyticAccountSchema = createAnalyticAccountSchema.partial();

export const analyticAccountIdParamSchema = z.object({
  id: z.string().cuid('Invalid analytic account id'),
});

export const listAnalyticAccountsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(100).optional(),
  type: analyticAccountTypeEnum.optional(),
  status: recordStatusEnum.optional(),
});

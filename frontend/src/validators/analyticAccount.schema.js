import { z } from 'zod';
import { recordStatusEnum } from './contact.schema.js';

export const analyticAccountTypeEnum = z.enum(['INCOME', 'EXPENSE']);

export const createAnalyticAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: analyticAccountTypeEnum,
  status: recordStatusEnum.optional(),
});

export const updateAnalyticAccountSchema = createAnalyticAccountSchema.partial();

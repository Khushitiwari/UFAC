import { z } from 'zod';

export const accountTypeEnum = z.enum(['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'CAPITAL']);

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: accountTypeEnum,
  isActive: z.boolean().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

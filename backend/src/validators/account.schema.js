import { z } from 'zod';

export const accountTypeEnum = z.enum(['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'CAPITAL']);

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: accountTypeEnum,
  isActive: z.boolean().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

export const accountIdParamSchema = z.object({
  id: z.string().cuid('Invalid account id'),
});

export const listAccountsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(100).optional(),
  type: accountTypeEnum.optional(),
  isActive: z.coerce.boolean().optional(),
});

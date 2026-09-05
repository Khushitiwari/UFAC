import { z } from 'zod';

export const accountTypeEnum = z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']);

export const createAccountSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  type: accountTypeEnum,
  parentId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateAccountSchema = createAccountSchema.partial().omit({ code: true });

export const accountIdParamSchema = z.object({
  id: z.string().cuid(),
});

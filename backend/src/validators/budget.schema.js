import { z } from 'zod';

export const createBudgetSchema = z.object({
  accountId: z.string().cuid(),
  analyticAccountId: z.string().cuid().optional().nullable(),
  fiscalYear: z.coerce.number().int().min(2000).max(2100),
  period: z.coerce.number().int().min(1).max(12),
  plannedAmount: z.coerce.number().nonnegative(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const budgetIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const budgetReportQuerySchema = z.object({
  fiscalYear: z.coerce.number().int().min(2000).max(2100),
  period: z.coerce.number().int().min(1).max(12).optional(),
});

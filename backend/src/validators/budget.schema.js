import { z } from 'zod';

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  plannedAmount: z.coerce.number().nonnegative(),
  analyticAccountId: z.string().cuid(),
  responsiblePersonId: z.string().cuid(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const budgetIdParamSchema = z.object({
  id: z.string().cuid('Invalid budget id'),
});

export const listBudgetsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  analyticAccountId: z.string().cuid().optional(),
});

export const budgetReportQuerySchema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
});

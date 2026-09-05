import { z } from 'zod';

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  plannedAmount: z.coerce.number().nonnegative(),
  analyticAccountId: z.string().min(1, 'Analytic account is required'),
  responsiblePersonId: z.string().min(1, 'Responsible person is required'),
});

export const updateBudgetSchema = createBudgetSchema.partial();

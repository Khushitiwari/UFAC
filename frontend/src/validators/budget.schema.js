import { z } from 'zod';

const budgetBaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  plannedAmount: z.coerce.number().positive('Planned amount must be greater than zero'),
  analyticAccountId: z.string().min(1, 'Analytic account is required'),
  responsiblePersonId: z.string().min(1, 'Responsible person is required'),
});

const periodRangeRefine = (data, ctx) => {
  if (data.periodStart && data.periodEnd && data.periodEnd < data.periodStart) {
    ctx.addIssue({
      code: 'custom',
      message: 'Period end must be on or after period start',
      path: ['periodEnd'],
    });
  }
};

export const createBudgetSchema = budgetBaseSchema.superRefine(periodRangeRefine);

export const updateBudgetSchema = budgetBaseSchema.partial().superRefine(periodRangeRefine);

export default { createBudgetSchema, updateBudgetSchema };

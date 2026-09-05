import { z } from 'zod';

export const journalEntryStatusEnum = z.enum(['DRAFT', 'POSTED', 'CANCELLED']);

export const journalItemSchema = z.object({
  accountId: z.string().cuid(),
  analyticAccountId: z.string().cuid().optional().nullable(),
  debit: z.coerce.number().nonnegative().default(0),
  credit: z.coerce.number().nonnegative().default(0),
  description: z.string().max(500).optional().nullable(),
});

export const createJournalEntrySchema = z
  .object({
    journalId: z.string().cuid(),
    date: z.coerce.date(),
    reference: z.string().max(100).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    status: journalEntryStatusEnum.optional(),
    items: z.array(journalItemSchema).min(2, 'At least two journal items required'),
  })
  .superRefine((data, ctx) => {
    const totalDebit = data.items.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = data.items.reduce((sum, item) => sum + item.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Debits (${totalDebit}) must equal credits (${totalCredit})`,
        path: ['items'],
      });
    }

    for (const item of data.items) {
      if (item.debit > 0 && item.credit > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A line cannot have both debit and credit',
          path: ['items'],
        });
      }
      if (item.debit === 0 && item.credit === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Each line must have a debit or credit amount',
          path: ['items'],
        });
      }
    }
  });

export const updateJournalEntrySchema = z.object({
  journalId: z.string().cuid().optional(),
  date: z.coerce.date().optional(),
  reference: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  status: journalEntryStatusEnum.optional(),
  items: z.array(journalItemSchema).min(2).optional(),
});

export const journalEntryIdParamSchema = z.object({
  id: z.string().cuid(),
});

import { z } from 'zod';
import { sourceTypeEnum } from './shared.schema.js';

export const journalItemSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  analyticAccountId: z.string().optional().nullable(),
  debit: z.coerce.number().nonnegative().default(0),
  credit: z.coerce.number().nonnegative().default(0),
  description: z.string().max(500).optional().nullable(),
});

export const createJournalEntrySchema = z
  .object({
    journalId: z.string().min(1, 'Journal is required'),
    date: z.coerce.date(),
    reference: z.string().max(100).optional().nullable(),
    sourceType: sourceTypeEnum.optional().nullable(),
    sourceId: z.string().optional().nullable(),
    items: z.array(journalItemSchema).min(2, 'At least two journal items required'),
  })
  .superRefine((data, ctx) => {
    const totalDebit = data.items.reduce((sum, item) => sum + Number(item.debit), 0);
    const totalCredit = data.items.reduce((sum, item) => sum + Number(item.credit), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      ctx.addIssue({
        code: 'custom',
        message: `Debits (${totalDebit}) must equal credits (${totalCredit})`,
        path: ['items'],
      });
    }
  });

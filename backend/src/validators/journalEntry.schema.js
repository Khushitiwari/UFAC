import { z } from 'zod';
import { sourceTypeEnum } from './shared.schema.js';

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
    sourceType: sourceTypeEnum.optional().nullable(),
    sourceId: z.string().optional().nullable(),
    items: z.array(journalItemSchema).min(2, 'At least two journal items required'),
  })
  .superRefine((data, ctx) => {
    const totalDebit = data.items.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = data.items.reduce((sum, item) => sum + item.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      ctx.addIssue({
        code: 'custom',
        message: `Debits (${totalDebit}) must equal credits (${totalCredit})`,
        path: ['items'],
      });
    }
  });

export const journalEntryIdParamSchema = z.object({
  id: z.string().cuid('Invalid journal entry id'),
});

export const listJournalEntriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  journalId: z.string().cuid().optional(),
});

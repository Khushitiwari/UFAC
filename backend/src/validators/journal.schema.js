import { z } from 'zod';

export const journalTypeEnum = z.enum(['SALE', 'PURCHASE', 'BANK', 'CASH', 'GENERAL']);

export const createJournalSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  type: journalTypeEnum.default('GENERAL'),
  defaultAccountId: z.string().cuid().optional().nullable(),
});

export const updateJournalSchema = createJournalSchema.partial().omit({ code: true });

export const journalIdParamSchema = z.object({
  id: z.string().cuid(),
});

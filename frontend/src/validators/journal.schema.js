import { z } from 'zod';

export const journalTypeEnum = z.enum(['SALES', 'PURCHASE', 'BANK', 'CASH']);

export const createJournalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: journalTypeEnum,
  defaultAccountId: z.string().cuid().optional().nullable(),
});

export const updateJournalSchema = createJournalSchema.partial();

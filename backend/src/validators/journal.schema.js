import { z } from 'zod';

export const journalTypeEnum = z.enum(['SALES', 'PURCHASE', 'BANK', 'CASH']);

export const createJournalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  type: journalTypeEnum,
  defaultAccountId: z.string().cuid().optional().nullable(),
});

export const updateJournalSchema = createJournalSchema.partial();

export const journalIdParamSchema = z.object({
  id: z.string().min(1, 'Invalid journal id'),
});

export const listJournalsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().max(100).optional(),
  type: journalTypeEnum.optional(),
});

import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Posts a journal entry with its items inside a single transaction.
 * @param {object} params
 * @param {string} params.journalId
 * @param {Date} params.date
 * @param {string} params.createdById
 * @param {string} [params.reference]
 * @param {string} [params.description]
 * @param {'DRAFT'|'POSTED'|'CANCELLED'} [params.status]
 * @param {Array<{ accountId: string, analyticAccountId?: string|null, debit: number, credit: number, description?: string|null }>} params.items
 */
export const postJournalEntry = async ({
  journalId,
  date,
  createdById,
  reference,
  description,
  status = 'DRAFT',
  items,
}) => {
  const totalDebit = items.reduce((sum, i) => sum + i.debit, 0);
  const totalCredit = items.reduce((sum, i) => sum + i.credit, 0);

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new ApiError(400, `Debits (${totalDebit}) must equal credits (${totalCredit})`);
  }

  return prisma.$transaction(async (tx) => {
    const journal = await tx.journal.findUnique({ where: { id: journalId } });
    if (!journal) throw new ApiError(404, 'Journal not found');

    const entry = await tx.journalEntry.create({
      data: {
        journalId,
        date,
        reference,
        description,
        status,
        createdById,
        items: {
          create: items.map((item) => ({
            accountId: item.accountId,
            analyticAccountId: item.analyticAccountId ?? null,
            debit: item.debit,
            credit: item.credit,
            description: item.description ?? null,
          })),
        },
      },
      select: {
        id: true,
        journalId: true,
        date: true,
        reference: true,
        description: true,
        status: true,
        items: {
          select: {
            id: true,
            accountId: true,
            debit: true,
            credit: true,
            description: true,
          },
        },
      },
    });

    return entry;
  });
};

export default { postJournalEntry };

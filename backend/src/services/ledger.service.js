import { ApiError } from '../utils/ApiError.js';

/**
 * Validates double-entry balance before any DB write.
 * @param {Array<{ debit: number|string, credit: number|string }>} items
 */
export const assertBalanced = (items) => {
  const totalDebit = items.reduce((sum, i) => sum + Number(i.debit), 0);
  const totalCredit = items.reduce((sum, i) => sum + Number(i.credit), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new ApiError(
      400,
      `Debits (${totalDebit}) must equal credits (${totalCredit})`,
    );
  }
};

/**
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {object} params
 */
export const createJournalEntryInTx = async (tx, params) => {
  const {
    journalId,
    date,
    reference,
    sourceType,
    sourceId,
    createdById,
    items,
  } = params;

  assertBalanced(items);

  const journal = await tx.journal.findUnique({ where: { id: journalId } });
  if (!journal) throw new ApiError(404, 'Journal not found');

  return tx.journalEntry.create({
    data: {
      journalId,
      date,
      reference,
      sourceType,
      sourceId,
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
    include: {
      items: {
        select: {
          id: true,
          accountId: true,
          debit: true,
          credit: true,
          analyticAccountId: true,
        },
      },
    },
  });
};

/**
 * Posts a journal entry with its items inside a single transaction.
 */
export const postJournalEntry = async (params) => {
  const { prisma } = await import('../config/db.js');
  return prisma.$transaction((tx) => createJournalEntryInTx(tx, params));
};

export default { assertBalanced, createJournalEntryInTx, postJournalEntry };

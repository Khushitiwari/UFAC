import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { prisma } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { postJournalEntry } from '../services/ledger.service.js';

export const listJournalEntries = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const { journalId } = req.query;

  const where = {
    ...(journalId && { journalId }),
  };

  const [items, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      select: {
        id: true,
        date: true,
        reference: true,
        sourceType: true,
        sourceId: true,
        journal: { select: { id: true, name: true, type: true } },
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
      skip,
      take,
      orderBy: { date: 'desc' },
    }),
    prisma.journalEntry.count({ where }),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const createJournalEntry = asyncHandler(async (req, res) => {
  const { journalId, date, reference, sourceType, sourceId, items } = req.body;
  const entry = await postJournalEntry({
    journalId,
    date,
    reference,
    sourceType,
    sourceId,
    items,
    createdById: req.user.id,
  });
  sendResponse(res, new ApiResponse(201, entry, 'Journal entry created'));
});

export default { listJournalEntries, createJournalEntry };

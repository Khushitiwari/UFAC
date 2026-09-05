import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { prisma } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { postJournalEntry } from '../services/ledger.service.js';

export const listJournalEntries = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const [items, total] = await Promise.all([
    prisma.journalEntry.findMany({
      select: {
        id: true,
        date: true,
        reference: true,
        description: true,
        status: true,
        journal: { select: { id: true, code: true, name: true } },
      },
      skip,
      take,
      orderBy: { date: 'desc' },
    }),
    prisma.journalEntry.count(),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const createJournalEntry = asyncHandler(async (req, res) => {
  const { journalId, date, reference, description, status, items } = req.body;
  const entry = await postJournalEntry({
    journalId,
    date,
    reference,
    description,
    status,
    items,
    createdById: req.user.id,
  });
  sendResponse(res, new ApiResponse(201, entry, 'Journal entry created'));
});

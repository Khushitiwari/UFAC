import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { prisma } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const listJournals = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const [items, total] = await Promise.all([
    prisma.journal.findMany({
      select: { id: true, code: true, name: true, type: true, defaultAccountId: true },
      skip,
      take,
      orderBy: { code: 'asc' },
    }),
    prisma.journal.count(),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const getJournal = asyncHandler(async (req, res) => {
  const journal = await prisma.journal.findUnique({
    where: { id: req.params.id },
    select: { id: true, code: true, name: true, type: true, defaultAccountId: true },
  });
  if (!journal) throw new ApiError(404, 'Journal not found');
  sendResponse(res, new ApiResponse(200, journal));
});

export const createJournal = asyncHandler(async (req, res) => {
  const journal = await prisma.journal.create({
    data: req.body,
    select: { id: true, code: true, name: true, type: true },
  });
  sendResponse(res, new ApiResponse(201, journal, 'Journal created'));
});

export const updateJournal = asyncHandler(async (req, res) => {
  const journal = await prisma.journal.update({
    where: { id: req.params.id },
    data: req.body,
    select: { id: true, code: true, name: true, type: true },
  });
  sendResponse(res, new ApiResponse(200, journal, 'Journal updated'));
});

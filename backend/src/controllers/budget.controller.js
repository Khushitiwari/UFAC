import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { prisma } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

export const listBudgets = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const [items, total] = await Promise.all([
    prisma.budget.findMany({
      select: {
        id: true,
        fiscalYear: true,
        period: true,
        plannedAmount: true,
        account: { select: { id: true, code: true, name: true } },
      },
      skip,
      take,
      orderBy: [{ fiscalYear: 'desc' }, { period: 'asc' }],
    }),
    prisma.budget.count(),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const createBudget = asyncHandler(async (req, res) => {
  const item = await prisma.budget.create({
    data: req.body,
    select: { id: true, fiscalYear: true, period: true, plannedAmount: true },
  });
  sendResponse(res, new ApiResponse(201, item, 'Budget created'));
});

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { prisma } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const listAccounts = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const [items, total] = await Promise.all([
    prisma.account.findMany({
      select: { id: true, code: true, name: true, type: true, isActive: true, parentId: true },
      skip,
      take,
      orderBy: { code: 'asc' },
    }),
    prisma.account.count(),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const getAccount = asyncHandler(async (req, res) => {
  const account = await prisma.account.findUnique({
    where: { id: req.params.id },
    select: { id: true, code: true, name: true, type: true, isActive: true, parentId: true },
  });
  if (!account) throw new ApiError(404, 'Account not found');
  sendResponse(res, new ApiResponse(200, account));
});

export const createAccount = asyncHandler(async (req, res) => {
  const account = await prisma.account.create({
    data: req.body,
    select: { id: true, code: true, name: true, type: true, isActive: true },
  });
  sendResponse(res, new ApiResponse(201, account, 'Account created'));
});

export const updateAccount = asyncHandler(async (req, res) => {
  const account = await prisma.account.update({
    where: { id: req.params.id },
    data: req.body,
    select: { id: true, code: true, name: true, type: true, isActive: true },
  });
  sendResponse(res, new ApiResponse(200, account, 'Account updated'));
});

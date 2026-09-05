import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { prisma } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

const scopedContactFilter = (user) => {
  if (user.role === 'CONTACT' && user.contactId) {
    return { contactId: user.contactId };
  }
  return {};
};

export const listPayments = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const where = scopedContactFilter(req.user);
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      select: {
        id: true,
        number: true,
        contactId: true,
        paymentDate: true,
        amount: true,
        type: true,
        status: true,
      },
      skip,
      take,
      orderBy: { paymentDate: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const createPayment = asyncHandler(async (req, res) => {
  if (req.user.role === 'CONTACT') throw new ApiError(403, 'Insufficient permissions');
  const item = await prisma.payment.create({
    data: req.body,
    select: { id: true, number: true, amount: true, status: true, type: true },
  });
  sendResponse(res, new ApiResponse(201, item, 'Payment created'));
});

export const getMyPayments = asyncHandler(async (req, res) => {
  if (req.user.role !== 'CONTACT' || !req.user.contactId) {
    throw new ApiError(403, 'Contact portal access only');
  }
  const { skip, take, page, limit } = getPagination(req);
  const where = { contactId: req.user.contactId };
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      select: { id: true, number: true, paymentDate: true, amount: true, type: true, status: true },
      skip,
      take,
      orderBy: { paymentDate: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

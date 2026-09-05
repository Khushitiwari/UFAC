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

export const listPurchaseOrders = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const where = scopedContactFilter(req.user);
  const [items, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      select: { id: true, number: true, contactId: true, orderDate: true, status: true, totalAmount: true },
      skip,
      take,
      orderBy: { orderDate: 'desc' },
    }),
    prisma.purchaseOrder.count({ where }),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const listVendorBills = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const where = scopedContactFilter(req.user);
  const [items, total] = await Promise.all([
    prisma.vendorBill.findMany({
      where,
      select: { id: true, number: true, contactId: true, billDate: true, status: true, totalAmount: true },
      skip,
      take,
      orderBy: { billDate: 'desc' },
    }),
    prisma.vendorBill.count({ where }),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const createPurchaseOrder = asyncHandler(async (req, res) => {
  if (req.user.role === 'CONTACT') throw new ApiError(403, 'Insufficient permissions');
  const item = await prisma.purchaseOrder.create({
    data: req.body,
    select: { id: true, number: true, status: true, totalAmount: true },
  });
  sendResponse(res, new ApiResponse(201, item, 'Purchase order created'));
});

export const createVendorBill = asyncHandler(async (req, res) => {
  if (req.user.role === 'CONTACT') throw new ApiError(403, 'Insufficient permissions');
  const item = await prisma.vendorBill.create({
    data: req.body,
    select: { id: true, number: true, status: true, totalAmount: true },
  });
  sendResponse(res, new ApiResponse(201, item, 'Vendor bill created'));
});

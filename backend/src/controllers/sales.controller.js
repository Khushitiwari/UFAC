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

export const listSalesOrders = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const where = scopedContactFilter(req.user);
  const [items, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      select: { id: true, number: true, contactId: true, orderDate: true, status: true, totalAmount: true },
      skip,
      take,
      orderBy: { orderDate: 'desc' },
    }),
    prisma.salesOrder.count({ where }),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const listCustomerInvoices = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const where = scopedContactFilter(req.user);
  const [items, total] = await Promise.all([
    prisma.customerInvoice.findMany({
      where,
      select: { id: true, number: true, contactId: true, invoiceDate: true, status: true, totalAmount: true },
      skip,
      take,
      orderBy: { invoiceDate: 'desc' },
    }),
    prisma.customerInvoice.count({ where }),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const createSalesOrder = asyncHandler(async (req, res) => {
  if (req.user.role === 'CONTACT') throw new ApiError(403, 'Insufficient permissions');
  const item = await prisma.salesOrder.create({
    data: req.body,
    select: { id: true, number: true, status: true, totalAmount: true },
  });
  sendResponse(res, new ApiResponse(201, item, 'Sales order created'));
});

export const createCustomerInvoice = asyncHandler(async (req, res) => {
  if (req.user.role === 'CONTACT') throw new ApiError(403, 'Insufficient permissions');
  const item = await prisma.customerInvoice.create({
    data: req.body,
    select: { id: true, number: true, status: true, totalAmount: true },
  });
  sendResponse(res, new ApiResponse(201, item, 'Customer invoice created'));
});

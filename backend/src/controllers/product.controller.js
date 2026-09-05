import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, sendResponse } from '../utils/ApiResponse.js';
import { prisma } from '../config/db.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = getPagination(req);
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        unitPrice: true,
        costPrice: true,
        status: true,
      },
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.product.count(),
  ]);
  sendResponse(res, new ApiResponse(200, { items, meta: paginationMeta(total, page, limit) }));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      sku: true,
      name: true,
      description: true,
      unitPrice: true,
      costPrice: true,
      status: true,
    },
  });
  if (!product) throw new ApiError(404, 'Product not found');
  sendResponse(res, new ApiResponse(200, product));
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.create({
    data: req.body,
    select: { id: true, sku: true, name: true, unitPrice: true, status: true },
  });
  sendResponse(res, new ApiResponse(201, product, 'Product created'));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
    select: { id: true, sku: true, name: true, unitPrice: true, status: true },
  });
  sendResponse(res, new ApiResponse(200, product, 'Product updated'));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  sendResponse(res, new ApiResponse(200, null, 'Product deleted'));
});

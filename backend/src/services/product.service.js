import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const productSelect = {
  id: true,
  name: true,
  type: true,
  salesPrice: true,
  cost: true,
  category: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export const listProducts = async (query) => {
  const { page, limit, skip, take } = getPagination({ query });
  const { search, category, type, status } = query;

  const where = {
    ...(category && { category }),
    ...(type && { type }),
    ...(status && { status }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productSelect,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, meta: paginationMeta(total, page, limit) };
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: productSelect,
  });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

export const createProduct = async (data) => {
  return prisma.product.create({
    data,
    select: productSelect,
  });
};

export const updateProduct = async (id, data) => {
  await getProductById(id);
  return prisma.product.update({
    where: { id },
    data,
    select: productSelect,
  });
};

export const deleteProduct = async (id) => {
  await getProductById(id);
  await prisma.product.delete({ where: { id } });
};

export default {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

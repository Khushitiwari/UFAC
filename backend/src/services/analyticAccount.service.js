import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const analyticAccountSelect = {
  id: true,
  name: true,
  type: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export const listAnalyticAccounts = async (query) => {
  const { page, limit, skip, take } = getPagination({ query });
  const { search, type, status } = query;

  const where = {
    ...(type && { type }),
    ...(status && { status }),
    ...(search && {
      name: { contains: search, mode: 'insensitive' },
    }),
  };

  const [analyticAccounts, total] = await Promise.all([
    prisma.analyticAccount.findMany({
      where,
      select: analyticAccountSelect,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.analyticAccount.count({ where }),
  ]);

  return { analyticAccounts, meta: paginationMeta(total, page, limit) };
};

export const getAnalyticAccountById = async (id) => {
  const analyticAccount = await prisma.analyticAccount.findUnique({
    where: { id },
    select: analyticAccountSelect,
  });
  if (!analyticAccount) throw new ApiError(404, 'Analytic account not found');
  return analyticAccount;
};

export const createAnalyticAccount = async (data) => {
  return prisma.analyticAccount.create({
    data,
    select: analyticAccountSelect,
  });
};

export const updateAnalyticAccount = async (id, data) => {
  await getAnalyticAccountById(id);
  return prisma.analyticAccount.update({
    where: { id },
    data,
    select: analyticAccountSelect,
  });
};

export const deleteAnalyticAccount = async (id) => {
  await getAnalyticAccountById(id);
  await prisma.analyticAccount.delete({ where: { id } });
};

export default {
  listAnalyticAccounts,
  getAnalyticAccountById,
  createAnalyticAccount,
  updateAnalyticAccount,
  deleteAnalyticAccount,
};

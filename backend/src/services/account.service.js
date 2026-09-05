import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const accountSelect = {
  id: true,
  name: true,
  type: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export const listAccounts = async (query) => {
  const { page, limit, skip, take } = getPagination({ query });
  const { search, type, isActive } = query;

  const where = {
    ...(type && { type }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      name: { contains: search, mode: 'insensitive' },
    }),
  };

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where,
      select: accountSelect,
      skip,
      take,
      orderBy: { name: 'asc' },
    }),
    prisma.account.count({ where }),
  ]);

  return { accounts, meta: paginationMeta(total, page, limit) };
};

export const getAccountById = async (id) => {
  const account = await prisma.account.findUnique({
    where: { id },
    select: accountSelect,
  });
  if (!account) throw new ApiError(404, 'Account not found');
  return account;
};

export const createAccount = async (data) => {
  return prisma.account.create({
    data,
    select: accountSelect,
  });
};

export const updateAccount = async (id, data) => {
  await getAccountById(id);
  return prisma.account.update({
    where: { id },
    data,
    select: accountSelect,
  });
};

export const deleteAccount = async (id) => {
  await getAccountById(id);
  await prisma.account.delete({ where: { id } });
};

export default {
  listAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
};

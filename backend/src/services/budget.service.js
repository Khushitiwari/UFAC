import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const budgetSelect = {
  id: true,
  name: true,
  periodStart: true,
  periodEnd: true,
  plannedAmount: true,
  analyticAccountId: true,
  responsiblePersonId: true,
  createdAt: true,
  updatedAt: true,
  analyticAccount: {
    select: { id: true, name: true, type: true },
  },
  responsiblePerson: {
    select: { id: true, name: true, email: true },
  },
};

export const listBudgets = async (query) => {
  const { page, limit, skip, take } = getPagination({ query });
  const { analyticAccountId } = query;

  const where = {
    ...(analyticAccountId && { analyticAccountId }),
  };

  const [budgets, total] = await Promise.all([
    prisma.budget.findMany({
      where,
      select: budgetSelect,
      skip,
      take,
      orderBy: { periodStart: 'desc' },
    }),
    prisma.budget.count({ where }),
  ]);

  return { budgets, meta: paginationMeta(total, page, limit) };
};

export const getBudgetById = async (id) => {
  const budget = await prisma.budget.findUnique({
    where: { id },
    select: budgetSelect,
  });
  if (!budget) throw new ApiError(404, 'Budget not found');
  return budget;
};

export const createBudget = async (data) => {
  await prisma.analyticAccount.findUniqueOrThrow({ where: { id: data.analyticAccountId } });
  await prisma.user.findUniqueOrThrow({ where: { id: data.responsiblePersonId } });

  return prisma.budget.create({
    data,
    select: budgetSelect,
  });
};

export const updateBudget = async (id, data) => {
  await getBudgetById(id);
  if (data.analyticAccountId) {
    await prisma.analyticAccount.findUniqueOrThrow({ where: { id: data.analyticAccountId } });
  }
  if (data.responsiblePersonId) {
    await prisma.user.findUniqueOrThrow({ where: { id: data.responsiblePersonId } });
  }

  return prisma.budget.update({
    where: { id },
    data,
    select: budgetSelect,
  });
};

export const deleteBudget = async (id) => {
  await getBudgetById(id);
  await prisma.budget.delete({ where: { id } });
};

export default {
  listBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
};

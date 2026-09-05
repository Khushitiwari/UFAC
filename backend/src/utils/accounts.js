import { ApiError } from './ApiError.js';

export const ACCOUNT_NAMES = {
  CASH: 'Cash',
  BANK: 'Bank',
  DEBTORS: 'Debtors',
  CREDITORS: 'Creditors',
  SALE_INCOME: 'Sale Income',
  PURCHASE_EXPENSE: 'Purchase Expense',
};

/**
 * @param {import('@prisma/client').Prisma.TransactionClient | import('@prisma/client').PrismaClient} client
 * @param {string} name
 */
export const getAccountByName = async (client, name) => {
  const account = await client.account.findUnique({ where: { name } });
  if (!account) throw new ApiError(404, `Account not found: ${name}`);
  if (!account.isActive) throw new ApiError(400, `Account is inactive: ${name}`);
  return account;
};

export default { ACCOUNT_NAMES, getAccountByName };

import { prisma } from '../config/db.js';

/**
 * Balance sheet aggregation by account type as of a given date.
 * @param {Date} asOfDate
 */
export const getBalanceSheet = async (asOfDate) => {
  const items = await prisma.journalItem.findMany({
    where: {
      journalEntry: {
        status: 'POSTED',
        date: { lte: asOfDate },
      },
    },
    select: {
      debit: true,
      credit: true,
      account: {
        select: { id: true, code: true, name: true, type: true },
      },
    },
  });

  const byAccount = new Map();

  for (const item of items) {
    const key = item.account.id;
    if (!byAccount.has(key)) {
      byAccount.set(key, { ...item.account, debit: 0, credit: 0 });
    }
    const acc = byAccount.get(key);
    acc.debit += Number(item.debit);
    acc.credit += Number(item.credit);
  }

  const sections = { ASSET: [], LIABILITY: [], EQUITY: [] };

  for (const acc of byAccount.values()) {
    if (!['ASSET', 'LIABILITY', 'EQUITY'].includes(acc.type)) continue;
    const balance =
      acc.type === 'ASSET'
        ? acc.debit - acc.credit
        : acc.credit - acc.debit;
    sections[acc.type].push({ ...acc, balance });
  }

  return {
    asOfDate,
    sections,
  };
};

/**
 * Profit & Loss for a date range.
 * @param {Date} startDate
 * @param {Date} endDate
 */
export const getProfitAndLoss = async (startDate, endDate) => {
  const items = await prisma.journalItem.findMany({
    where: {
      journalEntry: {
        status: 'POSTED',
        date: { gte: startDate, lte: endDate },
      },
      account: { type: { in: ['REVENUE', 'EXPENSE'] } },
    },
    select: {
      debit: true,
      credit: true,
      account: { select: { id: true, code: true, name: true, type: true } },
    },
  });

  let revenue = 0;
  let expenses = 0;
  const lines = [];

  for (const item of items) {
    const amount =
      item.account.type === 'REVENUE'
        ? Number(item.credit) - Number(item.debit)
        : Number(item.debit) - Number(item.credit);

    if (item.account.type === 'REVENUE') revenue += amount;
    else expenses += amount;

    lines.push({ account: item.account, amount });
  }

  return {
    startDate,
    endDate,
    revenue,
    expenses,
    netIncome: revenue - expenses,
    lines,
  };
};

/**
 * Budget vs actual report.
 * @param {number} fiscalYear
 * @param {number} [period]
 */
export const getBudgetReport = async (fiscalYear, period) => {
  const budgets = await prisma.budget.findMany({
    where: {
      fiscalYear,
      ...(period ? { period } : {}),
    },
    select: {
      id: true,
      fiscalYear: true,
      period: true,
      plannedAmount: true,
      account: { select: { id: true, code: true, name: true, type: true } },
      analyticAccount: { select: { id: true, code: true, name: true } },
    },
  });

  return budgets.map((b) => ({
    ...b,
    plannedAmount: Number(b.plannedAmount),
    actualAmount: 0,
    variance: Number(b.plannedAmount),
  }));
};

export default { getBalanceSheet, getProfitAndLoss, getBudgetReport };

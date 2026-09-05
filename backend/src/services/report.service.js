import { prisma } from '../config/db.js';

/**
 * Balance sheet aggregation by account type as of a given date.
 * @param {Date} asOfDate
 */
export const getBalanceSheet = async (asOfDate) => {
  const grouped = await prisma.journalItem.groupBy({
    by: ['accountId'],
    where: {
      journalEntry: {
        date: { lte: asOfDate },
      },
    },
    _sum: {
      debit: true,
      credit: true,
    },
  });

  const accountIds = grouped.map((g) => g.accountId);
  const accounts = await prisma.account.findMany({
    where: {
      id: { in: accountIds },
      type: { in: ['ASSET', 'LIABILITY', 'CAPITAL'] },
    },
    select: { id: true, name: true, type: true },
  });

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const sections = { ASSET: [], LIABILITY: [], CAPITAL: [] };
  const totals = { ASSET: 0, LIABILITY: 0, CAPITAL: 0 };

  for (const row of grouped) {
    const account = accountMap.get(row.accountId);
    if (!account) continue;

    const debit = Number(row._sum.debit ?? 0);
    const credit = Number(row._sum.credit ?? 0);
    const balance =
      account.type === 'ASSET' ? debit - credit : credit - debit;

    sections[account.type].push({
      accountId: account.id,
      name: account.name,
      type: account.type,
      debit,
      credit,
      balance,
    });
    totals[account.type] += balance;
  }

  for (const type of Object.keys(sections)) {
    sections[type].sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    asOfDate,
    sections,
    totals,
  };
};

/**
 * Profit & Loss for a date range.
 * @param {Date} startDate
 * @param {Date} endDate
 */
export const getProfitAndLoss = async (startDate, endDate) => {
  const grouped = await prisma.journalItem.groupBy({
    by: ['accountId'],
    where: {
      journalEntry: {
        date: { gte: startDate, lte: endDate },
      },
      account: {
        type: { in: ['INCOME', 'EXPENSE'] },
      },
    },
    _sum: {
      debit: true,
      credit: true,
    },
  });

  const accountIds = grouped.map((g) => g.accountId);
  const accounts = await prisma.account.findMany({
    where: { id: { in: accountIds } },
    select: { id: true, name: true, type: true },
  });

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const incomeLines = [];
  const expenseLines = [];
  let totalIncome = 0;
  let totalExpense = 0;

  for (const row of grouped) {
    const account = accountMap.get(row.accountId);
    if (!account) continue;

    const debit = Number(row._sum.debit ?? 0);
    const credit = Number(row._sum.credit ?? 0);
    const amount =
      account.type === 'INCOME' ? credit - debit : debit - credit;

    const line = {
      accountId: account.id,
      name: account.name,
      type: account.type,
      amount,
    };

    if (account.type === 'INCOME') {
      incomeLines.push(line);
      totalIncome += amount;
    } else {
      expenseLines.push(line);
      totalExpense += amount;
    }
  }

  incomeLines.sort((a, b) => a.name.localeCompare(b.name));
  expenseLines.sort((a, b) => a.name.localeCompare(b.name));

  return {
    startDate,
    endDate,
    income: { lines: incomeLines, total: totalIncome },
    expenses: { lines: expenseLines, total: totalExpense },
    netIncome: totalIncome - totalExpense,
  };
};

/**
 * Budget vs actual variance for a period.
 * @param {Date} periodStart
 * @param {Date} periodEnd
 */
export const getBudgetVariance = async (periodStart, periodEnd) => {
  const budgets = await prisma.budget.findMany({
    where: {
      periodStart: { lte: periodEnd },
      periodEnd: { gte: periodStart },
    },
    select: {
      id: true,
      name: true,
      periodStart: true,
      periodEnd: true,
      plannedAmount: true,
      analyticAccount: {
        select: { id: true, name: true, type: true },
      },
      responsiblePerson: {
        select: { id: true, name: true },
      },
    },
  });

  const analyticIds = budgets.map((b) => b.analyticAccount.id);

  const actuals = await prisma.journalItem.groupBy({
    by: ['analyticAccountId'],
    where: {
      analyticAccountId: { in: analyticIds },
      journalEntry: {
        date: { gte: periodStart, lte: periodEnd },
      },
    },
    _sum: {
      debit: true,
      credit: true,
    },
  });

  const actualMap = new Map(
    actuals.map((a) => [
      a.analyticAccountId,
      {
        debit: Number(a._sum.debit ?? 0),
        credit: Number(a._sum.credit ?? 0),
      },
    ]),
  );

  return budgets.map((budget) => {
    const actualRow = actualMap.get(budget.analyticAccount.id) ?? {
      debit: 0,
      credit: 0,
    };
    const planned = Number(budget.plannedAmount);
    const actual =
      budget.analyticAccount.type === 'INCOME'
        ? actualRow.credit - actualRow.debit
        : actualRow.debit - actualRow.credit;
    const variance = planned - actual;

    return {
      ...budget,
      plannedAmount: planned,
      actualAmount: actual,
      variance,
    };
  });
};

export default { getBalanceSheet, getProfitAndLoss, getBudgetVariance };

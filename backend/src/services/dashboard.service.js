import { prisma } from '../config/db.js';
import { contactScope } from '../utils/access.js';
import { ACCOUNT_NAMES } from '../utils/accounts.js';
import { getBudgetVariance } from './report.service.js';

const sumRemaining = (records) =>
  records.reduce((sum, record) => {
    const paid = record.payments.reduce((s, p) => s + Number(p.amount), 0);
    return sum + Math.max(0, Number(record.totalAmount) - paid);
  }, 0);

const getAssetBalance = async (accountName) => {
  const account = await prisma.account.findUnique({
    where: { name: accountName },
    select: { id: true, type: true },
  });
  if (!account) return 0;

  const totals = await prisma.journalItem.aggregate({
    where: { accountId: account.id },
    _sum: { debit: true, credit: true },
  });

  const debit = Number(totals._sum.debit ?? 0);
  const credit = Number(totals._sum.credit ?? 0);
  return debit - credit;
};

const countByStatus = async (model, scope, statusField, statuses) => {
  const entries = await Promise.all(
    statuses.map((status) =>
      model.count({ where: { ...scope, [statusField]: status } }),
    ),
  );
  return Object.fromEntries(statuses.map((status, i) => [status, entries[i]]));
};

const currentYearRange = () => {
  const year = new Date().getFullYear();
  return {
    periodStart: new Date(`${year}-01-01`),
    periodEnd: new Date(`${year}-12-31`),
  };
};

/**
 * Lightweight dashboard totals for admin/accountant views.
 * @param {import('@prisma/client').User} user
 */
export const getDashboardSummary = async (user) => {
  const scope = contactScope(user);
  const openStatuses = { in: ['UNPAID', 'PARTIAL'] };

  const [
    openBills,
    openInvoices,
    salesCounts,
    purchaseCounts,
    contactsCount,
    productsCount,
    accountsCount,
    paymentsCount,
    vendorBillsCount,
    customerInvoicesCount,
    recentSalesOrders,
    recentPurchaseOrders,
    salesOrderTotal,
    purchaseOrderTotal,
  ] = await Promise.all([
    prisma.vendorBill.findMany({
      where: { ...scope, status: openStatuses },
      select: { totalAmount: true, payments: { select: { amount: true } } },
    }),
    prisma.customerInvoice.findMany({
      where: { ...scope, status: openStatuses },
      select: { totalAmount: true, payments: { select: { amount: true } } },
    }),
    countByStatus(prisma.salesOrder, scope, 'status', ['DRAFT', 'CONFIRMED', 'INVOICED']),
    countByStatus(prisma.purchaseOrder, scope, 'status', ['DRAFT', 'CONFIRMED', 'BILLED']),
    prisma.contact.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.account.count({ where: { isActive: true } }),
    prisma.payment.count({ where: scope }),
    prisma.vendorBill.count({ where: scope }),
    prisma.customerInvoice.count({ where: scope }),
    prisma.salesOrder.findMany({
      where: scope,
      take: 5,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        date: true,
        status: true,
        contact: { select: { name: true } },
        lines: { select: { quantity: true, unitPrice: true, tax: true } },
      },
    }),
    prisma.purchaseOrder.findMany({
      where: scope,
      take: 5,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        date: true,
        status: true,
        contact: { select: { name: true } },
        lines: { select: { quantity: true, unitPrice: true } },
      },
    }),
    prisma.salesOrder.findMany({
      where: scope,
      select: { lines: { select: { quantity: true, unitPrice: true, tax: true } } },
    }),
    prisma.purchaseOrder.findMany({
      where: scope,
      select: { lines: { select: { quantity: true, unitPrice: true } } },
    }),
  ]);

  const unpaidBills = sumRemaining(openBills);
  const unpaidInvoices = sumRemaining(openInvoices);

  let cashBankBalance = 0;
  if (user.role !== 'CONTACT') {
    const [cash, bank] = await Promise.all([
      getAssetBalance(ACCOUNT_NAMES.CASH),
      getAssetBalance(ACCOUNT_NAMES.BANK),
    ]);
    cashBankBalance = cash + bank;
  }

  const salesAll = salesCounts.DRAFT + salesCounts.CONFIRMED + salesCounts.INVOICED;
  const purchaseAll = purchaseCounts.DRAFT + purchaseCounts.CONFIRMED + purchaseCounts.BILLED;

  const salesTotalAmount = salesOrderTotal.reduce(
    (sum, order) =>
      sum +
      order.lines.reduce(
        (lineSum, line) =>
          lineSum + Number(line.quantity) * Number(line.unitPrice) + Number(line.tax),
        0,
      ),
    0,
  );

  const purchaseTotalAmount = purchaseOrderTotal.reduce(
    (sum, order) =>
      sum +
      order.lines.reduce(
        (lineSum, line) => lineSum + Number(line.quantity) * Number(line.unitPrice),
        0,
      ),
    0,
  );

  const { periodStart, periodEnd } = currentYearRange();
  const budgetRows = user.role !== 'CONTACT' ? await getBudgetVariance(periodStart, periodEnd) : [];

  const budgetAchieved = budgetRows.filter((row) => {
    if (row.analyticAccount.type === 'INCOME') {
      return row.actualAmount >= row.plannedAmount;
    }
    return row.actualAmount <= row.plannedAmount;
  }).length;

  const budgetCommitted = budgetRows.filter((row) => row.actualAmount > 0).length;
  const budgetPlannedTotal = budgetRows.reduce((sum, row) => sum + row.plannedAmount, 0);
  const budgetActualTotal = budgetRows.reduce((sum, row) => sum + row.actualAmount, 0);

  const mapRecentSales = recentSalesOrders.map((order) => ({
    id: order.id,
    date: order.date,
    status: order.status,
    contactName: order.contact.name,
    total: order.lines.reduce(
      (sum, line) => sum + Number(line.quantity) * Number(line.unitPrice) + Number(line.tax),
      0,
    ),
  }));

  const mapRecentPurchase = recentPurchaseOrders.map((order) => ({
    id: order.id,
    date: order.date,
    status: order.status,
    contactName: order.contact.name,
    total: order.lines.reduce(
      (sum, line) => sum + Number(line.quantity) * Number(line.unitPrice),
      0,
    ),
  }));

  return {
    unpaidBills,
    unpaidInvoices,
    cashBankBalance,
    sales: {
      all: salesAll,
      draft: salesCounts.DRAFT,
      confirmed: salesCounts.CONFIRMED,
      invoiced: salesCounts.INVOICED,
      totalAmount: salesTotalAmount,
    },
    purchase: {
      all: purchaseAll,
      draft: purchaseCounts.DRAFT,
      confirmed: purchaseCounts.CONFIRMED,
      billed: purchaseCounts.BILLED,
      totalAmount: purchaseTotalAmount,
    },
    budgets: {
      total: budgetRows.length,
      achieved: budgetAchieved,
      committed: budgetCommitted,
      plannedTotal: budgetPlannedTotal,
      actualTotal: budgetActualTotal,
    },
    masters: {
      contacts: contactsCount,
      products: productsCount,
      accounts: accountsCount,
    },
    activity: {
      payments: paymentsCount,
      vendorBills: vendorBillsCount,
      customerInvoices: customerInvoicesCount,
    },
    recentSalesOrders: mapRecentSales,
    recentPurchaseOrders: mapRecentPurchase,
  };
};

export default { getDashboardSummary };

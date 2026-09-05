import { prisma } from '../config/db.js';
import { contactScope } from '../utils/access.js';
import { ACCOUNT_NAMES } from '../utils/accounts.js';

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

/**
 * Lightweight dashboard totals for admin/accountant views.
 * @param {import('@prisma/client').User} user
 */
export const getDashboardSummary = async (user) => {
  const scope = contactScope(user);
  const openStatuses = { in: ['UNPAID', 'PARTIAL'] };

  const [openBills, openInvoices] = await Promise.all([
    prisma.vendorBill.findMany({
      where: { ...scope, status: openStatuses },
      select: {
        totalAmount: true,
        payments: { select: { amount: true } },
      },
    }),
    prisma.customerInvoice.findMany({
      where: { ...scope, status: openStatuses },
      select: {
        totalAmount: true,
        payments: { select: { amount: true } },
      },
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

  return {
    unpaidBills,
    unpaidInvoices,
    cashBankBalance,
  };
};

export default { getDashboardSummary };

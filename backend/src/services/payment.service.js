import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { contactScope } from '../utils/access.js';
import { createJournalEntryInTx } from './ledger.service.js';
import { ACCOUNT_NAMES, getAccountByName } from '../utils/accounts.js';

const paymentInclude = {
  contact: { select: { id: true, name: true, email: true } },
  vendorBill: { select: { id: true, totalAmount: true, status: true } },
  customerInvoice: { select: { id: true, totalAmount: true, status: true } },
  journalEntry: {
    select: {
      id: true,
      date: true,
      reference: true,
      items: {
        select: { id: true, accountId: true, debit: true, credit: true },
      },
    },
  },
};

const getPaidAmount = async (tx, { billId, invoiceId }) => {
  const result = await tx.payment.aggregate({
    where: billId ? { billId } : { invoiceId },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
};

const resolvePaymentStatus = (totalAmount, paidAmount) => {
  if (paidAmount <= 0) return 'UNPAID';
  if (paidAmount >= totalAmount) return 'PAID';
  return 'PARTIAL';
};

const getPaymentJournal = async (tx, method) => {
  const journal = await tx.journal.findFirst({ where: { type: method } });
  if (!journal) throw new ApiError(404, `${method} journal not found`);
  return journal;
};

export const listPayments = async (query, user) => {
  const { page, limit, skip, take } = getPagination({ query });
  const { contactId, method } = query;

  const where = {
    ...contactScope(user),
    ...(contactId && { contactId }),
    ...(method && { method }),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: paymentInclude,
      skip,
      take,
      orderBy: { date: 'desc' },
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, meta: paginationMeta(total, page, limit) };
};

export const getPaymentById = async (id, user) => {
  const payment = await prisma.payment.findFirst({
    where: { id, ...contactScope(user) },
    include: paymentInclude,
  });
  if (!payment) throw new ApiError(404, 'Payment not found');
  return payment;
};

export const createPayment = async (data, createdById) => {
  const { billId, invoiceId, method, amount, date, contactId, reference } = data;

  return prisma.$transaction(async (tx) => {
    let totalAmount;
    let journalItems;
    let sourceLabel;

    if (billId) {
      const bill = await tx.vendorBill.findUnique({ where: { id: billId } });
      if (!bill) throw new ApiError(404, 'Vendor bill not found');
      if (bill.contactId !== contactId) {
        throw new ApiError(400, 'Payment contact must match vendor bill contact');
      }

      const alreadyPaid = await getPaidAmount(tx, { billId });
      const remaining = Number(bill.totalAmount) - alreadyPaid;
      if (amount > remaining + 0.001) {
        throw new ApiError(400, `Payment amount exceeds remaining balance (${remaining.toFixed(2)})`);
      }

      totalAmount = Number(bill.totalAmount);
      const creditors = await getAccountByName(tx, ACCOUNT_NAMES.CREDITORS);
      const cashOrBank = await getAccountByName(
        tx,
        method === 'CASH' ? ACCOUNT_NAMES.CASH : ACCOUNT_NAMES.BANK,
      );

      journalItems = [
        { accountId: creditors.id, debit: amount, credit: 0, description: 'Creditors payment' },
        { accountId: cashOrBank.id, debit: 0, credit: amount, description: `${method} payment` },
      ];
      sourceLabel = `Bill-${billId}`;
    } else {
      const invoice = await tx.customerInvoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw new ApiError(404, 'Customer invoice not found');
      if (invoice.contactId !== contactId) {
        throw new ApiError(400, 'Payment contact must match customer invoice contact');
      }

      const alreadyPaid = await getPaidAmount(tx, { invoiceId });
      const remaining = Number(invoice.totalAmount) - alreadyPaid;
      if (amount > remaining + 0.001) {
        throw new ApiError(400, `Payment amount exceeds remaining balance (${remaining.toFixed(2)})`);
      }

      totalAmount = Number(invoice.totalAmount);
      const debtors = await getAccountByName(tx, ACCOUNT_NAMES.DEBTORS);
      const cashOrBank = await getAccountByName(
        tx,
        method === 'CASH' ? ACCOUNT_NAMES.CASH : ACCOUNT_NAMES.BANK,
      );

      journalItems = [
        { accountId: cashOrBank.id, debit: amount, credit: 0, description: `${method} receipt` },
        { accountId: debtors.id, debit: 0, credit: amount, description: 'Debtors receipt' },
      ];
      sourceLabel = `Invoice-${invoiceId}`;
    }

    const journal = await getPaymentJournal(tx, method);

    const journalEntry = await createJournalEntryInTx(tx, {
      journalId: journal.id,
      date,
      reference: reference ?? sourceLabel,
      sourceType: 'PAYMENT',
      sourceId: undefined,
      createdById,
      items: journalItems,
    });

    const payment = await tx.payment.create({
      data: {
        contactId,
        billId: billId ?? null,
        invoiceId: invoiceId ?? null,
        method,
        amount,
        date,
        reference: reference ?? null,
        journalEntryId: journalEntry.id,
      },
      include: paymentInclude,
    });

    await tx.journalEntry.update({
      where: { id: journalEntry.id },
      data: { sourceId: payment.id },
    });

    const newPaid = billId
      ? await getPaidAmount(tx, { billId })
      : await getPaidAmount(tx, { invoiceId });

    const status = resolvePaymentStatus(totalAmount, newPaid);

    if (billId) {
      await tx.vendorBill.update({ where: { id: billId }, data: { status } });
    } else {
      await tx.customerInvoice.update({ where: { id: invoiceId }, data: { status } });
    }

    return payment;
  });
};

export const deletePayment = async (id) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      vendorBill: true,
      customerInvoice: true,
    },
  });
  if (!payment) throw new ApiError(404, 'Payment not found');

  await prisma.$transaction(async (tx) => {
    await tx.payment.delete({ where: { id } });
    await tx.journalEntry.delete({ where: { id: payment.journalEntryId } });

    if (payment.billId) {
      const paid = await getPaidAmount(tx, { billId: payment.billId });
      const status = resolvePaymentStatus(Number(payment.vendorBill.totalAmount), paid);
      await tx.vendorBill.update({ where: { id: payment.billId }, data: { status } });
    }

    if (payment.invoiceId) {
      const paid = await getPaidAmount(tx, { invoiceId: payment.invoiceId });
      const status = resolvePaymentStatus(Number(payment.customerInvoice.totalAmount), paid);
      await tx.customerInvoice.update({ where: { id: payment.invoiceId }, data: { status } });
    }
  });
};

export default {
  listPayments,
  getPaymentById,
  createPayment,
  deletePayment,
};

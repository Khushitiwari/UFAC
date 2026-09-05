import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { contactScope } from '../utils/access.js';
import { createJournalEntryInTx } from './ledger.service.js';
import { ACCOUNT_NAMES, getAccountByName } from '../utils/accounts.js';

const customerInvoiceInclude = {
  contact: { select: { id: true, name: true, email: true, type: true } },
  salesOrder: {
    include: {
      lines: {
        include: { product: { select: { id: true, name: true } } },
      },
    },
  },
  journalEntry: {
    select: {
      id: true,
      date: true,
      reference: true,
      sourceType: true,
      items: {
        select: {
          id: true,
          accountId: true,
          debit: true,
          credit: true,
          description: true,
        },
      },
    },
  },
  payments: {
    select: { id: true, amount: true, date: true, method: true },
  },
};

const calcLineTotal = (lines) =>
  lines.reduce(
    (sum, line) =>
      sum + Number(line.quantity) * Number(line.unitPrice) + Number(line.tax ?? 0),
    0,
  );

const getSalesJournal = async (tx) => {
  const journal = await tx.journal.findFirst({ where: { type: 'SALES' } });
  if (!journal) throw new ApiError(404, 'Sales journal not found');
  return journal;
};

const createCustomerInvoiceInTx = async (
  tx,
  { contactId, salesOrderId, invoiceDate, dueDate, totalAmount, createdById },
) => {
  const debtors = await getAccountByName(tx, ACCOUNT_NAMES.DEBTORS);
  const saleIncome = await getAccountByName(tx, ACCOUNT_NAMES.SALE_INCOME);
  const journal = await getSalesJournal(tx);

  const journalEntry = await createJournalEntryInTx(tx, {
    journalId: journal.id,
    date: invoiceDate,
    reference: salesOrderId ? `SO-${salesOrderId}` : undefined,
    sourceType: 'CUSTOMER_INVOICE',
    sourceId: undefined,
    createdById,
    items: [
      {
        accountId: debtors.id,
        debit: totalAmount,
        credit: 0,
        description: 'Debtors',
      },
      {
        accountId: saleIncome.id,
        debit: 0,
        credit: totalAmount,
        description: 'Sale income',
      },
    ],
  });

  const customerInvoice = await tx.customerInvoice.create({
    data: {
      contactId,
      salesOrderId: salesOrderId ?? null,
      invoiceDate,
      dueDate: dueDate ?? null,
      totalAmount,
      journalEntryId: journalEntry.id,
    },
    include: customerInvoiceInclude,
  });

  await tx.journalEntry.update({
    where: { id: journalEntry.id },
    data: { sourceId: customerInvoice.id },
  });

  return customerInvoice;
};

export const listCustomerInvoices = async (query, user) => {
  const { page, limit, skip, take } = getPagination({ query });
  const { status, contactId } = query;

  const where = {
    ...contactScope(user),
    ...(status && { status }),
    ...(contactId && { contactId }),
  };

  const [customerInvoices, total] = await Promise.all([
    prisma.customerInvoice.findMany({
      where,
      include: customerInvoiceInclude,
      skip,
      take,
      orderBy: { invoiceDate: 'desc' },
    }),
    prisma.customerInvoice.count({ where }),
  ]);

  return { customerInvoices, meta: paginationMeta(total, page, limit) };
};

export const getCustomerInvoiceById = async (id, user) => {
  const customerInvoice = await prisma.customerInvoice.findFirst({
    where: { id, ...contactScope(user) },
    include: customerInvoiceInclude,
  });
  if (!customerInvoice) throw new ApiError(404, 'Customer invoice not found');
  return customerInvoice;
};

export const createCustomerInvoice = async (data, createdById) => {
  const { lines, ...invoiceData } = data;
  const contact = await prisma.contact.findUnique({ where: { id: invoiceData.contactId } });
  if (!contact) throw new ApiError(404, 'Contact not found');
  if (!['CUSTOMER', 'BOTH'].includes(contact.type)) {
    throw new ApiError(400, 'Contact must be a customer');
  }

  for (const line of lines) {
    await prisma.product.findUniqueOrThrow({ where: { id: line.productId } });
  }

  const totalAmount = calcLineTotal(lines);

  return prisma.$transaction((tx) =>
    createCustomerInvoiceInTx(tx, {
      contactId: invoiceData.contactId,
      salesOrderId: null,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      totalAmount,
      createdById,
    }),
  );
};

export const createCustomerInvoiceFromSalesOrder = async (data, createdById) => {
  const { salesOrderId, invoiceDate, dueDate } = data;

  return prisma.$transaction(async (tx) => {
    const salesOrder = await tx.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: { lines: true },
    });

    if (!salesOrder) throw new ApiError(404, 'Sales order not found');
    if (salesOrder.status === 'INVOICED') {
      throw new ApiError(400, 'Sales order is already invoiced');
    }
    if (salesOrder.status === 'DRAFT') {
      throw new ApiError(400, 'Sales order must be confirmed before invoicing');
    }

    const totalAmount = calcLineTotal(salesOrder.lines);

    const customerInvoice = await createCustomerInvoiceInTx(tx, {
      contactId: salesOrder.contactId,
      salesOrderId: salesOrder.id,
      invoiceDate,
      dueDate,
      totalAmount,
      createdById,
    });

    await tx.salesOrder.update({
      where: { id: salesOrderId },
      data: { status: 'INVOICED' },
    });

    return customerInvoice;
  });
};

export const updateCustomerInvoice = async (id, data) => {
  await getCustomerInvoiceById(id);
  return prisma.customerInvoice.update({
    where: { id },
    data,
    include: customerInvoiceInclude,
  });
};

export const deleteCustomerInvoice = async (id) => {
  const invoice = await prisma.customerInvoice.findUnique({
    where: { id },
    include: { payments: { select: { id: true } } },
  });
  if (!invoice) throw new ApiError(404, 'Customer invoice not found');
  if (invoice.payments.length > 0) {
    throw new ApiError(400, 'Cannot delete customer invoice with payments');
  }
  await prisma.$transaction([
    prisma.customerInvoice.delete({ where: { id } }),
    prisma.journalEntry.delete({ where: { id: invoice.journalEntryId } }),
  ]);
};

export default {
  listCustomerInvoices,
  getCustomerInvoiceById,
  createCustomerInvoice,
  createCustomerInvoiceFromSalesOrder,
  updateCustomerInvoice,
  deleteCustomerInvoice,
};

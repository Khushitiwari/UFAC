import { prisma } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { contactScope } from '../utils/access.js';
import { createJournalEntryInTx } from './ledger.service.js';
import { ACCOUNT_NAMES, getAccountByName } from '../utils/accounts.js';

const vendorBillInclude = {
  contact: { select: { id: true, name: true, email: true, type: true } },
  purchaseOrder: {
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
  lines.reduce((sum, line) => sum + Number(line.quantity) * Number(line.unitPrice), 0);

const getPurchaseJournal = async (tx) => {
  const journal = await tx.journal.findFirst({ where: { type: 'PURCHASE' } });
  if (!journal) throw new ApiError(404, 'Purchase journal not found');
  return journal;
};

const createVendorBillInTx = async (tx, { contactId, purchaseOrderId, invoiceDate, dueDate, totalAmount, createdById }) => {
  const purchaseExpense = await getAccountByName(tx, ACCOUNT_NAMES.PURCHASE_EXPENSE);
  const creditors = await getAccountByName(tx, ACCOUNT_NAMES.CREDITORS);
  const journal = await getPurchaseJournal(tx);

  const journalEntry = await createJournalEntryInTx(tx, {
    journalId: journal.id,
    date: invoiceDate,
    reference: purchaseOrderId ? `PO-${purchaseOrderId}` : undefined,
    sourceType: 'VENDOR_BILL',
    sourceId: undefined,
    createdById,
    items: [
      {
        accountId: purchaseExpense.id,
        debit: totalAmount,
        credit: 0,
        description: 'Purchase expense',
      },
      {
        accountId: creditors.id,
        debit: 0,
        credit: totalAmount,
        description: 'Creditors',
      },
    ],
  });

  const vendorBill = await tx.vendorBill.create({
    data: {
      contactId,
      purchaseOrderId: purchaseOrderId ?? null,
      invoiceDate,
      dueDate: dueDate ?? null,
      totalAmount,
      journalEntryId: journalEntry.id,
    },
    include: vendorBillInclude,
  });

  await tx.journalEntry.update({
    where: { id: journalEntry.id },
    data: { sourceId: vendorBill.id },
  });

  return vendorBill;
};

export const listVendorBills = async (query, user) => {
  const { page, limit, skip, take } = getPagination({ query });
  const { status, contactId } = query;

  const where = {
    ...contactScope(user),
    ...(status && { status }),
    ...(contactId && { contactId }),
  };

  const [vendorBills, total] = await Promise.all([
    prisma.vendorBill.findMany({
      where,
      include: vendorBillInclude,
      skip,
      take,
      orderBy: { invoiceDate: 'desc' },
    }),
    prisma.vendorBill.count({ where }),
  ]);

  return { vendorBills, meta: paginationMeta(total, page, limit) };
};

export const getVendorBillById = async (id, user) => {
  const vendorBill = await prisma.vendorBill.findFirst({
    where: { id, ...contactScope(user) },
    include: vendorBillInclude,
  });
  if (!vendorBill) throw new ApiError(404, 'Vendor bill not found');
  return vendorBill;
};

export const createVendorBill = async (data, createdById) => {
  const { lines, ...billData } = data;
  const contact = await prisma.contact.findUnique({ where: { id: billData.contactId } });
  if (!contact) throw new ApiError(404, 'Contact not found');
  if (!['VENDOR', 'BOTH'].includes(contact.type)) {
    throw new ApiError(400, 'Contact must be a vendor');
  }

  for (const line of lines) {
    await prisma.product.findUniqueOrThrow({ where: { id: line.productId } });
  }

  const totalAmount = calcLineTotal(lines);

  return prisma.$transaction((tx) =>
    createVendorBillInTx(tx, {
      contactId: billData.contactId,
      purchaseOrderId: null,
      invoiceDate: billData.invoiceDate,
      dueDate: billData.dueDate,
      totalAmount,
      createdById,
    }),
  );
};

export const createVendorBillFromPurchaseOrder = async (data, createdById) => {
  const { purchaseOrderId, invoiceDate, dueDate } = data;

  return prisma.$transaction(async (tx) => {
    const purchaseOrder = await tx.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { lines: true },
    });

    if (!purchaseOrder) throw new ApiError(404, 'Purchase order not found');
    if (purchaseOrder.status === 'BILLED') {
      throw new ApiError(400, 'Purchase order is already billed');
    }
    if (purchaseOrder.status === 'DRAFT') {
      throw new ApiError(400, 'Purchase order must be confirmed before billing');
    }

    const totalAmount = calcLineTotal(purchaseOrder.lines);

    const vendorBill = await createVendorBillInTx(tx, {
      contactId: purchaseOrder.contactId,
      purchaseOrderId: purchaseOrder.id,
      invoiceDate,
      dueDate,
      totalAmount,
      createdById,
    });

    await tx.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: { status: 'BILLED' },
    });

    return vendorBill;
  });
};

export const updateVendorBill = async (id, data) => {
  await getVendorBillById(id);
  return prisma.vendorBill.update({
    where: { id },
    data,
    include: vendorBillInclude,
  });
};

export const deleteVendorBill = async (id) => {
  const bill = await prisma.vendorBill.findUnique({
    where: { id },
    include: { payments: { select: { id: true } } },
  });
  if (!bill) throw new ApiError(404, 'Vendor bill not found');
  if (bill.payments.length > 0) {
    throw new ApiError(400, 'Cannot delete vendor bill with payments');
  }
  await prisma.$transaction([
    prisma.vendorBill.delete({ where: { id } }),
    prisma.journalEntry.delete({ where: { id: bill.journalEntryId } }),
  ]);
};

export default {
  listVendorBills,
  getVendorBillById,
  createVendorBill,
  createVendorBillFromPurchaseOrder,
  updateVendorBill,
  deleteVendorBill,
};

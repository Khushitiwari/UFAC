import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createJournalEntryInTx } from '../src/services/ledger.service.js';
import { ACCOUNT_NAMES } from '../src/utils/accounts.js';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function clearTransactionalData() {
  await prisma.payment.deleteMany();
  await prisma.vendorBill.deleteMany();
  await prisma.customerInvoice.deleteMany();
  await prisma.journalItem.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.salesOrderLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.budget.deleteMany();
}

async function upsertAccount(name, type) {
  return prisma.account.upsert({
    where: { name },
    update: { type, isActive: true },
    create: { name, type, isActive: true },
  });
}

async function main() {
  console.log('Seeding UFAC database...');

  await clearTransactionalData();

  const adminPassword = await bcrypt.hash('Admin123!', BCRYPT_ROUNDS);
  const accountantPassword = await bcrypt.hash('Account123!', BCRYPT_ROUNDS);
  const contactPassword = await bcrypt.hash('Contact123!', BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ufac.local' },
    update: { name: 'Admin Owner', role: 'ADMIN', isActive: true },
    create: {
      email: 'admin@ufac.local',
      passwordHash: adminPassword,
      name: 'Admin Owner',
      role: 'ADMIN',
    },
  });

  const accountant = await prisma.user.upsert({
    where: { email: 'accountant@ufac.local' },
    update: { name: 'Jane Accountant', role: 'ACCOUNTANT', isActive: true },
    create: {
      email: 'accountant@ufac.local',
      passwordHash: accountantPassword,
      name: 'Jane Accountant',
      role: 'ACCOUNTANT',
    },
  });

  const vendorContact = await prisma.contact.upsert({
    where: { email: 'vendor@urbanfurniture.com' },
    update: {
      name: 'Urban Furniture Supplies Co.',
      type: 'VENDOR',
      status: 'ACTIVE',
    },
    create: {
      name: 'Urban Furniture Supplies Co.',
      email: 'vendor@urbanfurniture.com',
      phone: '+1-555-0100',
      type: 'VENDOR',
      address: '100 Warehouse Blvd, Cityville',
    },
  });

  const customerContact = await prisma.contact.upsert({
    where: { email: 'customer@designstudio.com' },
    update: {
      name: 'Design Studio LLC',
      type: 'CUSTOMER',
      status: 'ACTIVE',
    },
    create: {
      name: 'Design Studio LLC',
      email: 'customer@designstudio.com',
      phone: '+1-555-0200',
      type: 'CUSTOMER',
      address: '200 Creative Ave, Townsville',
    },
  });

  await prisma.user.upsert({
    where: { email: 'vendor@urbanfurniture.com' },
    update: {
      name: 'Vendor Portal User',
      role: 'CONTACT',
      contactId: vendorContact.id,
      isActive: true,
    },
    create: {
      email: 'vendor@urbanfurniture.com',
      passwordHash: contactPassword,
      name: 'Vendor Portal User',
      role: 'CONTACT',
      contactId: vendorContact.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@designstudio.com' },
    update: {
      name: 'Customer Portal User',
      role: 'CONTACT',
      contactId: customerContact.id,
      isActive: true,
    },
    create: {
      email: 'customer@designstudio.com',
      passwordHash: contactPassword,
      name: 'Customer Portal User',
      role: 'CONTACT',
      contactId: customerContact.id,
    },
  });

  const accounts = {};
  const accountDefs = [
    [ACCOUNT_NAMES.CASH, 'ASSET'],
    [ACCOUNT_NAMES.BANK, 'ASSET'],
    [ACCOUNT_NAMES.DEBTORS, 'ASSET'],
    [ACCOUNT_NAMES.CREDITORS, 'LIABILITY'],
    ['Capital', 'CAPITAL'],
    [ACCOUNT_NAMES.SALE_INCOME, 'INCOME'],
    [ACCOUNT_NAMES.PURCHASE_EXPENSE, 'EXPENSE'],
  ];

  for (const [name, type] of accountDefs) {
    accounts[name] = await upsertAccount(name, type);
  }

  const purchaseJournal = await prisma.journal.upsert({
    where: { id: 'seed-purchase-journal' },
    update: {
      name: 'Purchase Journal',
      type: 'PURCHASE',
      defaultAccountId: accounts[ACCOUNT_NAMES.PURCHASE_EXPENSE].id,
    },
    create: {
      id: 'seed-purchase-journal',
      name: 'Purchase Journal',
      type: 'PURCHASE',
      defaultAccountId: accounts[ACCOUNT_NAMES.PURCHASE_EXPENSE].id,
    },
  });

  const salesJournal = await prisma.journal.upsert({
    where: { id: 'seed-sales-journal' },
    update: {
      name: 'Sales Journal',
      type: 'SALES',
      defaultAccountId: accounts[ACCOUNT_NAMES.SALE_INCOME].id,
    },
    create: {
      id: 'seed-sales-journal',
      name: 'Sales Journal',
      type: 'SALES',
      defaultAccountId: accounts[ACCOUNT_NAMES.SALE_INCOME].id,
    },
  });

  const bankJournal = await prisma.journal.upsert({
    where: { id: 'seed-bank-journal' },
    update: {
      name: 'Bank Journal',
      type: 'BANK',
      defaultAccountId: accounts[ACCOUNT_NAMES.BANK].id,
    },
    create: {
      id: 'seed-bank-journal',
      name: 'Bank Journal',
      type: 'BANK',
      defaultAccountId: accounts[ACCOUNT_NAMES.BANK].id,
    },
  });

  const cashJournal = await prisma.journal.upsert({
    where: { id: 'seed-cash-journal' },
    update: {
      name: 'Cash Journal',
      type: 'CASH',
      defaultAccountId: accounts[ACCOUNT_NAMES.CASH].id,
    },
    create: {
      id: 'seed-cash-journal',
      name: 'Cash Journal',
      type: 'CASH',
      defaultAccountId: accounts[ACCOUNT_NAMES.CASH].id,
    },
  });

  const sofa = await prisma.product.upsert({
    where: { id: 'seed-product-sofa' },
    update: {
      name: 'Modern Sectional Sofa',
      type: 'GOODS',
      salesPrice: 1299.99,
      cost: 650.0,
      category: 'Seating',
    },
    create: {
      id: 'seed-product-sofa',
      name: 'Modern Sectional Sofa',
      type: 'GOODS',
      salesPrice: 1299.99,
      cost: 650.0,
      category: 'Seating',
      description: '3-seater grey fabric sectional',
    },
  });

  const desk = await prisma.product.upsert({
    where: { id: 'seed-product-desk' },
    update: {
      name: 'Executive Oak Desk',
      type: 'GOODS',
      salesPrice: 899.0,
      cost: 420.0,
      category: 'Office',
    },
    create: {
      id: 'seed-product-desk',
      name: 'Executive Oak Desk',
      type: 'GOODS',
      salesPrice: 899.0,
      cost: 420.0,
      category: 'Office',
      description: 'Solid oak executive desk with drawers',
    },
  });

  const salesAnalytic = await prisma.analyticAccount.upsert({
    where: { name: 'Sales Department' },
    update: { type: 'INCOME', status: 'ACTIVE' },
    create: { name: 'Sales Department', type: 'INCOME' },
  });

  const opsAnalytic = await prisma.analyticAccount.upsert({
    where: { name: 'Operations' },
    update: { type: 'EXPENSE', status: 'ACTIVE' },
    create: { name: 'Operations', type: 'EXPENSE' },
  });

  await prisma.budget.create({
    data: {
      name: 'Q1 Sales Target',
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-03-31'),
      plannedAmount: 50000,
      analyticAccountId: salesAnalytic.id,
      responsiblePersonId: accountant.id,
    },
  });

  await prisma.budget.create({
    data: {
      name: 'Q1 Operations Budget',
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-03-31'),
      plannedAmount: 15000,
      analyticAccountId: opsAnalytic.id,
      responsiblePersonId: admin.id,
    },
  });

  const poDate = new Date('2026-01-10');
  const soDate = new Date('2026-01-12');

  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      contactId: vendorContact.id,
      date: poDate,
      status: 'CONFIRMED',
      notes: 'Initial stock order',
      lines: {
        create: [
          { productId: sofa.id, quantity: 5, unitPrice: 650 },
          { productId: desk.id, quantity: 3, unitPrice: 420 },
        ],
      },
    },
    include: { lines: true },
  });

  const poTotal = purchaseOrder.lines.reduce(
    (sum, line) => sum + Number(line.quantity) * Number(line.unitPrice),
    0,
  );

  const salesOrder = await prisma.salesOrder.create({
    data: {
      contactId: customerContact.id,
      date: soDate,
      status: 'CONFIRMED',
      notes: 'Showroom order',
      lines: {
        create: [
          { productId: sofa.id, quantity: 2, unitPrice: 1299.99, tax: 100 },
          { productId: desk.id, quantity: 1, unitPrice: 899, tax: 50 },
        ],
      },
    },
    include: { lines: true },
  });

  const soTotal = salesOrder.lines.reduce(
    (sum, line) =>
      sum + Number(line.quantity) * Number(line.unitPrice) + Number(line.tax),
    0,
  );

  const billDate = new Date('2026-01-15');
  const invoiceDate = new Date('2026-01-18');

  await prisma.$transaction(async (tx) => {
    const billJournalEntry = await createJournalEntryInTx(tx, {
      journalId: purchaseJournal.id,
      date: billDate,
      reference: `PO-${purchaseOrder.id}`,
      sourceType: 'VENDOR_BILL',
      createdById: admin.id,
      items: [
        {
          accountId: accounts[ACCOUNT_NAMES.PURCHASE_EXPENSE].id,
          analyticAccountId: opsAnalytic.id,
          debit: poTotal,
          credit: 0,
          description: 'Purchase expense',
        },
        {
          accountId: accounts[ACCOUNT_NAMES.CREDITORS].id,
          debit: 0,
          credit: poTotal,
          description: 'Creditors',
        },
      ],
    });

    const vendorBill = await tx.vendorBill.create({
      data: {
        purchaseOrderId: purchaseOrder.id,
        contactId: vendorContact.id,
        invoiceDate: billDate,
        dueDate: new Date('2026-02-15'),
        totalAmount: poTotal,
        journalEntryId: billJournalEntry.id,
      },
    });

    await tx.journalEntry.update({
      where: { id: billJournalEntry.id },
      data: { sourceId: vendorBill.id },
    });

    await tx.purchaseOrder.update({
      where: { id: purchaseOrder.id },
      data: { status: 'BILLED' },
    });

    const invoiceJournalEntry = await createJournalEntryInTx(tx, {
      journalId: salesJournal.id,
      date: invoiceDate,
      reference: `SO-${salesOrder.id}`,
      sourceType: 'CUSTOMER_INVOICE',
      createdById: admin.id,
      items: [
        {
          accountId: accounts[ACCOUNT_NAMES.DEBTORS].id,
          debit: soTotal,
          credit: 0,
          description: 'Debtors',
        },
        {
          accountId: accounts[ACCOUNT_NAMES.SALE_INCOME].id,
          analyticAccountId: salesAnalytic.id,
          debit: 0,
          credit: soTotal,
          description: 'Sale income',
        },
      ],
    });

    const customerInvoice = await tx.customerInvoice.create({
      data: {
        salesOrderId: salesOrder.id,
        contactId: customerContact.id,
        invoiceDate,
        dueDate: new Date('2026-02-18'),
        totalAmount: soTotal,
        journalEntryId: invoiceJournalEntry.id,
      },
    });

    await tx.journalEntry.update({
      where: { id: invoiceJournalEntry.id },
      data: { sourceId: customerInvoice.id },
    });

    await tx.salesOrder.update({
      where: { id: salesOrder.id },
      data: { status: 'INVOICED' },
    });

    const vendorPaymentAmount = poTotal;
    const vendorPaymentJournal = await createJournalEntryInTx(tx, {
      journalId: bankJournal.id,
      date: new Date('2026-01-20'),
      reference: `Bill-${vendorBill.id}`,
      sourceType: 'PAYMENT',
      createdById: accountant.id,
      items: [
        {
          accountId: accounts[ACCOUNT_NAMES.CREDITORS].id,
          debit: vendorPaymentAmount,
          credit: 0,
          description: 'Vendor payment',
        },
        {
          accountId: accounts[ACCOUNT_NAMES.BANK].id,
          debit: 0,
          credit: vendorPaymentAmount,
          description: 'Bank payment',
        },
      ],
    });

    const vendorPayment = await tx.payment.create({
      data: {
        contactId: vendorContact.id,
        billId: vendorBill.id,
        method: 'BANK',
        amount: vendorPaymentAmount,
        date: new Date('2026-01-20'),
        journalEntryId: vendorPaymentJournal.id,
        reference: 'WIRE-001',
      },
    });

    await tx.journalEntry.update({
      where: { id: vendorPaymentJournal.id },
      data: { sourceId: vendorPayment.id },
    });

    await tx.vendorBill.update({
      where: { id: vendorBill.id },
      data: { status: 'PAID' },
    });

    const customerPaymentAmount = soTotal;
    const customerPaymentJournal = await createJournalEntryInTx(tx, {
      journalId: cashJournal.id,
      date: new Date('2026-01-25'),
      reference: `Invoice-${customerInvoice.id}`,
      sourceType: 'PAYMENT',
      createdById: accountant.id,
      items: [
        {
          accountId: accounts[ACCOUNT_NAMES.CASH].id,
          debit: customerPaymentAmount,
          credit: 0,
          description: 'Cash receipt',
        },
        {
          accountId: accounts[ACCOUNT_NAMES.DEBTORS].id,
          debit: 0,
          credit: customerPaymentAmount,
          description: 'Customer receipt',
        },
      ],
    });

    const customerPayment = await tx.payment.create({
      data: {
        contactId: customerContact.id,
        invoiceId: customerInvoice.id,
        method: 'CASH',
        amount: customerPaymentAmount,
        date: new Date('2026-01-25'),
        journalEntryId: customerPaymentJournal.id,
        reference: 'CASH-001',
      },
    });

    await tx.journalEntry.update({
      where: { id: customerPaymentJournal.id },
      data: { sourceId: customerPayment.id },
    });

    await tx.customerInvoice.update({
      where: { id: customerInvoice.id },
      data: { status: 'PAID' },
    });
  });

  console.log('Seed complete:');
  console.log(`  Users: admin@ufac.local / Admin123!, accountant@ufac.local / Account123!`);
  console.log(`  Contact users: vendor@urbanfurniture.com / Contact123!, customer@designstudio.com / Contact123!`);
  console.log(`  Accounts: ${accountDefs.length}, Journals: 4, Products: 2`);
  console.log(`  Purchase order total: ${poTotal}, Sales order total: ${soTotal}`);
  console.log('  Full purchase and sales cycles posted with payments');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

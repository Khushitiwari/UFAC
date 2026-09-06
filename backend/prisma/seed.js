import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createJournalEntryInTx } from '../src/services/ledger.service.js';
import { ACCOUNT_NAMES } from '../src/utils/accounts.js';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;
const BULK_COUNT = Number(process.env.BULK_COUNT || 300);
const BATCH_SIZE = 50;

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'CAPITAL'];
const PRODUCT_TYPES = ['GOODS', 'SERVICE', 'COMBO'];
const CONTACT_TYPES = ['CUSTOMER', 'VENDOR', 'BOTH'];
const JOURNAL_TYPES = ['SALES', 'PURCHASE', 'BANK', 'CASH'];
const PO_STATUSES = ['DRAFT', 'CONFIRMED', 'BILLED'];
const SO_STATUSES = ['DRAFT', 'CONFIRMED', 'INVOICED'];
const BILL_STATUSES = ['UNPAID', 'PARTIAL', 'PAID'];
const ANALYTIC_TYPES = ['INCOME', 'EXPENSE'];
const CATEGORIES = ['Seating', 'Office', 'Bedroom', 'Dining', 'Outdoor', 'Storage', 'Lighting'];

const pad = (n, width = 4) => String(n).padStart(width, '0');

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

async function clearAllData() {
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
  await prisma.user.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.product.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.analyticAccount.deleteMany();
}

async function upsertAccount(name, type) {
  return prisma.account.upsert({
    where: { name },
    update: { type, isActive: true },
    create: { name, type, isActive: true },
  });
}

async function seedUsers(adminPasswordHash, accountantPasswordHash, staffPasswordHash) {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@ufac.local',
      passwordHash: adminPasswordHash,
      name: 'Admin Owner',
      role: 'ADMIN',
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: 'accountant@ufac.local',
      passwordHash: accountantPasswordHash,
      name: 'Jane Accountant',
      role: 'ACCOUNTANT',
    },
  });

  const bulkUsers = Array.from({ length: BULK_COUNT - 4 }, (_, i) => ({
    email: `staff${pad(i + 1)}@bulk.ufac.local`,
    passwordHash: staffPasswordHash,
    name: `Staff User ${i + 1}`,
    role: i % 5 === 0 ? 'ADMIN' : 'ACCOUNTANT',
  }));

  await prisma.user.createMany({ data: bulkUsers, skipDuplicates: true });

  const allUsers = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  return { admin, accountant, allUsers };
}

async function seedContacts() {
  const demoContacts = [
    {
      name: 'Urban Furniture Supplies Co.',
      email: 'vendor@urbanfurniture.com',
      phone: '+1-555-0100',
      type: 'VENDOR',
      address: '100 Warehouse Blvd, Cityville',
    },
    {
      name: 'Design Studio LLC',
      email: 'customer@designstudio.com',
      phone: '+1-555-0200',
      type: 'CUSTOMER',
      address: '200 Creative Ave, Townsville',
    },
  ];

  const bulkContacts = Array.from({ length: BULK_COUNT - demoContacts.length }, (_, i) => ({
    name: `Bulk Contact ${pad(i + 1)}`,
    email: `contact${pad(i + 1)}@bulk.ufac.local`,
    phone: `+1-555-${pad(i + 1, 5)}`,
    type: CONTACT_TYPES[i % CONTACT_TYPES.length],
    address: `${100 + i} Commerce Street, Bulk City`,
    taxId: i % 3 === 0 ? `TAX-${pad(i + 1)}` : null,
  }));

  await prisma.contact.createMany({ data: [...demoContacts, ...bulkContacts] });

  const contacts = await prisma.contact.findMany({ orderBy: { email: 'asc' } });
  const vendorContact = contacts.find((c) => c.email === 'vendor@urbanfurniture.com');
  const customerContact = contacts.find((c) => c.email === 'customer@designstudio.com');

  const contactPassword = await bcrypt.hash('Contact123!', BCRYPT_ROUNDS);

  await prisma.user.create({
    data: {
      email: 'vendor@urbanfurniture.com',
      passwordHash: contactPassword,
      name: 'Vendor Portal User',
      role: 'CONTACT',
      contactId: vendorContact.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'customer@designstudio.com',
      passwordHash: contactPassword,
      name: 'Customer Portal User',
      role: 'CONTACT',
      contactId: customerContact.id,
    },
  });

  return contacts;
}

async function seedProducts() {
  const demoProducts = [
    {
      id: 'seed-product-sofa',
      name: 'Modern Sectional Sofa',
      type: 'GOODS',
      salesPrice: 1299.99,
      cost: 650,
      category: 'Seating',
      description: '3-seater grey fabric sectional',
    },
    {
      id: 'seed-product-desk',
      name: 'Executive Oak Desk',
      type: 'GOODS',
      salesPrice: 899,
      cost: 420,
      category: 'Office',
      description: 'Solid oak executive desk',
    },
  ];

  await prisma.product.createMany({ data: demoProducts });

  const bulkProducts = Array.from({ length: BULK_COUNT - demoProducts.length }, (_, i) => ({
    name: `Bulk Product ${pad(i + 1)}`,
    type: PRODUCT_TYPES[i % PRODUCT_TYPES.length],
    salesPrice: 50 + (i % 50) * 25 + 0.99,
    cost: 20 + (i % 40) * 10,
    category: CATEGORIES[i % CATEGORIES.length],
    description: `Bulk seeded product #${i + 1}`,
  }));

  await prisma.product.createMany({ data: bulkProducts });
  return prisma.product.findMany();
}

async function seedAccounts() {
  const coreDefs = [
    [ACCOUNT_NAMES.CASH, 'ASSET'],
    [ACCOUNT_NAMES.BANK, 'ASSET'],
    [ACCOUNT_NAMES.DEBTORS, 'ASSET'],
    [ACCOUNT_NAMES.CREDITORS, 'LIABILITY'],
    ['Capital', 'CAPITAL'],
    [ACCOUNT_NAMES.SALE_INCOME, 'INCOME'],
    [ACCOUNT_NAMES.PURCHASE_EXPENSE, 'EXPENSE'],
  ];

  const accounts = {};
  for (const [name, type] of coreDefs) {
    accounts[name] = await upsertAccount(name, type);
  }

  const bulkAccounts = Array.from({ length: BULK_COUNT - coreDefs.length }, (_, i) => ({
    name: `Bulk Account ${pad(i + 1)}`,
    type: ACCOUNT_TYPES[i % ACCOUNT_TYPES.length],
    isActive: true,
  }));

  await prisma.account.createMany({ data: bulkAccounts, skipDuplicates: true });
  const allAccounts = await prisma.account.findMany();
  return { accounts, allAccounts };
}

async function seedJournals(accounts) {
  const coreJournals = [
    { id: 'seed-purchase-journal', name: 'Purchase Journal', type: 'PURCHASE', defaultAccountId: accounts[ACCOUNT_NAMES.PURCHASE_EXPENSE].id },
    { id: 'seed-sales-journal', name: 'Sales Journal', type: 'SALES', defaultAccountId: accounts[ACCOUNT_NAMES.SALE_INCOME].id },
    { id: 'seed-bank-journal', name: 'Bank Journal', type: 'BANK', defaultAccountId: accounts[ACCOUNT_NAMES.BANK].id },
    { id: 'seed-cash-journal', name: 'Cash Journal', type: 'CASH', defaultAccountId: accounts[ACCOUNT_NAMES.CASH].id },
  ];

  await prisma.journal.createMany({ data: coreJournals });

  const bulkJournals = Array.from({ length: BULK_COUNT - coreJournals.length }, (_, i) => ({
    name: `Bulk Journal ${pad(i + 1)}`,
    type: JOURNAL_TYPES[i % JOURNAL_TYPES.length],
    defaultAccountId: i % 3 === 0 ? accounts[ACCOUNT_NAMES.CASH].id : null,
  }));

  await prisma.journal.createMany({ data: bulkJournals });
  return prisma.journal.findMany();
}

async function seedAnalyticAccounts() {
  await prisma.analyticAccount.createMany({
    data: [
      { name: 'Sales Department', type: 'INCOME' },
      { name: 'Operations', type: 'EXPENSE' },
    ],
  });

  const bulk = Array.from({ length: BULK_COUNT - 2 }, (_, i) => ({
    name: `Bulk Analytic ${pad(i + 1)}`,
    type: ANALYTIC_TYPES[i % ANALYTIC_TYPES.length],
  }));

  await prisma.analyticAccount.createMany({ data: bulk });
  return prisma.analyticAccount.findMany();
}

async function seedBudgets(users, analytics) {
  const staffUsers = users.filter((u) => u.role !== 'CONTACT');
  const data = Array.from({ length: BULK_COUNT }, (_, i) => {
    const month = (i % 12) + 1;
    const year = 2025 + Math.floor(i / 12);
    return {
      name: `Budget ${pad(i + 1)}`,
      periodStart: new Date(`${year}-${pad(month, 2)}-01`),
      periodEnd: new Date(`${year}-${pad(month, 2)}-28`),
      plannedAmount: 5000 + (i % 20) * 2500,
      analyticAccountId: analytics[i % analytics.length].id,
      responsiblePersonId: staffUsers[i % staffUsers.length].id,
    };
  });

  await prisma.budget.createMany({ data });
}

async function seedPurchaseOrders(contacts, products) {
  const vendors = contacts.filter((c) => c.type === 'VENDOR' || c.type === 'BOTH');
  for (let batch = 0; batch < BULK_COUNT; batch += BATCH_SIZE) {
    const chunk = Math.min(BATCH_SIZE, BULK_COUNT - batch);
    await Promise.all(
      Array.from({ length: chunk }, (_, j) => {
        const i = batch + j;
        const contact = vendors[i % vendors.length];
        const product = products[i % products.length];
        const qty = 1 + (i % 10);
        const price = Number(product.cost);
        return prisma.purchaseOrder.create({
          data: {
            contactId: contact.id,
            date: daysAgo(i % 365),
            status: PO_STATUSES[i % PO_STATUSES.length],
            notes: `Bulk PO #${i + 1}`,
            lines: {
              create: [{ productId: product.id, quantity: qty, unitPrice: price }],
            },
          },
        });
      }),
    );
  }
  return prisma.purchaseOrder.findMany({ include: { lines: true } });
}

async function seedSalesOrders(contacts, products) {
  const customers = contacts.filter((c) => c.type === 'CUSTOMER' || c.type === 'BOTH');
  for (let batch = 0; batch < BULK_COUNT; batch += BATCH_SIZE) {
    const chunk = Math.min(BATCH_SIZE, BULK_COUNT - batch);
    await Promise.all(
      Array.from({ length: chunk }, (_, j) => {
        const i = batch + j;
        const contact = customers[i % customers.length];
        const product = products[i % products.length];
        const qty = 1 + (i % 5);
        const price = Number(product.salesPrice);
        const tax = Math.round(price * qty * 0.08 * 100) / 100;
        return prisma.salesOrder.create({
          data: {
            contactId: contact.id,
            date: daysAgo(i % 300),
            status: SO_STATUSES[i % SO_STATUSES.length],
            notes: `Bulk SO #${i + 1}`,
            lines: {
              create: [{ productId: product.id, quantity: qty, unitPrice: price, tax }],
            },
          },
        });
      }),
    );
  }
  return prisma.salesOrder.findMany({ include: { lines: true } });
}

async function seedVendorBills(purchaseOrders, contacts, accounts, journals, adminId, analytics) {
  const purchaseJournal = journals.find((j) => j.id === 'seed-purchase-journal') || journals[0];
  const expenseAccount = accounts[ACCOUNT_NAMES.PURCHASE_EXPENSE];
  const creditorsAccount = accounts[ACCOUNT_NAMES.CREDITORS];

  for (let batch = 0; batch < BULK_COUNT; batch += BATCH_SIZE) {
    const chunk = Math.min(BATCH_SIZE, BULK_COUNT - batch);
    await Promise.all(
      Array.from({ length: chunk }, async (_, j) => {
        const i = batch + j;
        const po = purchaseOrders[i % purchaseOrders.length];
        const total = po.lines.reduce(
          (sum, line) => sum + Number(line.quantity) * Number(line.unitPrice),
          0,
        );

        await prisma.$transaction(async (tx) => {
          const entry = await createJournalEntryInTx(tx, {
            journalId: purchaseJournal.id,
            date: daysAgo(i % 180),
            reference: `BULK-VB-${pad(i + 1)}`,
            sourceType: 'VENDOR_BILL',
            createdById: adminId,
            items: [
              {
                accountId: expenseAccount.id,
                analyticAccountId: analytics[i % analytics.length].id,
                debit: total,
                credit: 0,
                description: 'Purchase expense',
              },
              {
                accountId: creditorsAccount.id,
                debit: 0,
                credit: total,
                description: 'Creditors',
              },
            ],
          });

          const bill = await tx.vendorBill.create({
            data: {
              purchaseOrderId: i % 2 === 0 ? po.id : null,
              contactId: po.contactId,
              invoiceDate: daysAgo(i % 180),
              dueDate: daysAgo(Math.max(0, (i % 180) - 30)),
              status: BILL_STATUSES[i % BILL_STATUSES.length],
              totalAmount: total,
              journalEntryId: entry.id,
            },
          });

          await tx.journalEntry.update({
            where: { id: entry.id },
            data: { sourceId: bill.id },
          });
        });
      }),
    );
  }
}

async function seedCustomerInvoices(salesOrders, accounts, journals, adminId, analytics) {
  const salesJournal = journals.find((j) => j.id === 'seed-sales-journal') || journals[1];
  const debtorsAccount = accounts[ACCOUNT_NAMES.DEBTORS];
  const incomeAccount = accounts[ACCOUNT_NAMES.SALE_INCOME];

  for (let batch = 0; batch < BULK_COUNT; batch += BATCH_SIZE) {
    const chunk = Math.min(BATCH_SIZE, BULK_COUNT - batch);
    await Promise.all(
      Array.from({ length: chunk }, async (_, j) => {
        const i = batch + j;
        const so = salesOrders[i % salesOrders.length];
        const total = so.lines.reduce(
          (sum, line) =>
            sum + Number(line.quantity) * Number(line.unitPrice) + Number(line.tax),
          0,
        );

        await prisma.$transaction(async (tx) => {
          const entry = await createJournalEntryInTx(tx, {
            journalId: salesJournal.id,
            date: daysAgo(i % 150),
            reference: `BULK-CI-${pad(i + 1)}`,
            sourceType: 'CUSTOMER_INVOICE',
            createdById: adminId,
            items: [
              {
                accountId: debtorsAccount.id,
                debit: total,
                credit: 0,
                description: 'Debtors',
              },
              {
                accountId: incomeAccount.id,
                analyticAccountId: analytics[i % analytics.length].id,
                debit: 0,
                credit: total,
                description: 'Sale income',
              },
            ],
          });

          const invoice = await tx.customerInvoice.create({
            data: {
              salesOrderId: i % 2 === 0 ? so.id : null,
              contactId: so.contactId,
              invoiceDate: daysAgo(i % 150),
              dueDate: daysAgo(Math.max(0, (i % 150) - 30)),
              status: BILL_STATUSES[i % BILL_STATUSES.length],
              totalAmount: total,
              journalEntryId: entry.id,
            },
          });

          await tx.journalEntry.update({
            where: { id: entry.id },
            data: { sourceId: invoice.id },
          });
        });
      }),
    );
  }
}

async function seedPayments(vendorBills, customerInvoices, accounts, journals, accountantId) {
  const bankJournal = journals.find((j) => j.id === 'seed-bank-journal') || journals[2];
  const cashJournal = journals.find((j) => j.id === 'seed-cash-journal') || journals[3];
  const half = Math.floor(BULK_COUNT / 2);

  for (let batch = 0; batch < half; batch += BATCH_SIZE) {
    const chunk = Math.min(BATCH_SIZE, half - batch);
    await Promise.all(
      Array.from({ length: chunk }, async (_, j) => {
        const i = batch + j;
        const bill = vendorBills[i % vendorBills.length];
        const amount = Number(bill.totalAmount);

        await prisma.$transaction(async (tx) => {
          const entry = await createJournalEntryInTx(tx, {
            journalId: bankJournal.id,
            date: daysAgo(i % 90),
            reference: `BULK-PAY-B-${pad(i + 1)}`,
            sourceType: 'PAYMENT',
            createdById: accountantId,
            items: [
              { accountId: accounts[ACCOUNT_NAMES.CREDITORS].id, debit: amount, credit: 0, description: 'Vendor payment' },
              { accountId: accounts[ACCOUNT_NAMES.BANK].id, debit: 0, credit: amount, description: 'Bank' },
            ],
          });

          const payment = await tx.payment.create({
            data: {
              contactId: bill.contactId,
              billId: bill.id,
              method: 'BANK',
              amount,
              date: daysAgo(i % 90),
              journalEntryId: entry.id,
              reference: `WIRE-${pad(i + 1)}`,
            },
          });

          await tx.journalEntry.update({
            where: { id: entry.id },
            data: { sourceId: payment.id },
          });
        });
      }),
    );
  }

  for (let batch = 0; batch < BULK_COUNT - half; batch += BATCH_SIZE) {
    const chunk = Math.min(BATCH_SIZE, BULK_COUNT - half - batch);
    await Promise.all(
      Array.from({ length: chunk }, async (_, j) => {
        const i = batch + j;
        const invoice = customerInvoices[i % customerInvoices.length];
        const amount = Number(invoice.totalAmount);

        await prisma.$transaction(async (tx) => {
          const entry = await createJournalEntryInTx(tx, {
            journalId: cashJournal.id,
            date: daysAgo(i % 60),
            reference: `BULK-PAY-I-${pad(i + 1)}`,
            sourceType: 'PAYMENT',
            createdById: accountantId,
            items: [
              { accountId: accounts[ACCOUNT_NAMES.CASH].id, debit: amount, credit: 0, description: 'Cash receipt' },
              { accountId: accounts[ACCOUNT_NAMES.DEBTORS].id, debit: 0, credit: amount, description: 'Debtors' },
            ],
          });

          const payment = await tx.payment.create({
            data: {
              contactId: invoice.contactId,
              invoiceId: invoice.id,
              method: 'CASH',
              amount,
              date: daysAgo(i % 60),
              journalEntryId: entry.id,
              reference: `CASH-${pad(i + 1)}`,
            },
          });

          await tx.journalEntry.update({
            where: { id: entry.id },
            data: { sourceId: payment.id },
          });
        });
      }),
    );
  }
}

async function seedManualJournalEntries(accounts, journals, users, analytics) {
  const cashAccount = accounts[ACCOUNT_NAMES.CASH];
  const bankAccount = accounts[ACCOUNT_NAMES.BANK];
  const staffUsers = users.filter((u) => u.role !== 'CONTACT');

  for (let batch = 0; batch < BULK_COUNT; batch += BATCH_SIZE) {
    const chunk = Math.min(BATCH_SIZE, BULK_COUNT - batch);
    await Promise.all(
      Array.from({ length: chunk }, async (_, j) => {
        const i = batch + j;
        const amount = 100 + (i % 50) * 10;
        const journal = journals[i % journals.length];
        const user = staffUsers[i % staffUsers.length];

        await createJournalEntryInTx(prisma, {
          journalId: journal.id,
          date: daysAgo(i % 200),
          reference: `MANUAL-${pad(i + 1)}`,
          sourceType: 'MANUAL',
          createdById: user.id,
          items: [
            {
              accountId: cashAccount.id,
              analyticAccountId: i % 2 === 0 ? analytics[i % analytics.length].id : null,
              debit: amount,
              credit: 0,
              description: 'Manual debit',
            },
            {
              accountId: bankAccount.id,
              debit: 0,
              credit: amount,
              description: 'Manual credit',
            },
          ],
        });
      }),
    );
  }
}

async function printCounts() {
  const counts = {
    User: await prisma.user.count(),
    Contact: await prisma.contact.count(),
    Product: await prisma.product.count(),
    Account: await prisma.account.count(),
    Journal: await prisma.journal.count(),
    JournalEntry: await prisma.journalEntry.count(),
    JournalItem: await prisma.journalItem.count(),
    PurchaseOrder: await prisma.purchaseOrder.count(),
    PurchaseOrderLine: await prisma.purchaseOrderLine.count(),
    SalesOrder: await prisma.salesOrder.count(),
    SalesOrderLine: await prisma.salesOrderLine.count(),
    VendorBill: await prisma.vendorBill.count(),
    CustomerInvoice: await prisma.customerInvoice.count(),
    Payment: await prisma.payment.count(),
    AnalyticAccount: await prisma.analyticAccount.count(),
    Budget: await prisma.budget.count(),
  };

  console.log('\nRecord counts:');
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table.padEnd(20)} ${count}`);
  }
}

async function main() {
  console.log(`Seeding UFAC with ${BULK_COUNT} records per table...`);
  const start = Date.now();

  await clearAllData();

  const adminPasswordHash = await bcrypt.hash('Admin123!', BCRYPT_ROUNDS);
  const accountantPasswordHash = await bcrypt.hash('Account123!', BCRYPT_ROUNDS);
  const staffPasswordHash = await bcrypt.hash('Admin123!', BCRYPT_ROUNDS);
  const { admin, accountant, allUsers } = await seedUsers(
    adminPasswordHash,
    accountantPasswordHash,
    staffPasswordHash,
  );
  console.log('  Users seeded');

  const contacts = await seedContacts();
  console.log('  Contacts seeded');

  const products = await seedProducts();
  console.log('  Products seeded');

  const { accounts, allAccounts } = await seedAccounts();
  console.log('  Accounts seeded');

  const journals = await seedJournals(accounts);
  console.log('  Journals seeded');

  const analytics = await seedAnalyticAccounts();
  console.log('  Analytic accounts seeded');

  await seedBudgets(allUsers, analytics);
  console.log('  Budgets seeded');

  const purchaseOrders = await seedPurchaseOrders(contacts, products);
  console.log('  Purchase orders seeded');

  const salesOrders = await seedSalesOrders(contacts, products);
  console.log('  Sales orders seeded');

  await seedVendorBills(purchaseOrders, contacts, accounts, journals, admin.id, analytics);
  console.log('  Vendor bills seeded');

  await seedCustomerInvoices(salesOrders, accounts, journals, admin.id, analytics);
  console.log('  Customer invoices seeded');

  const vendorBills = await prisma.vendorBill.findMany();
  const customerInvoices = await prisma.customerInvoice.findMany();
  await seedPayments(vendorBills, customerInvoices, accounts, journals, accountant.id);
  console.log('  Payments seeded');

  await seedManualJournalEntries(accounts, journals, allUsers, analytics);
  console.log('  Manual journal entries seeded');

  await printCounts();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nSeed complete in ${elapsed}s`);
  console.log('Login: admin@ufac.local / Admin123!');
  console.log('       accountant@ufac.local / Account123!');
  console.log('       vendor@urbanfurniture.com / Contact123!');
  console.log('       customer@designstudio.com / Contact123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

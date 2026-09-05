import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('Seeding UFAC database...');

  const adminPassword = await bcrypt.hash('Admin123!', BCRYPT_ROUNDS);
  const accountantPassword = await bcrypt.hash('Account123!', BCRYPT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ufac.local' },
    update: {},
    create: {
      email: 'admin@ufac.local',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'Owner',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'accountant@ufac.local' },
    update: {},
    create: {
      email: 'accountant@ufac.local',
      passwordHash: accountantPassword,
      firstName: 'Jane',
      lastName: 'Accountant',
      role: 'ACCOUNTANT',
    },
  });

  const contacts = await Promise.all([
    prisma.contact.upsert({
      where: { email: 'vendor@urbanfurniture.com' },
      update: {},
      create: {
        name: 'Urban Furniture Supplies Co.',
        email: 'vendor@urbanfurniture.com',
        phone: '+1-555-0100',
        type: 'VENDOR',
        address: '100 Warehouse Blvd, Cityville',
      },
    }),
    prisma.contact.upsert({
      where: { email: 'customer@designstudio.com' },
      update: {},
      create: {
        name: 'Design Studio LLC',
        email: 'customer@designstudio.com',
        phone: '+1-555-0200',
        type: 'CUSTOMER',
        address: '200 Creative Ave, Townsville',
      },
    }),
    prisma.contact.upsert({
      where: { email: 'partner@retailhub.com' },
      update: {},
      create: {
        name: 'Retail Hub Partners',
        email: 'partner@retailhub.com',
        phone: '+1-555-0300',
        type: 'BOTH',
        address: '300 Commerce St, Metropolis',
      },
    }),
  ]);

  const accountsData = [
    { code: '1000', name: 'Cash', type: 'ASSET' },
    { code: '1100', name: 'Accounts Receivable', type: 'ASSET' },
    { code: '1200', name: 'Inventory', type: 'ASSET' },
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
    { code: '2100', name: 'Sales Tax Payable', type: 'LIABILITY' },
    { code: '3000', name: "Owner's Equity", type: 'EQUITY' },
    { code: '4000', name: 'Sales Revenue', type: 'REVENUE' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE' },
    { code: '5100', name: 'Operating Expenses', type: 'EXPENSE' },
  ];

  const accounts = {};
  for (const acc of accountsData) {
    const created = await prisma.account.upsert({
      where: { code: acc.code },
      update: {},
      create: acc,
    });
    accounts[acc.code] = created;
  }

  const journalsData = [
    { code: 'SAL', name: 'Sales Journal', type: 'SALE', defaultAccountId: accounts['4000'].id },
    { code: 'PUR', name: 'Purchase Journal', type: 'PURCHASE', defaultAccountId: accounts['5000'].id },
    { code: 'BNK', name: 'Bank Journal', type: 'BANK', defaultAccountId: accounts['1000'].id },
    { code: 'CSH', name: 'Cash Journal', type: 'CASH', defaultAccountId: accounts['1000'].id },
    { code: 'GEN', name: 'General Journal', type: 'GENERAL', defaultAccountId: null },
  ];

  for (const journal of journalsData) {
    await prisma.journal.upsert({
      where: { code: journal.code },
      update: {},
      create: journal,
    });
  }

  await prisma.product.upsert({
    where: { sku: 'SOFA-001' },
    update: {},
    create: {
      sku: 'SOFA-001',
      name: 'Modern Sectional Sofa',
      description: '3-seater grey fabric sectional',
      unitPrice: 1299.99,
      costPrice: 650.0,
      incomeAccountId: accounts['4000'].id,
      expenseAccountId: accounts['5000'].id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'DESK-001' },
    update: {},
    create: {
      sku: 'DESK-001',
      name: 'Executive Oak Desk',
      description: 'Solid oak executive desk with drawers',
      unitPrice: 899.0,
      costPrice: 420.0,
      incomeAccountId: accounts['4000'].id,
      expenseAccountId: accounts['5000'].id,
    },
  });

  await prisma.analyticAccount.upsert({
    where: { code: 'DEPT-SALES' },
    update: {},
    create: {
      code: 'DEPT-SALES',
      name: 'Sales Department',
      accountId: accounts['4000'].id,
    },
  });

  console.log(`Seeded admin user: ${admin.email}`);
  console.log(`Seeded ${contacts.length} contacts, ${accountsData.length} accounts, ${journalsData.length} journals, 2 products`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

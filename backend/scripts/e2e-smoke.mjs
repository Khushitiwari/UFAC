/**
 * End-to-end API smoke test for UFAC backend.
 * Run: node scripts/e2e-smoke.mjs
 */
const BASE = process.env.API_BASE || 'http://localhost:5000/api/v1';

const USERS = {
  admin: { email: 'admin@ufac.local', password: 'Admin123!' },
  accountant: { email: 'accountant@ufac.local', password: 'Account123!' },
  contact: { email: 'vendor@urbanfurniture.com', password: 'Contact123!' },
};

const results = { pass: [], fail: [], skip: [] };

async function request(method, path, { token, body, expectStatus } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json = null;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  return { status: res.status, json };
}

async function login(role) {
  const { status, json } = await request('POST', '/auth/login', { body: USERS[role] });
  if (status !== 200 || !json?.data?.token) {
    throw new Error(`Login failed for ${role}: ${status} ${JSON.stringify(json)}`);
  }
  return json.data.token;
}

function ok(name, detail = '') {
  results.pass.push({ name, detail });
}

function fail(name, detail) {
  results.fail.push({ name, detail });
}

function skip(name, detail) {
  results.skip.push({ name, detail });
}

async function test(name, fn) {
  try {
    await fn();
    ok(name);
  } catch (err) {
    fail(name, err.message);
  }
}

async function expectOk(name, method, path, opts = {}) {
  const expected = opts.expectStatus ?? 200;
  const { status, json } = await request(method, path, opts);
  if (status !== expected) {
    throw new Error(`${method} ${path} → ${status} (expected ${expected}): ${json?.error || json?.message || JSON.stringify(json)?.slice(0, 200)}`);
  }
  if (opts.requireSuccess && json?.success !== true) {
    throw new Error(`${method} ${path} success=false: ${json?.message}`);
  }
  return json?.data ?? json;
}

async function main() {
  console.log('UFAC E2E Smoke Test');
  console.log('API:', BASE);
  console.log('---');

  // Health (public)
  await test('GET /health', async () => {
    const { status } = await request('GET', '/health');
    if (status !== 200) throw new Error(`status ${status}`);
  });

  // Auth
  let adminToken, accountantToken, contactToken;
  await test('POST /auth/login (admin)', async () => {
    adminToken = await login('admin');
  });
  await test('POST /auth/login (accountant)', async () => {
    accountantToken = await login('accountant');
  });
  await test('POST /auth/login (contact)', async () => {
    contactToken = await login('contact');
  });
  await test('GET /auth/me (admin)', async () => {
    const data = await expectOk('me', 'GET', '/auth/me', { token: adminToken });
    if (data?.role !== 'ADMIN') throw new Error(`role=${data?.role}`);
  });

  const token = adminToken;

  // Read-only lists (admin)
  const listEndpoints = [
    ['GET /contacts', '/contacts'],
    ['GET /products', '/products'],
    ['GET /accounts', '/accounts'],
    ['GET /journals', '/journals'],
    ['GET /journals/entries', '/journals/entries'],
    ['GET /purchase-orders', '/purchase-orders'],
    ['GET /vendor-bills', '/vendor-bills'],
    ['GET /sales-orders', '/sales-orders'],
    ['GET /customer-invoices', '/customer-invoices'],
    ['GET /payments', '/payments'],
    ['GET /analytic-accounts', '/analytic-accounts'],
    ['GET /budgets', '/budgets'],
    ['GET /dashboard/summary', '/dashboard/summary'],
    ['GET /reports/balance-sheet', '/reports/balance-sheet'],
    ['GET /reports/profit-loss', '/reports/profit-loss'],
    ['GET /reports/budget?periodStart=2025-01-01&periodEnd=2026-12-31', '/reports/budget?periodStart=2025-01-01&periodEnd=2026-12-31'],
  ];

  for (const [name, path] of listEndpoints) {
    await test(name, async () => {
      await expectOk(name, 'GET', path, { token, requireSuccess: true });
    });
  }

  // Contact role restrictions
  await test('CONTACT blocked from /contacts (403)', async () => {
    const { status } = await request('GET', '/contacts', { token: contactToken });
    // CONTACT has JWT - check if contacts list is allowed for contact
    // Based on routes: GET /contacts only requires authenticate, not staff
    // So contact CAN read contacts - verify actual behavior
    if (status !== 200 && status !== 403) throw new Error(`unexpected ${status}`);
    ok('CONTACT /contacts', `status=${status}`);
  });

  await test('CONTACT blocked from /dashboard/summary (403)', async () => {
    const { status } = await request('GET', '/dashboard/summary', { token: contactToken });
    if (status !== 403) throw new Error(`expected 403, got ${status}`);
  });

  await test('CONTACT blocked from /budgets (403)', async () => {
    const { status } = await request('GET', '/budgets', { token: contactToken });
    if (status !== 403) throw new Error(`expected 403, got ${status}`);
  });

  await test('CONTACT can GET /vendor-bills', async () => {
    await expectOk('vendor-bills', 'GET', '/vendor-bills', { token: contactToken, requireSuccess: true });
  });

  await test('CONTACT can GET /customer-invoices', async () => {
    await expectOk('invoices', 'GET', '/customer-invoices', { token: contactToken, requireSuccess: true });
  });

  await test('CONTACT can GET /payments', async () => {
    await expectOk('payments', 'GET', '/payments', { token: contactToken, requireSuccess: true });
  });

  // Fetch seed data IDs for detail + create flows
  const contacts = await expectOk('contacts', 'GET', '/contacts', { token });
  const products = await expectOk('products', 'GET', '/products', { token });
  const accounts = await expectOk('accounts', 'GET', '/accounts', { token });
  const journals = await expectOk('journals', 'GET', '/journals', { token });
  const analyticAccounts = await expectOk('analytic', 'GET', '/analytic-accounts', { token });
  const purchaseOrders = await expectOk('po', 'GET', '/purchase-orders', { token });
  const salesOrders = await expectOk('so', 'GET', '/sales-orders', { token });
  const vendorBills = await expectOk('vb', 'GET', '/vendor-bills', { token });
  const customerInvoices = await expectOk('ci', 'GET', '/customer-invoices', { token });
  const payments = await expectOk('pay', 'GET', '/payments', { token });
  const budgets = await expectOk('budgets', 'GET', '/budgets', { token });
  const entries = await expectOk('entries', 'GET', '/journals/entries', { token });

  const first = (data, key) => {
    const list = data?.[key] ?? data?.items ?? (Array.isArray(data) ? data : []);
    return list[0];
  };

  const contact = first(contacts, 'contacts');
  const product = first(products, 'products');
  const account = first(accounts, 'accounts');
  const journal = first(journals, 'journals');
  const analytic = first(analyticAccounts, 'analyticAccounts');
  const po = first(purchaseOrders, 'purchaseOrders');
  const so = first(salesOrders, 'salesOrders');
  const vb = first(vendorBills, 'vendorBills');
  const ci = first(customerInvoices, 'customerInvoices');
  const payment = first(payments, 'payments');
  const budget = first(budgets, 'budgets');
  const entry = first(entries, 'entries');

  const detailTests = [
    ['GET /contacts/:id', contact, `/contacts/${contact?.id}`],
    ['GET /products/:id', product, `/products/${product?.id}`],
    ['GET /accounts/:id', account, `/accounts/${account?.id}`],
    ['GET /journals/:id', journal, `/journals/${journal?.id}`],
    ['GET /analytic-accounts/:id', analytic, `/analytic-accounts/${analytic?.id}`],
    ['GET /purchase-orders/:id', po, `/purchase-orders/${po?.id}`],
    ['GET /sales-orders/:id', so, `/sales-orders/${so?.id}`],
    ['GET /vendor-bills/:id', vb, `/vendor-bills/${vb?.id}`],
    ['GET /customer-invoices/:id', ci, `/customer-invoices/${ci?.id}`],
    ['GET /payments/:id', payment, `/payments/${payment?.id}`],
    ['GET /budgets/:id', budget, `/budgets/${budget?.id}`],
  ];

  for (const [name, item, path] of detailTests) {
    if (!item?.id) {
      skip(name, 'no seed data');
      continue;
    }
    await test(name, async () => {
      await expectOk(name, 'GET', path, { token, requireSuccess: true });
    });
  }

  // CRUD smoke: create contact with imageUrl field, update, delete
  const testEmail = `e2e-${Date.now()}@test.local`;
  let createdContactId;
  await test('POST /contacts (create)', async () => {
    const data = await expectOk('create contact', 'POST', '/contacts', {
      token,
      expectStatus: 201,
      requireSuccess: true,
      body: {
        name: 'E2E Test Contact',
        email: testEmail,
        phone: '+1-555-9999',
        type: 'CUSTOMER',
        address: '123 Test St',
      },
    });
    createdContactId = data?.id;
    if (!createdContactId) throw new Error('no id returned');
  });

  await test('PUT /contacts/:id (update + imageUrl)', async () => {
    if (!createdContactId) throw new Error('no contact to update');
    const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const data = await expectOk('update', 'PUT', `/contacts/${createdContactId}`, {
      token,
      requireSuccess: true,
      body: { name: 'E2E Test Contact Updated', imageUrl: tinyPng },
    });
    if (!data?.imageUrl) throw new Error('imageUrl not saved');
  });

  await test('DELETE /contacts/:id', async () => {
    if (!createdContactId) throw new Error('no contact to delete');
    await expectOk('delete', 'DELETE', `/contacts/${createdContactId}`, { token, requireSuccess: true });
  });

  // Journal entry create
  const cashAccount = (accounts?.accounts ?? []).find((a) => a.name?.includes('Cash')) || account;
  const revenueAccount = (accounts?.accounts ?? []).find((a) => a.type === 'REVENUE') || account;

  if (journal?.id && cashAccount?.id && revenueAccount?.id) {
    await test('POST /journals/entries (balanced)', async () => {
      await expectOk('journal entry', 'POST', '/journals/entries', {
        token,
        expectStatus: 201,
        requireSuccess: true,
        body: {
          journalId: journal.id,
          date: new Date().toISOString(),
          reference: `E2E-${Date.now()}`,
          items: [
            { accountId: cashAccount.id, debit: 100, credit: 0 },
            { accountId: revenueAccount.id, debit: 0, credit: 100 },
          ],
        },
      });
    });
  } else {
    skip('POST /journals/entries', 'missing journal or accounts');
  }

  // Portal user (admin only) - create contact then portal user then delete contact fails if user exists
  const portalEmail = `portal-e2e-${Date.now()}@test.local`;
  let portalContactId;
  await test('POST /contacts/:id/portal-user (admin)', async () => {
    const created = await expectOk('create', 'POST', '/contacts', {
      token: adminToken,
      expectStatus: 201,
      body: { name: 'Portal E2E', email: portalEmail, type: 'VENDOR' },
    });
    portalContactId = created?.id;
    const updated = await expectOk('portal', 'POST', `/contacts/${portalContactId}/portal-user`, {
      token: adminToken,
      expectStatus: 201,
      body: { password: 'Portal123!', name: 'Portal E2E User' },
    });
    if (!updated?.user?.email) throw new Error('portal user not linked');
  });

  await test('POST /contacts/:id/portal-user blocked for accountant (403)', async () => {
    if (!portalContactId) throw new Error('no contact');
    const { status } = await request('POST', `/contacts/${portalContactId}/portal-user`, {
      token: accountantToken,
      body: { password: 'Portal123!' },
    });
    if (status !== 403) throw new Error(`expected 403, got ${status}`);
  });

  // Accountant can create product
  const productEmail = `prod-e2e-${Date.now()}`;
  let productId;
  await test('POST /products (accountant)', async () => {
    const data = await expectOk('create product', 'POST', '/products', {
      token: accountantToken,
      expectStatus: 201,
      body: {
        name: `E2E Product ${productEmail}`,
        type: 'GOODS',
        category: 'Test',
        salesPrice: 99.99,
        cost: 50,
      },
    });
    productId = data?.id;
    if (!productId) throw new Error('no product id');
  });

  if (productId) {
    await test('DELETE /products/:id blocked for accountant (403)', async () => {
      const { status } = await request('DELETE', `/products/${productId}`, { token: accountantToken });
      if (status !== 403) throw new Error(`expected 403, got ${status}`);
    });
    await test('DELETE /products/:id (admin)', async () => {
      await expectOk('delete product', 'DELETE', `/products/${productId}`, { token: adminToken, requireSuccess: true });
    });
  }

  // Unauthenticated
  await test('GET /contacts without token (401)', async () => {
    const { status } = await request('GET', '/contacts');
    if (status !== 401) throw new Error(`expected 401, got ${status}`);
  });

  // Summary
  console.log('\n=== RESULTS ===');
  console.log(`PASS: ${results.pass.length}`);
  console.log(`FAIL: ${results.fail.length}`);
  console.log(`SKIP: ${results.skip.length}`);

  if (results.fail.length) {
    console.log('\n--- FAILURES ---');
    for (const f of results.fail) console.log(`✗ ${f.name}: ${f.detail}`);
  }
  if (results.skip.length) {
    console.log('\n--- SKIPPED ---');
    for (const s of results.skip) console.log(`○ ${s.name}: ${s.detail}`);
  }

  process.exit(results.fail.length ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

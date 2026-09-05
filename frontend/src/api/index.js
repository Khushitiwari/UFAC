import axiosClient from './axiosClient.js';
import contactApi from './contact.js';
import productApi from './product.js';
import accountApi from './account.js';
import journalApi from './journal.js';
import journalEntryApi from './journalEntry.js';
import purchaseOrderApi from './purchaseOrder.js';
import vendorBillApi from './vendorBill.js';
import salesOrderApi from './salesOrder.js';
import customerInvoiceApi from './customerInvoice.js';
import paymentApi from './payment.js';
import analyticAccountApi from './analyticAccount.js';
import budgetApi from './budget.js';
import reportApi from './report.js';
import dashboardApiModule from './dashboard.js';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (payload) => axiosClient.post('/auth/register', payload),
  me: () => axiosClient.get('/auth/me'),
};

export const contactsApi = contactApi;
export const productsApi = productApi;
export const accountsApi = accountApi;
export const journalsApi = journalApi;
export const journalEntriesApi = journalEntryApi;
export const purchaseOrdersApi = purchaseOrderApi;
export const vendorBillsApi = vendorBillApi;
export const salesOrdersApi = salesOrderApi;
export const customerInvoicesApi = customerInvoiceApi;
export const paymentsApi = paymentApi;
export const analyticAccountsApi = analyticAccountApi;
export const budgetsApi = budgetApi;
export const reportsApi = reportApi;
export const dashboardApi = dashboardApiModule;

import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../components/common/Layout.jsx';
import PageSkeleton from '../components/common/PageSkeleton.jsx';
import { canViewReports } from '../utils/permissions.js';

const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
const SignupPage = lazy(() => import('../pages/SignupPage.jsx'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage.jsx'));

const ContactsListPage = lazy(() => import('../pages/contacts/ContactsListPage.jsx'));
const ContactDetailPage = lazy(() => import('../pages/contacts/ContactDetailPage.jsx'));

const ProductsListPage = lazy(() => import('../pages/products/ProductsListPage.jsx'));
const ProductDetailPage = lazy(() => import('../pages/products/ProductDetailPage.jsx'));

const AccountsListPage = lazy(() => import('../pages/accounts/AccountsListPage.jsx'));
const AccountDetailPage = lazy(() => import('../pages/accounts/AccountDetailPage.jsx'));

const JournalsListPage = lazy(() => import('../pages/journals/JournalsListPage.jsx'));
const JournalDetailPage = lazy(() => import('../pages/journals/JournalDetailPage.jsx'));
const JournalEntryPage = lazy(() => import('../pages/journals/JournalEntryPage.jsx'));
const JournalEntriesListPage = lazy(() => import('../pages/journals/JournalEntriesListPage.jsx'));

const PurchaseOrdersListPage = lazy(() => import('../pages/purchaseOrders/PurchaseOrdersListPage.jsx'));
const PurchaseOrderDetailPage = lazy(() => import('../pages/purchaseOrders/PurchaseOrderDetailPage.jsx'));

const VendorBillsListPage = lazy(() => import('../pages/vendorBills/VendorBillsListPage.jsx'));
const VendorBillDetailPage = lazy(() => import('../pages/vendorBills/VendorBillDetailPage.jsx'));

const SalesOrdersListPage = lazy(() => import('../pages/salesOrders/SalesOrdersListPage.jsx'));
const SalesOrderDetailPage = lazy(() => import('../pages/salesOrders/SalesOrderDetailPage.jsx'));

const CustomerInvoicesListPage = lazy(() => import('../pages/customerInvoices/CustomerInvoicesListPage.jsx'));
const CustomerInvoiceDetailPage = lazy(() => import('../pages/customerInvoices/CustomerInvoiceDetailPage.jsx'));

const PaymentsListPage = lazy(() => import('../pages/payments/PaymentsListPage.jsx'));
const PaymentDetailPage = lazy(() => import('../pages/payments/PaymentDetailPage.jsx'));

const AnalyticAccountsListPage = lazy(() => import('../pages/analyticAccounts/AnalyticAccountsListPage.jsx'));
const AnalyticAccountDetailPage = lazy(() => import('../pages/analyticAccounts/AnalyticAccountDetailPage.jsx'));

const BudgetsListPage = lazy(() => import('../pages/budgets/BudgetsListPage.jsx'));
const BudgetDetailPage = lazy(() => import('../pages/budgets/BudgetDetailPage.jsx'));

const ReportsIndexPage = lazy(() => import('../pages/reports/ReportsIndexPage.jsx'));
const BalanceSheetPage = lazy(() => import('../pages/reports/BalanceSheetPage.jsx'));
const ProfitAndLossPage = lazy(() => import('../pages/reports/ProfitAndLossPage.jsx'));
const BudgetReportPage = lazy(() => import('../pages/reports/BudgetReportPage.jsx'));

const AuthSuspense = ({ children }) => (
  <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const StaffRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'CONTACT') return <Navigate to="/vendor-bills" replace />;
  return children;
};

const ReportsRoute = ({ children }) => {
  const { user } = useAuth();
  if (!canViewReports(user)) return <Navigate to="/vendor-bills" replace />;
  return children;
};

const ContactHomeRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'CONTACT') return <Navigate to="/vendor-bills" replace />;
  return <DashboardPage />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<AuthSuspense><LoginPage /></AuthSuspense>} />
    <Route path="/signup" element={<AuthSuspense><SignupPage /></AuthSuspense>} />
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route index element={<ContactHomeRedirect />} />
      <Route path="vendor-bills" element={<VendorBillsListPage />} />
      <Route path="vendor-bills/:id" element={<VendorBillDetailPage />} />
      <Route path="customer-invoices" element={<CustomerInvoicesListPage />} />
      <Route path="customer-invoices/:id" element={<CustomerInvoiceDetailPage />} />
      <Route path="payments" element={<PaymentsListPage />} />
      <Route path="payments/:id" element={<PaymentDetailPage />} />

      <Route path="contacts" element={<StaffRoute><ContactsListPage /></StaffRoute>} />
      <Route path="contacts/:id" element={<StaffRoute><ContactDetailPage /></StaffRoute>} />
      <Route path="products" element={<StaffRoute><ProductsListPage /></StaffRoute>} />
      <Route path="products/:id" element={<StaffRoute><ProductDetailPage /></StaffRoute>} />
      <Route path="accounts" element={<StaffRoute><AccountsListPage /></StaffRoute>} />
      <Route path="accounts/:id" element={<StaffRoute><AccountDetailPage /></StaffRoute>} />
      <Route path="journals" element={<StaffRoute><JournalsListPage /></StaffRoute>} />
      <Route path="journals/entries" element={<StaffRoute><JournalEntriesListPage /></StaffRoute>} />
      <Route path="journals/entry/new" element={<StaffRoute><JournalEntryPage /></StaffRoute>} />
      <Route path="journals/:id" element={<StaffRoute><JournalDetailPage /></StaffRoute>} />
      <Route path="purchase-orders" element={<StaffRoute><PurchaseOrdersListPage /></StaffRoute>} />
      <Route path="purchase-orders/:id" element={<StaffRoute><PurchaseOrderDetailPage /></StaffRoute>} />
      <Route path="sales-orders" element={<StaffRoute><SalesOrdersListPage /></StaffRoute>} />
      <Route path="sales-orders/:id" element={<StaffRoute><SalesOrderDetailPage /></StaffRoute>} />
      <Route path="analytic-accounts" element={<StaffRoute><AnalyticAccountsListPage /></StaffRoute>} />
      <Route path="analytic-accounts/:id" element={<StaffRoute><AnalyticAccountDetailPage /></StaffRoute>} />
      <Route path="budgets" element={<StaffRoute><BudgetsListPage /></StaffRoute>} />
      <Route path="budgets/:id" element={<StaffRoute><BudgetDetailPage /></StaffRoute>} />
      <Route path="reports" element={<ReportsRoute><ReportsIndexPage /></ReportsRoute>} />
      <Route path="reports/balance-sheet" element={<ReportsRoute><BalanceSheetPage /></ReportsRoute>} />
      <Route path="reports/profit-loss" element={<ReportsRoute><ProfitAndLossPage /></ReportsRoute>} />
      <Route path="reports/budget" element={<ReportsRoute><BudgetReportPage /></ReportsRoute>} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;

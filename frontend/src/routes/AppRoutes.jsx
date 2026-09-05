import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../components/common/Layout.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const ContactHomeRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'CONTACT') return <Navigate to="/vendor-bills" replace />;
  return <DashboardPage />;
};

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner label="Loading page..." />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ContactHomeRedirect />} />
        <Route path="contacts" element={<ContactsListPage />} />
        <Route path="contacts/:id" element={<ContactDetailPage />} />
        <Route path="products" element={<ProductsListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="accounts" element={<AccountsListPage />} />
        <Route path="accounts/:id" element={<AccountDetailPage />} />
        <Route path="journals" element={<JournalsListPage />} />
        <Route path="journals/entry/new" element={<JournalEntryPage />} />
        <Route path="journals/:id" element={<JournalDetailPage />} />
        <Route path="purchase-orders" element={<PurchaseOrdersListPage />} />
        <Route path="purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
        <Route path="vendor-bills" element={<VendorBillsListPage />} />
        <Route path="vendor-bills/:id" element={<VendorBillDetailPage />} />
        <Route path="sales-orders" element={<SalesOrdersListPage />} />
        <Route path="sales-orders/:id" element={<SalesOrderDetailPage />} />
        <Route path="customer-invoices" element={<CustomerInvoicesListPage />} />
        <Route path="customer-invoices/:id" element={<CustomerInvoiceDetailPage />} />
        <Route path="payments" element={<PaymentsListPage />} />
        <Route path="payments/:id" element={<PaymentDetailPage />} />
        <Route path="analytic-accounts" element={<AnalyticAccountsListPage />} />
        <Route path="analytic-accounts/:id" element={<AnalyticAccountDetailPage />} />
        <Route path="budgets" element={<BudgetsListPage />} />
        <Route path="budgets/:id" element={<BudgetDetailPage />} />
        <Route path="reports" element={<ReportsIndexPage />} />
        <Route path="reports/balance-sheet" element={<BalanceSheetPage />} />
        <Route path="reports/profit-loss" element={<ProfitAndLossPage />} />
        <Route path="reports/budget" element={<BudgetReportPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;

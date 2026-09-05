import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../components/common/Layout.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const LoginPage = lazy(() => import('../pages/LoginPage.jsx'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage.jsx'));
const ContactsPage = lazy(() => import('../pages/contacts/ContactsPage.jsx'));
const ProductsPage = lazy(() => import('../pages/products/ProductsPage.jsx'));
const ChartOfAccountsPage = lazy(() => import('../pages/chartOfAccounts/ChartOfAccountsPage.jsx'));
const JournalsPage = lazy(() => import('../pages/journals/JournalsPage.jsx'));
const PurchasesPage = lazy(() => import('../pages/purchases/PurchasesPage.jsx'));
const SalesPage = lazy(() => import('../pages/sales/SalesPage.jsx'));
const PaymentsPage = lazy(() => import('../pages/payments/PaymentsPage.jsx'));
const BudgetPage = lazy(() => import('../pages/budget/BudgetPage.jsx'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage.jsx'));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
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
        <Route index element={<DashboardPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="chart-of-accounts" element={<ChartOfAccountsPage />} />
        <Route path="journals" element={<JournalsPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;

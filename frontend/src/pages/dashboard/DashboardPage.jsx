import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dashboardApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import PageLoadTransition from '../../components/common/PageLoadTransition.jsx';
import Button from '../../components/common/Button.jsx';
import { staggerContainer, staggerItem, summaryCardVariant } from '../../utils/motion.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const DASHBOARD_TABS = [
  { id: 'sales', label: 'Sales', href: '#dashboard-sales' },
  { id: 'purchase', label: 'Purchase', href: '#dashboard-purchase' },
  { id: 'account', label: 'Account', href: '#dashboard-account' },
  { id: 'report', label: 'Report', href: '#dashboard-report' },
];

const statusClass = (status) => `status-pill status-${status.toLowerCase()}`;

const StatSkeleton = () => (
  <div className="dashboard-stat-pill dashboard-stat-pill-skeleton">
    <div className="skeleton-bar skeleton-bar-sm" style={{ width: '50%' }} />
    <div className="skeleton-bar" style={{ width: '30%', marginTop: '0.5rem', height: '1.5rem' }} />
  </div>
);

const SectionSkeleton = () => (
  <div className="dashboard-section card">
    <div className="dashboard-section-header">
      <div className="skeleton-bar" style={{ width: '120px', height: '1.25rem' }} />
      <div className="skeleton-bar skeleton-bar-sm" style={{ width: '72px' }} />
    </div>
    <div className="dashboard-stat-row">
      <StatSkeleton />
      <StatSkeleton />
      <StatSkeleton />
    </div>
  </div>
);

const MetricPill = ({ label, value, hint }) => (
  <div className="dashboard-stat-pill">
    <span className="dashboard-stat-label">{label}</span>
    <strong className="dashboard-stat-value">{value}</strong>
    {hint && <span className="dashboard-stat-hint">{hint}</span>}
  </div>
);

const DashboardSection = ({ id, title, action, children }) => (
  <motion.section id={id} className="dashboard-section card" variants={staggerItem}>
    <div className="dashboard-section-header">
      <h2>{title}</h2>
      {action}
    </div>
    {children}
  </motion.section>
);

const RecentTable = ({ rows, type, emptyLabel }) => (
  <div className="dashboard-recent-table-wrap">
    {rows?.length ? (
      <table className="dashboard-recent-table">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <Link to={`/${type}/${row.id}`} className="dashboard-recent-link">
                  {row.contactName}
                </Link>
              </td>
              <td>{formatDate(row.date)}</td>
              <td><span className={statusClass(row.status)}>{row.status}</span></td>
              <td>{formatCurrency(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="table-empty">{emptyLabel}</p>
    )}
  </div>
);

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notAvailable, setNotAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await dashboardApi.summary();
        setSummary(data.data.summary ?? data.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotAvailable(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (notAvailable) {
    return (
      <PageShell title="App Dashboard" subtitle="Business overview">
        <div className="card">
          <p className="text-muted">Dashboard summary is not available yet.</p>
        </div>
      </PageShell>
    );
  }

  const financeCards = [
    {
      key: 'bills',
      className: 'stat-card stat-card-bills',
      label: 'Unpaid Bills',
      value: formatCurrency(summary?.unpaidBills ?? 0),
    },
    {
      key: 'invoices',
      className: 'stat-card stat-card-invoices',
      label: 'Unpaid Invoices',
      value: formatCurrency(summary?.unpaidInvoices ?? 0),
    },
    {
      key: 'cash',
      className: 'stat-card stat-card-cash',
      label: 'Cash + Bank Balance',
      value: formatCurrency(summary?.cashBankBalance ?? 0),
    },
  ];

  return (
    <PageShell title="App Dashboard" subtitle="Sales, purchase, accounts, and budget overview" bare>
      <nav className="dashboard-tabs" aria-label="Dashboard sections">
        {DASHBOARD_TABS.map((tab) => (
          <a key={tab.id} href={tab.href} className="dashboard-tab">
            {tab.label}
          </a>
        ))}
      </nav>

      <PageLoadTransition
        loading={loading}
        hasData={!!summary}
        skeleton={(
          <>
            <div className="stat-grid">
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </div>
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </>
        )}
      >
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="dashboard-stack">
          <motion.div id="dashboard-account" className="stat-grid" variants={staggerItem}>
            {financeCards.map((card) => (
              <motion.div key={card.key} className={card.className} variants={summaryCardVariant}>
                <div className="label">{card.label}</div>
                <div className="value">{card.value}</div>
              </motion.div>
            ))}
          </motion.div>

          <DashboardSection
            id="dashboard-sales"
            title="Sales"
            action={<Link to="/sales-orders"><Button>+ New</Button></Link>}
          >
            <div className="dashboard-stat-row">
              <MetricPill label="All" value={summary?.sales?.all ?? 0} hint={formatCurrency(summary?.sales?.totalAmount ?? 0)} />
              <MetricPill label="Confirmed" value={summary?.sales?.confirmed ?? 0} />
              <MetricPill label="Draft" value={summary?.sales?.draft ?? 0} />
              <MetricPill label="Invoiced" value={summary?.sales?.invoiced ?? 0} />
            </div>
            <RecentTable
              rows={summary?.recentSalesOrders}
              type="sales-orders"
              emptyLabel="No sales orders yet"
            />
          </DashboardSection>

          <DashboardSection
            id="dashboard-purchase"
            title="Purchase"
            action={<Link to="/purchase-orders"><Button>+ New</Button></Link>}
          >
            <div className="dashboard-stat-row">
              <MetricPill label="All" value={summary?.purchase?.all ?? 0} hint={formatCurrency(summary?.purchase?.totalAmount ?? 0)} />
              <MetricPill label="Confirmed" value={summary?.purchase?.confirmed ?? 0} />
              <MetricPill label="Draft" value={summary?.purchase?.draft ?? 0} />
              <MetricPill label="Billed" value={summary?.purchase?.billed ?? 0} />
            </div>
            <RecentTable
              rows={summary?.recentPurchaseOrders}
              type="purchase-orders"
              emptyLabel="No purchase orders yet"
            />
          </DashboardSection>

          <DashboardSection
            id="dashboard-report"
            title="Budget Reports"
            action={<Link to="/reports/budget"><Button variant="secondary">Report</Button></Link>}
          >
            <div className="dashboard-stat-row">
              <MetricPill label="Achieved" value={summary?.budgets?.achieved ?? 0} />
              <MetricPill label="Budget" value={summary?.budgets?.total ?? 0} hint={formatCurrency(summary?.budgets?.plannedTotal ?? 0)} />
              <MetricPill label="Committed" value={summary?.budgets?.committed ?? 0} hint={formatCurrency(summary?.budgets?.actualTotal ?? 0)} />
            </div>
          </DashboardSection>

          <motion.section className="dashboard-section card" variants={staggerItem}>
            <div className="dashboard-section-header">
              <h2>Master Data & Activity</h2>
            </div>
            <div className="dashboard-stat-row dashboard-stat-row-wide">
              <MetricPill label="Contacts" value={summary?.masters?.contacts ?? 0} />
              <MetricPill label="Products" value={summary?.masters?.products ?? 0} />
              <MetricPill label="Accounts" value={summary?.masters?.accounts ?? 0} />
              <MetricPill label="Payments" value={summary?.activity?.payments ?? 0} />
              <MetricPill label="Vendor Bills" value={summary?.activity?.vendorBills ?? 0} />
              <MetricPill label="Customer Invoices" value={summary?.activity?.customerInvoices ?? 0} />
            </div>
            <div className="dashboard-quick-links">
              <Link to="/contacts" className="dashboard-quick-link">Contacts</Link>
              <Link to="/products" className="dashboard-quick-link">Products</Link>
              <Link to="/accounts" className="dashboard-quick-link">Chart of Accounts</Link>
              <Link to="/payments" className="dashboard-quick-link">Payments</Link>
              <Link to="/reports/balance-sheet" className="dashboard-quick-link">Balance Sheet</Link>
              <Link to="/reports/profit-loss" className="dashboard-quick-link">Profit & Loss</Link>
            </div>
          </motion.section>
        </motion.div>
      </PageLoadTransition>
    </PageShell>
  );
};

export default DashboardPage;

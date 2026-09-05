import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dashboardApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import PageLoadTransition from '../../components/common/PageLoadTransition.jsx';
import { staggerContainer, staggerItem, summaryCardVariant } from '../../utils/motion.js';
import { formatCurrency } from '../../utils/format.js';

const StatSkeleton = () => (
  <div className="stat-card stat-card-skeleton">
    <div className="skeleton-bar skeleton-bar-sm" style={{ width: '60%' }} />
    <div className="skeleton-bar" style={{ width: '45%', marginTop: '0.75rem', height: '1.75rem' }} />
  </div>
);

const statCards = (summary) => [
  {
    key: 'bills',
    className: 'stat-card stat-card-bills',
    label: 'Unpaid Bills',
    value: formatCurrency(summary?.unpaidBills ?? summary?.unpaidBillsTotal ?? 0),
  },
  {
    key: 'invoices',
    className: 'stat-card stat-card-invoices',
    label: 'Unpaid Invoices',
    value: formatCurrency(summary?.unpaidInvoices ?? summary?.unpaidInvoicesTotal ?? 0),
  },
  {
    key: 'cash',
    className: 'stat-card stat-card-cash',
    label: 'Cash + Bank Balance',
    value: formatCurrency(summary?.cashBankBalance ?? summary?.cashAndBankBalance ?? 0),
  },
];

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
      <PageShell title="Dashboard" subtitle="Overview of your business finances">
        <div className="card">
          <p className="text-muted">
            Dashboard summary is not available yet. The backend needs a <code>GET /dashboard/summary</code> endpoint.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Dashboard" subtitle="Overview of your business finances" bare>
      <PageLoadTransition
        loading={loading}
        hasData={!!summary}
        skeleton={(
          <div className="stat-grid">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
        )}
      >
        <motion.div className="stat-grid" variants={staggerContainer} initial="initial" animate="animate">
          {statCards(summary).map((card) => (
            <motion.div key={card.key} className={card.className} variants={summaryCardVariant}>
              <div className="label">{card.label}</div>
              <div className="value">{card.value}</div>
            </motion.div>
          ))}
        </motion.div>
      </PageLoadTransition>
    </PageShell>
  );
};

export default DashboardPage;

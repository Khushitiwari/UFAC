import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import { formatCurrency } from '../../utils/format.js';

const StatSkeleton = () => (
  <div className="stat-card stat-card-skeleton">
    <div className="skeleton-bar skeleton-bar-sm" style={{ width: '60%' }} />
    <div className="skeleton-bar" style={{ width: '45%', marginTop: '0.75rem', height: '1.75rem' }} />
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
      <div className="stat-grid">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <div className="stat-card stat-card-bills">
              <div className="label">Unpaid Bills</div>
              <div className="value">{formatCurrency(summary?.unpaidBills ?? summary?.unpaidBillsTotal ?? 0)}</div>
            </div>
            <div className="stat-card stat-card-invoices">
              <div className="label">Unpaid Invoices</div>
              <div className="value">{formatCurrency(summary?.unpaidInvoices ?? summary?.unpaidInvoicesTotal ?? 0)}</div>
            </div>
            <div className="stat-card stat-card-cash">
              <div className="label">Cash + Bank Balance</div>
              <div className="value">{formatCurrency(summary?.cashBankBalance ?? summary?.cashAndBankBalance ?? 0)}</div>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default DashboardPage;

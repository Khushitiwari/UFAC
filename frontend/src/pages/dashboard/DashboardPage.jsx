import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { formatCurrency } from '../../utils/format.js';

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

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;

  if (notAvailable) {
    return (
      <PageShell title="Dashboard">
        <div className="card">
          <p style={{ color: 'var(--color-muted)' }}>
            Dashboard summary is not available yet. The backend needs a <code>GET /dashboard/summary</code> endpoint.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Dashboard">
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Unpaid Bills</div>
          <div className="value">{formatCurrency(summary?.unpaidBills ?? summary?.unpaidBillsTotal ?? 0)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Unpaid Invoices</div>
          <div className="value">{formatCurrency(summary?.unpaidInvoices ?? summary?.unpaidInvoicesTotal ?? 0)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Cash + Bank Balance</div>
          <div className="value">{formatCurrency(summary?.cashBankBalance ?? summary?.cashAndBankBalance ?? 0)}</div>
        </div>
      </div>
    </PageShell>
  );
};

export default DashboardPage;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { formatCurrency } from '../../utils/format.js';
import { toDateInput } from '../../utils/formHelpers.js';

const BudgetReportPage = () => {
  const [periodStart, setPeriodStart] = useState(toDateInput(new Date(new Date().getFullYear(), 0, 1)));
  const [periodEnd, setPeriodEnd] = useState(toDateInput(new Date()));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await reportsApi.budget({ periodStart, periodEnd });
      setReport(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [periodStart, periodEnd]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const rows = useMemo(() => report?.items || report?.budgets || [], [report]);
  const totals = useMemo(() => ({
    planned: rows.reduce((s, r) => s + Number(r.plannedAmount || 0), 0),
    actual: rows.reduce((s, r) => s + Number(r.actualAmount || r.actual || 0), 0),
    variance: rows.reduce((s, r) => s + Number(r.variance || (r.plannedAmount - (r.actualAmount || r.actual || 0))), 0),
  }), [rows]);

  return (
    <PageShell title="Budget Variance" actions={<Link to="/reports"><Button variant="secondary">Back</Button></Link>}>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label>From <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} /></label>
        <label>To <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /></label>
        <Button variant="secondary" onClick={fetchReport}>Refresh</Button>
      </div>
      {error && <div className="alert-error">{error}</div>}
      {loading ? <LoadingSpinner /> : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Budget</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Planned</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Actual</th>
                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Variance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id || row.name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.5rem' }}>{row.name || row.analyticAccount?.name}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(row.plannedAmount)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(row.actualAmount ?? row.actual)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(row.variance ?? (row.plannedAmount - (row.actualAmount || row.actual || 0)))}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700 }}>
                <td style={{ padding: '0.5rem' }}>Totals</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(totals.planned)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(totals.actual)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(totals.variance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
};

export default BudgetReportPage;

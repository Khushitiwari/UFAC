import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import TableSkeleton from '../../components/common/TableSkeleton.jsx';
import { formatCurrency } from '../../utils/format.js';
import { toDateInput } from '../../utils/formHelpers.js';

const ProfitAndLossPage = () => {
  const today = toDateInput(new Date());
  const monthStart = toDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [start, setStart] = useState(monthStart);
  const [end, setEnd] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await reportsApi.profitLoss({ start, end });
      setReport(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const sections = useMemo(() => {
    if (!report) return [];
    return [
      { title: 'Income', items: report.income || [], total: report.totalIncome },
      { title: 'Expenses', items: report.expenses || [], total: report.totalExpenses },
    ];
  }, [report]);

  const netProfit = useMemo(
    () => (report ? Number(report.netProfit ?? (report.totalIncome || 0) - (report.totalExpenses || 0)) : 0),
    [report],
  );

  return (
    <PageShell title="Profit & Loss" actions={<Link to="/reports"><Button variant="secondary">Back</Button></Link>}>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label>From <input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>To <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <Button variant="secondary" onClick={fetchReport}>Refresh</Button>
      </div>
      {error && <div className="alert-error">{error}</div>}
      {loading && !report ? (
        <TableSkeleton columns={2} rows={8} />
      ) : (
        <>
          {sections.map((section) => (
            <div key={section.title} className="card" style={{ marginBottom: '1rem' }}>
              <h3>{section.title}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {(section.items || []).map((item) => (
                    <tr key={item.accountId || item.name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.5rem' }}>{item.name || item.account?.name}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(item.balance ?? item.amount)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 700 }}>
                    <td style={{ padding: '0.5rem' }}>Total {section.title}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(section.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          <div className="card" style={{ fontWeight: 700 }}>
            Net Profit: {formatCurrency(netProfit)}
          </div>
        </>
      )}
    </PageShell>
  );
};

export default ProfitAndLossPage;

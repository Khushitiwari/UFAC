import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import TableSkeleton from '../../components/common/TableSkeleton.jsx';
import { formatCurrency } from '../../utils/format.js';
import { toDateInput } from '../../utils/formHelpers.js';

const BalanceSheetPage = () => {
  const [date, setDate] = useState(toDateInput(new Date()));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await reportsApi.balanceSheet({ date });
      setReport(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const sections = useMemo(() => {
    if (!report) return [];
    return [
      { title: 'Assets', items: report.assets || [], total: report.totalAssets },
      { title: 'Liabilities', items: report.liabilities || [], total: report.totalLiabilities },
      { title: 'Capital', items: report.capital || [], total: report.totalCapital },
    ];
  }, [report]);

  return (
    <PageShell title="Balance Sheet" actions={<Link to="/reports"><Button variant="secondary">Back</Button></Link>}>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label htmlFor="date">As of</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button variant="secondary" onClick={fetchReport}>Refresh</Button>
      </div>
      {error && <div className="alert-error">{error}</div>}
      {loading && !report ? (
        <TableSkeleton columns={2} rows={8} />
      ) : (
        sections.map((section) => (
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
        ))
      )}
    </PageShell>
  );
};

export default BalanceSheetPage;

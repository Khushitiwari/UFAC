import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reportsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import TableSkeleton from '../../components/common/TableSkeleton.jsx';
import ReportLoadTransition from '../../components/reports/ReportLoadTransition.jsx';
import ReportFiltersBar from '../../components/reports/ReportFiltersBar.jsx';
import { tableRowVariant } from '../../components/reports/reportMotion.js';
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

  const rows = useMemo(() => {
    if (Array.isArray(report)) return report;
    return report?.items || report?.budgets || [];
  }, [report]);
  const totals = useMemo(() => ({
    planned: rows.reduce((s, r) => s + Number(r.plannedAmount || 0), 0),
    actual: rows.reduce((s, r) => s + Number(r.actualAmount || r.actual || 0), 0),
    variance: rows.reduce((s, r) => s + Number(r.variance || (r.plannedAmount - (r.actualAmount || r.actual || 0))), 0),
  }), [rows]);

  return (
    <PageShell title="Budget Variance" actions={<Link to="/reports"><Button variant="secondary">Back</Button></Link>}>
      <ReportFiltersBar onRefresh={fetchReport} loading={loading}>
        <label>From <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} /></label>
        <label>To <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /></label>
      </ReportFiltersBar>

      {error && (
        <motion.div
          className="alert-error"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {error}
        </motion.div>
      )}

      <ReportLoadTransition
        loading={loading}
        hasData={!!report}
        skeleton={<TableSkeleton columns={4} rows={6} />}
      >
        <div className="report-table-card">
          <table className="report-budget-table">
            <thead>
              <tr>
                <th>Budget</th>
                <th>Planned</th>
                <th>Actual</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <motion.tr
                  key={row.id || row.name}
                  variants={tableRowVariant}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.04 }}
                >
                  <td>{row.name || row.analyticAccount?.name}</td>
                  <td>{formatCurrency(row.plannedAmount)}</td>
                  <td>{formatCurrency(row.actualAmount ?? row.actual)}</td>
                  <td>{formatCurrency(row.variance ?? (row.plannedAmount - (row.actualAmount || row.actual || 0)))}</td>
                </motion.tr>
              ))}
              <motion.tr
                className="report-budget-total"
                variants={tableRowVariant}
                initial="initial"
                animate="animate"
                transition={{ delay: rows.length * 0.04 + 0.05 }}
              >
                <td>Totals</td>
                <td>{formatCurrency(totals.planned)}</td>
                <td>{formatCurrency(totals.actual)}</td>
                <td>{formatCurrency(totals.variance)}</td>
              </motion.tr>
            </tbody>
          </table>
        </div>
      </ReportLoadTransition>
    </PageShell>
  );
};

export default BudgetReportPage;

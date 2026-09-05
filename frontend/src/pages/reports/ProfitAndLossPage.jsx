import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { reportsApi } from '../../api/index.js';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';
import TableSkeleton from '../../components/common/TableSkeleton.jsx';
import ReportLoadTransition from '../../components/reports/ReportLoadTransition.jsx';
import ReportSectionCard from '../../components/reports/ReportSectionCard.jsx';
import ReportFiltersBar from '../../components/reports/ReportFiltersBar.jsx';
import { staggerContainer, summaryCardVariant } from '../../components/reports/reportMotion.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
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
      { title: 'Income', items: report.income?.lines || [], total: report.income?.total },
      { title: 'Expenses', items: report.expenses?.lines || [], total: report.expenses?.total },
    ];
  }, [report]);

  const netIncome = useMemo(
    () => (report ? Number(report.netIncome ?? 0) : 0),
    [report],
  );

  const periodLabel = report?.startDate && report?.endDate
    ? `${formatDate(report.startDate)} – ${formatDate(report.endDate)}`
    : null;

  return (
    <PageShell
      title="Profit & Loss"
      subtitle={periodLabel}
      actions={<Link to="/reports"><Button variant="secondary">Back</Button></Link>}
    >
      <ReportFiltersBar onRefresh={fetchReport} loading={loading}>
        <label>From <input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>To <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
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
        skeleton={<TableSkeleton columns={2} rows={8} />}
      >
        <motion.div
          key={`${start}-${end}-${report?.netIncome ?? 0}`}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {sections.map((section) => (
            <ReportSectionCard
              key={section.title}
              title={section.title}
              items={section.items}
              total={section.total}
            />
          ))}
          <motion.div className="card report-summary-card" variants={summaryCardVariant} layout>
            Net Income: {formatCurrency(netIncome)}
          </motion.div>
        </motion.div>
      </ReportLoadTransition>
    </PageShell>
  );
};

export default ProfitAndLossPage;

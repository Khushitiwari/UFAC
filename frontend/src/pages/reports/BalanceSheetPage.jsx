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
import { staggerContainer } from '../../components/reports/reportMotion.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
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
    const { sections: data = {}, totals = {} } = report;
    return [
      { title: 'Assets', items: data.ASSET || [], total: totals.ASSET },
      { title: 'Liabilities', items: data.LIABILITY || [], total: totals.LIABILITY },
      { title: 'Capital', items: data.CAPITAL || [], total: totals.CAPITAL },
    ];
  }, [report]);

  return (
    <PageShell
      title="Balance Sheet"
      subtitle={report?.asOfDate ? `As of ${formatDate(report.asOfDate)}` : undefined}
      actions={<Link to="/reports"><Button variant="secondary">Back</Button></Link>}
    >
      <ReportFiltersBar onRefresh={fetchReport} loading={loading}>
        <label htmlFor="date">As of</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
          key={`${date}-${sections.length}`}
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
        </motion.div>
      </ReportLoadTransition>
    </PageShell>
  );
};

export default BalanceSheetPage;

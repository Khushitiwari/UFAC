import PageShell from '../../components/common/PageShell.jsx';

const ReportsPage = () => (
  <PageShell title="Reports" subtitle="Financial statements and budget analysis">
    <p className="welcome-text">
      Balance Sheet, Profit &amp; Loss, and Budget reports — connect to /api/v1/reports.
    </p>
  </PageShell>
);

export default ReportsPage;

import PageShell from '../../components/common/PageShell.jsx';

const ReportsPage = () => (
  <PageShell title="Reports">
    <p style={{ color: 'var(--color-muted)' }}>
      Balance Sheet, Profit &amp; Loss, and Budget reports — connect to /api/v1/reports.
    </p>
  </PageShell>
);

export default ReportsPage;

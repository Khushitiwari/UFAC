import PageShell from '../../components/common/PageShell.jsx';

const DashboardPage = () => (
  <PageShell title="Dashboard">
    <div className="stat-grid">
      <div className="stat-card">
        <div className="label">Module</div>
        <div className="value">UFAC</div>
      </div>
      <div className="stat-card">
        <div className="label">Status</div>
        <div className="value" style={{ fontSize: '1.2rem', color: 'var(--color-success)' }}>
          Ready
        </div>
      </div>
    </div>
    <p style={{ color: 'var(--color-muted)' }}>
      Welcome to Urban Furniture Accounting System. Use the sidebar to navigate modules.
    </p>
  </PageShell>
);

export default DashboardPage;

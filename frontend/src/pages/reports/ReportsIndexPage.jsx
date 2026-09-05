import { Link } from 'react-router-dom';
import PageShell from '../../components/common/PageShell.jsx';

const reportLinks = [
  { to: '/reports/balance-sheet', title: 'Balance Sheet', desc: 'Assets, liabilities, and capital as of a date', icon: '◫' },
  { to: '/reports/profit-loss', title: 'Profit & Loss', desc: 'Income and expenses for a period', icon: '▦' },
  { to: '/reports/budget', title: 'Budget Variance', desc: 'Planned vs actual by analytic account', icon: '◈' },
];

const ReportsIndexPage = () => (
  <PageShell title="Reports" subtitle="Financial statements and variance analysis">
    <div className="report-link-grid">
      {reportLinks.map((item) => (
        <Link key={item.to} to={item.to} className="report-link-card">
          <span className="report-link-icon" aria-hidden="true">{item.icon}</span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  </PageShell>
);

export default ReportsIndexPage;

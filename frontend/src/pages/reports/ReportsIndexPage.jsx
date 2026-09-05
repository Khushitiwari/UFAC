import { Link } from 'react-router-dom';
import PageShell from '../../components/common/PageShell.jsx';
import Button from '../../components/common/Button.jsx';

const ReportsIndexPage = () => (
  <PageShell title="Reports">
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link to="/reports/balance-sheet"><Button style={{ width: '100%' }}>Balance Sheet</Button></Link>
      <Link to="/reports/profit-loss"><Button style={{ width: '100%' }}>Profit &amp; Loss</Button></Link>
      <Link to="/reports/budget"><Button style={{ width: '100%' }}>Budget Variance</Button></Link>
    </div>
  </PageShell>
);

export default ReportsIndexPage;

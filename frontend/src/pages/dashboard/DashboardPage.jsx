import { Link } from 'react-router-dom';
import PageShell from '../../components/common/PageShell.jsx';
import Icon from '../../components/common/Icon.jsx';

const quickLinks = [
  { to: '/contacts', label: 'Contacts', icon: 'contacts' },
  { to: '/products', label: 'Products', icon: 'products' },
  { to: '/journals', label: 'Journals', icon: 'journals' },
  { to: '/purchases', label: 'Purchases', icon: 'purchases' },
  { to: '/sales', label: 'Sales', icon: 'sales' },
  { to: '/payments', label: 'Payments', icon: 'payments' },
  { to: '/budget', label: 'Budget', icon: 'budget' },
  { to: '/reports', label: 'Reports', icon: 'reports' },
];

const DashboardPage = () => (
  <PageShell title="Dashboard" subtitle="Overview of your accounting workspace">
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-icon stat-icon--primary">
          <Icon name="accounts" size={22} />
        </div>
        <div className="stat-card-body">
          <div className="label">System</div>
          <div className="value">UFAC</div>
          <div className="sub">Urban Furniture Accounting</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon stat-icon--success">
          <Icon name="check" size={22} />
        </div>
        <div className="stat-card-body">
          <div className="label">Status</div>
          <div className="value stat-value--success">Operational</div>
          <div className="sub">All modules ready</div>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon stat-icon--accent">
          <Icon name="reports" size={22} />
        </div>
        <div className="stat-card-body">
          <div className="label">Modules</div>
          <div className="value">10</div>
          <div className="sub">Available in sidebar</div>
        </div>
      </div>
    </div>

    <p className="welcome-text">
      Welcome to the Urban Furniture Accounting System. Manage contacts, track transactions, and
      generate reports — all from one place.
    </p>

    <h3 className="section-title">Quick Access</h3>
    <div className="quick-links">
      {quickLinks.map((link) => (
        <Link key={link.to} to={link.to} className="quick-link">
          <Icon name={link.icon} size={18} />
          {link.label}
        </Link>
      ))}
    </div>
  </PageShell>
);

export default DashboardPage;

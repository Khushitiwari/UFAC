import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';
import PageTransition from './PageTransition.jsx';

const adminNavItems = [
  { to: '/', label: 'Dashboard', icon: '◫', end: true },
  { to: '/contacts', label: 'Contacts', icon: '◎' },
  { to: '/products', label: 'Products', icon: '▣' },
  { to: '/accounts', label: 'Chart of Accounts', icon: '☰' },
  { to: '/journals', label: 'Journals', icon: '▤' },
  { to: '/journals/entries', label: 'Journal Entries', icon: '▥' },
  { to: '/journals/entry/new', label: 'Manual Entry', icon: '✎' },
  { to: '/purchase-orders', label: 'Purchase Orders', icon: '↓' },
  { to: '/vendor-bills', label: 'Vendor Bills', icon: '▧' },
  { to: '/sales-orders', label: 'Sales Orders', icon: '↑' },
  { to: '/customer-invoices', label: 'Customer Invoices', icon: '▨' },
  { to: '/payments', label: 'Payments', icon: '$' },
  { to: '/analytic-accounts', label: 'Analytic Accounts', icon: '◉' },
  { to: '/budgets', label: 'Budget', icon: '◈' },
  { to: '/reports', label: 'Reports', icon: '▦' },
];

const contactNavItems = [
  { to: '/vendor-bills', label: 'My Bills', icon: '▧' },
  { to: '/customer-invoices', label: 'My Invoices', icon: '▨' },
  { to: '/payments', label: 'Payments', icon: '$' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isContact = user?.role === 'CONTACT';
  const navItems = isContact ? contactNavItems : adminNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">UF</div>
          <div>
            <h1>UFAC</h1>
            <span>Accounting Suite</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.charAt(0) ?? '?'}</div>
            <div>
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <Button variant="secondary" onClick={handleLogout} className="btn-block btn-sm">
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="main-content">
        <PageTransition />
      </main>
    </div>
  );
};

export default Layout;

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';

const adminNavItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/contacts', label: 'Contacts' },
  { to: '/products', label: 'Products' },
  { to: '/accounts', label: 'Chart of Accounts' },
  { to: '/journals', label: 'Journals' },
  { to: '/journals/entry/new', label: 'Journal Entry' },
  { to: '/purchase-orders', label: 'Purchase Orders' },
  { to: '/vendor-bills', label: 'Vendor Bills' },
  { to: '/sales-orders', label: 'Sales Orders' },
  { to: '/customer-invoices', label: 'Customer Invoices' },
  { to: '/payments', label: 'Payments' },
  { to: '/analytic-accounts', label: 'Analytic Accounts' },
  { to: '/budgets', label: 'Budget' },
  { to: '/reports', label: 'Reports' },
];

const contactNavItems = [
  { to: '/vendor-bills', label: 'My Bills' },
  { to: '/customer-invoices', label: 'My Invoices' },
  { to: '/payments', label: 'Payments' },
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
        <h1>UFAC</h1>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '1.25rem', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.75rem' }}>{user?.role}</div>
          <Button variant="secondary" onClick={handleLogout} style={{ width: '100%', fontSize: '0.8rem' }}>
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

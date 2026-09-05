import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isContact = user?.role === 'CONTACT';
  const navItems = isContact ? contactNavItems : adminNavItems;

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');

    const handleChange = (event) => {
      if (event.matches) closeSidebar();
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [closeSidebar]);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeSidebar();
    };

    document.body.classList.add('sidebar-open');
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('sidebar-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [sidebarOpen, closeSidebar]);

  const handleLogout = () => {
    closeSidebar();
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <button
        type="button"
        className={`sidebar-overlay ${sidebarOpen ? 'is-visible' : ''}`}
        aria-label="Close navigation menu"
        onClick={closeSidebar}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <aside id="app-sidebar" className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">UF</div>
          <div className="sidebar-brand-text">
            <h1>UFAC</h1>
            <span>Accounting Suite</span>
          </div>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close navigation menu"
            onClick={closeSidebar}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="nav-link"
              onClick={closeSidebar}
            >
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

      <div className="app-main">
        <header className="mobile-header">
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
            onClick={toggleSidebar}
          >
            <span className="sidebar-toggle-bar" />
            <span className="sidebar-toggle-bar" />
            <span className="sidebar-toggle-bar" />
          </button>
          <div className="mobile-header-brand">
            <span className="mobile-header-logo">UF</span>
            <span className="mobile-header-title">UFAC</span>
          </div>
        </header>

        <main className="main-content">
          <PageTransition />
        </main>
      </div>
    </div>
  );
};

export default Layout;

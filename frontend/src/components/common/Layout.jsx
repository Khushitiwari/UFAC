import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from './Button.jsx';
import Icon from './Icon.jsx';

const navSections = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: 'dashboard', end: true }],
  },
  {
    label: 'Master Data',
    items: [
      { to: '/contacts', label: 'Contacts', icon: 'contacts' },
      { to: '/products', label: 'Products', icon: 'products' },
      { to: '/chart-of-accounts', label: 'Chart of Accounts', icon: 'accounts' },
    ],
  },
  {
    label: 'Transactions',
    items: [
      { to: '/journals', label: 'Journals', icon: 'journals' },
      { to: '/purchases', label: 'Purchases', icon: 'purchases' },
      { to: '/sales', label: 'Sales', icon: 'sales' },
      { to: '/payments', label: 'Payments', icon: 'payments' },
    ],
  },
  {
    label: 'Planning',
    items: [
      { to: '/budget', label: 'Budget', icon: 'budget' },
      { to: '/reports', label: 'Reports', icon: 'reports' },
    ],
  },
];

const getInitials = (firstName, lastName) => {
  const first = firstName?.[0] ?? '';
  const last = lastName?.[0] ?? '';
  return (first + last).toUpperCase() || '?';
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>UFAC</h1>
          <span>Urban Furniture Accounting</span>
        </div>
        <nav>
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end}>
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{getInitials(user?.firstName, user?.lastName)}</div>
            <div className="user-info">
              <div className="user-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <Icon name="logout" size={16} />
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

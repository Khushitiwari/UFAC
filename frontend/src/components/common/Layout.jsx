import { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';
import PageTransition from './PageTransition.jsx';
import {
  NavIcons,
  adminNavGroups,
  contactNavGroups,
  roleLabels,
} from './sidebarConfig.jsx';

const STORAGE_KEY = 'ufac-sidebar-collapsed';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const [search, setSearch] = useState('');

  const isContact = user?.role === 'CONTACT';
  const navGroups = isContact ? contactNavGroups : adminNavGroups;

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      if (next) setSearch('');
      return next;
    });
  }, []);

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

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return navGroups;

    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.label.toLowerCase().includes(query)),
      }))
      .filter((group) => group.items.length > 0);
  }, [navGroups, search]);

  const handleLogout = () => {
    closeSidebar();
    logout();
    navigate('/login');
  };

  const sidebarClass = [
    'sidebar',
    sidebarOpen ? 'is-open' : '',
    collapsed ? 'is-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <button
        type="button"
        className={`sidebar-overlay ${sidebarOpen ? 'is-visible' : ''}`}
        aria-label="Close navigation menu"
        onClick={closeSidebar}
        tabIndex={sidebarOpen ? 0 : -1}
      />

      <aside id="app-sidebar" className={sidebarClass}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">UF</div>
          <div className="sidebar-brand-text">
            <h1>UFAC</h1>
            <span>Accounting Suite</span>
          </div>
          <button
            type="button"
            className="sidebar-collapse-btn"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggleCollapsed}
          >
            {collapsed ? NavIcons.chevronRight : NavIcons.chevronLeft}
          </button>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close navigation menu"
            onClick={closeSidebar}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {!collapsed && (
          <div className="sidebar-search-wrap">
            <span className="sidebar-search-icon" aria-hidden="true">{NavIcons.search}</span>
            <input
              type="search"
              className="sidebar-search"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search navigation"
            />
          </div>
        )}

        <nav className="sidebar-nav">
          {filteredGroups.map((group) => (
            <div key={group.id} className="sidebar-group">
              {!collapsed && <div className="sidebar-group-label">{group.label}</div>}
              <div className="sidebar-group-items">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    onClick={closeSidebar}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="nav-icon" aria-hidden="true">
                      {NavIcons[item.icon]}
                    </span>
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
          {!collapsed && search && filteredGroups.length === 0 && (
            <p className="sidebar-search-empty">No menu items match your search.</p>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" title={collapsed ? user?.name : undefined}>
            <div className="sidebar-avatar">{user?.name?.charAt(0) ?? '?'}</div>
            {!collapsed && (
              <div className="sidebar-user-meta">
                <div className="sidebar-user-name">{user?.name}</div>
                <div className="sidebar-user-role">{roleLabels[user?.role] ?? user?.role}</div>
              </div>
            )}
          </div>
          {!collapsed ? (
            <Button variant="secondary" onClick={handleLogout} className="btn-block btn-sm sidebar-logout">
              Sign Out
            </Button>
          ) : (
            <button type="button" className="sidebar-logout-icon" onClick={handleLogout} title="Sign out">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
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

import { Link } from 'react-router-dom';

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="auth-page">
    <div className="auth-page-bg" aria-hidden="true" />
    <div className="auth-container">
      <div className="auth-brand">
        <div className="auth-logo">UF</div>
        <h1>Urban Furniture Accounting</h1>
        <p>Manage purchases, sales, payments, and your ledger in one place.</p>
      </div>
      <div className="auth-card">
        <h2>{title}</h2>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
        {footer}
      </div>
    </div>
  </div>
);

export const AuthFooterLink = ({ to, children }) => (
  <p className="auth-footer">
    {children}{' '}
    <Link to={to}>{to === '/signup' ? 'Create an account' : 'Sign in'}</Link>
  </p>
);

export default AuthLayout;

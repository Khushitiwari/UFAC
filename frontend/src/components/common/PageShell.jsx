const PageShell = ({ title, subtitle, children, actions }) => (
  <>
    <div className="page-header">
      <div className="page-header-text">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
    <div className="card">{children}</div>
  </>
);

export default PageShell;

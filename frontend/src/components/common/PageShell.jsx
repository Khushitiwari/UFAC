const PageShell = ({ title, subtitle, children, actions, bare = false }) => (
  <>
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions}
    </div>
    <div className="page-body">
      {bare ? children : <div className="card">{children}</div>}
    </div>
  </>
);

export default PageShell;

const PageShell = ({ title, children, actions }) => (
  <>
    <div className="page-header">
      <h2>{title}</h2>
      {actions}
    </div>
    <div className="card">{children}</div>
  </>
);

export default PageShell;

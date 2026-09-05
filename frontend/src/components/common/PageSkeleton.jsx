const PageSkeleton = () => (
  <div className="page-skeleton" aria-hidden="true">
    <div className="skeleton-bar skeleton-title" />
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="skeleton-bar" style={{ width: '40%', marginBottom: '1rem' }} />
      <div className="skeleton-bar" style={{ width: '100%', marginBottom: '0.75rem' }} />
      <div className="skeleton-bar" style={{ width: '92%' }} />
    </div>
  </div>
);

export default PageSkeleton;

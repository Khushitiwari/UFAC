const TableSkeleton = ({ columns = 4, rows = 6 }) => (
  <div className="table-skeleton" aria-hidden="true">
    <div className="table-skeleton-header">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="skeleton-bar skeleton-bar-sm" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, row) => (
      <div key={row} className="table-skeleton-row">
        {Array.from({ length: columns }).map((_, col) => (
          <div key={col} className="skeleton-bar" style={{ width: `${55 + ((row + col) % 3) * 15}%` }} />
        ))}
      </div>
    ))}
  </div>
);

export default TableSkeleton;

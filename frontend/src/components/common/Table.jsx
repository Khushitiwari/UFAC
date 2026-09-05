import TableSkeleton from './TableSkeleton.jsx';

const Table = ({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No records found',
  loading = false,
  refreshing = false,
}) => {
  if (loading && !data?.length) {
    return <TableSkeleton columns={columns.length || 4} />;
  }

  if (!data?.length) {
    return (
      <p className="table-empty">{emptyMessage}</p>
    );
  }

  return (
    <div className={`table-wrap ${refreshing ? 'is-refreshing' : ''}`}>
      {refreshing && <div className="table-refresh-bar" aria-hidden="true" />}
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'clickable' : undefined}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

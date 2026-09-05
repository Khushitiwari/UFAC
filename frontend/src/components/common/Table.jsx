import TableSkeleton from './TableSkeleton.jsx';
import PageLoadTransition from './PageLoadTransition.jsx';

const Table = ({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No records found',
  loading = false,
  refreshing = false,
}) => {
  const hasData = !!data?.length;
  const isInitialLoad = loading && !hasData;

  return (
    <PageLoadTransition
      loading={isInitialLoad}
      hasData={hasData || (!loading && !hasData)}
      skeleton={<TableSkeleton columns={columns.length || 4} />}
    >
      {!hasData ? (
        <p className="table-empty">{emptyMessage}</p>
      ) : (
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
      )}
    </PageLoadTransition>
  );
};

export default Table;

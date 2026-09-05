const Table = ({ columns, data, onRowClick, emptyMessage = 'No records found' }) => {
  if (!data?.length) {
    return (
      <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '2rem' }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ background: 'var(--color-bg)', borderBottom: '2px solid var(--color-border)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  fontWeight: 600,
                  color: 'var(--color-muted)',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom: '1px solid var(--color-border)',
                cursor: onRowClick ? 'pointer' : 'default',
              }}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ padding: '0.75rem 1rem' }}>
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

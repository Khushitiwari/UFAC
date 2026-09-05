const LoadingSpinner = ({ size = 40, label = 'Loading...' }) => (
  <div
    role="status"
    aria-label={label}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '0.75rem',
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        border: '3px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
    <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>{label}</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default LoadingSpinner;

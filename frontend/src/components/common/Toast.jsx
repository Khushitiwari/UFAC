import { useEffect } from 'react';

const Toast = ({ message, type = 'error', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bg = type === 'success' ? 'var(--color-success)' : 'var(--color-danger)';

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        background: bg,
        color: '#fff',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 2000,
        maxWidth: 420,
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '1rem',
          padding: 0,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;

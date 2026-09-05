const variants = {
  primary: {
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
  },
  danger: {
    background: 'var(--color-danger)',
    color: '#fff',
    border: 'none',
  },
};

const Button = ({ children, variant = 'primary', type = 'button', disabled, onClick, style }) => {
  const baseStyle = {
    padding: '0.55rem 1.1rem',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    fontFamily: 'inherit',
    ...variants[variant],
    ...style,
  };

  return (
    <button type={type} disabled={disabled} onClick={onClick} style={baseStyle}>
      {children}
    </button>
  );
};

export default Button;

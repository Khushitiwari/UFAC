const variantClass = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const Button = ({ children, variant = 'primary', type = 'button', disabled, onClick, className = '', size }) => {
  const classes = ['btn', variantClass[variant], size === 'sm' && 'btn-sm', className].filter(Boolean).join(' ');

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
};

export default Button;

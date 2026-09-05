const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
};

const Button = ({ children, variant = 'primary', type = 'button', disabled, onClick, className = '', style }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`btn ${variants[variant] ?? variants.primary} ${className}`.trim()}
    style={style}
  >
    {children}
  </button>
);

export default Button;

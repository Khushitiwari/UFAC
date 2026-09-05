const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div role="status" aria-label={label} className="spinner-container">
    <div className="spinner" />
    <span className="spinner-label">{label}</span>
  </div>
);

export default LoadingSpinner;

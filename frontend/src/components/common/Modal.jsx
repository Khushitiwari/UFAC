import Button from './Button.jsx';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="modal-overlay" onClick={onClose}>
      <div className="card modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <Button variant="secondary" onClick={onClose} className="btn-icon btn-sm" aria-label="Close">
            ✕
          </Button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

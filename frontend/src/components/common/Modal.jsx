import Button from './Button.jsx';

const sizeClass = {
  md: 'modal-panel-md',
  lg: 'modal-panel-lg',
};

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-panel card ${sizeClass[size] || sizeClass.md}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <Button variant="secondary" onClick={onClose} className="modal-close-btn">
            ✕
          </Button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

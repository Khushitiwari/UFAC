import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toast from '../components/common/Toast.jsx';

const ToastContext = createContext(null);

let externalShowToast = null;

export const showToast = (message, type = 'error') => {
  if (externalShowToast) externalShowToast(message, type);
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const dismiss = useCallback(() => setToast(null), []);

  const addToast = useCallback((message, type = 'error') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  externalShowToast = addToast;

  const value = useMemo(() => ({ showToast: addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={dismiss} />}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;

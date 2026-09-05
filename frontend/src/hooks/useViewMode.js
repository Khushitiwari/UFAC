import { useEffect, useState } from 'react';

export const useViewMode = (storageKey, defaultMode = 'list') => {
  const [viewMode, setViewMode] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored === 'kanban' ? 'kanban' : defaultMode;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, viewMode);
  }, [storageKey, viewMode]);

  return [viewMode, setViewMode];
};

export default useViewMode;

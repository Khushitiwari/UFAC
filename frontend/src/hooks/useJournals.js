import { useCallback, useState } from 'react';
import { journalsApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const useJournals = (filters = {}) => {
  const fetchFn = useCallback((params) => journalsApi.list(params), []);
  return useResourceList(fetchFn, 'journals', filters);
};

export const useJournal = (id) => {
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await journalsApi.get(id);
      setJournal(data.data.journal ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load journal');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { journal, loading, error, refetch };
};

export default useJournals;

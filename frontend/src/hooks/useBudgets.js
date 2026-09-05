import { useCallback, useState } from 'react';
import { budgetsApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const useBudgets = (filters = {}) => {
  const fetchFn = useCallback((params) => budgetsApi.list(params), []);
  return useResourceList(fetchFn, 'budgets', filters);
};

export const useBudget = (id) => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await budgetsApi.get(id);
      setBudget(data.data.budget ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { budget, loading, error, refetch };
};

export default useBudgets;

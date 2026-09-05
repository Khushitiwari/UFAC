import { useCallback, useState } from 'react';
import { analyticAccountsApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const useAnalyticAccounts = (filters = {}) => {
  const fetchFn = useCallback((params) => analyticAccountsApi.list(params), []);
  return useResourceList(fetchFn, 'analyticAccounts', filters);
};

export const useAnalyticAccount = (id) => {
  const [analyticAccount, setAnalyticAccount] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await analyticAccountsApi.get(id);
      setAnalyticAccount(data.data.analyticAccount ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytic account');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { analyticAccount, loading, error, refetch };
};

export default useAnalyticAccounts;

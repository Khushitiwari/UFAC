import { useCallback, useState } from 'react';
import { accountsApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const useAccounts = (filters = {}) => {
  const fetchFn = useCallback((params) => accountsApi.list(params), []);
  return useResourceList(fetchFn, 'accounts', filters);
};

export const useAccount = (id) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await accountsApi.get(id);
      setAccount(data.data.account ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load account');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { account, loading, error, refetch };
};

export default useAccounts;

import { useCallback, useState } from 'react';
import { paymentsApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const usePayments = (filters = {}) => {
  const fetchFn = useCallback((params) => paymentsApi.list(params), []);
  return useResourceList(fetchFn, 'payments', filters);
};

export const usePayment = (id) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await paymentsApi.get(id);
      setPayment(data.data.payment ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { payment, loading, error, refetch };
};

export default usePayments;

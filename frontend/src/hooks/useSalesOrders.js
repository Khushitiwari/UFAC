import { useCallback, useState } from 'react';
import { salesOrdersApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const useSalesOrders = (filters = {}) => {
  const fetchFn = useCallback((params) => salesOrdersApi.list(params), []);
  return useResourceList(fetchFn, 'salesOrders', filters);
};

export const useSalesOrder = (id) => {
  const [salesOrder, setSalesOrder] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await salesOrdersApi.get(id);
      setSalesOrder(data.data.salesOrder ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load sales order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { salesOrder, loading, error, refetch };
};

export default useSalesOrders;

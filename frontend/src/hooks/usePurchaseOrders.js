import { useCallback, useState } from 'react';
import { purchaseOrdersApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const usePurchaseOrders = (filters = {}) => {
  const fetchFn = useCallback((params) => purchaseOrdersApi.list(params), []);
  return useResourceList(fetchFn, 'purchaseOrders', filters);
};

export const usePurchaseOrder = (id) => {
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await purchaseOrdersApi.get(id);
      setPurchaseOrder(data.data.purchaseOrder ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load purchase order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { purchaseOrder, loading, error, refetch };
};

export default usePurchaseOrders;

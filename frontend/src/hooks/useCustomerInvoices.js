import { useCallback, useState } from 'react';
import { customerInvoicesApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const useCustomerInvoices = (filters = {}) => {
  const fetchFn = useCallback((params) => customerInvoicesApi.list(params), []);
  return useResourceList(fetchFn, 'customerInvoices', filters);
};

export const useCustomerInvoice = (id) => {
  const [customerInvoice, setCustomerInvoice] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await customerInvoicesApi.get(id);
      setCustomerInvoice(data.data.customerInvoice ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customer invoice');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { customerInvoice, loading, error, refetch };
};

export default useCustomerInvoices;

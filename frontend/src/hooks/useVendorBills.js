import { useCallback, useState } from 'react';
import { vendorBillsApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const useVendorBills = (filters = {}) => {
  const fetchFn = useCallback((params) => vendorBillsApi.list(params), []);
  return useResourceList(fetchFn, 'vendorBills', filters);
};

export const useVendorBill = (id) => {
  const [vendorBill, setVendorBill] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await vendorBillsApi.get(id);
      setVendorBill(data.data.vendorBill ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load vendor bill');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { vendorBill, loading, error, refetch };
};

export default useVendorBills;

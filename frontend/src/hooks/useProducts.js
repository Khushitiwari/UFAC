import { useCallback, useState } from 'react';
import { productsApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const useProducts = (filters = {}) => {
  const fetchFn = useCallback((params) => productsApi.list(params), []);
  return useResourceList(fetchFn, 'products', filters);
};

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await productsApi.get(id);
      setProduct(data.data.product ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { product, loading, error, refetch };
};

export default useProducts;

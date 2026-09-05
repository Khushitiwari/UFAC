import { useCallback, useEffect, useState } from 'react';
import { usePagination } from './usePagination.js';

export const useResourceList = (fetchFn, dataKey, filters = {}) => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { page, limit, nextPage, prevPage, reset } = usePagination();

  const filterKey = JSON.stringify(filters);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchFn({ page, limit, ...filters });
      setItems(data.data[dataKey] ?? []);
      setMeta(data.data.meta ?? {});
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, limit, filterKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, meta, loading, error, refetch, page, limit, nextPage, prevPage, reset };
};

export default useResourceList;

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePagination } from './usePagination.js';

export const useResourceList = (fetchFn, dataKey, filters = {}) => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const { page, limit, nextPage, prevPage, reset } = usePagination();
  const hasLoadedRef = useRef(false);

  const filterKey = JSON.stringify(filters);

  const refetch = useCallback(async () => {
    const isInitial = !hasLoadedRef.current;
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const { data } = await fetchFn({ page, limit, ...filters });
      setItems(data.data[dataKey] ?? []);
      setMeta(data.data.meta ?? {});
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchFn, page, limit, filterKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, meta, loading, refreshing, error, refetch, page, limit, nextPage, prevPage, reset };
};

export default useResourceList;

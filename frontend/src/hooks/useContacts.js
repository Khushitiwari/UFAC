import { useCallback, useState } from 'react';
import { contactsApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const useContacts = (filters = {}) => {
  const fetchFn = useCallback((params) => contactsApi.list(params), []);
  const list = useResourceList(fetchFn, 'contacts', filters);
  return list;
};

export const useContact = (id) => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await contactsApi.get(id);
      setContact(data.data.contact ?? data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load contact');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { contact, loading, error, refetch };
};

export default useContacts;

import { useCallback } from 'react';
import { journalEntriesApi } from '../api/index.js';
import { useResourceList } from './useResourceList.js';

export const useJournalEntries = (filters = {}) => {
  const fetchFn = useCallback((params) => journalEntriesApi.list(params), []);
  return useResourceList(fetchFn, 'entries', filters);
};

export default useJournalEntries;

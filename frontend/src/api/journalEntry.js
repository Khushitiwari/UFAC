import axiosClient from './axiosClient.js';

const journalEntryApi = {
  list: (params) => axiosClient.get('/journals/entries', { params }),
  create: (data) => axiosClient.post('/journals/entries', data),
};

export default journalEntryApi;

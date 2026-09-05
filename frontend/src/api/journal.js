import axiosClient from './axiosClient.js';

const journalApi = {
  list: (params) => axiosClient.get('/journals', { params }),
  get: (id) => axiosClient.get(`/journals/${id}`),
  create: (data) => axiosClient.post('/journals', data),
  update: (id, data) => axiosClient.put(`/journals/${id}`, data),
  remove: (id) => axiosClient.delete(`/journals/${id}`),
};

export default journalApi;

import axiosClient from './axiosClient.js';

const analyticAccountApi = {
  list: (params) => axiosClient.get('/analytic-accounts', { params }),
  get: (id) => axiosClient.get(`/analytic-accounts/${id}`),
  create: (data) => axiosClient.post('/analytic-accounts', data),
  update: (id, data) => axiosClient.put(`/analytic-accounts/${id}`, data),
  remove: (id) => axiosClient.delete(`/analytic-accounts/${id}`),
};

export default analyticAccountApi;

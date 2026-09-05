import axiosClient from './axiosClient.js';

const accountApi = {
  list: (params) => axiosClient.get('/accounts', { params }),
  get: (id) => axiosClient.get(`/accounts/${id}`),
  create: (data) => axiosClient.post('/accounts', data),
  update: (id, data) => axiosClient.put(`/accounts/${id}`, data),
  remove: (id) => axiosClient.delete(`/accounts/${id}`),
};

export default accountApi;

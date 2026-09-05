import axiosClient from './axiosClient.js';

const budgetApi = {
  list: (params) => axiosClient.get('/budgets', { params }),
  get: (id) => axiosClient.get(`/budgets/${id}`),
  create: (data) => axiosClient.post('/budgets', data),
  update: (id, data) => axiosClient.put(`/budgets/${id}`, data),
  remove: (id) => axiosClient.delete(`/budgets/${id}`),
};

export default budgetApi;

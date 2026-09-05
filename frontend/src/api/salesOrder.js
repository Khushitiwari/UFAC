import axiosClient from './axiosClient.js';

const salesOrderApi = {
  list: (params) => axiosClient.get('/sales-orders', { params }),
  get: (id) => axiosClient.get(`/sales-orders/${id}`),
  create: (data) => axiosClient.post('/sales-orders', data),
  update: (id, data) => axiosClient.put(`/sales-orders/${id}`, data),
  remove: (id) => axiosClient.delete(`/sales-orders/${id}`),
};

export default salesOrderApi;

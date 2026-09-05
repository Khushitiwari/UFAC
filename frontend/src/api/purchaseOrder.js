import axiosClient from './axiosClient.js';

const purchaseOrderApi = {
  list: (params) => axiosClient.get('/purchase-orders', { params }),
  get: (id) => axiosClient.get(`/purchase-orders/${id}`),
  create: (data) => axiosClient.post('/purchase-orders', data),
  update: (id, data) => axiosClient.put(`/purchase-orders/${id}`, data),
  remove: (id) => axiosClient.delete(`/purchase-orders/${id}`),
};

export default purchaseOrderApi;

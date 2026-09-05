import axiosClient from './axiosClient.js';

const vendorBillApi = {
  list: (params) => axiosClient.get('/vendor-bills', { params }),
  get: (id) => axiosClient.get(`/vendor-bills/${id}`),
  create: (data) => axiosClient.post('/vendor-bills', data),
  createFromPO: (data) => axiosClient.post('/vendor-bills/from-purchase-order', data),
  update: (id, data) => axiosClient.put(`/vendor-bills/${id}`, data),
  remove: (id) => axiosClient.delete(`/vendor-bills/${id}`),
};

export default vendorBillApi;

import axiosClient from './axiosClient.js';

const paymentApi = {
  list: (params) => axiosClient.get('/payments', { params }),
  get: (id) => axiosClient.get(`/payments/${id}`),
  create: (data) => axiosClient.post('/payments', data),
  remove: (id) => axiosClient.delete(`/payments/${id}`),
};

export default paymentApi;

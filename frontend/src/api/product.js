import axiosClient from './axiosClient.js';

const productApi = {
  list: (params) => axiosClient.get('/products', { params }),
  get: (id) => axiosClient.get(`/products/${id}`),
  create: (data) => axiosClient.post('/products', data),
  update: (id, data) => axiosClient.put(`/products/${id}`, data),
  remove: (id) => axiosClient.delete(`/products/${id}`),
};

export default productApi;

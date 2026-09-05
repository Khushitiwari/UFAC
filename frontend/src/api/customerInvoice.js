import axiosClient from './axiosClient.js';

const customerInvoiceApi = {
  list: (params) => axiosClient.get('/customer-invoices', { params }),
  get: (id) => axiosClient.get(`/customer-invoices/${id}`),
  create: (data) => axiosClient.post('/customer-invoices', data),
  createFromSO: (data) => axiosClient.post('/customer-invoices/from-sales-order', data),
  update: (id, data) => axiosClient.put(`/customer-invoices/${id}`, data),
  remove: (id) => axiosClient.delete(`/customer-invoices/${id}`),
};

export default customerInvoiceApi;

import axiosClient from './axiosClient.js';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  me: () => axiosClient.get('/auth/me'),
};

export const contactsApi = {
  list: (params) => axiosClient.get('/contacts', { params }),
  get: (id) => axiosClient.get(`/contacts/${id}`),
  create: (data) => axiosClient.post('/contacts', data),
  update: (id, data) => axiosClient.put(`/contacts/${id}`, data),
  remove: (id) => axiosClient.delete(`/contacts/${id}`),
};

export const productsApi = {
  list: (params) => axiosClient.get('/products', { params }),
};

export const accountsApi = {
  list: (params) => axiosClient.get('/accounts', { params }),
};

export const reportsApi = {
  balanceSheet: (params) => axiosClient.get('/reports/balance-sheet', { params }),
  profitAndLoss: (params) => axiosClient.get('/reports/profit-and-loss', { params }),
  budget: (params) => axiosClient.get('/reports/budget', { params }),
};

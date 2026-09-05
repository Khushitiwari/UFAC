import axiosClient from './axiosClient.js';

const contactApi = {
  list: (params) => axiosClient.get('/contacts', { params }),
  get: (id) => axiosClient.get(`/contacts/${id}`),
  create: (data) => axiosClient.post('/contacts', data),
  createPortalUser: (id, data) => axiosClient.post(`/contacts/${id}/portal-user`, data),
  update: (id, data) => axiosClient.put(`/contacts/${id}`, data),
  remove: (id) => axiosClient.delete(`/contacts/${id}`),
};

export default contactApi;

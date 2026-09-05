import axiosClient from './axiosClient.js';

const dashboardApi = {
  summary: () => axiosClient.get('/dashboard/summary', { skipErrorToast: true }),
};

export default dashboardApi;

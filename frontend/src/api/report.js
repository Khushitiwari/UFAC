import axiosClient from './axiosClient.js';

const reportApi = {
  balanceSheet: (params) => axiosClient.get('/reports/balance-sheet', { params }),
  profitLoss: (params) => axiosClient.get('/reports/profit-loss', { params }),
  budget: (params) => axiosClient.get('/reports/budget', { params }),
};

export default reportApi;

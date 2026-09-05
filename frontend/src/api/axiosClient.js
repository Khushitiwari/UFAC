import axios from 'axios';
import { showToast } from '../context/ToastContext.jsx';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ufac_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ufac_token');
      localStorage.removeItem('ufac_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (!error.config?.skipErrorToast) {
      const message = error.response?.data?.error || error.message || 'Request failed';
      showToast(message, 'error');
    }
    return Promise.reject(error);
  },
);

export default axiosClient;

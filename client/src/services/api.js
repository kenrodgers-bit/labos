import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('labos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('labos_token');
      localStorage.removeItem('labos_user');
    }
    return Promise.reject(error);
  }
);

export default api;

export function exportUrl(path, format = 'pdf') {
  return `${API_URL}${path}?format=${format}`;
}

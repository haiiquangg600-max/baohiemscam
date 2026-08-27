import axios from 'axios';

const api = axios.create({
  baseURL: 'https://baohiemscam-api.onrender.com/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/admin/login')) {
      localStorage.removeItem('admin_token');
    }
    return Promise.reject(err);
  }
);

export const tradersApi = {
  list: (params) => api.get('/traders', { params }),
  get: (id) => api.get(`/traders/${id}`),
  create: (formData) =>
    api.post('/traders', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.put(`/traders/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/traders/${id}`),
};

export const reportsApi = {
  list: (params) => api.get('/reports', { params }),
  get: (id) => api.get(`/reports/${id}`),
  create: (formData) =>
    api.post('/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateStatus: (id, status) => api.patch(`/reports/${id}/status`, { status }),
  remove: (id) => api.delete(`/reports/${id}`),
};

export const authApi = {
  login: async (data) => {
    const res = await api.post('/admin/login', data);
    if (res.data?.success && res.data?.data?.token) {
      localStorage.setItem('admin_token', res.data.data.token);
    }
    return res;
  },
  logout: async () => {
    try {
      await api.post('/admin/logout');
    } finally {
      localStorage.removeItem('admin_token');
    }
  },
  me: () => api.get('/admin/me'),
};

export const statsApi = {
  get: () => api.get('/admin/stats'),
  logSearch: (q) => api.post('/search-log', { q }),
};

export default api;

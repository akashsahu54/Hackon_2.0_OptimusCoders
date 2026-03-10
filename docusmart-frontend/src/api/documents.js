import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('docusmart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('docusmart_token');
      localStorage.removeItem('docusmart_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const documentsApi = {
  upload: (formData) => apiClient.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: (params) => apiClient.get('/documents', { params }),
  get: (id) => apiClient.get(`/documents/${id}`),
  delete: (id) => apiClient.delete(`/documents/${id}`),
};

export const reportsApi = {
  expense: (params) => apiClient.post('/reports/expense', params),
};

export const analyticsApi = {
  overview: () => apiClient.get('/analytics/overview'),
};

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (data) => apiClient.post('/auth/register', data),
};

export default apiClient;

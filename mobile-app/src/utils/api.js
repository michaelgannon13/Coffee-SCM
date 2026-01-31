import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this to your deployed backend URL
const API_URL = 'http://localhost:3001'; // Change for production

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
  },
  getCurrentUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const batches = {
  getAll: (params) => api.get('/batches', { params }),
  getById: (id) => api.get(`/batches/${id}`),
  create: (data) => api.post('/batches', data),
  generateQR: (id) => api.get(`/batches/${id}/qr`),
};

export const farmers = {
  getById: (id) => api.get(`/farmers/${id}`),
};

export const price = {
  getCurrent: () => api.get('/coffee-price'),
};

export default api;

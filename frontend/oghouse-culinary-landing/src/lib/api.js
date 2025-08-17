import axios from 'axios';
import { validateAuthResponse } from './apiValidator';

const API_BASE_URL = 'https://og-house.onrender.com/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Food API - using your actual /api/food endpoint
export const foodAPI = {
  getFoods: () => api.get('/food'),
  getFoodById: (id) => api.get(`/food/${id}`),
  getFoodsByCategory: (category) => api.get(`/food?category=${category}`),
  getFoodsBySubCategory: (subCategory) => api.get(`/food?subCategory=${subCategory}`),
  searchFoods: (query) => api.get(`/food?search=${query}`),
  // Admin endpoints
  createFood: (foodData) => api.post('/food', foodData),
  updateFood: (id, foodData) => api.put(`/food/${id}`, foodData),
  deleteFood: (id) => api.delete(`/food/${id}`),
  uploadImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/food', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Cart API - using your actual /api/cart endpoint
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (foodId, quantity = 1) => api.post('/cart', { foodId, quantity }),
  updateQuantity: (foodId, quantity) => api.put(`/cart/${foodId}`, { quantity }),
  removeItem: (foodId) => api.delete(`/cart/${foodId}`),
  clearCart: () => api.delete('/cart'),
  getCartSummary: () => api.get('/cart/summary'),
};

// Order API - using your actual /api/orders endpoint
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  createOrderFromCart: (orderData) => api.post('/orders/from-cart', orderData),
  getOrders: () => api.get('/orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getMyOrders: () => api.get('/orders/my-orders'),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getOrderTracking: (orderId) => api.get(`/orders/tracking/${orderId}`),
  // Admin endpoints
  getAllOrders: () => api.get('/orders'),
  getOrdersByStatus: (status) => api.get(`/orders/by-status?status=${status}`),
  updateOrderTracking: (id, trackingData) => api.patch(`/orders/${id}`, trackingData),
};

// Notification API - using your actual notification service
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  // Admin endpoints
  sendNotification: (notificationData) => api.post('/notifications/send', notificationData),
  getAdminNotifications: () => api.get('/notifications/admin'),
};

// Admin API - using your actual admin endpoints
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  getSystemStats: () => api.get('/admin/stats'),
};

// Test API connection
export const testAPI = {
  testConnection: () => api.get('/test'),
};

export default api;

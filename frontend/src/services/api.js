
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
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

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    );
  }
);

// Auth Service
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Books Service
export const bookApi = {
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  search: (query) => api.get('/books/search', { params: { query } }),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

// Categories Service
export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Borrowing Service
export const borrowApi = {
  request: (data) => api.post('/borrow/request', data),
  approve: (id, data) => api.put(`/borrow/${id}/approve`, data || {}),
  reject: (id, data) => api.put(`/borrow/${id}/reject`, data || {}),
  issue: (id, data) => api.put(`/borrow/${id}/issue`, data || {}),
  returnBook: (id, data) => api.put(`/borrow/${id}/return`, data || {}),
  getMyBooks: () => api.get('/borrow/my-books'),
  getHistory: () => api.get('/borrow/history'),
  getStudentHistory: (userId) => api.get(`/borrow/user/${userId}`),
  getAll: (status) => api.get('/borrow/all', { params: { status } }),
  getRequests: () => api.get('/borrow/requests'),
  getOverdue: () => api.get('/borrow/overdue'),
};

// Fines Service
export const fineApi = {
  getMyFines: () => api.get('/fines/my-fines'),
  getAll: (status) => api.get('/fines/all', { params: { status } }),
  payFine: (id) => api.put(`/fines/${id}/pay`),
};

// Notifications Service
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Wishlist Service
export const wishlistApi = {
  getAll: () => api.get('/wishlist'),
  add: (bookId) => api.post(`/wishlist/${bookId}`),
  remove: (bookId) => api.delete(`/wishlist/${bookId}`),
};

// AI Recommendations Service
export const recommendationApi = {
  getMyRecommendations: (limit = 8) =>
    api.get('/recommendations/me', { params: { limit } }),
  getSimilar: (bookId, limit = 4) =>
    api.get(`/recommendations/similar/${bookId}`, { params: { limit } }),
  getPopular: (limit = 8) =>
    api.get('/recommendations/popular', { params: { limit } }),
  getPreferences: () => api.get('/recommendations/preferences'),
  updatePreferences: (data) =>
    api.put('/recommendations/preferences', data),
};

// Dashboard Service
export const dashboardApi = {
  getStudent: () => api.get('/dashboard/student'),
  getLibrarian: () => api.get('/dashboard/librarian'),
  getAdmin: () => api.get('/dashboard/admin'),
};

// Admin Service
export const adminApi = {
  getUsers: (role) => api.get('/admin/users', { params: { role } }),
  createLibrarian: (data) => api.post('/admin/librarians', data),
  toggleStatus: (id, status) =>
    api.put(`/admin/users/${id}/status`, { status }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

export default api;

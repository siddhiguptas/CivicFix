import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_BASE_URL}${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    CREATE_DEMO_USERS: '/auth/create-demo-users',
  },
  // Grievances
  GRIEVANCES: {
    CREATE: '/grievances/',
    LIST: '/grievances/',
    GET: (id: string) => `/grievances/${id}`,
    UPDATE: (id: string) => `/grievances/${id}`,
    DELETE: (id: string) => `/grievances/${id}`,
  },
  // Images
  IMAGES: {
    UPLOAD: '/images/upload',
    ANALYZE: '/images/analyze',
    DELETE: (id: string) => `/images/${id}`,
  },
  // Chatbot
  CHATBOT: {
    CHAT: '/chatbot/chat',
  },
  // Admin
  ADMIN: {
    GRIEVANCES: '/admin/grievances',
    USERS: '/admin/users',
    STATS: '/admin/stats/overview',
    ASSIGN_DEPARTMENT: (id: string) => `/admin/grievances/${id}/assign`,
    UPDATE_STATUS: (id: string) => `/admin/grievances/${id}/status`,
  },
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications/',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    DELETE: (id: string) => `/notifications/${id}`,
  },
  // Departments
  DEPARTMENTS: {
    LIST: '/departments/',
    CREATE: '/departments/',
    GET: (id: string) => `/departments/${id}`,
    UPDATE: (id: string) => `/departments/${id}`,
    DELETE: (id: string) => `/departments/${id}`,
    INITIALIZE: '/departments/initialize',
    MY_GRIEVANCES: '/departments/grievances/my',
    GRIEVANCES: (id: string) => `/departments/${id}/grievances`,
    STATS: (id: string) => `/departments/${id}/stats`,
  },
} as const;

export default api;

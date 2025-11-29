// src/services/api.ts
import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add the x-api-key and the JWT on every request
api.interceptors.request.use(
  (config) => {
    // 1. Add the x-api-key
    const apiKey = (import.meta as any).env.VITE_API_KEY;
    if (apiKey) {
      config.headers['x-api-key'] = apiKey;
    }

    // 2. Add the JWT from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration and global errors (no changes needed here)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the error is 401 Unauthorized, log the user out
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - possibly expired token.');
      // Clear token from localStorage
      localStorage.removeItem('authToken');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// The setAuthToken function is no longer needed.
// export const setAuthToken = (token: string | null) => { ... };

export default api;
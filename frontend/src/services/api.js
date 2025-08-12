import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Changed to backend port
  timeout: 5000, // Reduced timeout to prevent resource exhaustion
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// First response interceptor: Add retry mechanism
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Only retry GET requests to avoid side effects with mutations
    if (error.config && error.config.method === 'get' && !error.config._isRetry) {
      error.config._isRetry = true;
      try {
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await api.request(error.config);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }
    return Promise.reject(error);
  }
);

// Second response interceptor: Handle errors and show notifications
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      // Log access denied errors to console instead of showing to users
      console.error('Access denied:', error.response?.data?.message || 'You do not have permission to view these records.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again later.');
    } else if (error.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
      toast.error('Server is busy. Please try again later.');
    } else if (!error.response) {
      // Limit frequency of network error messages
      if (!window._lastNetworkErrorTime || Date.now() - window._lastNetworkErrorTime > 10000) {
        window._lastNetworkErrorTime = Date.now();
        toast.error('Network error. Please check your connection.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
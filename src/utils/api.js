import axios from 'axios';

const API_BASE_URL = 'https://ott.no1news.in';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for POST/PUT/DELETE requests
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('isAuthenticated', 'false');
      
      // Get current path for redirect
      const currentPath = window.location.hash.slice(1); // Remove the '#' from the hash
      
      // Only redirect if not already on login page
      if (!window.location.href.includes('/login')) {
        // Store current path and redirect to login
        window.location.href = `/#/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

export const watchlistAPI = {
  toggle: (contentId) => api.post('/api/watchlist/toggle/', { content_id: contentId }),
  getStatus: (contentId) => api.get(`/api/watchlist/status/?content_id=${contentId}`),
  getList: () => api.get('/api/watchlist/'),
};

export default api; 
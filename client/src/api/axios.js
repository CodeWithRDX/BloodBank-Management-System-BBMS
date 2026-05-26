import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 & 403 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const publicRoutes = ['/', '/login', '/register', '/inventory', '/about', '/forgot-password', '/locator'];
      const isPublic = publicRoutes.includes(window.location.pathname) || 
                       window.location.pathname.startsWith('/reset-password/');
      
      if (!isPublic) {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403 && error.response?.data?.passwordExpired === true) {
      if (window.location.pathname !== '/change-password') {
        window.location.href = '/change-password?expired=true';
      }
    }

    return Promise.reject(error);
  }
);

export default API;

import axios from 'axios';

// ✅ RUNTIME API URL - Build-time sabitlenmez!
// Electron içinde çalışıyorsa dinamik port kullan
const getBaseURL = () => {
  // Electron ortamında mı kontrol et
  if (window.electronAPI && window.electronAPI.isElectron) {
    // Backend port'unu al (Electron'dan inject edilir)
    const port = window.electronAPI.getBackendPort ? window.electronAPI.getBackendPort() : (window.__BACKEND_PORT__ || 3000);
    return `http://localhost:${port}/api`;
  }
  // Normal web ortamında - HTTPS değil, HTTP kullan!
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  // HTTPS kullanılıyorsa HTTP'ye çevir (local development için)
  if (apiUrl.startsWith('https://localhost') || apiUrl.startsWith('https://127.0.0.1')) {
    console.warn('⚠️ HTTPS detected for localhost, converting to HTTP');
    return apiUrl.replace('https://', 'http://');
  }
  return apiUrl;
};

// ✅ Axios config - withCredentials: false (SSL + cookie zorlamaz)
const api = axios.create({
  baseURL: getBaseURL(), // İlk değer, her request'te güncellenecek
  timeout: 10000,
  withCredentials: false, // ❌ SSL + cookie zorlamaz
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Her request'te baseURL'i runtime'da güncelle + auth token ekle
api.interceptors.request.use(
  (config) => {
    // BaseURL'i her request'te runtime'da hesapla (port değişikliklerini yakala)
    config.baseURL = getBaseURL();
    
    // Auth token ekle
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no token and not on login/register page, log warning
      if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
        console.warn('⚠️ No access token found for request:', config.url);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if it's already a retry or if it's a login/register request
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Use axios directly to avoid circular dependency
          let refreshURL;
          if (window.electronAPI && window.electronAPI.isElectron) {
            const port = window.electronAPI.getBackendPort ? window.electronAPI.getBackendPort() : (window.__BACKEND_PORT__ || 3000);
            refreshURL = `http://localhost:${port}/api/auth/refresh`;
          } else {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            // HTTPS kullanılıyorsa HTTP'ye çevir
            const baseUrl = apiUrl.startsWith('https://localhost') || apiUrl.startsWith('https://127.0.0.1')
              ? apiUrl.replace('https://', 'http://')
              : apiUrl;
            refreshURL = `${baseUrl}/auth/refresh`;
          }
          const response = await axios.post(
            refreshURL,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const { accessToken } = response.data.data;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear all auth data and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // If 401 and no refresh token or refresh failed, redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      const token = localStorage.getItem('accessToken');
      if (!token && window.location.pathname !== '/login') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;


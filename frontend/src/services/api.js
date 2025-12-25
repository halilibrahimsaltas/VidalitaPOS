import axios from 'axios';

// ✅ RUNTIME API URL - Build-time sabitlenmez!
// Electron içinde çalışıyorsa dinamik port kullan
const getBaseURL = () => {
  // Electron ortamında mı kontrol et
  if (window.electronAPI && window.electronAPI.isElectron) {
    // Backend port'unu al (Electron'dan inject edilir)
    // Önce window.__BACKEND_PORT__ kontrol et (en güncel)
    let port = null;
    if (typeof window !== 'undefined' && window.__BACKEND_PORT__) {
      port = window.__BACKEND_PORT__;
    } else if (window.electronAPI && window.electronAPI.getBackendPort) {
      port = window.electronAPI.getBackendPort();
    }
    
    // Port yoksa, backend henüz başlamadı demektir
    // Bu durumda default 3000 döndür ama interceptor'da retry yapılacak
    if (!port) {
      console.warn('⚠️ Backend port not ready yet, using default 3000 (will retry)');
      return 'http://localhost:3000/api'; // Temporary, interceptor will update
    }
    
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
// Not: baseURL'i interceptor'da set ediyoruz, burada default değer
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Default, interceptor'da güncellenecek
  timeout: 10000,
  withCredentials: false, // ❌ SSL + cookie zorlamaz
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Her request'te baseURL'i runtime'da güncelle + auth token ekle
api.interceptors.request.use(
  (config) => {
    // Electron ortamında port kontrolü yap
    if (window.electronAPI && window.electronAPI.isElectron) {
      // Port'u al
      let port = null;
      if (typeof window !== 'undefined' && window.__BACKEND_PORT__) {
        port = window.__BACKEND_PORT__;
      } else if (window.electronAPI && window.electronAPI.getBackendPort) {
        port = window.electronAPI.getBackendPort();
      }
      
      // Port hazırsa kullan
      if (port) {
        config.baseURL = `http://localhost:${port}/api`;
        
        // Debug: İlk request'te port bilgisini logla
        if (!config._portLogged) {
          console.log('🌐 API BaseURL:', config.baseURL, '(Port:', port + ')');
          config._portLogged = true;
        }
      } else {
        // Port henüz hazır değil - backend başlamadı, request'i ertele
        // Bu durumda request'i iptal et ve retry yap
        config.baseURL = 'http://localhost:3000/api'; // Fallback (backend başlamadıysa)
        config._portNotReady = true;
        
        if (!config._portWarningLogged) {
          console.warn('⚠️ Backend port not available yet, request may fail');
          config._portWarningLogged = true;
        }
      }
    } else {
      // Web ortamında normal baseURL kullan
      config.baseURL = getBaseURL();
    }
    
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

// Response interceptor - Handle errors and retry with correct port
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Electron ortamında port hatası varsa retry yap
    if (window.electronAPI && window.electronAPI.isElectron) {
      // Connection refused veya port hatası varsa ve port henüz hazır değilse retry
      if (
        (error.code === 'ECONNREFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('Failed to fetch')) &&
        originalRequest._portNotReady &&
        !originalRequest._retriedPort
      ) {
        // Port'u tekrar kontrol et
        let port = null;
        if (typeof window !== 'undefined' && window.__BACKEND_PORT__) {
          port = window.__BACKEND_PORT__;
        } else if (window.electronAPI && window.electronAPI.getBackendPort) {
          port = window.electronAPI.getBackendPort();
        }
        
        if (port && port !== 3000) {
          console.log('🔄 Retrying request with correct port:', port);
          originalRequest._retriedPort = true;
          originalRequest.baseURL = `http://localhost:${port}/api`;
          return api(originalRequest);
        }
      }
    }

    // Don't retry if it's already a retry or if it's a login/register request
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Use axios directly to avoid circular dependency
          let refreshURL;
          if (window.electronAPI && window.electronAPI.isElectron) {
            // Port'u al (getBaseURL mantığı ile aynı)
            let port = null;
            if (typeof window !== 'undefined' && window.__BACKEND_PORT__) {
              port = window.__BACKEND_PORT__;
            } else if (window.electronAPI && window.electronAPI.getBackendPort) {
              port = window.electronAPI.getBackendPort();
            }
            if (!port || port === 3000) {
              throw new Error('Backend port not ready for token refresh');
            }
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


// Utility function to get full image URL
// Handles both relative paths and full URLs
// Works in both Electron and web environments
export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If already a full URL (http:// or https://), return as is
  // CDN URL'leri ve external URL'ler direkt döndürülür
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // HTTPS localhost'u HTTP'ye çevir (local development için)
    if (url.startsWith('https://localhost') || url.startsWith('https://127.0.0.1')) {
      return url.replace('https://', 'http://');
    }
    // Diğer tüm external URL'ler (CDN, Instagram, vb.) olduğu gibi döndürülür
    return url;
  }
  
  // All uploads are served from backend
  let apiBaseUrl;
  if (window.electronAPI && window.electronAPI.isElectron) {
    // Electron ortamında dinamik port kullan
    const port = window.__BACKEND_PORT__ || 
                 (window.electronAPI.getBackendPort ? window.electronAPI.getBackendPort() : 3000);
    apiBaseUrl = `http://localhost:${port}`;
  } else {
    // Web ortamında
    apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Remove /api suffix if present (we want base URL, not API URL)
    // Backend'de uploads klasörü root'ta serve ediliyor, /api altında değil
    if (apiBaseUrl.endsWith('/api')) {
      apiBaseUrl = apiBaseUrl.slice(0, -4);
    }
    // HTTPS kullanılıyorsa HTTP'ye çevir (local development için)
    if (apiBaseUrl.startsWith('https://localhost') || apiBaseUrl.startsWith('https://127.0.0.1')) {
      apiBaseUrl = apiBaseUrl.replace('https://', 'http://');
    }
  }
  
  // Ensure URL starts with / and combine with base URL
  return url.startsWith('/') ? `${apiBaseUrl}${url}` : `${apiBaseUrl}/${url}`;
};


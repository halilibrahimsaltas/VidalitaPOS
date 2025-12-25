import api from './api';

// Helper function to get full image URL
const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) {
    // HTTPS localhost'u HTTP'ye çevir (local development için)
    if (url.startsWith('https://localhost') || url.startsWith('https://127.0.0.1')) {
      return url.replace('https://', 'http://');
    }
    return url; // Already a full URL
  }
  
  // All uploads are served from backend
  let apiBaseUrl;
  if (window.electronAPI && window.electronAPI.isElectron) {
    // Electron ortamında dinamik port kullan
    const port = window.electronAPI.getBackendPort ? window.electronAPI.getBackendPort() : (window.__BACKEND_PORT__ || 3000);
    apiBaseUrl = `http://localhost:${port}`;
  } else {
    apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // HTTPS kullanılıyorsa HTTP'ye çevir (local development için)
    if (apiBaseUrl.startsWith('https://localhost') || apiBaseUrl.startsWith('https://127.0.0.1')) {
      apiBaseUrl = apiBaseUrl.replace('https://', 'http://');
    }
  }
  return url.startsWith('/') ? `${apiBaseUrl}${url}` : `${apiBaseUrl}/${url}`;
};

export const productService = {
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getByBarcode: async (barcode) => {
    const response = await api.get(`/products/barcode/${barcode}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Ensure the returned URL is a full URL
    if (response.data.data?.url) {
      response.data.data.url = getImageUrl(response.data.data.url);
    }
    return response.data;
  },
  
  getImageUrl, // Export helper for use in components

  importProducts: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadTemplate: async () => {
    const response = await api.get('/products/import/template', {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product-import-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  getAvailableImages: async () => {
    const response = await api.get('/products/available-images');
    return response.data;
  },
};


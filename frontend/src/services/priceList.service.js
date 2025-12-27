import api from './api';

export const priceListService = {
  getAll: async (params = {}) => {
    const response = await api.get('/price-lists', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/price-lists/${id}`);
    return response.data;
  },

  getDefault: async () => {
    const response = await api.get('/price-lists/default');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/price-lists', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/price-lists/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/price-lists/${id}`);
    return response.data;
  },

  // Product Price operations
  getProductPrices: async (productId) => {
    const response = await api.get(`/price-lists/products/${productId}/prices`);
    return response.data;
  },

  getPriceListProducts: async (priceListId) => {
    const response = await api.get(`/price-lists/${priceListId}/products`);
    return response.data;
  },

  setProductPrice: async (productId, priceListId, price) => {
    const response = await api.post(`/price-lists/products/${productId}/prices/${priceListId}`, { price });
    return response.data;
  },

  setProductPrices: async (productId, prices) => {
    // prices should be an array of { priceListId, price }
    const response = await api.post(`/price-lists/products/${productId}/prices`, { prices });
    return response.data;
  },

  deleteProductPrice: async (productId, priceListId) => {
    const response = await api.delete(`/price-lists/products/${productId}/prices/${priceListId}`);
    return response.data;
  },
};


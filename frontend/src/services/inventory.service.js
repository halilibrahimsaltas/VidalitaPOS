import api from './api';

export const inventoryService = {
  getAll: async (params = {}) => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  getByBranch: async (branchId) => {
    const response = await api.get(`/inventory/branch/${branchId}`);
    return response.data;
  },

  getByProduct: async (productId) => {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  },

  getItem: async (branchId, productId) => {
    const response = await api.get(`/inventory/${branchId}/${productId}`);
    return response.data;
  },

  createOrUpdate: async (data) => {
    const response = await api.post('/inventory', data);
    return response.data;
  },

  getLowStock: async (branchId = null) => {
    const params = branchId ? { branchId } : {};
    const response = await api.get('/inventory/low-stock', { params });
    return response.data;
  },
};


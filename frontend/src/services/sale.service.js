import api from './api';

export const saleService = {
  getAll: async (params = {}) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  getByNumber: async (saleNumber) => {
    const response = await api.get(`/sales/number/${saleNumber}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/sales', data);
    return response.data;
  },

  refund: async (id, items = null) => {
    const response = await api.post(`/sales/${id}/refund`, { items });
    return response.data;
  },

  cancel: async (id) => {
    const response = await api.post(`/sales/${id}/cancel`);
    return response.data;
  },

  getReceipt: async (id) => {
    const response = await api.get(`/sales/${id}/receipt`);
    return response.data;
  },
};


import api from './api';

export const stockAdjustmentService = {
  getAll: async (params = {}) => {
    const response = await api.get('/stock-adjustments', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/stock-adjustments/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/stock-adjustments', data);
    return response.data;
  },
};


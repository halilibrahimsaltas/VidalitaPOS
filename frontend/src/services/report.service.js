import api from './api';

export const reportService = {
  getDashboardOverview: async (params = {}) => {
    const response = await api.get('/reports/dashboard/overview', { params });
    return response.data;
  },

  getSalesSummary: async (params = {}) => {
    const response = await api.get('/reports/sales-summary', { params });
    return response.data;
  },

  getInventoryStatus: async (params = {}) => {
    const response = await api.get('/reports/inventory-status', { params });
    return response.data;
  },

  getTopProducts: async (params = {}) => {
    const response = await api.get('/reports/top-products', { params });
    return response.data;
  },

  getDebtSummary: async (params = {}) => {
    const response = await api.get('/reports/debt-summary', { params });
    return response.data;
  },
};


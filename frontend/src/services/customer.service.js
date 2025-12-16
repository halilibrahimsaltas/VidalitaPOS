import api from './api';

export const customerService = {
  getAll: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  getTransactions: async (customerId, params = {}) => {
    const response = await api.get(`/customers/${customerId}/transactions`, { params });
    return response.data;
  },

  getDebt: async (customerId) => {
    const response = await api.get(`/customers/${customerId}/debt`);
    return response.data;
  },

  recordPayment: async (customerId, data) => {
    const response = await api.post(`/customers/${customerId}/payments`, data);
    return response.data;
  },

  getStatistics: async (customerId, params = {}) => {
    const response = await api.get(`/customers/${customerId}/statistics`, { params });
    return response.data;
  },
};


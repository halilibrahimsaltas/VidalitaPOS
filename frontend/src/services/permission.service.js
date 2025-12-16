import api from './api';

export const permissionService = {
  getAllPermissions: async () => {
    const response = await api.get('/api/permissions');
    return response.data;
  },

  getUserPermissions: async (userId) => {
    const response = await api.get(`/api/users/${userId}/permissions`);
    return response.data;
  },

  updateUserPermissions: async (userId, permissionIds) => {
    const response = await api.put(`/api/users/${userId}/permissions`, {
      permissionIds,
    });
    return response.data;
  },
};


import api from './api';

export const permissionService = {
  getAllPermissions: async () => {
    const response = await api.get('/permissions');
    return response.data;
  },

  getUserPermissions: async (userId) => {
    const response = await api.get(`/users/${userId}/permissions`);
    return response.data;
  },

  updateUserPermissions: async (userId, permissionIds) => {
    const response = await api.put(`/users/${userId}/permissions`, {
      permissionIds,
    });
    return response.data;
  },
};

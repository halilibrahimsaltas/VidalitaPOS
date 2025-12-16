import { useQuery, useMutation, useQueryClient } from 'react-query';
import { permissionService } from '../services/permission.service';

export const usePermissions = () => {
  return useQuery(
    ['permissions'],
    async () => {
      const response = await permissionService.getAllPermissions();
      return response.data;
    }
  );
};

export const useUserPermissions = (userId) => {
  return useQuery(
    ['user-permissions', userId],
    async () => {
      const response = await permissionService.getUserPermissions(userId);
      return response.data;
    },
    {
      enabled: !!userId,
    }
  );
};

export const useUpdateUserPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ userId, permissionIds }) => {
      const response = await permissionService.updateUserPermissions(userId, permissionIds);
      return response.data;
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['user-permissions', variables.userId]);
        queryClient.invalidateQueries('users');
      },
    }
  );
};


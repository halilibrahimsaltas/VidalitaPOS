import { useQuery, useMutation, useQueryClient } from 'react-query';
import { userService } from '../services/user.service';

export const useUsers = (filters = {}) => {
  return useQuery(
    ['users', filters],
    () => userService.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useUser = (id) => {
  return useQuery(
    ['user', id],
    () => userService.getById(id),
    {
      enabled: !!id,
    }
  );
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) => userService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) => userService.update(id, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['user', variables.id]);
      },
    }
  );
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => userService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, role }) => userService.updateRole(id, role),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['user', variables.id]);
      },
    }
  );
};


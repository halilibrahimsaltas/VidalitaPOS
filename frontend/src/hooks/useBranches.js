import { useQuery, useMutation, useQueryClient } from 'react-query';
import { branchService } from '../services/branch.service';

export const useBranches = (filters = {}) => {
  return useQuery(
    ['branches', filters],
    () => branchService.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  );
};

export const useBranch = (id) => {
  return useQuery(
    ['branch', id],
    () => branchService.getById(id),
    {
      enabled: !!id,
    }
  );
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) => branchService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('branches');
      },
    }
  );
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) => branchService.update(id, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('branches');
        queryClient.invalidateQueries(['branch', variables.id]);
      },
    }
  );
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => branchService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('branches');
      },
    }
  );
};


import { useQuery, useMutation, useQueryClient } from 'react-query';
import { categoryService } from '../services/category.service';

export const useCategories = (filters = {}) => {
  return useQuery(
    ['categories', filters],
    () => categoryService.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useRootCategories = () => {
  return useQuery(
    'rootCategories',
    () => categoryService.getRoots(),
    {
      staleTime: 30000,
    }
  );
};

export const useCategory = (id) => {
  return useQuery(
    ['category', id],
    () => categoryService.getById(id),
    {
      enabled: !!id,
    }
  );
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) => categoryService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        queryClient.invalidateQueries('rootCategories');
      },
    }
  );
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) => categoryService.update(id, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('categories');
        queryClient.invalidateQueries('rootCategories');
        queryClient.invalidateQueries(['category', variables.id]);
      },
    }
  );
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => categoryService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        queryClient.invalidateQueries('rootCategories');
      },
    }
  );
};


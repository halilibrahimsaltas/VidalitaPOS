import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productService } from '../services/product.service';

export const useProducts = (filters = {}) => {
  return useQuery(
    ['products', filters],
    () => productService.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useProduct = (id) => {
  return useQuery(
    ['product', id],
    () => productService.getById(id),
    {
      enabled: !!id,
    }
  );
};

export const useProductByBarcode = (barcode) => {
  return useQuery(
    ['product', 'barcode', barcode],
    () => productService.getByBarcode(barcode),
    {
      enabled: !!barcode,
      retry: false,
    }
  );
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) => productService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
      },
    }
  );
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) => productService.update(id, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('products');
        queryClient.invalidateQueries(['product', variables.id]);
      },
    }
  );
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => productService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
      },
    }
  );
};


import { useQuery, useMutation, useQueryClient } from 'react-query';
import { priceListService } from '../services/priceList.service';

export const usePriceLists = (filters = {}) => {
  return useQuery(
    ['priceLists', filters],
    () => priceListService.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const usePriceList = (id) => {
  return useQuery(
    ['priceList', id],
    () => priceListService.getById(id),
    {
      enabled: !!id,
    }
  );
};

export const useDefaultPriceList = () => {
  return useQuery(
    ['priceList', 'default'],
    () => priceListService.getDefault(),
    {
      staleTime: 60000, // Cache for 1 minute
    }
  );
};

export const useCreatePriceList = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data) => priceListService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('priceLists');
      },
    }
  );
};

export const useUpdatePriceList = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }) => priceListService.update(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('priceLists');
        queryClient.invalidateQueries(['priceList', id]);
      },
    }
  );
};

export const useDeletePriceList = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (id) => priceListService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('priceLists');
      },
    }
  );
};

export const useProductPrices = (productId) => {
  return useQuery(
    ['productPrices', productId],
    () => priceListService.getProductPrices(productId),
    {
      enabled: !!productId,
      staleTime: 30000,
    }
  );
};

export const useSetProductPrices = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ productId, prices }) => priceListService.setProductPrices(productId, prices),
    {
      onSuccess: (_, { productId }) => {
        queryClient.invalidateQueries(['productPrices', productId]);
        queryClient.invalidateQueries(['product', productId]);
        queryClient.invalidateQueries('products');
      },
    }
  );
};


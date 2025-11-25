import { useQuery, useMutation, useQueryClient } from 'react-query';
import { saleService } from '../services/sale.service';

export const useSales = (filters = {}) => {
  return useQuery(
    ['sales', filters],
    () => saleService.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useSale = (id) => {
  return useQuery(
    ['sale', id],
    () => saleService.getById(id),
    {
      enabled: !!id,
    }
  );
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) => saleService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sales');
        queryClient.invalidateQueries('inventory');
      },
    }
  );
};

export const useRefundSale = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, items }) => saleService.refund(id, items),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sales');
        queryClient.invalidateQueries('inventory');
      },
    }
  );
};


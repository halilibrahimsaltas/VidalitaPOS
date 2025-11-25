import { useQuery, useMutation, useQueryClient } from 'react-query';
import { stockAdjustmentService } from '../services/stockAdjustment.service';

export const useStockAdjustments = (filters = {}) => {
  return useQuery(
    ['stockAdjustments', filters],
    () => stockAdjustmentService.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useStockAdjustment = (id) => {
  return useQuery(
    ['stockAdjustment', id],
    () => stockAdjustmentService.getById(id),
    {
      enabled: !!id,
    }
  );
};

export const useCreateStockAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) => stockAdjustmentService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stockAdjustments');
        queryClient.invalidateQueries('inventory');
      },
    }
  );
};


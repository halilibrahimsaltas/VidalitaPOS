import { useQuery, useMutation, useQueryClient } from 'react-query';
import { stockTransferService } from '../services/stockTransfer.service';

export const useStockTransfers = (filters = {}) => {
  return useQuery(
    ['stockTransfers', filters],
    () => stockTransferService.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useStockTransfer = (id) => {
  return useQuery(
    ['stockTransfer', id],
    () => stockTransferService.getById(id),
    {
      enabled: !!id,
    }
  );
};

export const useCreateStockTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) => stockTransferService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stockTransfers');
        queryClient.invalidateQueries('inventory');
      },
    }
  );
};

export const useCompleteStockTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => stockTransferService.complete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stockTransfers');
        queryClient.invalidateQueries('inventory');
      },
    }
  );
};

export const useCancelStockTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => stockTransferService.cancel(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stockTransfers');
      },
    }
  );
};


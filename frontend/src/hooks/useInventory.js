import { useQuery, useMutation, useQueryClient } from 'react-query';
import { inventoryService } from '../services/inventory.service';

export const useInventory = (filters = {}) => {
  return useQuery(
    ['inventory', filters],
    () => inventoryService.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useInventoryByBranch = (branchId) => {
  return useQuery(
    ['inventory', 'branch', branchId],
    () => inventoryService.getByBranch(branchId),
    {
      enabled: !!branchId,
      staleTime: 30000,
    }
  );
};

export const useInventoryByProduct = (productId) => {
  return useQuery(
    ['inventory', 'product', productId],
    () => inventoryService.getByProduct(productId),
    {
      enabled: !!productId,
      staleTime: 30000,
    }
  );
};

export const useLowStockItems = (branchId = null) => {
  return useQuery(
    ['inventory', 'low-stock', branchId],
    () => inventoryService.getLowStock(branchId),
    {
      staleTime: 30000,
    }
  );
};

export const useCreateOrUpdateInventory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) => inventoryService.createOrUpdate(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory');
      },
    }
  );
};


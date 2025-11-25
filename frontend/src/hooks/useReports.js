import { useQuery } from 'react-query';
import { reportService } from '../services/report.service';

export const useDashboardOverview = (filters = {}) => {
  return useQuery(
    ['dashboardOverview', filters],
    () => reportService.getDashboardOverview(filters),
    {
      staleTime: 60000, // 1 minute
      refetchInterval: 300000, // 5 minutes
    }
  );
};

export const useSalesSummary = (filters = {}) => {
  return useQuery(
    ['salesSummary', filters],
    () => reportService.getSalesSummary(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useInventoryStatus = (filters = {}) => {
  return useQuery(
    ['inventoryStatus', filters],
    () => reportService.getInventoryStatus(filters),
    {
      staleTime: 30000,
    }
  );
};

export const useTopProducts = (filters = {}) => {
  return useQuery(
    ['topProducts', filters],
    () => reportService.getTopProducts(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useDebtSummary = (filters = {}) => {
  return useQuery(
    ['debtSummary', filters],
    () => reportService.getDebtSummary(filters),
    {
      staleTime: 30000,
    }
  );
};


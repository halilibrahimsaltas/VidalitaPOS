import { useQuery } from 'react-query';
import { reportService } from '../services/report.service';

export const useSalesSummary = (filters = {}) => {
  return useQuery(
    ['reports', 'sales-summary', filters],
    () => reportService.getSalesSummary(filters),
    {
      keepPreviousData: true,
      staleTime: 60000, // 1 minute
    }
  );
};

export const useInventoryStatus = (filters = {}) => {
  return useQuery(
    ['reports', 'inventory-status', filters],
    () => reportService.getInventoryStatus(filters),
    {
      keepPreviousData: true,
      staleTime: 60000,
    }
  );
};

export const useTopProducts = (filters = {}) => {
  return useQuery(
    ['reports', 'top-products', filters],
    () => reportService.getTopProducts(filters),
    {
      keepPreviousData: true,
      staleTime: 60000,
    }
  );
};

export const useDebtSummary = (filters = {}) => {
  return useQuery(
    ['reports', 'debt-summary', filters],
    () => reportService.getDebtSummary(filters),
    {
      keepPreviousData: true,
      staleTime: 60000,
    }
  );
};

export const useCashRegisterReport = (filters = {}) => {
  return useQuery(
    ['reports', 'cash-register', filters],
    () => reportService.getCashRegisterReport(filters),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  );
};

export const useDashboardOverview = (filters = {}) => {
  return useQuery(
    ['reports', 'dashboard-overview', filters],
    () => reportService.getDashboardOverview(filters),
    {
      keepPreviousData: true,
      staleTime: 60000,
    }
  );
};

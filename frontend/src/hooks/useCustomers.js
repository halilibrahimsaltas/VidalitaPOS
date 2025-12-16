import { useQuery, useMutation, useQueryClient } from 'react-query';
import { customerService } from '../services/customer.service';

export const useCustomers = (filters = {}) => {
  return useQuery(
    ['customers', filters],
    () => customerService.getAll(filters),
    {
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useCustomer = (id) => {
  return useQuery(
    ['customer', id],
    () => customerService.getById(id),
    {
      enabled: !!id,
    }
  );
};

export const useCustomerTransactions = (customerId, filters = {}) => {
  return useQuery(
    ['customerTransactions', customerId, filters],
    () => customerService.getTransactions(customerId, filters),
    {
      enabled: !!customerId,
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};

export const useCustomerDebt = (customerId) => {
  return useQuery(
    ['customerDebt', customerId],
    () => customerService.getDebt(customerId),
    {
      enabled: !!customerId,
      staleTime: 30000,
    }
  );
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data) => customerService.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
      },
    }
  );
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }) => customerService.update(id, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('customers');
        queryClient.invalidateQueries(['customer', variables.id]);
      },
    }
  );
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (id) => customerService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
      },
    }
  );
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({ customerId, data }) => customerService.recordPayment(customerId, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries('customers');
        queryClient.invalidateQueries(['customer', variables.customerId]);
        queryClient.invalidateQueries(['customerTransactions', variables.customerId]);
        queryClient.invalidateQueries(['customerDebt', variables.customerId]);
        queryClient.invalidateQueries(['customerStatistics', variables.customerId]);
      },
    }
  );
};

export const useCustomerStatistics = (customerId, filters = {}) => {
  return useQuery(
    ['customerStatistics', customerId, filters],
    () => customerService.getStatistics(customerId, filters),
    {
      enabled: !!customerId,
      keepPreviousData: true,
      staleTime: 30000,
    }
  );
};


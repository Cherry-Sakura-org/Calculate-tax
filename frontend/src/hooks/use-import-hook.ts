import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import type { ImportResponse } from '../types/order';

export const useImportOrders = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ImportResponse, Error, File>({
    mutationFn: (file: File) => ordersApi.import(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    importOrders: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};
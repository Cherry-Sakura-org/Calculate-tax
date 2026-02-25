import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';

export const useImportOrders = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
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
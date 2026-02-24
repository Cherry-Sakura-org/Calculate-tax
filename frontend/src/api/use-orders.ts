import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ordersApi } from './orders';
import type { OrdersParams } from '../types/order';

export const ordersKeys = {
    all: ['orders'] as const,
    lists: () => [...ordersKeys.all, 'list'] as const,
    list: (params: OrdersParams) => [...ordersKeys.lists(), params] as const,
};

export const useOrders = (params: OrdersParams = {}) =>
    useQuery({
        queryKey: ordersKeys.list(params),
        queryFn: () => ordersApi.list(params),
    });

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ordersApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersKeys.lists() }),
        onError: () => toast.error('Failed to create order'),
    });
};

export const useImportOrders = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ordersApi.import,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersKeys.lists() }),
        onError: () => toast.error('Failed to import orders'),
    });
};

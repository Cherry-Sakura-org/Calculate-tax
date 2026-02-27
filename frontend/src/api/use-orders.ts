import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

const PAGE_SIZE = 25;

export const useInfiniteOrders = (params: Omit<OrdersParams, 'page' | 'size'> = {}, enabled = true) =>
    useInfiniteQuery({
        queryKey: ordersKeys.list({ ...params, size: PAGE_SIZE }),
        queryFn: ({ pageParam }) => ordersApi.list({ ...params, page: pageParam, size: PAGE_SIZE }),
        initialPageParam: 0,
        enabled,
        getNextPageParam: (lastPage, allPages) => {
            const fetched = allPages.reduce((sum, p) => sum + p.items.length, 0);
            return fetched < lastPage.total ? allPages.length : undefined;
        },
    });

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ordersApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
            toast.success('Order created successfully');
        },
        onError: (error) => {
            if (error && 'response' in error && (error as any).response?.status === 400) {
                toast.error('Invalid location - must be within NY State');
            } else {
                toast.error('Failed to create order');
            }
        },
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

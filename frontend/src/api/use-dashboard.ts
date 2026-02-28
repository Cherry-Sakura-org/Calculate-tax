import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from './dashboard';
import { ordersApi } from './orders';

export const dashboardKeys = {
    all: ['dashboard'] as const,
    data: () => [...dashboardKeys.all, 'data'] as const,
    countyBoundaries: () => [...dashboardKeys.all, 'county-boundaries'] as const,
    countyData: () => [...dashboardKeys.all, 'county-data'] as const,
};

export const useDashboard = () =>
    useQuery({
        queryKey: dashboardKeys.data(),
        queryFn: dashboardApi.get,
    });

export const useCountyBoundaries = () =>
    useQuery({
        queryKey: dashboardKeys.countyBoundaries(),
        queryFn: dashboardApi.getCountyBoundaries,
        staleTime: Infinity,
    });

export const useCountyData = () =>
    useQuery({
        queryKey: dashboardKeys.countyData(),
        queryFn: ordersApi.counties,
    });

export const useEvictCache = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: dashboardApi.evictCache,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
        },
    });
};

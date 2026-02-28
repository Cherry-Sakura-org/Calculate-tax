import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { ordersApi } from './orders';
import type { OrdersParams } from '../types/order';
import type { JurisdictionNode } from '../components/orders-table/filters/types';

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

export const useInfiniteOrders = (params: Omit<OrdersParams, 'page' | 'size'> = {}) =>
    useInfiniteQuery({
        queryKey: ordersKeys.list({ ...params, size: PAGE_SIZE }),
        queryFn: ({ pageParam }) => ordersApi.list({ ...params, page: pageParam, size: PAGE_SIZE }),
        initialPageParam: 0,
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

export const importFilesKeys = {
    all: ['importFiles'] as const,
    list: () => [...importFilesKeys.all, 'list'] as const,
};

export const useImportFiles = () =>
    useQuery({
        queryKey: importFilesKeys.list(),
        queryFn: () => ordersApi.importFiles({ size: 1000 }),
        select: (data) => data.content,
    });

export const useImportOrders = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ordersApi.import,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
            queryClient.invalidateQueries({ queryKey: importFilesKeys.all });
        },
        onError: () => toast.error('Failed to import orders'),
    });
};

export const useDownloadOrdersCsv = () =>
    useMutation({
        mutationFn: (params: Omit<OrdersParams, 'page' | 'size'> = {}) => ordersApi.downloadCsv(params),
        onError: () => toast.error('Failed to download CSV'),
    });

/** Known NY regions and the counties that belong to each. */
export const REGION_COUNTIES: Record<string, string[]> = {
    'NYC': [
        'New York', 'Kings', 'Queens', 'Bronx', 'Richmond',
    ],
    'Long Island': [
        'Nassau', 'Suffolk',
    ],
    'Hudson Valley': [
        'Westchester', 'Rockland', 'Orange', 'Dutchess', 'Putnam', 'Sullivan', 'Ulster',
    ],
    'Capital District': [
        'Albany', 'Rensselaer', 'Saratoga', 'Schenectady',
    ],
    'Upstate': [],   // fallback — any NY county not in another region
};

export const COUNTY_TO_REGION = new Map<string, string>();
for (const [region, counties] of Object.entries(REGION_COUNTIES)) {
    for (const c of counties) {
        COUNTY_TO_REGION.set(c.toLowerCase(), region);
    }
}

export const useJurisdictions = () => {
    const { data: counties, isLoading } = useQuery({
        queryKey: ['map', 'counties'],
        queryFn: ordersApi.counties,
        staleTime: 10 * 60 * 1000,
    });

    const tree = useMemo((): JurisdictionNode[] => {
        if (!counties?.length) return [];

        const regionMap = new Map<string, JurisdictionNode[]>();
        for (const region of Object.keys(REGION_COUNTIES)) {
            regionMap.set(region, []);
        }

        for (const c of counties) {
            const region = COUNTY_TO_REGION.get(c.county.toLowerCase()) ?? 'Upstate';
            const children = regionMap.get(region) ?? [];
            children.push({ id: c.county, label: c.county });
            regionMap.set(region, children);
        }

        const nodes: JurisdictionNode[] = [];
        for (const [region, children] of regionMap) {
            if (children.length === 0) continue;
            children.sort((a, b) => a.label.localeCompare(b.label));
            nodes.push({ id: `region:${region}`, label: region, children });
        }

        nodes.push({ id: 'region:Out of State', label: 'Out of State' });

        return nodes;
    }, [counties]);

    return { tree, isLoading };
};

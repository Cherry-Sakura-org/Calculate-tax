import { useState } from 'react';
import {
    createColumnHelper,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    type PaginationState,
} from '@tanstack/react-table';
import { DateTime } from 'luxon';
import type { Order } from '../../types/order';
// import { useOrders } from '../../api/use-orders'; // Uncomment when using real API data instead of mock data
import { mockOrders } from './mock-orders';

const columnHelper = createColumnHelper<Order>();

const formatRate = (value: number) => `${(value * 100).toFixed(4)}%`;

const columns = [
    columnHelper.display({
        id: 'expand',
        header: '',
        size: 48,
        cell: ({ row }) => (row.getCanExpand() ? null : undefined),
    }),
    columnHelper.accessor('id', {
        header: 'ID',
        size: 80,
        cell: (info) => info.getValue().slice(0, 8),
    }),
    columnHelper.accessor('latitude', {
        header: 'Latitude',
        cell: (info) => info.getValue().toFixed(6),
    }),
    columnHelper.accessor('longitude', {
        header: 'Longitude',
        cell: (info) => info.getValue().toFixed(6),
    }),
    columnHelper.accessor('subtotal', {
        header: 'Subtotal',
        cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('tax_amount', {
        header: 'Tax',
        cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('composite_rate', {
        header: 'Tax Rate',
        cell: (info) => formatRate(info.getValue()),
    }),
    columnHelper.accessor('jurisdictions', {
        header: 'Jurisdictions',
        cell: (info) => info.getValue().join(', '),
    }),
    columnHelper.accessor('created_at', {
        header: 'Created',
        cell: (info) => DateTime.fromISO(info.getValue()).toLocaleString(DateTime.DATETIME_SHORT),
    }),
];

export const useOrdersTableController = () => {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    // const { data, isLoading } = useOrders({
    //     page: pagination.pageIndex + 1,
    //     page_size: pagination.pageSize,
    // });

    // mock data - replace with real API call above
    const start = pagination.pageIndex * pagination.pageSize;
    const data = {
        items: mockOrders.slice(start, start + pagination.pageSize),
        total: mockOrders.length,
    };
    const isLoading = false;
    // end mock

    const table = useReactTable({
        data: data?.items ?? [],
        columns,
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        manualPagination: true,
        pageCount: data ? Math.ceil(data.total / pagination.pageSize) : -1,
        getRowCanExpand: () => true,
    });

    const totalRows = data?.total ?? 0;

    return { table, isLoading, pagination, setPagination, totalRows };
};

export { formatRate };

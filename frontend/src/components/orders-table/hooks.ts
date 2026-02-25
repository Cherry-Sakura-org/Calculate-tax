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
import { useOrders } from '../../api/use-orders';

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
    columnHelper.accessor('total_amount', {
        header: 'Total',
        cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('composite_tax_rate', {
        header: 'Tax Rate',
        cell: (info) => formatRate(info.getValue()),
    }),
    columnHelper.accessor('jurisdictions', {
        header: 'Jurisdictions',
        cell: (info) => info.getValue().join(', '),
    }),
    columnHelper.accessor('timestamp', {
        header: 'Created',
        cell: (info) => DateTime.fromISO(info.getValue()).toLocaleString(DateTime.DATETIME_SHORT),
    }),
];

export const useOrdersTableController = () => {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data, isLoading } = useOrders({
        page: pagination.pageIndex,
        size: pagination.pageSize,
    });

    const items = data?.items ?? [];
    const totalRows = data?.total ?? 0;

    const table = useReactTable({
        data: items,
        columns,
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        manualPagination: true,
        pageCount: totalRows > 0 ? Math.ceil(totalRows / pagination.pageSize) : -1,
        getRowCanExpand: () => true,
    });

    return { table, isLoading, pagination, setPagination, totalRows };
};

export { formatRate };

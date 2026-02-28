import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import {
    createColumnHelper,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useInfiniteOrders, useImportFiles } from '../../api/use-orders';
import { useCurrentUser } from '../../hooks/auth';
import type { Order, OrdersParams } from '../../types/order';
import {
    type TableFilterValues,
    INITIAL_FILTERS,
    filtersToParams,
} from './TableFilters';
import * as styles from './table-hooks.styles';

const columnHelper = createColumnHelper<Order>();

const formatRate = (value: number) => `${(value * 100).toFixed(4)}%`;

const MutedCell = ({ children }: { children: React.ReactNode }) => (
    <Typography component='span' sx={styles.mutedCell}>
        {children}
    </Typography>
);

const ValueCell = ({ children }: { children: React.ReactNode }) => (
    <Typography component='span' sx={styles.valueCell}>
        {children}
    </Typography>
);

const HighlightCell = ({ children }: { children: React.ReactNode }) => (
    <Typography component='span' sx={styles.highlightCell}>
        {children}
    </Typography>
);

const TaxRateBreakdown = ({ order }: { order: Order }) => (
    <Box sx={styles.breakdownContainer}>
        <Typography variant='caption' sx={styles.breakdownTitle}>
            Tax Rate Breakdown
        </Typography>
        {[
            { label: 'State', value: order.taxBreakdown.state_rate },
            { label: 'County', value: order.taxBreakdown.county_rate },
            { label: 'City', value: order.taxBreakdown.city_rate },
            { label: 'Special', value: order.taxBreakdown.special_rates },
        ].map((item) => (
            <Stack key={item.label} direction='row' justifyContent='space-between' spacing={2} sx={styles.breakdownRow}>
                <Typography variant='caption' color='text.secondary'>
                    {item.label}
                </Typography>
                <Typography variant='caption' sx={styles.breakdownValue}>
                    {formatRate(item.value)}
                </Typography>
            </Stack>
        ))}
    </Box>
);

const columns = [
    columnHelper.accessor('id', {
        header: 'ID',
        meta: { width: 110 },
        enableSorting: false,
        cell: (info) => {
            const id = info.getValue();
            return (
                <Tooltip title='Copy ID' arrow placement='top'>
                    <Chip
                        label={id.slice(0, 8)}
                        color='primary'
                        size='small'
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(id);
                            toast.success('ID copied');
                        }}
                        sx={styles.idChip}
                    />
                </Tooltip>
            );
        },
    }),
    columnHelper.accessor('latitude', {
        header: 'Latitude',
        meta: { width: 120 },
        enableSorting: false,
        cell: (info) => <MutedCell>{info.getValue().toFixed(6)}</MutedCell>,
    }),
    columnHelper.accessor('longitude', {
        header: 'Longitude',
        meta: { width: 130 },
        enableSorting: false,
        cell: (info) => <MutedCell>{info.getValue().toFixed(6)}</MutedCell>,
    }),
    columnHelper.accessor('jurisdictions', {
        header: 'Jurisdictions',
        enableSorting: false,
        cell: (info) => {
            const values = info.getValue();
            if (!values?.length) return null;
            return (
                <Stack direction='row' spacing={0.5} flexWrap='wrap' useFlexGap>
                    {values.map((j) => (
                        <Chip
                            key={j}
                            label={j}
                            size='small'
                            sx={styles.jurisdictionChip}
                        />
                    ))}
                </Stack>
            );
        },
    }),
    columnHelper.accessor('timestamp', {
        id: 'orderedAt',
        header: 'Created',
        meta: { width: 200, sortField: 'orderedAt' },
        cell: (info) => (
            <MutedCell>
                {DateTime.fromISO(info.getValue()).toLocaleString(DateTime.DATETIME_SHORT)}
            </MutedCell>
        ),
    }),
    columnHelper.accessor('composite_tax_rate', {
        id: 'compositeTaxRate',
        header: 'Tax Rate',
        meta: { highlighted: true, width: 100, sortField: 'compositeTaxRate' },
        cell: (info) => (
            <Tooltip
                title={<TaxRateBreakdown order={info.row.original} />}
                arrow
                placement='top'
                slotProps={{
                    tooltip: { sx: styles.taxRateTooltip },
                    arrow: { sx: styles.taxRateArrow },
                }}
            >
                <Typography component='span' sx={styles.taxRateValue}>
                    {formatRate(info.getValue())}
                </Typography>
            </Tooltip>
        ),
    }),
    columnHelper.accessor('subtotal', {
        header: 'Subtotal',
        meta: { highlighted: true, width: 100, sortField: 'subtotal' },
        cell: (info) => <ValueCell>${info.getValue().toFixed(2)}</ValueCell>,
    }),
    columnHelper.accessor('tax_amount', {
        id: 'taxAmount',
        header: 'Tax',
        meta: { highlighted: true, width: 80, sortField: 'taxAmount' },
        cell: (info) => <ValueCell>${info.getValue().toFixed(2)}</ValueCell>,
    }),
    columnHelper.accessor('total_amount', {
        id: 'totalAmount',
        header: 'Total',
        meta: { highlighted: true, width: 90, sortField: 'totalAmount' },
        cell: (info) => <HighlightCell>${info.getValue().toFixed(2)}</HighlightCell>,
    }),
];

const ROW_HEIGHT_ESTIMATE = 49;

const sortingStateToParams = (sorting: SortingState): string[] => {
    return sorting.map((s) => {
        const col = columns.find((c) => c.accessorKey === s.id || ('id' in (c as any) && (c as any).id === s.id));
        const sortField = (col?.meta as { sortField?: string })?.sortField || s.id;
        return `${sortField},${s.desc ? 'desc' : 'asc'}`;
    });
};

export const useOrdersTableController = () => {
    const { data: currentUser, isLoading: isAuthLoading } = useCurrentUser();
    const isAuthenticated = !!currentUser;

    const [filters, setFilters] = useState<TableFilterValues>(INITIAL_FILTERS);
    const [sorting, setSorting] = useState<SortingState>([]);

    const filterParams = useMemo(() => filtersToParams(filters), [filters]);
    const sortParams = useMemo(() => sortingStateToParams(sorting), [sorting]);

    const queryParams: Omit<OrdersParams, 'page' | 'size'> = useMemo(
        () => ({
            ...filterParams,
            ...(sortParams.length > 0 ? { sort: sortParams } : {}),
        }),
        [filterParams, sortParams],
    );

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteOrders(
        queryParams,
        isAuthenticated,
    );

    const { data: importFiles } = useImportFiles();

    const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
    const totalRows = data?.pages[0]?.total ?? 0;

    const table = useReactTable({
        data: items,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualSorting: true,
    });

    const { rows } = table.getRowModel();

    const tableContainerRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => ROW_HEIGHT_ESTIMATE,
        overscan: 30,
    });

    // Fetch next page when scrolled near the end
    const virtualItems = rowVirtualizer.getVirtualItems();

    useEffect(() => {
        const lastItem = virtualItems[virtualItems.length - 1];
        if (!lastItem) return;

        if (lastItem.index >= rows.length - 5 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [virtualItems, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleFiltersChange = useCallback((newFilters: TableFilterValues) => {
        setFilters(newFilters);
    }, []);

    return {
        table,
        rows,
        isLoading: isLoading || isAuthLoading,
        isAuthenticated,
        totalRows,
        tableContainerRef,
        rowVirtualizer,
        isFetchingNextPage,
        hasNextPage,
        filters,
        onFiltersChange: handleFiltersChange,
        filterParams: queryParams,
        importFiles: importFiles ?? [],
    };
};

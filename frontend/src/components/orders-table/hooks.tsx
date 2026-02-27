import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useInfiniteOrders } from '../../api/use-orders';
import type { Order, OrdersParams } from '../../types/order';
import ColumnHeader from './filters/ColumnHeader';
import type { FilterType, RangeFilterValue, SortDirection } from './filters/types';
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
            <Stack
                key={item.label}
                direction='row'
                justifyContent='space-between'
                spacing={2}
                sx={styles.breakdownRow}
            >
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

interface ColumnFilterMeta {
    width?: number;
    highlighted?: boolean;
    filterType?: FilterType;
    filterKey?: string;
}

const EMPTY_RANGE: RangeFilterValue = { from: '', to: '' };

const ROW_HEIGHT_ESTIMATE = 49;

/** Maps UI column keys to API sort field names */
const SORT_FIELD_MAP: Record<string, string> = {
    latitude: 'latitude',
    longitude: 'longitude',
    timestamp: 'orderedAt',
    composite_tax_rate: 'compositeTaxRate',
    subtotal: 'subtotal',
    tax_amount: 'taxAmount',
    total_amount: 'totalAmount',
};

/**
 * Builds API query params from the current filter and sort state.
 * Empty/unset filters are omitted.
 */
const buildApiParams = (
    filters: Record<string, RangeFilterValue>,
    sortColumn: string | null,
    sortDirection: SortDirection,
): Omit<OrdersParams, 'page' | 'size'> => {
    const params: Omit<OrdersParams, 'page' | 'size'> = {};

    // Lat/Lon bounding box
    if (filters.latitude.from) params.minLat = Number(filters.latitude.from);
    if (filters.latitude.to) params.maxLat = Number(filters.latitude.to);
    if (filters.longitude.from) params.minLon = Number(filters.longitude.from);
    if (filters.longitude.to) params.maxLon = Number(filters.longitude.to);

    // Date range (HTML date input gives YYYY-MM-DD, API expects ISO 8601)
    if (filters.timestamp.from) params.from = `${filters.timestamp.from}T00:00:00`;
    if (filters.timestamp.to) params.to = `${filters.timestamp.to}T23:59:59`;

    // Tax rate range (UI shows percent, API expects decimal)
    if (filters.composite_tax_rate.from) params.minTaxRate = Number(filters.composite_tax_rate.from) / 100;
    if (filters.composite_tax_rate.to) params.maxTaxRate = Number(filters.composite_tax_rate.to) / 100;

    // Subtotal range
    if (filters.subtotal.from) params.minSubtotal = Number(filters.subtotal.from);
    if (filters.subtotal.to) params.maxSubtotal = Number(filters.subtotal.to);

    // Total range
    if (filters.total_amount.from) params.minTotal = Number(filters.total_amount.from);
    if (filters.total_amount.to) params.maxTotal = Number(filters.total_amount.to);

    // Sort
    if (sortColumn && sortDirection) {
        const apiField = SORT_FIELD_MAP[sortColumn] ?? sortColumn;
        params.sort = `${apiField},${sortDirection}`;
    }

    return params;
};

export const useOrdersTableController = () => {
    const [filters, setFilters] = useState<Record<string, RangeFilterValue>>({
        latitude: { ...EMPTY_RANGE },
        longitude: { ...EMPTY_RANGE },
        timestamp: { ...EMPTY_RANGE },
        composite_tax_rate: { ...EMPTY_RANGE },
        subtotal: { ...EMPTY_RANGE },
        tax_amount: { ...EMPTY_RANGE },
        total_amount: { ...EMPTY_RANGE },
    });

    const [jurisdictionFilter, setJurisdictionFilter] = useState<Set<string>>(new Set());

    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const apiParams = useMemo(
        () => buildApiParams(filters, sortColumn, sortDirection),
        [filters, sortColumn, sortDirection],
    );

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteOrders(apiParams);

    const toggleSort = useCallback((columnKey: string) => () => {
        if (sortColumn !== columnKey) {
            setSortColumn(columnKey);
            setSortDirection('asc');
        } else if (sortDirection === 'asc') {
            setSortDirection('desc');
        } else {
            setSortColumn(null);
            setSortDirection(null);
        }
    }, [sortColumn, sortDirection]);

    const getSortDirection = useCallback(
        (columnKey: string): SortDirection => (sortColumn === columnKey ? sortDirection : null),
        [sortColumn, sortDirection],
    );

    const updateFilter = useCallback((key: string) => (value: RangeFilterValue) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const columns = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: () => 'ORDER ID',
                meta: { width: 110 } satisfies ColumnFilterMeta,
                cell: (info) => {
                    const id = info.getValue();
                    return (
                        <Tooltip title='Copy ID' arrow placement='top'>
                            <Chip
                                label={id?.slice(0, 8) ?? '—'}
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
                header: () => (
                    <ColumnHeader
                        label='Latitude'
                        filterType='range-number'
                        rangeValue={filters.latitude}
                        onRangeChange={updateFilter('latitude')}
                        sortDirection={getSortDirection('latitude')}
                        onSort={toggleSort('latitude')}
                    />
                ),
                meta: { width: 120, filterType: 'range-number', filterKey: 'latitude' } satisfies ColumnFilterMeta,
                cell: (info) => <MutedCell>{info.getValue()?.toFixed(6) ?? '—'}</MutedCell>,
            }),
            columnHelper.accessor('longitude', {
                header: () => (
                    <ColumnHeader
                        label='Longitude'
                        filterType='range-number'
                        rangeValue={filters.longitude}
                        onRangeChange={updateFilter('longitude')}
                        sortDirection={getSortDirection('longitude')}
                        onSort={toggleSort('longitude')}
                    />
                ),
                meta: { width: 130, filterType: 'range-number', filterKey: 'longitude' } satisfies ColumnFilterMeta,
                cell: (info) => <MutedCell>{info.getValue()?.toFixed(6) ?? '—'}</MutedCell>,
            }),
            columnHelper.accessor('jurisdictions', {
                header: () => (
                    <ColumnHeader
                        label='Jurisdictions'
                        filterType='jurisdiction'
                        jurisdictionValue={jurisdictionFilter}
                        onJurisdictionChange={setJurisdictionFilter}
                        sortDirection={getSortDirection('jurisdictions')}
                        onSort={toggleSort('jurisdictions')}
                    />
                ),
                meta: { filterType: 'jurisdiction' } satisfies ColumnFilterMeta,
                cell: (info) => {
                    const values = info.getValue();
                    if (!values?.length) return null;
                    return (
                        <Stack direction='row' spacing={0.5} flexWrap='wrap' useFlexGap>
                            {values.map((j) => (
                                <Chip key={j} label={j} size='small' sx={styles.jurisdictionChip} />
                            ))}
                        </Stack>
                    );
                },
            }),
            columnHelper.accessor('timestamp', {
                header: () => (
                    <ColumnHeader
                        label='ORDER CREATED'
                        filterType='range-date'
                        rangeValue={filters.timestamp}
                        onRangeChange={updateFilter('timestamp')}
                        sortDirection={getSortDirection('timestamp')}
                        onSort={toggleSort('timestamp')}
                    />
                ),
                meta: { width: 200, filterType: 'range-date', filterKey: 'timestamp' } satisfies ColumnFilterMeta,
                cell: (info) => (
                    <MutedCell>
                        {DateTime.fromISO(info.getValue()).toLocaleString(DateTime.DATETIME_SHORT)}
                    </MutedCell>
                ),
            }),
            columnHelper.accessor('composite_tax_rate', {
                header: () => (
                    <ColumnHeader
                        label='Tax Rate'
                        filterType='range-percent'
                        rangeValue={filters.composite_tax_rate}
                        onRangeChange={updateFilter('composite_tax_rate')}
                        sortDirection={getSortDirection('composite_tax_rate')}
                        onSort={toggleSort('composite_tax_rate')}
                    />
                ),
                meta: { highlighted: true, width: 100, filterType: 'range-percent', filterKey: 'composite_tax_rate' } satisfies ColumnFilterMeta,
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
                header: () => (
                    <ColumnHeader
                        label='Subtotal'
                        filterType='range-currency'
                        rangeValue={filters.subtotal}
                        onRangeChange={updateFilter('subtotal')}
                        sortDirection={getSortDirection('subtotal')}
                        onSort={toggleSort('subtotal')}
                    />
                ),
                meta: { highlighted: true, width: 100, filterType: 'range-currency', filterKey: 'subtotal' } satisfies ColumnFilterMeta,
                cell: (info) => (
                    <ValueCell>
                        {info.getValue() != null ? `$${info.getValue().toFixed(2)}` : '—'}
                    </ValueCell>
                ),
            }),
            columnHelper.accessor('tax_amount', {
                header: () => (
                    <ColumnHeader
                        label='Tax'
                        filterType='range-currency'
                        rangeValue={filters.tax_amount}
                        onRangeChange={updateFilter('tax_amount')}
                        sortDirection={getSortDirection('tax_amount')}
                        onSort={toggleSort('tax_amount')}
                    />
                ),
                meta: { highlighted: true, width: 80, filterType: 'range-currency', filterKey: 'tax_amount' } satisfies ColumnFilterMeta,
                cell: (info) => (
                    <ValueCell>
                        {info.getValue() != null ? `$${info.getValue().toFixed(2)}` : '—'}
                    </ValueCell>
                ),
            }),
            columnHelper.accessor('total_amount', {
                header: () => (
                    <ColumnHeader
                        label='Total'
                        filterType='range-currency'
                        rangeValue={filters.total_amount}
                        onRangeChange={updateFilter('total_amount')}
                        sortDirection={getSortDirection('total_amount')}
                        onSort={toggleSort('total_amount')}
                    />
                ),
                meta: { highlighted: true, width: 90, filterType: 'range-currency', filterKey: 'total_amount' } satisfies ColumnFilterMeta,
                cell: (info) => (
                    <HighlightCell>
                        {info.getValue() != null ? `$${info.getValue().toFixed(2)}` : '—'}
                    </HighlightCell>
                ),
            }),
        ],
        [filters, jurisdictionFilter, updateFilter, getSortDirection, toggleSort],
    );

    const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
    const totalRows = data?.pages[0]?.total ?? 0;

    const table = useReactTable({
        data: items,
        columns,
        getCoreRowModel: getCoreRowModel(),
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

    return {
        table,
        rows,
        isLoading,
        totalRows,
        tableContainerRef,
        rowVirtualizer,
        isFetchingNextPage,
        hasNextPage,
        filters,
        jurisdictionFilter,
        sortColumn,
        sortDirection,
    };
};

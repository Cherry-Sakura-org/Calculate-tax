import { useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import {
    Box,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { toast } from 'react-toastify';
import { ordersApi } from '../../api/orders';
import { useDeleteOrdersByFilter } from '../../api/use-orders';
import { useDialog } from '../../hooks/use-dialog';
import { useOrdersTableController } from './hooks';
import TableFilters, { hasActiveFilters } from './TableFilters';
import * as styles from './orders-table.styles';

const OrdersTable = () => {
    const {
        table,
        rows,
        isLoading,
        isAuthenticated,
        tableContainerRef,
        rowVirtualizer,
        isFetchingNextPage,
        hasNextPage,
        totalRows,
        filters,
        onFiltersChange,
        filterParams,
        importFiles,
    } = useOrdersTableController();
    const [isExporting, setIsExporting] = useState(false);
    const deleteByFilter = useDeleteOrdersByFilter();
    const [showDeleteDialog, openDeleteDialog, closeDeleteDialog, mountDeleteDialog] = useDialog();

    const handleExportCsv = async () => {
        setIsExporting(true);
        try {
            await ordersApi.exportCsv(filterParams);
            toast.success('CSV downloaded');
        } catch {
            toast.error('Failed to export CSV');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteFiltered = () => {
        deleteByFilter.mutate(filterParams, {
            onSuccess: () => closeDeleteDialog(),
        });
    };

    if (!isAuthenticated && !isLoading) {
        return (
            <Paper sx={styles.loadingPaper}>
                <Stack alignItems='center' spacing={2}>
                    <Typography variant='body2' color='text.secondary'>
                        Please sign in to view orders
                    </Typography>
                </Stack>
            </Paper>
        );
    }

    if (isLoading) {
        return (
            <Paper sx={styles.loadingPaper}>
                <Stack alignItems='center' spacing={2}>
                    <CircularProgress size={32} thickness={3} />
                    <Typography variant='caption' color='text.secondary'>
                        Loading orders...
                    </Typography>
                </Stack>
            </Paper>
        );
    }

    const virtualRows = rowVirtualizer.getVirtualItems();
    const filtersActive = hasActiveFilters(filters);

    return (
        <Paper sx={styles.paper}>
            <TableFilters
                filters={filters}
                onChange={onFiltersChange}
                importFiles={importFiles}
            />

            {/* Toolbar: row count + action buttons */}
            <Box sx={styles.toolbar}>
                <Typography variant='caption' color='text.disabled'>
                    {totalRows > 0 ? `${totalRows} orders` : ''}
                </Typography>
                <Stack direction='row' spacing={1}>
                    {filtersActive && (
                        <Button
                            size='small'
                            variant='outlined'
                            color='error'
                            startIcon={<DeleteSweepIcon />}
                            onClick={openDeleteDialog}
                            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                            Delete Filtered
                        </Button>
                    )}
                    <Button
                        size='small'
                        variant='outlined'
                        startIcon={isExporting ? <CircularProgress size={14} thickness={3} /> : <DownloadIcon />}
                        onClick={handleExportCsv}
                        disabled={isExporting}
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                        Export CSV
                    </Button>
                </Stack>
            </Box>

            <TableContainer ref={tableContainerRef} sx={styles.tableContainer}>
                <Table size='small' stickyHeader sx={styles.table}>
                    <colgroup>
                        {table.getAllColumns().map((col) => {
                            const w = (col.columnDef.meta as { width?: number })?.width;
                            return <col key={col.id} style={w ? { width: w } : undefined} />;
                        })}
                    </colgroup>
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort();
                                    const sorted = header.column.getIsSorted();
                                    return (
                                        <TableCell
                                            key={header.id}
                                            sx={{
                                                ...styles.headerCell,
                                                ...(canSort
                                                    ? {
                                                          cursor: 'pointer',
                                                          userSelect: 'none',
                                                          '&:hover': { color: 'primary.main' },
                                                      }
                                                    : {}),
                                            }}
                                            onClick={
                                                canSort
                                                    ? header.column.getToggleSortingHandler()
                                                    : undefined
                                            }
                                        >
                                            <Stack
                                                direction='row'
                                                alignItems='center'
                                                spacing={0.5}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                                {sorted === 'asc' && (
                                                    <ArrowUpwardIcon
                                                        sx={{ fontSize: 14, color: 'primary.main' }}
                                                    />
                                                )}
                                                {sorted === 'desc' && (
                                                    <ArrowDownwardIcon
                                                        sx={{ fontSize: 14, color: 'primary.main' }}
                                                    />
                                                )}
                                            </Stack>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getAllColumns().length}
                                    align='center'
                                >
                                    <Box sx={styles.emptyState}>
                                        <Typography variant='body2' color='text.secondary'>
                                            No orders found
                                        </Typography>
                                        <Typography
                                            variant='caption'
                                            color='text.secondary'
                                            sx={styles.emptySubtext}
                                        >
                                            {filtersActive
                                                ? 'Try adjusting your filters'
                                                : 'Create a new order or import a CSV file'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {virtualRows[0]?.start > 0 && (
                                    <tr>
                                        <td
                                            colSpan={table.getAllColumns().length}
                                            style={{ height: virtualRows[0].start, padding: 0, border: 'none' }}
                                        />
                                    </tr>
                                )}
                                {virtualRows.map((virtualRow) => {
                                    const row = rows[virtualRow.index];
                                    const isOutOfState = row.original.jurisdictions?.includes('Out of New York State');
                                    return (
                                        <TableRow
                                            key={row.id}
                                            hover
                                            data-index={virtualRow.index}
                                            ref={rowVirtualizer.measureElement}
                                            sx={isOutOfState ? styles.outOfStateRow : styles.dataRow}
                                        >
                                            {row.getVisibleCells().map((cell) => {
                                                const highlighted = (
                                                    cell.column.columnDef.meta as {
                                                        highlighted?: boolean;
                                                    }
                                                )?.highlighted;
                                                return (
                                                    <TableCell
                                                        key={cell.id}
                                                        sx={
                                                            highlighted && !isOutOfState
                                                                ? styles.highlightedCell
                                                                : undefined
                                                        }
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                                {(() => {
                                    const lastItem = virtualRows[virtualRows.length - 1];
                                    const paddingBottom = lastItem
                                        ? rowVirtualizer.getTotalSize() - lastItem.end
                                        : 0;
                                    return paddingBottom > 0 ? (
                                        <tr>
                                            <td
                                                colSpan={table.getAllColumns().length}
                                                style={{ height: paddingBottom, padding: 0, border: 'none' }}
                                            />
                                        </tr>
                                    ) : null;
                                })()}
                            </>
                        )}
                    </TableBody>
                </Table>

                {/* Infinite scroll status */}
                <Box sx={styles.scrollStatus}>
                    {isFetchingNextPage && (
                        <Stack direction='row' alignItems='center' spacing={1}>
                            <CircularProgress size={18} thickness={3} />
                            <Typography variant='caption' color='text.secondary'>
                                Loading more...
                            </Typography>
                        </Stack>
                    )}
                    {!hasNextPage && rows.length > 0 && (
                        <Typography variant='caption' color='text.disabled'>
                            All {totalRows} orders loaded
                        </Typography>
                    )}
                </Box>
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            {mountDeleteDialog && (
                <Dialog open={showDeleteDialog} onClose={closeDeleteDialog}>
                    <DialogTitle>Delete Filtered Orders</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            This will permanently delete <strong>{totalRows}</strong> orders matching
                            the current filters. This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDeleteDialog}>Cancel</Button>
                        <Button
                            onClick={handleDeleteFiltered}
                            color='error'
                            variant='contained'
                            disabled={deleteByFilter.isPending}
                            startIcon={
                                deleteByFilter.isPending ? (
                                    <CircularProgress size={16} />
                                ) : undefined
                            }
                        >
                            Delete {totalRows} Orders
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Paper>
    );
};

export default OrdersTable;

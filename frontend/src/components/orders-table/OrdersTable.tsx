import { flexRender } from '@tanstack/react-table';
import {
    Box,
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
} from '@mui/material';
import { useOrdersTableController } from './hooks';
import * as styles from './orders-table.styles';

const OrdersTable = () => {
    const { table, rows, isLoading, tableContainerRef, rowVirtualizer, isFetchingNextPage, hasNextPage } =
        useOrdersTableController();

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

    return (
        <Paper sx={styles.paper}>
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
                                {headerGroup.headers.map((header) => (
                                    <TableCell key={header.id} sx={styles.headerCell}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </TableCell>
                                ))}
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
                                            Create a new order or import a CSV file
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
                            All orders loaded
                        </Typography>
                    )}
                </Box>
            </TableContainer>
        </Paper>
    );
};

export default OrdersTable;

import { useEffect, useRef, useState } from 'react';
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
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NewOrderButton from '../manual-order-create/NewOrderButton';
import OrdersImportDialog from '../orders-import/OrdersImport';
import { CsvFileSelector, useCsvFileSelector } from '../csv-file-selector';
import { useDialog } from '../../hooks/use-dialog';
import { useDownloadOrdersCsv } from '../../api/use-orders';
import { useOrdersTableController } from './hooks';
import * as styles from './orders-table.styles';

const OrdersTable = () => {
    const csvSelector = useCsvFileSelector();

    const importFileIds =
        csvSelector.selectedIds.size > 0
            ? [...csvSelector.selectedIds].sort().join(',')
            : undefined;

    const [debouncedImportFileIds, setDebouncedImportFileIds] = useState(importFileIds);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
    useEffect(() => {
        timerRef.current = setTimeout(() => setDebouncedImportFileIds(importFileIds), 300);
        return () => clearTimeout(timerRef.current!);
    }, [importFileIds]);

    const {
        table,
        rows,
        isLoading,
        totalRows,
        tableContainerRef,
        rowVirtualizer,
        isFetchingNextPage,
        hasNextPage,
    } = useOrdersTableController(debouncedImportFileIds);

    const [showImportDialog, openImportDialog, closeImportDialog, mountImportDialog] = useDialog();
    const { mutate: downloadCsv, isPending: isDownloading } = useDownloadOrdersCsv();

    const virtualRows = isLoading ? [] : rowVirtualizer.getVirtualItems();

    const colGroup = (
        <colgroup>
            {table.getAllColumns().map((col) => {
                const w = (col.columnDef.meta as { width?: number })?.width;
                return <col key={col.id} style={w ? { width: w } : undefined} />;
            })}
        </colgroup>
    );

    return (
        <>
            <Paper sx={styles.paper}>
                {/* Toolbar */}
                <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                    sx={styles.toolbar}
                >
                    <Typography variant='body2' color='text.secondary'>
                        {isLoading ? 'Loading...' : `${totalRows} items`}
                    </Typography>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                        <CsvFileSelector
                            files={csvSelector.files}
                            selectedIds={csvSelector.selectedIds}
                            onToggle={csvSelector.toggleFile}
                            onSelectAll={csvSelector.selectAll}
                            onDeselectAll={csvSelector.deselectAll}
                            onSelectOnly={csvSelector.selectOnly}
                        />
                        <Button
                            variant='outlined'
                            size='small'
                            startIcon={<FileUploadIcon />}
                            onClick={openImportDialog}
                            sx={styles.actionButton}
                        >
                            Import CSV
                        </Button>
                        <NewOrderButton />
                        <Button
                            variant='contained'
                            size='small'
                            startIcon={<FileDownloadIcon />}
                            onClick={() => downloadCsv()}
                            disabled={isDownloading}
                            sx={styles.actionButton}
                        >
                            {isDownloading ? 'Downloading...' : 'Download CSV'}
                        </Button>
                    </Stack>
                </Stack>

                {/* Fixed header */}
                <TableContainer sx={styles.headerContainer}>
                    <Table size='small' sx={styles.table}>
                        {colGroup}
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
                    </Table>
                </TableContainer>

                {/* Scrollable body */}
                <TableContainer ref={tableContainerRef} sx={styles.bodyContainer}>
                    <Table size='small' sx={styles.table}>
                        {colGroup}
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={table.getAllColumns().length}
                                        sx={styles.emptyStateCell}
                                    >
                                        <Box sx={styles.emptyStateContainer}>
                                            <CircularProgress size={24} thickness={3} />
                                            <Typography
                                                variant='caption'
                                                color='text.secondary'
                                                sx={styles.emptySubtext}
                                            >
                                                Loading orders...
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={table.getAllColumns().length}
                                        sx={styles.emptyStateCell}
                                    >
                                        <Box sx={styles.emptyStateContainer}>
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
                                                style={{
                                                    height: virtualRows[0].start,
                                                    padding: 0,
                                                    border: 'none',
                                                }}
                                            />
                                        </tr>
                                    )}
                                    {virtualRows.map((virtualRow) => {
                                        const row = rows[virtualRow.index];
                                        const isOutOfState =
                                            row.original.jurisdictions?.includes(
                                                'Out of New York State',
                                            );
                                        return (
                                            <TableRow
                                                key={row.id}
                                                hover
                                                data-index={virtualRow.index}
                                                ref={rowVirtualizer.measureElement}
                                                sx={
                                                    isOutOfState
                                                        ? styles.outOfStateRow
                                                        : styles.dataRow
                                                }
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
                                                    style={{
                                                        height: paddingBottom,
                                                        padding: 0,
                                                        border: 'none',
                                                    }}
                                                />
                                            </tr>
                                        ) : null;
                                    })()}
                                </>
                            )}
                        </TableBody>
                    </Table>

                    {/* Infinite scroll status */}
                    {(isFetchingNextPage || (!hasNextPage && rows.length > 0)) && (
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
                    )}
                </TableContainer>
            </Paper>

            {mountImportDialog && (
                <OrdersImportDialog open={showImportDialog} onClose={closeImportDialog} />
            )}
        </>
    );
};

export default OrdersTable;

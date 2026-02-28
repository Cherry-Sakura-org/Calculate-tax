import { useCallback, useEffect, useRef, useState } from 'react';
import { flexRender } from '@tanstack/react-table';
import {
    Box,
    Button,
    Checkbox,
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
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import NewOrderButton from '../manual-order-create/NewOrderButton';
import OrdersImportDialog from '../orders-import/OrdersImport';
import { CsvFileSelector, useCsvFileSelector } from '../csv-file-selector';
import { useDialog } from '../../hooks/use-dialog';
import { useDownloadOrdersCsv } from '../../api/use-orders';
import { useOrdersTableController, type TableDensity } from './hooks';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import * as styles from './orders-table.styles';

const OrdersTable = () => {
    const [density, setDensity] = useState<TableDensity>('default');
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
        apiParams,
        selection,
    } = useOrdersTableController(debouncedImportFileIds, density);

    const [showImportDialog, openImportDialog, closeImportDialog, mountImportDialog] = useDialog();
    const [showDeleteDialog, openDeleteDialog, closeDeleteDialog, mountDeleteDialog] = useDialog();
    const { mutate: downloadCsv, isPending: isDownloading } = useDownloadOrdersCsv();

    const isSlim = density === 'slim';
    const virtualRows = isLoading ? [] : rowVirtualizer.getVirtualItems();

    const handleDeleteConfirm = useCallback(() => {
        // TODO: connect to backend delete API
        // Example: deleteOrders([...selection.selectedIds]).then(() => { ... });
        selection.clearSelection();
        closeDeleteDialog();
    }, [selection, closeDeleteDialog]);

    const colGroup = (
        <colgroup>
            <col style={{ width: 48 }} />
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
                    <Stack direction='row' spacing={2} alignItems='center'>
                        <Typography variant='body2' color='text.secondary'>
                            {isLoading ? 'Loading...' : `${totalRows} items`}
                        </Typography>
                        <CsvFileSelector
                            files={csvSelector.files}
                            selectedIds={csvSelector.selectedIds}
                            onToggle={csvSelector.toggleFile}
                            onSelectAll={csvSelector.selectAll}
                            onDeselectAll={csvSelector.deselectAll}
                            onSelectOnly={csvSelector.selectOnly}
                        />
                    </Stack>
                    <Stack direction='row' spacing={1.5} alignItems='center'>
                        {selection.someSelected && (
                            <Button
                                variant='outlined'
                                size='small'
                                color='error'
                                startIcon={<DeleteOutlineIcon />}
                                onClick={openDeleteDialog}
                                sx={styles.actionButton}
                            >
                                Delete selected ({selection.selectedIds.size})
                            </Button>
                        )}
                        <ToggleButtonGroup
                            value={density}
                            exclusive
                            size='small'
                            onChange={(_, val) => val && setDensity(val)}
                            sx={styles.densityToggle}
                        >
                            <ToggleButton value='default'>
                                <ViewStreamIcon fontSize='small' />
                            </ToggleButton>
                            <ToggleButton value='slim'>
                                <ViewHeadlineIcon fontSize='small' />
                            </ToggleButton>
                        </ToggleButtonGroup>
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
                            onClick={() => downloadCsv(apiParams)}
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
                                    <TableCell padding='checkbox' sx={styles.headerCell} />
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
                                        colSpan={table.getAllColumns().length + 1}
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
                                        colSpan={table.getAllColumns().length + 1}
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
                                                colSpan={table.getAllColumns().length + 1}
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
                                                selected={selection.selectedIds.has(row.original.id)}
                                                sx={
                                                    isOutOfState
                                                        ? styles.outOfStateRow
                                                        : styles.dataRow
                                                }
                                            >
                                                <TableCell padding='checkbox'>
                                                    <Checkbox
                                                        size='small'
                                                        checked={selection.selectedIds.has(row.original.id)}
                                                        onChange={() => selection.toggleOne(row.original.id)}
                                                    />
                                                </TableCell>
                                                {row.getVisibleCells().map((cell) => {
                                                    const meta = cell.column.columnDef.meta as {
                                                        highlighted?: boolean;
                                                        align?: 'left' | 'right' | 'center';
                                                        filterType?: string;
                                                    } | undefined;
                                                    const highlighted = meta?.highlighted;
                                                    const isRightAligned = meta?.align === 'right';
                                                    const hasFilter = !!meta?.filterType;
                                                    return (
                                                        <TableCell
                                                            key={cell.id}
                                                            sx={{
                                                                ...(highlighted && !isOutOfState ? styles.highlightedCell as object : {}),
                                                                ...(isRightAligned && {
                                                                    textAlign: 'right',
                                                                    ...(hasFilter && { paddingRight: '36px' }),
                                                                }),
                                                                ...(isSlim && styles.slimCell as object),
                                                            }}
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
                                                    colSpan={table.getAllColumns().length + 1}
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

            {mountDeleteDialog && (
                <DeleteConfirmDialog
                    open={showDeleteDialog}
                    count={selection.selectedIds.size}
                    onClose={closeDeleteDialog}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </>
    );
};

export default OrdersTable;

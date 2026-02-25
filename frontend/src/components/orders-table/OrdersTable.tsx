import { Fragment } from 'react';
import { flexRender } from '@tanstack/react-table';
import {
    Box,
    Collapse,
    CircularProgress,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Paper,
    Typography,
    Stack,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type { Order } from '../../types/order';
import { useOrdersTableController, formatRate } from './hooks';

const TaxBreakdown = ({ order }: { order: Order }) => (
    <Box sx={{ py: 1, px: 2 }}>
        <Typography variant='subtitle2' gutterBottom>
            Tax Rate Breakdown
        </Typography>
        <Stack direction='row' spacing={4}>
            <Typography variant='body2'>State: {formatRate(order.state_rate)}</Typography>
            <Typography variant='body2'>County: {formatRate(order.county_rate)}</Typography>
            <Typography variant='body2'>City: {formatRate(order.city_rate)}</Typography>
            <Typography variant='body2'>Special: {formatRate(order.special_rates)}</Typography>
        </Stack>
    </Box>
);

const OrdersTable = () => {
    const { table, isLoading, totalRows } = useOrdersTableController();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table size='small'>
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                <TableCell padding='checkbox' />
                                {headerGroup.headers.map((header) =>
                                    header.id === 'expand' ? null : (
                                        <TableCell key={header.id}>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                        </TableCell>
                                    ),
                                )}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getAllColumns().length + 1}
                                    align='center'
                                >
                                    <Typography
                                        variant='body2'
                                        color='text.secondary'
                                        sx={{ py: 2 }}
                                    >
                                        No orders found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <Fragment key={row.id}>
                                    <TableRow
                                        hover
                                        sx={{
                                            '& > *': {
                                                borderBottom: row.getIsExpanded()
                                                    ? 'unset'
                                                    : undefined,
                                            },
                                        }}
                                    >
                                        <TableCell padding='checkbox'>
                                            <IconButton
                                                size='small'
                                                onClick={row.getToggleExpandedHandler()}
                                            >
                                                {row.getIsExpanded() ? (
                                                    <KeyboardArrowUpIcon />
                                                ) : (
                                                    <KeyboardArrowDownIcon />
                                                )}
                                            </IconButton>
                                        </TableCell>
                                        {row
                                            .getVisibleCells()
                                            .map((cell) =>
                                                cell.column.id === 'expand' ? null : (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ),
                                            )}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell
                                            colSpan={table.getAllColumns().length + 1}
                                            sx={{
                                                py: 0,
                                                borderBottom: row.getIsExpanded()
                                                    ? undefined
                                                    : 'none',
                                            }}
                                        >
                                            <Collapse
                                                in={row.getIsExpanded()}
                                                timeout='auto'
                                                unmountOnExit
                                            >
                                                <TaxBreakdown order={row.original} />
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component='div'
                count={totalRows}
                page={table.getState().pagination.pageIndex}
                rowsPerPage={table.getState().pagination.pageSize}
                onPageChange={(_e, page) => table.setPageIndex(page)}
                onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
                rowsPerPageOptions={[5, 10, 25, 50]}
            />
        </Paper>
    );
};

export default OrdersTable;

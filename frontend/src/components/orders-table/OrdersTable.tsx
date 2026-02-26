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
    alpha,
    Chip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { Order } from '../../types/order';
import { useOrdersTableController, formatRate } from './hooks';
import TableFilters from './TableFilters';

const TaxBreakdown = ({ order }: { order: Order }) => (
    <Box
        sx={{
            py: 2,
            px: 3,
            my: 1,
            borderRadius: 2,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.08)}`,
        }}
    >
        <Typography
            variant='overline'
            sx={{
                display: 'block',
                mb: 1.5,
                color: 'primary.main',
            }}
        >
            Tax Rate Breakdown
        </Typography>
        <Stack direction='row' spacing={3} flexWrap='wrap' useFlexGap>
            {[
                { label: 'State', value: order.taxBreakdown.state_rate },
                { label: 'County', value: order.taxBreakdown.county_rate },
                { label: 'City', value: order.taxBreakdown.city_rate },
                { label: 'Special', value: order.taxBreakdown.special_rates },
            ].map((item) => (
                <Box key={item.label} sx={{ minWidth: 100 }}>
                    <Typography
                        variant='caption'
                        sx={{
                            display: 'block',
                            color: 'text.secondary',
                            fontSize: '0.65rem',
                            mb: 0.3,
                        }}
                    >
                        {item.label}
                    </Typography>
                    <Typography
                        variant='body2'
                        sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 500,
                            color: 'text.primary',
                        }}
                    >
                        {formatRate(item.value)}
                    </Typography>
                </Box>
            ))}
        </Stack>
        {order.jurisdictions?.length > 0 && (
            <Stack direction='row' spacing={0.5} mt={1.5} flexWrap='wrap' useFlexGap>
                {order.jurisdictions.map((j) => (
                    <Chip
                        key={j}
                        label={j}
                        size='small'
                        sx={{
                            height: 22,
                            fontSize: '0.65rem',
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                            color: 'primary.main',
                            border: 'none',
                        }}
                    />
                ))}
            </Stack>
        )}
    </Box>
);

const OrdersTable = () => {
    const { table, isLoading, totalRows } = useOrdersTableController();

    if (isLoading) {
        return (
            <Paper
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 8,
                    animation: 'pulseGlow 2s infinite',
                }}
            >
                <Stack alignItems='center' spacing={2}>
                    <CircularProgress size={32} thickness={3} />
                    <Typography variant='caption' color='text.secondary'>
                        Loading orders...
                    </Typography>
                </Stack>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                overflow: 'hidden',
                '&:hover': {
                    borderColor: (t) => alpha(t.palette.primary.main, 0.15),
                },
            }}
        >
            <TableFilters />
            <TableContainer>
                <Table size='small'>
                    <TableHead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                <TableCell
                                    padding='checkbox'
                                    sx={{
                                        bgcolor: (t) =>
                                            `${alpha(t.palette.primary.main, 0.04)} !important`,
                                    }}
                                />
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
                                    <Box sx={{ py: 6 }}>
                                        <Typography
                                            variant='body2'
                                            color='text.secondary'
                                            sx={{ fontFamily: '"DM Sans", sans-serif' }}
                                        >
                                            No orders found
                                        </Typography>
                                        <Typography
                                            variant='caption'
                                            color='text.secondary'
                                            sx={{ mt: 0.5, display: 'block', opacity: 0.6 }}
                                        >
                                            Create a new order or import a CSV file
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row, index) => (
                                <Fragment key={row.id}>
                                    <TableRow
                                        hover
                                        sx={{
                                            animation: 'fadeIn 0.3s ease-out',
                                            animationFillMode: 'backwards',
                                            animationDelay: `${index * 0.03}s`,
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
                                                sx={{
                                                    transition: 'transform 0.2s ease',
                                                    transform: row.getIsExpanded()
                                                        ? 'rotate(180deg)'
                                                        : 'rotate(0deg)',
                                                }}
                                            >
                                                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
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

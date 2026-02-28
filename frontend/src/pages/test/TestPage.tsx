import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Divider,
    Tooltip,
    ToggleButtonGroup,
    ToggleButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    type SelectChangeEvent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapIcon from '@mui/icons-material/Map';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CachedIcon from '@mui/icons-material/Cached';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { apiClient } from '../../api/client';
import type {
    DashboardStats,
    MapCounty,
    ImportFile,
} from '../../api/dashboard';
import * as styles from './test-page.styles';

/* ───────── helpers ───────── */

const fmt = (n: number | undefined | null) =>
    n != null ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—';

const fmtCurrency = (n: number | undefined | null) =>
    n != null
        ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '—';

const fmtPct = (n: number | undefined | null) =>
    n != null ? `${(n * 100).toFixed(2)}%` : '—';

/* ───────── order response type (from openapi.json) ───────── */

interface OrderRow {
    id: string;
    latitude: number;
    longitude: number;
    subtotal: number;
    composite_tax_rate: number;
    tax_amount: number;
    total_amount: number;
    timestamp: string;
    is_within_new_york: boolean;
    county: string | null;
    region: string | null;
    taxBreakdown: { state_rate: number; county_rate: number; city_rate: number; special_rates: number } | null;
    jurisdictions: string[];
}

interface PageMeta {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
}

/* ───────── Section wrapper ───────── */

interface SectionProps {
    title: string;
    endpoint: string;
    method?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

const Section = ({ title, endpoint, method = 'GET', icon, children, onRefresh, isRefreshing }: SectionProps) => (
    <Paper sx={styles.sectionCard}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
            <Stack direction='row' alignItems='center' spacing={1.5}>
                {icon}
                <Typography variant='h6' sx={styles.sectionTitle}>{title}</Typography>
            </Stack>
            <Stack direction='row' alignItems='center' spacing={1}>
                <Chip
                    label={`${method} ${endpoint}`}
                    size='small'
                    variant='outlined'
                    color={method === 'DELETE' ? 'error' : method === 'POST' ? 'warning' : 'info'}
                    sx={styles.endpointChip}
                />
                {onRefresh && (
                    <Tooltip title='Refresh'>
                        <Button size='small' variant='outlined' onClick={onRefresh} disabled={isRefreshing} sx={styles.refreshButton}>
                            {isRefreshing ? <CircularProgress size={18} /> : <RefreshIcon fontSize='small' />}
                        </Button>
                    </Tooltip>
                )}
            </Stack>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {children}
    </Paper>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
    <Box sx={styles.statCard}>
        <Typography sx={styles.statValue}>{value}</Typography>
        <Typography sx={styles.statLabel}>{label}</Typography>
    </Box>
);

/* ─────────────────────────────────────────────
   1. Dashboard
   ───────────────────────────────────────────── */

const DashboardSection = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery<DashboardStats>({
        queryKey: ['test-dashboard'],
        queryFn: () => apiClient.get('/dashboard').then((r) => r.data),
    });

    if (isLoading) return <CircularProgress size={24} />;
    if (error) return <Alert severity='error'>Failed to load dashboard</Alert>;
    if (!data) return null;

    return (
        <Section title='Dashboard' endpoint='/dashboard' icon={<BarChartIcon color='primary' />} onRefresh={() => refetch()} isRefreshing={isFetching}>
            <Stack direction='row' flexWrap='wrap' gap={2} mb={3}>
                <StatCard label='Total Orders' value={fmt(data.total_orders)} />
                <StatCard label='Valid (NY)' value={fmt(data.valid_orders)} />
                <StatCard label='Invalid' value={fmt(data.invalid_orders)} />
                <StatCard label='Revenue' value={fmtCurrency(data.total_revenue)} />
                <StatCard label='Tax Collected' value={fmtCurrency(data.total_tax)} />
                <StatCard label='Avg Order' value={fmtCurrency(data.average_order_value)} />
                <StatCard label='Avg Tax Rate' value={fmtPct(data.average_tax_rate)} />
            </Stack>

            {data.region_breakdown?.length > 0 && (
                <>
                    <Typography variant='subtitle2' gutterBottom>Region Breakdown</Typography>
                    <TableContainer sx={styles.tableContainer}>
                        <Table size='small' stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Region</TableCell>
                                    <TableCell align='right'>Orders</TableCell>
                                    <TableCell align='right'>Revenue</TableCell>
                                    <TableCell align='right'>Avg Tax</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.region_breakdown.map((r) => (
                                    <TableRow key={r.region}>
                                        <TableCell>{r.region}</TableCell>
                                        <TableCell align='right'>{fmt(r.order_count)}</TableCell>
                                        <TableCell align='right'>{fmtCurrency(r.total_revenue)}</TableCell>
                                        <TableCell align='right'>{fmtPct(r.average_tax_rate)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {data.top_counties?.length > 0 && (
                <Box mt={2}>
                    <Typography variant='subtitle2' gutterBottom>Top Counties</Typography>
                    <TableContainer sx={styles.tableContainer}>
                        <Table size='small' stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>County</TableCell>
                                    <TableCell align='right'>Orders</TableCell>
                                    <TableCell align='right'>Revenue</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.top_counties.map((c) => (
                                    <TableRow key={c.county}>
                                        <TableCell>{c.county}</TableCell>
                                        <TableCell align='right'>{fmt(c.order_count)}</TableCell>
                                        <TableCell align='right'>{fmtCurrency(c.total_revenue)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {data.tax_rate_distribution?.length > 0 && (
                <Box mt={2}>
                    <Typography variant='subtitle2' gutterBottom>Tax Rate Distribution</Typography>
                    <Stack direction='row' flexWrap='wrap' gap={1}>
                        {data.tax_rate_distribution.map((b) => (
                            <Chip key={b.rate_label} label={`${b.rate_label}: ${fmt(b.order_count)}`} size='small' variant='outlined' />
                        ))}
                    </Stack>
                </Box>
            )}
        </Section>
    );
};

/* ─────────────────────────────────────────────
   2. Orders — UI controls for sort / filter / pagination
   ───────────────────────────────────────────── */

const SORT_OPTIONS = [
    { label: 'Total ↓', value: 'totalAmount,desc' },
    { label: 'Total ↑', value: 'totalAmount,asc' },
    { label: 'Subtotal ↓', value: 'subtotal,desc' },
    { label: 'Tax Rate ↓', value: 'compositeTaxRate,desc' },
    { label: 'Tax Rate ↑', value: 'compositeTaxRate,asc' },
    { label: 'Date ↓', value: 'orderedAt,desc' },
    { label: 'Date ↑', value: 'orderedAt,asc' },
];

const PAGE_SIZES = [5, 10, 20, 50];

const REGIONS = ['', 'NYC', 'Long Island', 'Hudson Valley', 'Capital District', 'Upstate', 'Out of State'];

const WITHIN_NY_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'NY Only', value: 'true' },
    { label: 'Out of NY', value: 'false' },
];

const OrdersSection = () => {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sort, setSort] = useState('totalAmount,desc');
    const [region, setRegion] = useState('');
    const [withinNY, setWithinNY] = useState('');
    const [county, setCounty] = useState('');

    const params: Record<string, string | number | boolean> = { page, size, sort };
    if (region) params.regions = region;
    if (withinNY) params.withinNewYork = withinNY;
    if (county.trim()) params.counties = county.trim();

    const { data, isLoading, error, refetch, isFetching } = useQuery<{ content: OrderRow[]; page: PageMeta }>({
        queryKey: ['test-orders', page, size, sort, region, withinNY, county],
        queryFn: () => apiClient.get('/orders', { params }).then((r) => r.data),
    });

    const orders = data?.content ?? [];
    const meta = data?.page;
    const totalPages = meta?.totalPages ?? 0;

    return (
        <Section title='Orders' endpoint='/orders' icon={<StorageIcon color='primary' />} onRefresh={() => refetch()} isRefreshing={isFetching}>
            {/* ── Controls ── */}
            <Stack direction='row' flexWrap='wrap' gap={2} mb={2} alignItems='center'>
                <FormControl size='small' sx={{ minWidth: 130 }}>
                    <InputLabel>Sort</InputLabel>
                    <Select value={sort} label='Sort' onChange={(e: SelectChangeEvent) => { setSort(e.target.value); setPage(0); }}>
                        {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size='small' sx={{ minWidth: 100 }}>
                    <InputLabel>Size</InputLabel>
                    <Select value={String(size)} label='Size' onChange={(e: SelectChangeEvent) => { setSize(Number(e.target.value)); setPage(0); }}>
                        {PAGE_SIZES.map((s) => <MenuItem key={s} value={String(s)}>{s}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size='small' sx={{ minWidth: 140 }}>
                    <InputLabel>Region</InputLabel>
                    <Select value={region} label='Region' onChange={(e: SelectChangeEvent) => { setRegion(e.target.value); setPage(0); }}>
                        {REGIONS.map((r) => <MenuItem key={r} value={r}>{r || 'All Regions'}</MenuItem>)}
                    </Select>
                </FormControl>

                <ToggleButtonGroup
                    size='small'
                    exclusive
                    value={withinNY}
                    onChange={(_, v) => { if (v !== null) { setWithinNY(v); setPage(0); } }}
                >
                    {WITHIN_NY_OPTIONS.map((o) => (
                        <ToggleButton key={o.value} value={o.value} sx={{ textTransform: 'none', px: 2 }}>
                            {o.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                <TextField
                    size='small'
                    label='County'
                    placeholder='e.g. Suffolk'
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setPage(0); refetch(); } }}
                    sx={{ width: 140 }}
                />
            </Stack>

            {/* ── Status ── */}
            <Typography variant='body2' color='text.secondary' mb={1}>
                Page {(meta?.number ?? 0) + 1} of {totalPages} · {fmt(meta?.totalElements ?? 0)} total
            </Typography>

            {/* ── Table ── */}
            {isLoading ? (
                <CircularProgress size={24} />
            ) : error ? (
                <Alert severity='error'>Failed to load orders</Alert>
            ) : (
                <TableContainer sx={styles.tableContainer}>
                    <Table size='small' stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>County</TableCell>
                                <TableCell>Region</TableCell>
                                <TableCell align='right'>Subtotal</TableCell>
                                <TableCell align='right'>Tax Rate</TableCell>
                                <TableCell align='right'>Tax</TableCell>
                                <TableCell align='right'>Total</TableCell>
                                <TableCell align='center'>NY?</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align='center'>
                                        <Typography variant='body2' color='text.secondary'>No orders</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((o) => (
                                    <TableRow key={o.id}>
                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{o.id.slice(0, 8)}…</TableCell>
                                        <TableCell>{o.county ?? '—'}</TableCell>
                                        <TableCell>{o.region ?? '—'}</TableCell>
                                        <TableCell align='right'>{fmtCurrency(o.subtotal)}</TableCell>
                                        <TableCell align='right'>{fmtPct(o.composite_tax_rate)}</TableCell>
                                        <TableCell align='right'>{fmtCurrency(o.tax_amount)}</TableCell>
                                        <TableCell align='right'>{fmtCurrency(o.total_amount)}</TableCell>
                                        <TableCell align='center'>
                                            <Chip
                                                label={o.is_within_new_york ? 'Yes' : 'No'}
                                                size='small'
                                                color={o.is_within_new_york ? 'success' : 'default'}
                                                variant='outlined'
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* ── Pagination ── */}
            <Stack direction='row' spacing={1} mt={2} justifyContent='center' alignItems='center'>
                <Button size='small' variant='outlined' disabled={page === 0} onClick={() => setPage(0)}>First</Button>
                <Button size='small' variant='outlined' disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <Chip label={`${page + 1} / ${totalPages || 1}`} size='small' />
                <Button size='small' variant='outlined' disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                <Button size='small' variant='outlined' disabled={page + 1 >= totalPages} onClick={() => setPage(totalPages - 1)}>Last</Button>
            </Stack>
        </Section>
    );
};

/* ─────────────────────────────────────────────
   3. Map Counties
   ───────────────────────────────────────────── */

const MapCountiesSection = () => {
    const { data, isLoading, error, refetch, isFetching } = useQuery<MapCounty[]>({
        queryKey: ['test-counties'],
        queryFn: () => apiClient.get('/map/counties').then((r) => r.data),
    });

    const counties = data ?? [];

    return (
        <Section
            title={`Counties (${counties.length})`}
            endpoint='/map/counties'
            icon={<MapIcon color='primary' />}
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
        >
            {isLoading ? <CircularProgress size={24} /> : error ? <Alert severity='error'>Failed to load counties</Alert> : (
                <TableContainer sx={styles.tableContainer}>
                    <Table size='small' stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>County</TableCell>
                                <TableCell align='right'>Orders</TableCell>
                                <TableCell align='right'>Revenue</TableCell>
                                <TableCell align='right'>Avg Tax</TableCell>
                                <TableCell align='right'>Avg Order</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {counties.map((c) => (
                                <TableRow key={c.county}>
                                    <TableCell>{c.county}</TableCell>
                                    <TableCell align='right'>{fmt(c.order_count)}</TableCell>
                                    <TableCell align='right'>{fmtCurrency(c.total_revenue)}</TableCell>
                                    <TableCell align='right'>{fmtPct(c.average_tax_rate)}</TableCell>
                                    <TableCell align='right'>{fmtCurrency(c.average_order_value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Section>
    );
};

/* ─────────────────────────────────────────────
   4. Import Files
   ───────────────────────────────────────────── */

const ImportFilesSection = () => {
    const [page, setPage] = useState(0);
    const pageSize = 5;

    const { data, isLoading, error, refetch, isFetching } = useQuery<{ content: ImportFile[]; page: PageMeta }>({
        queryKey: ['test-imports', page],
        queryFn: () => apiClient.get('/orders/import-files', { params: { page, size: pageSize } }).then((r) => r.data),
    });

    const files = data?.content ?? [];
    const meta = data?.page;
    const totalPages = meta?.totalPages ?? 0;

    return (
        <Section
            title='Import Files'
            endpoint='/orders/import-files'
            icon={<UploadFileIcon color='primary' />}
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
        >
            {isLoading ? <CircularProgress size={24} /> : error ? <Alert severity='error'>Failed to load imports</Alert> : (
                <>
                    <Typography variant='body2' color='text.secondary' mb={1}>
                        {fmt(meta?.totalElements ?? 0)} total files
                    </Typography>
                    <TableContainer sx={styles.tableContainer}>
                        <Table size='small' stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Filename</TableCell>
                                    <TableCell align='right'>Total</TableCell>
                                    <TableCell align='right'>OK</TableCell>
                                    <TableCell align='right'>Failed</TableCell>
                                    <TableCell align='right'>Out of NY</TableCell>
                                    <TableCell align='right'>Speed</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {files.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align='center'>
                                            <Typography variant='body2' color='text.secondary'>No imports</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    files.map((f) => (
                                        <TableRow key={f.id}>
                                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{f.original_filename}</TableCell>
                                            <TableCell align='right'>{fmt(f.total_records)}</TableCell>
                                            <TableCell align='right'>{fmt(f.successful_records)}</TableCell>
                                            <TableCell align='right'>{fmt(f.failed_records)}</TableCell>
                                            <TableCell align='right'>{fmt(f.out_of_ny_records)}</TableCell>
                                            <TableCell align='right'>{f.records_per_second ? `${fmt(f.records_per_second)} rec/s` : '—'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={f.status}
                                                    size='small'
                                                    color={f.status === 'COMPLETED' ? 'success' : f.status === 'FAILED' ? 'error' : 'default'}
                                                    variant='outlined'
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Stack direction='row' spacing={1} mt={2} justifyContent='center' alignItems='center'>
                        <Button size='small' variant='outlined' disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                        <Chip label={`${page + 1} / ${totalPages || 1}`} size='small' />
                        <Button size='small' variant='outlined' disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                    </Stack>
                </>
            )}
        </Section>
    );
};

/* ─────────────────────────────────────────────
   5. Cache Management
   ───────────────────────────────────────────── */

const CacheSection = () => {
    const queryClient = useQueryClient();

    const cacheStats = useQuery<{ geoTaxCacheSize: number }>({
        queryKey: ['test-cache-stats'],
        queryFn: () => apiClient.get('/map/cache/stats').then((r) => r.data),
    });

    const evictMutation = useMutation({
        mutationFn: () => apiClient.post('/dashboard/cache/evict').then((r) => r.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['test-cache-stats'] }),
    });

    return (
        <Section title='Cache Management' endpoint='/dashboard/cache/evict' method='POST' icon={<CachedIcon color='primary' />}>
            <Stack direction='row' alignItems='center' spacing={3} flexWrap='wrap'>
                <StatCard label='GeoJSON Tax Cache' value={cacheStats.data ? fmt(cacheStats.data.geoTaxCacheSize) : '—'} />
                <Button
                    variant='contained'
                    color='warning'
                    startIcon={<DeleteSweepIcon />}
                    onClick={() => evictMutation.mutate()}
                    disabled={evictMutation.isPending}
                >
                    {evictMutation.isPending ? 'Evicting…' : 'Evict All Caches'}
                </Button>
                {evictMutation.isSuccess && <Alert severity='success' sx={{ py: 0 }}>Caches evicted</Alert>}
                {evictMutation.isError && <Alert severity='error' sx={{ py: 0 }}>Failed</Alert>}
            </Stack>
        </Section>
    );
};

/* ─────────────────────────────────────────────
   6. Delete All Orders (test)
   ───────────────────────────────────────────── */

const DeleteAllOrdersSection = () => {
    const queryClient = useQueryClient();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const deleteMutation = useMutation<{ message: string; deletedCount: number }>({
        mutationFn: () => apiClient.delete('/orders/all').then((r) => r.data),
        onSuccess: (data) => {
            queryClient.invalidateQueries();
            setConfirmOpen(false);
            window.alert(`Deleted ${data.deletedCount} orders`);
        },
    });

    return (
        <Section title='⚠️ Delete All Orders' endpoint='/orders/all' method='DELETE' icon={<DeleteSweepIcon color='error' />}>
            <Typography variant='body2' color='text.secondary' mb={2}>
                Hard-deletes <strong>all</strong> orders, tax breakdowns, and import files. This cannot be undone.
            </Typography>
            {!confirmOpen ? (
                <Button variant='outlined' color='error' startIcon={<DeleteSweepIcon />} onClick={() => setConfirmOpen(true)}>
                    Delete All Orders…
                </Button>
            ) : (
                <Stack direction='row' spacing={2} alignItems='center'>
                    <Button
                        variant='contained'
                        color='error'
                        startIcon={<DeleteSweepIcon />}
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? 'Deleting…' : 'Confirm Delete ALL'}
                    </Button>
                    <Button variant='outlined' onClick={() => setConfirmOpen(false)} disabled={deleteMutation.isPending}>
                        Cancel
                    </Button>
                    {deleteMutation.isError && <Alert severity='error' sx={{ py: 0 }}>Failed to delete</Alert>}
                </Stack>
            )}
        </Section>
    );
};

/* ─────────────────────────────────────────────
   Page root
   ───────────────────────────────────────────── */

const TestPage = () => (
    <Box sx={styles.pageRoot}>
        <Box sx={styles.container}>
            <Box component={Link} to='/' sx={styles.backLink}>
                <ArrowBackIcon fontSize='small' />
                Back to Orders
            </Box>

            <Typography variant='h4' sx={styles.pageTitle}>API Test Page</Typography>
            <Typography variant='body2' sx={styles.pageSubtitle}>
                Interactive demo of all major endpoints. Sort, filter, and paginate using the controls below.
            </Typography>

            <DashboardSection />
            <OrdersSection />
            <MapCountiesSection />
            <ImportFilesSection />
            <CacheSection />
            <DeleteAllOrdersSection />
        </Box>
    </Box>
);

export default TestPage;

import { Box, Typography, Grid, Paper, Stack, Skeleton, alpha } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { dashboardApi, type DashboardStats, type RegionBreakdown, type TaxRateBucket } from '../../api/dashboard';

const COLORS = ['#2e7d5b', '#1a6b6a', '#3d9970', '#5cb39a', '#7ecbbf'];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatPercent(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
}

function StatCard({ title, value, subtitle }: StatCardProps) {
    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="overline" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            )}
        </Paper>
    );
}

function StatCardSkeleton() {
    return (
        <Paper sx={{ p: 3, height: '100%' }}>
            <Skeleton width={80} height={16} />
            <Skeleton width={120} height={40} sx={{ my: 1 }} />
            <Skeleton width={100} height={14} />
        </Paper>
    );
}

interface RevenueChartProps {
    data: RegionBreakdown[];
}

function RevenueChart({ data }: RevenueChartProps) {
    const chartData = data.map((r) => ({
        name: r.region,
        revenue: r.total_revenue,
        orders: r.order_count,
    }));

    return (
        <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
                Revenue by Region
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0' }}
                    />
                    <Bar dataKey="revenue" fill="#2e7d5b" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
}

interface TaxDistributionChartProps {
    data: TaxRateBucket[];
}

function TaxDistributionChart({ data }: TaxDistributionChartProps) {
    const chartData = data.map((d, i) => ({
        name: d.rate_label,
        value: d.order_count,
        color: COLORS[i % COLORS.length],
    }));

    return (
        <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
                Tax Rate Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={{ stroke: '#888', strokeWidth: 1 }}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => `${value.toLocaleString()} orders`}
                        contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Paper>
    );
}

interface TopCountiesChartProps {
    data: DashboardStats['top_counties'];
}

function TopCountiesChart({ data }: TopCountiesChartProps) {
    const chartData = data.slice(0, 10).map((c) => ({
        name: c.county,
        orders: c.order_count,
        revenue: c.total_revenue,
    }));

    return (
        <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
                Top 10 Counties by Orders
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                    <Tooltip
                        formatter={(value: number, name: string) =>
                            name === 'orders' ? value.toLocaleString() : formatCurrency(value)
                        }
                        contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0' }}
                    />
                    <Legend />
                    <Bar dataKey="orders" fill="#2e7d5b" radius={[0, 4, 4, 0]} name="Orders" />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
}

interface RegionTableProps {
    data: RegionBreakdown[];
}

function RegionTable({ data }: RegionTableProps) {
    return (
        <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Region Breakdown
            </Typography>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                        <Box component="th" sx={{ textAlign: 'left', py: 1, px: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                            Region
                        </Box>
                        <Box component="th" sx={{ textAlign: 'right', py: 1, px: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                            Orders
                        </Box>
                        <Box component="th" sx={{ textAlign: 'right', py: 1, px: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                            Revenue
                        </Box>
                        <Box component="th" sx={{ textAlign: 'right', py: 1, px: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                            Avg Tax
                        </Box>
                    </Box>
                </Box>
                <Box component="tbody">
                    {data.map((row) => (
                        <Box
                            component="tr"
                            key={row.region}
                            sx={{
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) },
                            }}
                        >
                            <Box component="td" sx={{ py: 1.5, px: 1, fontSize: '0.875rem' }}>
                                {row.region}
                            </Box>
                            <Box component="td" sx={{ py: 1.5, px: 1, fontSize: '0.875rem', textAlign: 'right' }}>
                                {row.order_count.toLocaleString()}
                            </Box>
                            <Box component="td" sx={{ py: 1.5, px: 1, fontSize: '0.875rem', textAlign: 'right' }}>
                                {formatCurrency(row.total_revenue)}
                            </Box>
                            <Box component="td" sx={{ py: 1.5, px: 1, fontSize: '0.875rem', textAlign: 'right' }}>
                                {formatPercent(row.average_tax_rate)}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}

export default function DashboardPage() {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: dashboardApi.getStats,
        staleTime: 5 * 60 * 1000,
    });

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">Failed to load dashboard data: {String(error)}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Dashboard
            </Typography>

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    {isLoading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="Total Orders"
                            value={stats!.total_orders.toLocaleString()}
                            subtitle={`${stats!.valid_orders.toLocaleString()} valid, ${stats!.invalid_orders.toLocaleString()} out of NY`}
                        />
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    {isLoading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="Total Revenue"
                            value={formatCurrency(stats!.total_revenue)}
                            subtitle={`Subtotal: ${formatCurrency(stats!.total_subtotal)}`}
                        />
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    {isLoading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="Tax Collected"
                            value={formatCurrency(stats!.total_tax)}
                            subtitle={`Avg rate: ${formatPercent(stats!.average_tax_rate)}`}
                        />
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    {isLoading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="Average Order"
                            value={formatCurrency(stats!.average_order_value)}
                            subtitle={`Range: ${formatCurrency(stats!.min_subtotal)} - ${formatCurrency(stats!.max_subtotal)}`}
                        />
                    )}
                </Grid>
            </Grid>

            {/* Charts Row 1 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    {isLoading ? (
                        <Paper sx={{ p: 3, height: 400 }}>
                            <Skeleton width={200} height={28} />
                            <Skeleton variant="rectangular" height={320} sx={{ mt: 2, borderRadius: 2 }} />
                        </Paper>
                    ) : (
                        <RevenueChart data={stats!.region_breakdown} />
                    )}
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    {isLoading ? (
                        <Paper sx={{ p: 3, height: 400 }}>
                            <Skeleton width={200} height={28} />
                            <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', mt: 4 }} />
                        </Paper>
                    ) : (
                        <TaxDistributionChart data={stats!.tax_rate_distribution} />
                    )}
                </Grid>
            </Grid>

            {/* Charts Row 2 */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 6 }}>
                    {isLoading ? (
                        <Paper sx={{ p: 3, height: 400 }}>
                            <Skeleton width={200} height={28} />
                            <Skeleton variant="rectangular" height={320} sx={{ mt: 2, borderRadius: 2 }} />
                        </Paper>
                    ) : (
                        <TopCountiesChart data={stats!.top_counties} />
                    )}
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                    {isLoading ? (
                        <Paper sx={{ p: 3, height: 400 }}>
                            <Skeleton width={200} height={28} />
                            <Skeleton variant="rectangular" height={320} sx={{ mt: 2, borderRadius: 2 }} />
                        </Paper>
                    ) : (
                        <RegionTable data={stats!.region_breakdown} />
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}

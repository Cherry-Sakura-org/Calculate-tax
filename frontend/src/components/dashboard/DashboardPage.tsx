import { Box, Grid, Typography, Skeleton } from '@mui/material';
import { useDashboard } from '../../api/use-dashboard';
import CountyHeatMap from './CountyHeatMap';
import * as styles from './dashboard.styles';

function formatCurrency(value: number) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DashboardSkeleton() {
    return (
        <Box sx={styles.page}>
            <Grid container spacing={2}>
                {Array.from({ length: 4 }, (_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={styles.statCard}>
                            <Skeleton width={100} height={20} />
                            <Skeleton width={140} height={36} sx={{ mt: 0.5 }} />
                            <Skeleton width={180} height={18} sx={{ mt: 0.5 }} />
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <Box sx={styles.chartContainer}>
                <Skeleton width={160} height={28} sx={{ mb: 2 }} />
                <Skeleton variant='rectangular' height={400} sx={{ borderRadius: 1 }} />
            </Box>
        </Box>
    );
}

export default function DashboardPage() {
    const { data, isLoading } = useDashboard();

    if (isLoading) return <DashboardSkeleton />;

    if (!data) return null;

    const cards = [
        {
            label: 'Total Orders',
            value: data.total_orders.toLocaleString(),
            subtitle: `${data.valid_orders} valid, ${data.invalid_orders} out of NY`,
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(data.total_subtotal),
            subtitle: `With tax: ${formatCurrency(data.total_revenue)}`,
        },
        {
            label: 'Tax Collected',
            value: formatCurrency(data.total_tax),
            subtitle: `Avg rate: ${(data.average_tax_rate * 100).toFixed(2)}%`,
        },
        {
            label: 'Average Order',
            value: formatCurrency(data.average_order_value),
            subtitle: `Range: ${formatCurrency(data.min_subtotal)} – ${formatCurrency(data.max_subtotal)}`,
        },
    ];

    return (
        <Box sx={styles.page}>
            <Grid container spacing={2}>
                {cards.map((card) => (
                    <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={styles.statCard}>
                            <Typography sx={styles.statLabel}>{card.label}</Typography>
                            <Typography sx={styles.statValue}>{card.value}</Typography>
                            <Typography sx={styles.statSubtitle}>{card.subtitle}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <CountyHeatMap />
        </Box>
    );
}

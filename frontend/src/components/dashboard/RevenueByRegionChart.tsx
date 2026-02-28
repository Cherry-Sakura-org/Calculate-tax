import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { RegionSummary } from '../../types/dashboard';

interface Props {
    data: RegionSummary[];
}

const BAR_COLOR = '#2e7d5b';

const formatYAxis = (value: number) => (value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`);

const formatTooltip = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

export default function RevenueByRegionChart({ data }: Props) {
    return (
        <ResponsiveContainer width='100%' height={350}>
            <BarChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis dataKey='region' tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                <Tooltip formatter={formatTooltip} labelStyle={{ fontWeight: 600 }} />
                <Bar dataKey='total_revenue' name='Revenue' fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

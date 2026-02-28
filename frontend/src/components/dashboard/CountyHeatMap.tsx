import { useState, useMemo, useCallback } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Skeleton, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import { schemeGreens } from 'd3-scale-chromatic';
import { useCountyBoundaries, useCountyData } from '../../api/use-dashboard';
import type { MapCountyResponse } from '../../types/order';
import * as styles from './county-heat-map.styles';

type Metric = 'order_count' | 'total_revenue' | 'average_order_value';

const METRIC_OPTIONS: { value: Metric; label: string }[] = [
    { value: 'order_count', label: 'Orders Count' },
    { value: 'total_revenue', label: 'Total Revenue' },
    { value: 'average_order_value', label: 'Avg Order Value' },
];

const DEFAULT_COLOR = '#EEE';
const COLOR_RANGE = schemeGreens[9];

// NY center approx
const NY_CENTER: [number, number] = [-75.5, 42.8];

function formatMetricValue(metric: Metric, value: number): string {
    if (metric === 'order_count') return value.toLocaleString();
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function normalizeCountyName(name: string): string {
    return name.toLowerCase().replace(/\s+county$/i, '').trim();
}

export default function CountyHeatMap() {
    const { data: boundaries, isLoading: boundariesLoading } = useCountyBoundaries();
    const { data: countyData, isLoading: dataLoading } = useCountyData();
    const [metric, setMetric] = useState<Metric>('order_count');
    const [tooltip, setTooltip] = useState<{ name: string; value: number; x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState(1);
    const [center, setCenter] = useState<[number, number]>(NY_CENTER);

    const dataByCounty = useMemo(() => {
        if (!countyData) return new Map<string, MapCountyResponse>();
        const map = new Map<string, MapCountyResponse>();
        for (const item of countyData) {
            map.set(normalizeCountyName(item.county), item);
        }
        return map;
    }, [countyData]);

    const colorScale = useMemo(() => {
        if (!countyData?.length) return null;
        const values = countyData.map((d) => d[metric]);
        return scaleQuantile<string>().domain(values).range(COLOR_RANGE as unknown as string[]);
    }, [countyData, metric]);

    const topCounties = useMemo(() => {
        if (!countyData) return [];
        return [...countyData].sort((a, b) => b[metric] - a[metric]).slice(0, 10);
    }, [countyData, metric]);

    const [minValue, maxValue] = useMemo(() => {
        if (!countyData?.length) return [0, 0];
        const values = countyData.map((d) => d[metric]);
        return [Math.min(...values), Math.max(...values)];
    }, [countyData, metric]);

    const handleMetricChange = useCallback((_: unknown, value: Metric | null) => {
        if (value) setMetric(value);
    }, []);

    const handleMouseEnter = useCallback(
        (geo: { properties: { NAME?: string; name?: string } }, evt: React.MouseEvent) => {
            const countyName = geo.properties.NAME || geo.properties.name || '';
            const data = dataByCounty.get(normalizeCountyName(countyName));
            if (data) {
                setTooltip({
                    name: countyName,
                    value: data[metric],
                    x: evt.clientX,
                    y: evt.clientY,
                });
            }
        },
        [dataByCounty, metric],
    );

    const handleMouseLeave = useCallback(() => setTooltip(null), []);

    const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.5, 8)), []);
    const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.5, 1)), []);
    const handleReset = useCallback(() => {
        setZoom(1);
        setCenter(NY_CENTER);
    }, []);
    const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
        setCenter(position.coordinates);
        setZoom(position.zoom);
    }, []);

    if (boundariesLoading || dataLoading) {
        return (
            <Box sx={styles.container}>
                <Skeleton width={180} height={28} sx={{ mb: 2 }} />
                <Box sx={styles.content}>
                    <Box sx={styles.mapWrapper}>
                        <Skeleton variant='rectangular' height={400} sx={{ borderRadius: 1 }} />
                    </Box>
                    <Box sx={styles.sidebar}>
                        <Skeleton width={160} height={20} sx={{ mb: 1 }} />
                        {Array.from({ length: 10 }, (_, i) => (
                            <Box key={i} sx={{ py: 0.75, px: 1 }}>
                                <Skeleton width={`${70 + Math.random() * 30}%`} height={18} />
                                <Skeleton height={4} sx={{ mt: 0.5, borderRadius: 0.5 }} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        );
    }

    if (!boundaries || !countyData) return null;

    return (
        <Box sx={styles.container}>
            <Typography sx={styles.title}>Orders by County</Typography>

            <ToggleButtonGroup value={metric} exclusive onChange={handleMetricChange} size='small' sx={styles.toggleGroup}>
                {METRIC_OPTIONS.map((opt) => (
                    <ToggleButton key={opt.value} value={opt.value}>
                        {opt.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>

            <Box sx={styles.content}>
                <Box sx={styles.mapWrapper}>
                    <ComposableMap
                        projection='geoMercator'
                        projectionConfig={{ center: NY_CENTER, scale: 5800 }}
                        width={800}
                        height={750}
                        style={{ width: '100%', height: 'auto', maxHeight: 500 }}
                    >
                        <ZoomableGroup
                            zoom={zoom}
                            center={center}
                            minZoom={1}
                            maxZoom={8}
                            onMoveEnd={handleMoveEnd}
                        >
                            <Geographies geography={boundaries}>
                                {({ geographies }) => (
                                    <>
                                        {geographies.map((geo) => {
                                            const countyName = geo.properties.NAME || geo.properties.name || '';
                                            const data = dataByCounty.get(normalizeCountyName(countyName));
                                            const fill = data && colorScale ? colorScale(data[metric]) : DEFAULT_COLOR;

                                            return (
                                                <Geography
                                                    key={geo.rsmKey}
                                                    geography={geo}
                                                    fill={fill}
                                                    stroke='#fff'
                                                    strokeWidth={0.5}
                                                    style={{
                                                        default: { outline: 'none' },
                                                        hover: { outline: 'none', fill: '#FFCA28', cursor: 'pointer' },
                                                        pressed: { outline: 'none' },
                                                    }}
                                                    onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                                                    onMouseLeave={handleMouseLeave}
                                                />
                                            );
                                        })}
                                        {geographies.map((geo) => (
                                            <Geography
                                                key={`outline-${geo.rsmKey}`}
                                                geography={geo}
                                                fill='none'
                                                stroke='#333'
                                                strokeWidth={0.8}
                                                style={{
                                                    default: { outline: 'none', pointerEvents: 'none' },
                                                    hover: { outline: 'none', pointerEvents: 'none' },
                                                    pressed: { outline: 'none', pointerEvents: 'none' },
                                                }}
                                            />
                                        ))}
                                    </>
                                )}
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>

                    <Box sx={styles.zoomControls}>
                        <IconButton size='small' onClick={handleZoomIn} title='Zoom in'>
                            <AddIcon fontSize='small' />
                        </IconButton>
                        <IconButton size='small' onClick={handleZoomOut} title='Zoom out'>
                            <RemoveIcon fontSize='small' />
                        </IconButton>
                        <IconButton size='small' onClick={handleReset} title='Reset'>
                            <RestartAltIcon fontSize='small' />
                        </IconButton>
                    </Box>

                    {tooltip && (
                        <Box
                            sx={{
                                ...styles.tooltip,
                                left: tooltip.x + 12,
                                top: tooltip.y - 40,
                                position: 'fixed',
                            }}
                        >
                            <Typography sx={styles.tooltipCounty}>{tooltip.name}</Typography>
                            <Typography sx={styles.tooltipValue}>
                                {METRIC_OPTIONS.find((o) => o.value === metric)?.label}: {formatMetricValue(metric, tooltip.value)}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={styles.legend}>
                        <Box sx={styles.legendGradient(COLOR_RANGE as unknown as string[])} />
                        <Box sx={styles.legendTicks}>
                            {Array.from({ length: 5 }, (_, i) => {
                                const value = minValue + (maxValue - minValue) * (i / 4);
                                return (
                                    <Typography key={i} sx={styles.legendLabel}>
                                        {formatMetricValue(metric, value)}
                                    </Typography>
                                );
                            })}
                        </Box>
                    </Box>
                </Box>

                <Box sx={styles.sidebar}>
                    <Typography sx={styles.sidebarTitle}>
                        Top 10 Counties by {METRIC_OPTIONS.find((o) => o.value === metric)?.label}
                    </Typography>
                    {topCounties.map((county, i) => {
                        const pct = maxValue > 0 ? (county[metric] / maxValue) * 100 : 0;
                        return (
                            <Box key={county.county} sx={styles.rankRow}>
                                <Box sx={styles.rankHeader}>
                                    <Typography sx={styles.rankName}>
                                        {i + 1}. {county.county}
                                    </Typography>
                                    <Typography sx={styles.rankValue}>{formatMetricValue(metric, county[metric])}</Typography>
                                </Box>
                                <Box sx={styles.rankBarTrack}>
                                    <Box sx={styles.rankBarFill(pct)} />
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}

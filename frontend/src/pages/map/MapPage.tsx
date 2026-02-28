import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Skeleton,
    Divider,
    alpha,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import * as d3 from 'd3';
import { mapApi, type MapCounty } from '../../api/dashboard';
import { apiClient } from '../../api/client';

type ColorMetric = 'order_count' | 'total_revenue' | 'average_tax_rate';

interface CountyBoundaries {
    type: 'FeatureCollection';
    features: Array<{
        type: 'Feature';
        geometry: {
            type: 'Polygon' | 'MultiPolygon';
            coordinates: number[][][] | number[][][][];
        };
        properties: {
            name: string;
            geoid?: string;
        };
    }>;
}

interface TooltipData {
    county: string;
    orderCount: number;
    revenue: number;
    avgTaxRate: number;
    x: number;
    y: number;
}

const metricLabels: Record<ColorMetric, string> = {
    order_count: 'Order Count',
    total_revenue: 'Revenue',
    average_tax_rate: 'Avg Tax Rate',
};

function formatValue(value: number, metric: ColorMetric): string {
    switch (metric) {
        case 'order_count':
            return value.toLocaleString();
        case 'total_revenue':
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(value);
        case 'average_tax_rate':
            return `${(value * 100).toFixed(2)}%`;
        default:
            return String(value);
    }
}

interface MapLegendProps {
    colorScale: d3.ScaleSequential<string>;
    metric: ColorMetric;
    domain: [number, number];
}

function MapLegend({ colorScale, metric, domain }: MapLegendProps) {
    const legendRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!legendRef.current) return;

        const svg = d3.select(legendRef.current);
        svg.selectAll('*').remove();

        const width = 200;
        const height = 12;

        const defs = svg.append('defs');
        const gradient = defs
            .append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('x2', '100%');

        const stops = d3.range(0, 1.01, 0.1);
        stops.forEach((t) => {
            gradient
                .append('stop')
                .attr('offset', `${t * 100}%`)
                .attr('stop-color', colorScale(domain[0] + t * (domain[1] - domain[0])));
        });

        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('rx', 4)
            .style('fill', 'url(#legend-gradient)');

        svg.append('text')
            .attr('x', 0)
            .attr('y', height + 14)
            .attr('font-size', '11px')
            .attr('fill', '#666')
            .text(formatValue(domain[0], metric));

        svg.append('text')
            .attr('x', width)
            .attr('y', height + 14)
            .attr('font-size', '11px')
            .attr('fill', '#666')
            .attr('text-anchor', 'end')
            .text(formatValue(domain[1], metric));
    }, [colorScale, metric, domain]);

    return <svg ref={legendRef} width={200} height={30} />;
}

interface CountyMapProps {
    boundaries: CountyBoundaries;
    countyData: MapCounty[];
    metric: ColorMetric;
    onHover: (data: TooltipData | null) => void;
}

function CountyMap({ boundaries, countyData, metric, onHover }: CountyMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    const countyDataMap = useMemo(() => {
        const map = new Map<string, MapCounty>();
        countyData.forEach((c) => {
            map.set(c.county.toLowerCase(), c);
        });
        return map;
    }, [countyData]);

    const { colorScale, domain } = useMemo(() => {
        const values = countyData.map((c) => c[metric]);
        const min = Math.min(...values, 0);
        const max = Math.max(...values, 1);
        const scale = d3.scaleSequential(d3.interpolateGreens).domain([min, max]);
        return { colorScale: scale, domain: [min, max] as [number, number] };
    }, [countyData, metric]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height: Math.max(height, 400) });
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!svgRef.current || !boundaries?.features?.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const { width, height } = dimensions;

        const projection = d3
            .geoAlbers()
            .center([0, 42.5])
            .rotate([74, 0])
            .parallels([40, 44])
            .scale(width * 8)
            .translate([width / 2, height / 2]);

        const pathGenerator = d3.geoPath().projection(projection);

        const g = svg.append('g');

        g.selectAll('path')
            .data(boundaries.features)
            .join('path')
            .attr('d', (d) => pathGenerator(d as d3.GeoPermissibleObjects) || '')
            .attr('fill', (d) => {
                const countyName = d.properties.name?.toLowerCase() || '';
                const data = countyDataMap.get(countyName);
                if (data) {
                    return colorScale(data[metric]);
                }
                return '#e0e0e0';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .attr('cursor', 'pointer')
            .on('mouseenter', function (event, d) {
                d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);

                const countyName = d.properties.name?.toLowerCase() || '';
                const data = countyDataMap.get(countyName);

                if (data) {
                    const [x, y] = d3.pointer(event, svg.node());
                    onHover({
                        county: d.properties.name || 'Unknown',
                        orderCount: data.order_count,
                        revenue: data.total_revenue,
                        avgTaxRate: data.average_tax_rate,
                        x,
                        y,
                    });
                }
            })
            .on('mouseleave', function () {
                d3.select(this).attr('stroke', '#fff').attr('stroke-width', 0.5);
                onHover(null);
            });

        // Zoom behavior
        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);
    }, [boundaries, countyDataMap, colorScale, metric, dimensions, onHover]);

    return (
        <Box ref={containerRef} sx={{ width: '100%', height: '100%', minHeight: 400 }}>
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{ display: 'block' }}
            />
            <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                <Paper sx={{ p: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        {metricLabels[metric]}
                    </Typography>
                    <MapLegend colorScale={colorScale} metric={metric} domain={domain} />
                </Paper>
            </Box>
        </Box>
    );
}

export default function MapPage() {
    const [metric, setMetric] = useState<ColorMetric>('order_count');
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    const { data: countyData, isLoading: isLoadingData } = useQuery({
        queryKey: ['map-counties'],
        queryFn: mapApi.getCounties,
        staleTime: 10 * 60 * 1000,
    });

    const { data: boundaries, isLoading: isLoadingBoundaries } = useQuery({
        queryKey: ['map-boundaries'],
        queryFn: () => apiClient.get<CountyBoundaries>('/map/boundaries/counties').then((r) => r.data),
        staleTime: 60 * 60 * 1000,
    });

    const handleHover = useCallback((data: TooltipData | null) => {
        setTooltip(data);
    }, []);

    const isLoading = isLoadingData || isLoadingBoundaries;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    NY Counties Map
                </Typography>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Color by</InputLabel>
                    <Select
                        value={metric}
                        label="Color by"
                        onChange={(e) => setMetric(e.target.value as ColorMetric)}
                    >
                        <MenuItem value="order_count">Order Count</MenuItem>
                        <MenuItem value="total_revenue">Revenue</MenuItem>
                        <MenuItem value="average_tax_rate">Avg Tax Rate</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            <Paper sx={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 500 }}>
                {isLoading ? (
                    <Box sx={{ p: 4 }}>
                        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                    </Box>
                ) : boundaries && countyData ? (
                    <>
                        <CountyMap
                            boundaries={boundaries}
                            countyData={countyData}
                            metric={metric}
                            onHover={handleHover}
                        />
                        {tooltip && (
                            <Paper
                                sx={{
                                    position: 'absolute',
                                    left: tooltip.x + 10,
                                    top: tooltip.y + 10,
                                    p: 2,
                                    pointerEvents: 'none',
                                    zIndex: 10,
                                    minWidth: 180,
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    {tooltip.county}
                                </Typography>
                                <Divider sx={{ mb: 1 }} />
                                <Stack spacing={0.5}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Orders:
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {tooltip.orderCount.toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Revenue:
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {formatValue(tooltip.revenue, 'total_revenue')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Avg Tax:
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {formatValue(tooltip.avgTaxRate, 'average_tax_rate')}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        )}
                    </>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No map data available</Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

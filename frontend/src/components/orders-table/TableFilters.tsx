import { useState, type ReactNode } from 'react';
import {
    Box,
    Stack,
    Typography,
    TextField,
    Button,
    Popover,
    Chip,
    InputAdornment,
    Divider,
    alpha,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PercentIcon from '@mui/icons-material/Percent';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';

export interface TableFilterValues {
    search: string;
    dateFrom: string;
    dateTo: string;
    latitude: string;
    longitude: string;
    minTaxRate: string;
    maxTaxRate: string;
}

const INITIAL_FILTERS: TableFilterValues = {
    search: '',
    dateFrom: '',
    dateTo: '',
    latitude: '',
    longitude: '',
    minTaxRate: '',
    maxTaxRate: '',
};

interface FilterPopoverProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const FilterPopover = ({ anchorEl, open, onClose, title, children }: FilterPopoverProps) => (
    <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
            paper: {
                sx: {
                    mt: 1,
                    p: 2.5,
                    minWidth: 260,
                    bgcolor: '#1a2235',
                    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
                    boxShadow: (t) =>
                        `0 16px 48px ${alpha('#000', 0.5)}, 0 0 24px ${alpha(t.palette.primary.main, 0.06)}`,
                    animation: 'fadeInUp 0.2s ease-out',
                },
            },
        }}
    >
        <Typography
            variant='overline'
            sx={{ display: 'block', mb: 2, color: 'primary.main' }}
        >
            {title}
        </Typography>
        {children}
    </Popover>
);

const TableFilters = () => {
    const [filters, setFilters] = useState<TableFilterValues>(INITIAL_FILTERS);
    const [dateAnchor, setDateAnchor] = useState<HTMLElement | null>(null);
    const [locationAnchor, setLocationAnchor] = useState<HTMLElement | null>(null);
    const [taxRateAnchor, setTaxRateAnchor] = useState<HTMLElement | null>(null);

    const updateFilter = <K extends keyof TableFilterValues>(key: K, value: TableFilterValues[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => setFilters(INITIAL_FILTERS);

    const hasDateFilter = filters.dateFrom || filters.dateTo;
    const hasLocationFilter = filters.latitude || filters.longitude;
    const hasTaxRateFilter = filters.minTaxRate || filters.maxTaxRate;
    const hasAnyFilter =
        filters.search || hasDateFilter || hasLocationFilter || hasTaxRateFilter;

    const activeCount = [filters.search, hasDateFilter, hasLocationFilter, hasTaxRateFilter].filter(
        Boolean,
    ).length;

    return (
        <Box
            sx={{
                px: 3,
                py: 2,
                borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
            }}
        >
            <Stack
                direction='row'
                alignItems='center'
                spacing={2}
                flexWrap='wrap'
                useFlexGap
            >
                {/* Left side: label + search */}
                <Stack direction='row' alignItems='center' spacing={1.5}>
                    <Stack direction='row' alignItems='center' spacing={0.75}>
                        <FilterListIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography
                            variant='caption'
                            sx={{
                                color: 'text.secondary',
                                fontFamily: '"DM Sans", sans-serif',
                                fontWeight: 500,
                                fontSize: '0.8rem',
                            }}
                        >
                            Filters
                        </Typography>
                        {activeCount > 0 && (
                            <Chip
                                label={activeCount}
                                size='small'
                                color='primary'
                                sx={{
                                    height: 20,
                                    minWidth: 20,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    '& .MuiChip-label': { px: 0.75 },
                                }}
                            />
                        )}
                    </Stack>

                    <Divider orientation='vertical' flexItem sx={{ my: 0.5 }} />

                    <TextField
                        placeholder='Search orders...'
                        size='small'
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    height: 36,
                                    fontSize: '0.8rem',
                                    borderRadius: '8px',
                                    '& fieldset': {
                                        borderColor: (t) =>
                                            `${alpha(t.palette.divider, 1)} !important`,
                                    },
                                },
                            },
                        }}
                        sx={{ width: 220 }}
                    />
                </Stack>

                {/* Spacer pushes chips right */}
                <Box sx={{ flex: 1 }} />

                {/* Right side: filter chips + clear */}
                <Stack direction='row' alignItems='center' spacing={1.5}>
                    {/* Clear All */}
                    {hasAnyFilter && (
                        <Button
                            size='small'
                            variant='text'
                            startIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                            onClick={clearFilters}
                            sx={{
                                fontSize: '0.75rem',
                                height: 34,
                                px: 1.5,
                                color: 'text.secondary',
                                '&:hover': { color: 'error.main' },
                            }}
                        >
                            Clear all
                        </Button>
                    )}

                    {/* Date Range Chip */}
                <Chip
                    icon={<CalendarTodayIcon sx={{ fontSize: '14px !important' }} />}
                    label={
                        hasDateFilter
                            ? `${filters.dateFrom || '...'} — ${filters.dateTo || '...'}`
                            : 'Date Range'
                    }
                    size='small'
                    variant={hasDateFilter ? 'filled' : 'outlined'}
                    color={hasDateFilter ? 'primary' : 'default'}
                    onClick={(e) => setDateAnchor(e.currentTarget)}
                    onDelete={hasDateFilter ? () => setFilters((p) => ({ ...p, dateFrom: '', dateTo: '' })) : undefined}
                    sx={{
                        height: 34,
                        px: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        ...(hasDateFilter
                            ? {}
                            : {
                                  borderColor: (t) => alpha(t.palette.divider, 1),
                                  color: 'text.secondary',
                                  '&:hover': {
                                      borderColor: (t) => alpha(t.palette.primary.main, 0.4),
                                      color: 'primary.main',
                                  },
                              }),
                    }}
                />

                {/* Location Chip */}
                <Chip
                    icon={<MyLocationIcon sx={{ fontSize: '14px !important' }} />}
                    label={
                        hasLocationFilter
                            ? `${filters.latitude || '—'}, ${filters.longitude || '—'}`
                            : 'Location'
                    }
                    size='small'
                    variant={hasLocationFilter ? 'filled' : 'outlined'}
                    color={hasLocationFilter ? 'primary' : 'default'}
                    onClick={(e) => setLocationAnchor(e.currentTarget)}
                    onDelete={
                        hasLocationFilter
                            ? () => setFilters((p) => ({ ...p, latitude: '', longitude: '' }))
                            : undefined
                    }
                    sx={{
                        height: 34,
                        px: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        ...(hasLocationFilter
                            ? {}
                            : {
                                  borderColor: (t) => alpha(t.palette.divider, 1),
                                  color: 'text.secondary',
                                  '&:hover': {
                                      borderColor: (t) => alpha(t.palette.primary.main, 0.4),
                                      color: 'primary.main',
                                  },
                              }),
                    }}
                />

                {/* Tax Rate Chip */}
                <Chip
                    icon={<PercentIcon sx={{ fontSize: '14px !important' }} />}
                    label={
                        hasTaxRateFilter
                            ? `${filters.minTaxRate || '0'}% — ${filters.maxTaxRate || '...'}%`
                            : 'Tax Rate'
                    }
                    size='small'
                    variant={hasTaxRateFilter ? 'filled' : 'outlined'}
                    color={hasTaxRateFilter ? 'primary' : 'default'}
                    onClick={(e) => setTaxRateAnchor(e.currentTarget)}
                    onDelete={
                        hasTaxRateFilter
                            ? () => setFilters((p) => ({ ...p, minTaxRate: '', maxTaxRate: '' }))
                            : undefined
                    }
                    sx={{
                        height: 34,
                        px: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        ...(hasTaxRateFilter
                            ? {}
                            : {
                                  borderColor: (t) => alpha(t.palette.divider, 1),
                                  color: 'text.secondary',
                                  '&:hover': {
                                      borderColor: (t) => alpha(t.palette.primary.main, 0.4),
                                      color: 'primary.main',
                                  },
                              }),
                    }}
                />
                </Stack>
            </Stack>

            {/* ── Date Range Popover ── */}
            <FilterPopover
                anchorEl={dateAnchor}
                open={Boolean(dateAnchor)}
                onClose={() => setDateAnchor(null)}
                title='Date Range'
            >
                <Stack spacing={2}>
                    <TextField
                        label='From'
                        type='date'
                        size='small'
                        fullWidth
                        value={filters.dateFrom}
                        onChange={(e) => updateFilter('dateFrom', e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label='To'
                        type='date'
                        size='small'
                        fullWidth
                        value={filters.dateTo}
                        onChange={(e) => updateFilter('dateTo', e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </Stack>
            </FilterPopover>

            {/* ── Location Popover ── */}
            <FilterPopover
                anchorEl={locationAnchor}
                open={Boolean(locationAnchor)}
                onClose={() => setLocationAnchor(null)}
                title='GPS Coordinates'
            >
                <Stack spacing={2}>
                    <TextField
                        label='Latitude'
                        type='number'
                        size='small'
                        fullWidth
                        placeholder='-90 to 90'
                        value={filters.latitude}
                        onChange={(e) => updateFilter('latitude', e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                                            lat
                                        </Typography>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <TextField
                        label='Longitude'
                        type='number'
                        size='small'
                        fullWidth
                        placeholder='-180 to 180'
                        value={filters.longitude}
                        onChange={(e) => updateFilter('longitude', e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                                            lng
                                        </Typography>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Stack>
            </FilterPopover>

            {/* ── Tax Rate Popover ── */}
            <FilterPopover
                anchorEl={taxRateAnchor}
                open={Boolean(taxRateAnchor)}
                onClose={() => setTaxRateAnchor(null)}
                title='Tax Rate Range'
            >
                <Stack spacing={2}>
                    <TextField
                        label='Min Rate'
                        type='number'
                        size='small'
                        fullWidth
                        placeholder='0'
                        value={filters.minTaxRate}
                        onChange={(e) => updateFilter('minTaxRate', e.target.value)}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <PercentIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <TextField
                        label='Max Rate'
                        type='number'
                        size='small'
                        fullWidth
                        placeholder='100'
                        value={filters.maxTaxRate}
                        onChange={(e) => updateFilter('maxTaxRate', e.target.value)}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <PercentIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Stack>
            </FilterPopover>
        </Box>
    );
};

export default TableFilters;

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
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PercentIcon from '@mui/icons-material/Percent';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import * as styles from './table-filters.styles';

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
        slotProps={{ paper: { sx: styles.popoverPaper } }}
    >
        <Typography variant='overline' sx={styles.popoverTitle}>
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

    const updateFilter = <K extends keyof TableFilterValues>(
        key: K,
        value: TableFilterValues[K],
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => setFilters(INITIAL_FILTERS);

    const hasDateFilter = filters.dateFrom || filters.dateTo;
    const hasLocationFilter = filters.latitude || filters.longitude;
    const hasTaxRateFilter = filters.minTaxRate || filters.maxTaxRate;
    const hasAnyFilter = filters.search || hasDateFilter || hasLocationFilter || hasTaxRateFilter;

    const activeCount = [filters.search, hasDateFilter, hasLocationFilter, hasTaxRateFilter].filter(
        Boolean,
    ).length;

    return (
        <Box sx={styles.root}>
            <Stack direction='row' alignItems='center' spacing={2} flexWrap='wrap' useFlexGap>
                {/* Left side: label + search */}
                <Stack direction='row' alignItems='center' spacing={1.5}>
                    <Stack direction='row' alignItems='center' spacing={0.75}>
                        <FilterListIcon sx={styles.filterIcon} />
                        <Typography variant='caption' sx={styles.filterLabel}>
                            Filters
                        </Typography>
                        {activeCount > 0 && (
                            <Chip
                                label={activeCount}
                                size='small'
                                color='primary'
                                sx={styles.activeCountChip}
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
                                        <SearchIcon sx={styles.searchIcon} />
                                    </InputAdornment>
                                ),
                                sx: styles.searchInput,
                            },
                        }}
                        sx={styles.searchField}
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
                            startIcon={<CloseIcon sx={styles.clearIcon} />}
                            onClick={clearFilters}
                            sx={styles.clearButton}
                        >
                            Clear all
                        </Button>
                    )}

                    {/* Date Range Chip */}
                    <Chip
                        icon={<CalendarTodayIcon sx={styles.chipIcon} />}
                        label={
                            hasDateFilter
                                ? `${filters.dateFrom || '...'} — ${filters.dateTo || '...'}`
                                : 'Date Range'
                        }
                        size='small'
                        variant={hasDateFilter ? 'filled' : 'outlined'}
                        color={hasDateFilter ? 'primary' : 'default'}
                        onClick={(e) => setDateAnchor(e.currentTarget)}
                        onDelete={
                            hasDateFilter
                                ? () => setFilters((p) => ({ ...p, dateFrom: '', dateTo: '' }))
                                : undefined
                        }
                        sx={hasDateFilter ? styles.activeFilterChip : styles.inactiveFilterChip}
                    />

                    {/* Location Chip */}
                    <Chip
                        icon={<MyLocationIcon sx={styles.chipIcon} />}
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
                        sx={hasLocationFilter ? styles.activeFilterChip : styles.inactiveFilterChip}
                    />

                    {/* Tax Rate Chip */}
                    <Chip
                        icon={<PercentIcon sx={styles.chipIcon} />}
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
                                ? () =>
                                      setFilters((p) => ({ ...p, minTaxRate: '', maxTaxRate: '' }))
                                : undefined
                        }
                        sx={hasTaxRateFilter ? styles.activeFilterChip : styles.inactiveFilterChip}
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
                                        <Typography variant='caption' sx={styles.adornmentLabel}>
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
                                        <Typography variant='caption' sx={styles.adornmentLabel}>
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
                                        <PercentIcon sx={styles.percentIcon} />
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
                                        <PercentIcon sx={styles.percentIcon} />
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

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
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    ToggleButtonGroup,
    ToggleButton,
    Checkbox,
    ListItemText,
    type SelectChangeEvent,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PercentIcon from '@mui/icons-material/Percent';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PublicIcon from '@mui/icons-material/Public';
import FolderIcon from '@mui/icons-material/Folder';
import * as styles from './table-filters.styles';
import type { ImportFile, OrdersParams } from '../../types/order';

export interface TableFilterValues {
    from: string;
    to: string;
    minLat: string;
    maxLat: string;
    minLon: string;
    maxLon: string;
    minTaxRate: string;
    maxTaxRate: string;
    minSubtotal: string;
    maxSubtotal: string;
    minTotal: string;
    maxTotal: string;
    county: string;
    region: string;
    withinNewYork: 'all' | 'true' | 'false';
    importFileIds: string[];
}

export const INITIAL_FILTERS: TableFilterValues = {
    from: '',
    to: '',
    minLat: '',
    maxLat: '',
    minLon: '',
    maxLon: '',
    minTaxRate: '',
    maxTaxRate: '',
    minSubtotal: '',
    maxSubtotal: '',
    minTotal: '',
    maxTotal: '',
    county: '',
    region: '',
    withinNewYork: 'all',
    importFileIds: [],
};

const REGIONS = [
    'NYC',
    'Long Island',
    'Hudson Valley',
    'Capital District',
    'Upstate',
    'Out of State',
];

export const filtersToParams = (filters: TableFilterValues): Omit<OrdersParams, 'page' | 'size'> => {
    const params: Omit<OrdersParams, 'page' | 'size'> = {};

    if (filters.from) params.from = `${filters.from}T00:00:00`;
    if (filters.to) params.to = `${filters.to}T23:59:59`;
    if (filters.minLat) params.minLat = Number(filters.minLat);
    if (filters.maxLat) params.maxLat = Number(filters.maxLat);
    if (filters.minLon) params.minLon = Number(filters.minLon);
    if (filters.maxLon) params.maxLon = Number(filters.maxLon);
    if (filters.minTaxRate) params.minTaxRate = Number(filters.minTaxRate) / 100;
    if (filters.maxTaxRate) params.maxTaxRate = Number(filters.maxTaxRate) / 100;
    if (filters.minSubtotal) params.minSubtotal = Number(filters.minSubtotal);
    if (filters.maxSubtotal) params.maxSubtotal = Number(filters.maxSubtotal);
    if (filters.minTotal) params.minTotal = Number(filters.minTotal);
    if (filters.maxTotal) params.maxTotal = Number(filters.maxTotal);
    if (filters.county) params.counties = filters.county;
    if (filters.region) params.regions = filters.region;
    if (filters.withinNewYork !== 'all') params.withinNewYork = filters.withinNewYork === 'true';
    if (filters.importFileIds.length > 0) params.importFileIds = filters.importFileIds;

    return params;
};

export const hasActiveFilters = (filters: TableFilterValues): boolean => {
    return (
        filters.from !== '' ||
        filters.to !== '' ||
        filters.minLat !== '' ||
        filters.maxLat !== '' ||
        filters.minLon !== '' ||
        filters.maxLon !== '' ||
        filters.minTaxRate !== '' ||
        filters.maxTaxRate !== '' ||
        filters.minSubtotal !== '' ||
        filters.maxSubtotal !== '' ||
        filters.minTotal !== '' ||
        filters.maxTotal !== '' ||
        filters.county !== '' ||
        filters.region !== '' ||
        filters.withinNewYork !== 'all' ||
        filters.importFileIds.length > 0
    );
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

interface TableFiltersProps {
    filters: TableFilterValues;
    onChange: (filters: TableFilterValues) => void;
    importFiles?: ImportFile[];
}

const TableFilters = ({ filters, onChange, importFiles = [] }: TableFiltersProps) => {
    const [dateAnchor, setDateAnchor] = useState<HTMLElement | null>(null);
    const [locationAnchor, setLocationAnchor] = useState<HTMLElement | null>(null);
    const [taxRateAnchor, setTaxRateAnchor] = useState<HTMLElement | null>(null);
    const [amountAnchor, setAmountAnchor] = useState<HTMLElement | null>(null);

    const updateFilter = <K extends keyof TableFilterValues>(key: K, value: TableFilterValues[K]) => {
        onChange({ ...filters, [key]: value });
    };

    const clearFilters = () => onChange(INITIAL_FILTERS);

    const hasDateFilter = filters.from || filters.to;
    const hasLocationFilter = filters.minLat || filters.maxLat || filters.minLon || filters.maxLon;
    const hasTaxRateFilter = filters.minTaxRate || filters.maxTaxRate;
    const hasAmountFilter =
        filters.minSubtotal || filters.maxSubtotal || filters.minTotal || filters.maxTotal;
    const hasRegionFilter = filters.region;
    const hasCountyFilter = filters.county;
    const hasNyFilter = filters.withinNewYork !== 'all';
    const hasImportFilter = filters.importFileIds.length > 0;
    const hasAnyFilter = hasActiveFilters(filters);

    const activeCount = [
        hasDateFilter,
        hasLocationFilter,
        hasTaxRateFilter,
        hasAmountFilter,
        hasRegionFilter,
        hasCountyFilter,
        hasNyFilter,
        hasImportFilter,
    ].filter(Boolean).length;

    const handleImportFileChange = (e: SelectChangeEvent<string[]>) => {
        const value = e.target.value;
        updateFilter('importFileIds', typeof value === 'string' ? value.split(',') : value);
    };

    return (
        <Box sx={styles.root}>
            <Stack direction='row' alignItems='center' spacing={2} flexWrap='wrap' useFlexGap>
                {/* Left side: label */}
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

                {/* Spacer pushes chips right */}
                <Box sx={{ flex: 1 }} />

                {/* Right side: filter chips + clear */}
                <Stack direction='row' alignItems='center' spacing={1} flexWrap='wrap' useFlexGap>
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
                                ? `${filters.from || '...'} — ${filters.to || '...'}`
                                : 'Date Range'
                        }
                        size='small'
                        variant={hasDateFilter ? 'filled' : 'outlined'}
                        color={hasDateFilter ? 'primary' : 'default'}
                        onClick={(e) => setDateAnchor(e.currentTarget)}
                        onDelete={
                            hasDateFilter
                                ? () => onChange({ ...filters, from: '', to: '' })
                                : undefined
                        }
                        sx={hasDateFilter ? styles.activeFilterChip : styles.inactiveFilterChip}
                    />

                    {/* Location Chip */}
                    <Chip
                        icon={<MyLocationIcon sx={styles.chipIcon} />}
                        label={hasLocationFilter ? 'Location (active)' : 'Location'}
                        size='small'
                        variant={hasLocationFilter ? 'filled' : 'outlined'}
                        color={hasLocationFilter ? 'primary' : 'default'}
                        onClick={(e) => setLocationAnchor(e.currentTarget)}
                        onDelete={
                            hasLocationFilter
                                ? () =>
                                      onChange({
                                          ...filters,
                                          minLat: '',
                                          maxLat: '',
                                          minLon: '',
                                          maxLon: '',
                                      })
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
                                      onChange({ ...filters, minTaxRate: '', maxTaxRate: '' })
                                : undefined
                        }
                        sx={hasTaxRateFilter ? styles.activeFilterChip : styles.inactiveFilterChip}
                    />

                    {/* Amount Chip */}
                    <Chip
                        icon={<AttachMoneyIcon sx={styles.chipIcon} />}
                        label={hasAmountFilter ? 'Amount (active)' : 'Amount'}
                        size='small'
                        variant={hasAmountFilter ? 'filled' : 'outlined'}
                        color={hasAmountFilter ? 'primary' : 'default'}
                        onClick={(e) => setAmountAnchor(e.currentTarget)}
                        onDelete={
                            hasAmountFilter
                                ? () =>
                                      onChange({
                                          ...filters,
                                          minSubtotal: '',
                                          maxSubtotal: '',
                                          minTotal: '',
                                          maxTotal: '',
                                      })
                                : undefined
                        }
                        sx={hasAmountFilter ? styles.activeFilterChip : styles.inactiveFilterChip}
                    />

                    {/* Region Select */}
                    <FormControl size='small' sx={{ minWidth: 130 }}>
                        <InputLabel sx={{ fontSize: '0.8rem' }}>Region</InputLabel>
                        <Select
                            value={filters.region}
                            label='Region'
                            onChange={(e) => updateFilter('region', e.target.value)}
                            sx={styles.selectField}
                        >
                            <MenuItem value=''>
                                <em>All</em>
                            </MenuItem>
                            {REGIONS.map((r) => (
                                <MenuItem key={r} value={r}>
                                    {r}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* County Input */}
                    <TextField
                        placeholder='County...'
                        size='small'
                        value={filters.county}
                        onChange={(e) => updateFilter('county', e.target.value)}
                        slotProps={{ input: { sx: styles.searchInput } }}
                        sx={{ width: 120 }}
                    />

                    {/* NY Status Toggle */}
                    <ToggleButtonGroup
                        value={filters.withinNewYork}
                        exclusive
                        onChange={(_, val) => val && updateFilter('withinNewYork', val)}
                        size='small'
                        sx={styles.toggleGroup}
                    >
                        <ToggleButton value='all' sx={styles.toggleButton}>
                            All
                        </ToggleButton>
                        <ToggleButton value='true' sx={styles.toggleButton}>
                            NY
                        </ToggleButton>
                        <ToggleButton value='false' sx={styles.toggleButton}>
                            Non-NY
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {/* Import File Multi-Select */}
                    {importFiles.length > 0 && (
                        <FormControl size='small' sx={{ minWidth: 160 }}>
                            <InputLabel sx={{ fontSize: '0.8rem' }}>
                                <Stack direction='row' alignItems='center' spacing={0.5}>
                                    <FolderIcon sx={{ fontSize: 14 }} />
                                    <span>Import File</span>
                                </Stack>
                            </InputLabel>
                            <Select
                                multiple
                                value={filters.importFileIds}
                                label='Import File'
                                onChange={handleImportFileChange}
                                renderValue={(selected) => `${selected.length} file(s)`}
                                sx={styles.selectField}
                            >
                                {importFiles.map((f) => (
                                    <MenuItem key={f.id} value={f.id}>
                                        <Checkbox
                                            checked={filters.importFileIds.includes(f.id)}
                                            size='small'
                                        />
                                        <ListItemText
                                            primary={f.original_filename}
                                            secondary={new Date(f.imported_at).toLocaleDateString()}
                                            primaryTypographyProps={{ fontSize: '0.8rem' }}
                                            secondaryTypographyProps={{ fontSize: '0.7rem' }}
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Stack>
            </Stack>

            {/* Date Range Popover */}
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
                        value={filters.from}
                        onChange={(e) => updateFilter('from', e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label='To'
                        type='date'
                        size='small'
                        fullWidth
                        value={filters.to}
                        onChange={(e) => updateFilter('to', e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                </Stack>
            </FilterPopover>

            {/* Location Popover */}
            <FilterPopover
                anchorEl={locationAnchor}
                open={Boolean(locationAnchor)}
                onClose={() => setLocationAnchor(null)}
                title='Bounding Box'
            >
                <Stack spacing={2}>
                    <Stack direction='row' spacing={1}>
                        <TextField
                            label='Min Lat'
                            type='number'
                            size='small'
                            value={filters.minLat}
                            onChange={(e) => updateFilter('minLat', e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Typography variant='caption' sx={styles.adornmentLabel}>
                                                S
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            label='Max Lat'
                            type='number'
                            size='small'
                            value={filters.maxLat}
                            onChange={(e) => updateFilter('maxLat', e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Typography variant='caption' sx={styles.adornmentLabel}>
                                                N
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Stack>
                    <Stack direction='row' spacing={1}>
                        <TextField
                            label='Min Lon'
                            type='number'
                            size='small'
                            value={filters.minLon}
                            onChange={(e) => updateFilter('minLon', e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Typography variant='caption' sx={styles.adornmentLabel}>
                                                W
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            label='Max Lon'
                            type='number'
                            size='small'
                            value={filters.maxLon}
                            onChange={(e) => updateFilter('maxLon', e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Typography variant='caption' sx={styles.adornmentLabel}>
                                                E
                                            </Typography>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Stack>
                </Stack>
            </FilterPopover>

            {/* Tax Rate Popover */}
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

            {/* Amount Popover */}
            <FilterPopover
                anchorEl={amountAnchor}
                open={Boolean(amountAnchor)}
                onClose={() => setAmountAnchor(null)}
                title='Amount Range'
            >
                <Stack spacing={2}>
                    <Typography variant='caption' color='text.secondary'>
                        Subtotal
                    </Typography>
                    <Stack direction='row' spacing={1}>
                        <TextField
                            label='Min'
                            type='number'
                            size='small'
                            value={filters.minSubtotal}
                            onChange={(e) => updateFilter('minSubtotal', e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>$</InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            label='Max'
                            type='number'
                            size='small'
                            value={filters.maxSubtotal}
                            onChange={(e) => updateFilter('maxSubtotal', e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>$</InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Stack>
                    <Typography variant='caption' color='text.secondary'>
                        Total (after tax)
                    </Typography>
                    <Stack direction='row' spacing={1}>
                        <TextField
                            label='Min'
                            type='number'
                            size='small'
                            value={filters.minTotal}
                            onChange={(e) => updateFilter('minTotal', e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>$</InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            label='Max'
                            type='number'
                            size='small'
                            value={filters.maxTotal}
                            onChange={(e) => updateFilter('maxTotal', e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position='start'>$</InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Stack>
                </Stack>
            </FilterPopover>
        </Box>
    );
};

export default TableFilters;

import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    IconButton,
    Popover,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import type { FilterType, RangeFilterValue } from './types';
import * as styles from './filters.styles';

interface RangeFilterProps {
    label: string;
    filterType: Exclude<FilterType, 'jurisdiction'>;
    value: RangeFilterValue;
    onChange: (value: RangeFilterValue) => void;
}

const getInputConfig = (filterType: RangeFilterProps['filterType']) => {
    switch (filterType) {
        case 'range-currency':
            return { type: 'number', fromLabel: 'From ($)', toLabel: 'To ($)', step: '0.01' };
        case 'range-percent':
            return { type: 'number', fromLabel: 'From (%)', toLabel: 'To (%)', step: '0.0001' };
        case 'range-number':
            return { type: 'number', fromLabel: 'From', toLabel: 'To', step: 'any' };
        case 'range-date':
            return { type: 'date', fromLabel: 'From', toLabel: 'To', step: undefined };
        default:
            return { type: 'text', fromLabel: 'From', toLabel: 'To', step: undefined };
    }
};

const MIN_DATE = '1999-01-01';
const MAX_DATE = '2200-12-31';

/** A date is "ready to validate" when it has a 4-digit year ≥ 1000 (i.e. the user finished typing the year). */
const isReadyToValidate = (value: string) => {
    const match = value.match(/^(\d{4})-\d{2}-\d{2}$/);
    return match !== null && Number(match[1]) >= 1000;
};

const validateRange = (
    localValue: RangeFilterValue,
    filterType: RangeFilterProps['filterType'],
): { fromError: string; toError: string } => {
    const errors = { fromError: '', toError: '' };
    const { from, to } = localValue;

    if (!from && !to) return errors;

    if (filterType === 'range-date') {
        const fromReady = from !== '' && isReadyToValidate(from);
        const toReady = to !== '' && isReadyToValidate(to);

        if (fromReady && (from < MIN_DATE || from > MAX_DATE)) {
            errors.fromError = 'Date out of range (1999–2200)';
        }
        if (toReady && (to < MIN_DATE || to > MAX_DATE)) {
            errors.toError = 'Date out of range (1999–2200)';
        }
        if (
            fromReady && toReady &&
            !errors.fromError && !errors.toError &&
            from > to
        ) {
            errors.fromError = '"From" must be before "To"';
        }
    } else if (from !== '' && to !== '') {
        const fromNum = Number(from);
        const toNum = Number(to);
        if (fromNum > toNum) {
            errors.fromError = '"From" must be less than "To"';
        }
    }

    return errors;
};

const RangeFilter = ({ label, filterType, value, onChange }: RangeFilterProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [localValue, setLocalValue] = useState<RangeFilterValue>(value);
    const open = Boolean(anchorEl);

    const hasValue = value.from !== '' || value.to !== '';
    const config = getInputConfig(filterType);
    const isDate = filterType === 'range-date';
    const { fromError, toError } = useMemo(
        () => validateRange(localValue, filterType),
        [localValue, filterType],
    );
    const hasError = fromError !== '' || toError !== '';

    // Sync local state when external value changes while closed
    useEffect(() => {
        if (!open) setLocalValue(value);
    }, [value, open]);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setLocalValue(value);
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        if (!hasError) {
            // Defer the heavy filter update so the popover closes instantly
            // instead of being blocked by the table re-render
            setTimeout(() => onChange(localValue), 0);
        }
    };

    return (
        <>
            <IconButton
                size='small'
                onClick={handleOpen}
                sx={hasValue ? styles.filterIconButtonActive : styles.filterIconButton}
            >
                <FilterListIcon />
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                sx={styles.filterPopover}
                disableRestoreFocus
            >
                <Box sx={styles.filterPopoverContent}>
                    <Typography sx={styles.filterTitle}>
                        {label}
                    </Typography>

                    <Stack sx={styles.rangeInputsStack}>
                        <TextField
                            size='small'
                            fullWidth
                            autoFocus
                            label={config.fromLabel}
                            type={config.type}
                            placeholder={config.fromLabel}
                            value={localValue.from}
                            onChange={(e) => setLocalValue((prev) => ({ ...prev, from: e.target.value }))}
                            error={fromError !== ''}
                            helperText={fromError}
                            slotProps={{
                                htmlInput: {
                                    step: config.step,
                                    ...(isDate && { min: MIN_DATE, max: MAX_DATE }),
                                },
                                inputLabel: { shrink: true },
                            }}
                            sx={styles.rangeInput}
                        />
                        <TextField
                            size='small'
                            fullWidth
                            label={config.toLabel}
                            type={config.type}
                            placeholder={config.toLabel}
                            value={localValue.to}
                            onChange={(e) => setLocalValue((prev) => ({ ...prev, to: e.target.value }))}
                            error={toError !== ''}
                            helperText={toError}
                            slotProps={{
                                htmlInput: {
                                    step: config.step,
                                    ...(isDate && { min: MIN_DATE, max: MAX_DATE }),
                                },
                                inputLabel: { shrink: true },
                            }}
                            sx={styles.rangeInput}
                        />
                    </Stack>
                </Box>
            </Popover>
        </>
    );
};

export default RangeFilter;

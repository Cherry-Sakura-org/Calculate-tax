import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    IconButton,
    Popover,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
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
    checkCrossField: boolean,
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
            checkCrossField &&
            fromReady && toReady &&
            !errors.fromError && !errors.toError &&
            from > to
        ) {
            errors.fromError = '"From" must be before "To"';
        }
    } else if (checkCrossField && from !== '' && to !== '') {
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
    const [toBlurred, setToBlurred] = useState(false);
    const open = Boolean(anchorEl);

    const hasValue = value.from !== '' || value.to !== '';
    const config = getInputConfig(filterType);
    const isDate = filterType === 'range-date';
    const { fromError, toError } = useMemo(
        () => validateRange(localValue, filterType, toBlurred),
        [localValue, filterType, toBlurred],
    );
    const hasError = fromError !== '' || toError !== '';

    // Sync local state when external value changes while closed
    useEffect(() => {
        if (!open) setLocalValue(value);
    }, [value, open]);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setLocalValue(value);
        setToBlurred(false);
        setAnchorEl(event.currentTarget);
    };

    const emptyValue: RangeFilterValue = { from: '', to: '' };
    const isDirty = localValue.from !== value.from || localValue.to !== value.to;
    const hasLocalValue = localValue.from !== '' || localValue.to !== '';

    const handleClose = () => {
        setAnchorEl(null);
        setLocalValue(value);
    };

    const handleApply = () => {
        if (hasError) return;
        onChange(localValue);
        setAnchorEl(null);
    };

    const handleReset = () => {
        if (isDirty) {
            setLocalValue(value);
        } else {
            setLocalValue(emptyValue);
            setAnchorEl(null);
            setTimeout(() => onChange(emptyValue), 0);
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
                    <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 2 }}>
                        <Typography sx={{ ...styles.filterTitle, mb: 0 }}>
                            {label}
                        </Typography>
                        <IconButton size='small' onClick={handleClose} sx={{ p: 0.25 }}>
                            <CloseIcon sx={{ fontSize: '1.125rem' }} />
                        </IconButton>
                    </Stack>

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
                            onBlur={() => setToBlurred(true)}
                            onFocus={() => setToBlurred(false)}
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

                    <Stack direction='row' justifyContent='flex-end' gap={1} sx={{ mt: 1.5 }}>
                        <Button
                            size='small'
                            variant='text'
                            onClick={handleReset}
                            disabled={!isDirty && !hasLocalValue}
                            sx={styles.filterActionButton}
                        >
                            Reset
                        </Button>
                        <Button
                            size='small'
                            variant='contained'
                            onClick={handleApply}
                            disabled={!isDirty || hasError}
                            sx={styles.filterActionButton}
                        >
                            Apply
                        </Button>
                    </Stack>
                </Box>
            </Popover>
        </>
    );
};

export default RangeFilter;

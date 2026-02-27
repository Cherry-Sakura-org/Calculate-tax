import { useEffect, useState } from 'react';
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

const RangeFilter = ({ label, filterType, value, onChange }: RangeFilterProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [localValue, setLocalValue] = useState<RangeFilterValue>(value);
    const open = Boolean(anchorEl);

    const hasValue = value.from !== '' || value.to !== '';
    const config = getInputConfig(filterType);

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
        onChange(localValue);
        setAnchorEl(null);
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
                            type={config.type}
                            placeholder={config.fromLabel}
                            value={localValue.from}
                            onChange={(e) => setLocalValue((prev) => ({ ...prev, from: e.target.value }))}
                            slotProps={{
                                htmlInput: { step: config.step },
                            }}
                            sx={styles.rangeInput}
                        />
                        <TextField
                            size='small'
                            fullWidth
                            type={config.type}
                            placeholder={config.toLabel}
                            value={localValue.to}
                            onChange={(e) => setLocalValue((prev) => ({ ...prev, to: e.target.value }))}
                            slotProps={{
                                htmlInput: { step: config.step },
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

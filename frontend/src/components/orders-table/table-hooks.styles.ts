import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const mutedCell: SxProps<Theme> = {
    fontSize: '0.875rem',
    color: 'text.secondary',
};

export const valueCell: SxProps<Theme> = {
    fontSize: '0.875rem',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
};

export const highlightCell: SxProps<Theme> = {
    fontSize: '0.875rem',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: 'primary.dark',
};

export const breakdownContainer: SxProps<Theme> = {
    p: 1.5,
    minWidth: 180,
};

export const breakdownTitle: SxProps<Theme> = {
    fontWeight: 600,
    color: 'primary.main',
    mb: 1,
    display: 'block',
};

export const breakdownRow: SxProps<Theme> = {
    py: 0.25,
};

export const breakdownValue: SxProps<Theme> = {
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
};

export const idChip: SxProps<Theme> = {
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    height: 24,
};

export const jurisdictionChip: SxProps<Theme> = {
    height: 24,
    fontSize: '0.75rem',
    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
    color: 'primary.dark',
    border: 'none',
};

export const taxRateTooltip: SxProps<Theme> = {
    bgcolor: 'background.paper',
    color: 'text.primary',
    boxShadow: 6,
    borderRadius: 1.5,
    p: 0,
};

export const taxRateArrow: SxProps<Theme> = {
    color: 'background.paper',
};

export const taxRateValue: SxProps<Theme> = {
    fontSize: '0.875rem',
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    cursor: 'default',
    borderBottom: '1px dashed',
    borderColor: 'primary.main',
};

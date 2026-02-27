import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const root: SxProps<Theme> = {
    px: 3,
    py: 2,
    borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
};

export const filterLabel: SxProps<Theme> = {
    color: 'text.secondary',
    fontFamily: '"Inter", sans-serif',
    fontWeight: 500,
    fontSize: '0.8rem',
};

export const filterIcon: SxProps<Theme> = {
    fontSize: 18,
    color: 'text.secondary',
};

export const activeCountChip: SxProps<Theme> = {
    height: 20,
    minWidth: 20,
    fontSize: '0.65rem',
    fontWeight: 700,
    '& .MuiChip-label': { px: 0.75 },
};

export const searchInput: SxProps<Theme> = {
    height: 36,
    fontSize: '0.8rem',
    borderRadius: '8px',
    '& fieldset': {
        borderColor: (t: Theme) => `${alpha(t.palette.divider, 1)} !important`,
    },
};

export const searchField: SxProps<Theme> = {
    width: 220,
};

export const searchIcon: SxProps<Theme> = {
    fontSize: 16,
    color: 'text.disabled',
};

export const clearButton: SxProps<Theme> = {
    fontSize: '0.75rem',
    height: 34,
    px: 1.5,
    color: 'text.secondary',
    '&:hover': { color: 'error.main' },
};

export const clearIcon: SxProps<Theme> = {
    fontSize: '14px !important',
};

export const chipIcon: SxProps<Theme> = {
    fontSize: '14px !important',
};

const filterChipBase: SxProps<Theme> = {
    height: 34,
    px: 1.5,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
};

export const activeFilterChip: SxProps<Theme> = {
    ...filterChipBase,
};

export const inactiveFilterChip: SxProps<Theme> = {
    ...filterChipBase,
    borderColor: (t) => alpha(t.palette.divider, 1),
    color: 'text.secondary',
    '&:hover': {
        borderColor: (t) => alpha(t.palette.primary.main, 0.4),
        color: 'primary.main',
    },
};

export const popoverPaper: SxProps<Theme> = {
    mt: 1,
    p: 2.5,
    minWidth: 260,
    bgcolor: '#ffffff',
    border: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
    boxShadow: `0 16px 48px ${alpha('#000', 0.1)}`,
};

export const popoverTitle: SxProps<Theme> = {
    display: 'block',
    mb: 2,
    color: 'primary.main',
};

export const adornmentLabel: SxProps<Theme> = {
    color: 'text.disabled',
};

export const percentIcon: SxProps<Theme> = {
    fontSize: 14,
    color: 'text.disabled',
};

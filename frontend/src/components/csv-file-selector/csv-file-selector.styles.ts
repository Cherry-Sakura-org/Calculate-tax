import type { SxProps, Theme } from '@mui/material';

export const selectButton: SxProps<Theme> = {
    textTransform: 'none',
    minWidth: 180,
    justifyContent: 'space-between',
    whiteSpace: 'nowrap',
};

export const menuItem: SxProps<Theme> = {
    py: 0.5,
    px: 1,
};

export const selectAllItem: SxProps<Theme> = {
    py: 0.5,
    px: 1,
    borderBottom: 1,
    borderColor: 'divider',
};

export const emptyText: SxProps<Theme> = {
    px: 2,
    py: 1.5,
    color: 'text.secondary',
};

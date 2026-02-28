import type { SxProps, Theme } from '@mui/material';

export const selectButton: SxProps<Theme> = {
    textTransform: 'none',
    minWidth: 210,
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
};

export const onlyButton: SxProps<Theme> = {
    ml: 1,
    px: 0.75,
    py: 0.25,
    fontSize: '0.7rem',
    color: 'primary.main',
    cursor: 'pointer',
    borderRadius: 1,
    flexShrink: 0,
    '&:hover': {
        backgroundColor: 'action.hover',
    },
};

export const emptyText: SxProps<Theme> = {
    px: 2,
    py: 1.5,
    color: 'text.secondary',
};

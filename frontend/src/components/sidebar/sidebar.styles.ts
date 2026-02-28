import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const SIDEBAR_WIDTH_OPEN = 220;
export const SIDEBAR_WIDTH_CLOSED = 60;

export const drawer = (open: boolean): SxProps<Theme> => ({
    width: open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED,
    flexShrink: 0,
    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '& .MuiDrawer-paper': {
        width: open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box',
        border: 'none',
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: '#fff',
        overflow: 'hidden',
        top: 'auto',
        position: 'relative',
    },
});

export const toggleButton: SxProps<Theme> = {
    width: 32,
    height: 32,
    borderRadius: '8px',
    color: 'text.secondary',
};

export const navList: SxProps<Theme> = {
    flex: 1,
    px: 1,
    pt: 1,
};

export const navItem = (open: boolean): SxProps<Theme> => ({
    borderRadius: '8px',
    mb: 0.5,
    minHeight: 40,
    justifyContent: open ? 'initial' : 'center',
    px: open ? 1.5 : 0,
    py: 0.75,
    transition: 'all 0.15s ease',
    '&.Mui-selected': {
        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
        color: 'primary.main',
        '&:hover': {
            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
        },
    },
    '&:not(.Mui-selected):hover': {
        bgcolor: (t) => alpha(t.palette.action.hover, 0.5),
    },
});

export const navIcon = (active: boolean, open: boolean): SxProps<Theme> => ({
    minWidth: 0,
    mr: open ? 1.5 : 0,
    justifyContent: 'center',
    color: active ? 'primary.main' : 'text.secondary',
    transition: 'margin 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
});

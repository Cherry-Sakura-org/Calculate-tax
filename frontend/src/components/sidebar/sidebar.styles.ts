import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const SIDEBAR_WIDTH = 64;

export const drawer: SxProps<Theme> = {
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: SIDEBAR_WIDTH,
        boxSizing: 'border-box',
        borderRight: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
};

export const logoSection: SxProps<Theme> = {
    py: 1.5,
    display: 'flex',
    justifyContent: 'center',
    borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`,
    width: '100%',
};

export const iconBox: SxProps<Theme> = {
    width: 36,
    height: 36,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
};

export const shippingIcon: SxProps<Theme> = {
    fontSize: 20,
    color: 'primary.main',
};

export const authSection: SxProps<Theme> = {
    mt: 'auto',
    py: 1.5,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`,
};

export const userButton: SxProps<Theme> = {
    minWidth: 'unset',
    p: 1,
};

export const signInButton: SxProps<Theme> = {
    minWidth: 'unset',
    p: 1,
};

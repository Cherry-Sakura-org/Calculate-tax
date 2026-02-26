import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const header: SxProps<Theme> = {
    position: 'sticky',
    top: 0,
    zIndex: 1100,
    px: { xs: 2, md: 4 },
    py: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backdropFilter: 'blur(12px)',
    backgroundColor: (t) => alpha(t.palette.background.default, 0.85),
    borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
};

export const iconBox: SxProps<Theme> = {
    width: 38,
    height: 38,
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

export const title: SxProps<Theme> = {
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: 1.2,
    color: 'text.primary',
};

export const subtitle: SxProps<Theme> = {
    display: 'block',
    lineHeight: 1.4,
    color: 'text.secondary',
};

export const statusDot: SxProps<Theme> = {
    fontSize: '8px !important',
    color: 'primary.main',
};

export const statusChip: SxProps<Theme> = {
    borderColor: (t) => alpha(t.palette.primary.main, 0.3),
    color: 'primary.dark',
    fontSize: '0.7rem',
    '& .MuiChip-icon': {
        ml: '8px',
    },
};

export const regionLabel: SxProps<Theme> = {
    color: 'text.secondary',
    display: { xs: 'none', sm: 'block' },
};

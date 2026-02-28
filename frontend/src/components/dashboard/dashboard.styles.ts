import type { SxProps, Theme } from '@mui/material';

export const page: SxProps<Theme> = {
    height: '100%',
    overflow: 'auto',
};

export const statCard: SxProps<Theme> = {
    p: 3,
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
};

export const statValue: SxProps<Theme> = {
    fontWeight: 700,
    fontSize: '1.75rem',
    lineHeight: 1.2,
    color: 'text.primary',
};

export const statLabel: SxProps<Theme> = {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'text.secondary',
    mb: 0.5,
};

export const statSubtitle: SxProps<Theme> = {
    fontSize: '0.8rem',
    color: 'text.secondary',
    mt: 0.5,
};

export const chartContainer: SxProps<Theme> = {
    p: 3,
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    mt: 3,
};

export const chartTitle: SxProps<Theme> = {
    fontWeight: 600,
    fontSize: '1.1rem',
    mb: 2,
};

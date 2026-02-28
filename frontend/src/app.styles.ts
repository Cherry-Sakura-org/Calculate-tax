import type { SxProps, Theme } from '@mui/material';

export const root: SxProps<Theme> = {
    height: '100vh',
    overflow: 'hidden',
};

export const appBar: SxProps<Theme> = {
    bgcolor: '#fff',
    borderBottom: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
};

export const toolbar: SxProps<Theme> = {
    justifyContent: 'space-between',
    px: { xs: 2, sm: 3 },
};

export const logo: SxProps<Theme> = {
    color: 'text.primary',
    fontWeight: 700,
};

export const content: SxProps<Theme> = {
    flex: 1,
    overflow: 'hidden',
    p: { xs: 2, sm: 3 },
};

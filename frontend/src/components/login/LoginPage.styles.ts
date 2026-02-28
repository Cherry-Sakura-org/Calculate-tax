import type { SxProps, Theme } from '@mui/material';

export const container: SxProps<Theme> = {
    minHeight: '100vh',
    flexDirection: 'row',
};

export const leftPanel: SxProps<Theme> = {
    width: '45%',
    background: 'linear-gradient(135deg, #2e7d5b 0%, #1a6b6a 100%)',
    color: '#fff',
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    justifyContent: 'center',
    px: 8,
    py: 6,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -120,
        right: -120,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 220,
        height: 220,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
    },
};

export const brandName: SxProps<Theme> = {
    fontWeight: 700,
    fontSize: '2rem',
    mb: 2,
};

export const welcomeText: SxProps<Theme> = {
    fontWeight: 600,
    fontSize: '1.5rem',
    mb: 2,
    opacity: 0.95,
};

export const description: SxProps<Theme> = {
    fontSize: '1rem',
    lineHeight: 1.7,
    opacity: 0.8,
    maxWidth: 400,
};

export const rightPanel: SxProps<Theme> = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: '#fff',
    px: { xs: 3, sm: 6 },
    py: 6,
};

export const formContainer: SxProps<Theme> = {
    width: '100%',
    maxWidth: 420,
};

export const formTitle: SxProps<Theme> = {
    fontWeight: 700,
    mb: 1,
};

export const formSubtitle: SxProps<Theme> = {
    color: 'text.secondary',
    mb: 4,
};

export const submitButton: SxProps<Theme> = {
    py: 1.4,
    fontSize: '0.95rem',
    mt: 1,
};

export const switchLink: SxProps<Theme> = {
    mt: 3,
    textAlign: 'center',
};

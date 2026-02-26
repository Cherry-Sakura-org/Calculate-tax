import type { SxProps, Theme } from '@mui/material';

export const closeButton: SxProps<Theme> = {
    position: 'absolute',
    top: 8,
    right: 8,
};

export const form: SxProps<Theme> = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
};

export const formTitle: SxProps<Theme> = {
    fontWeight: 700,
    color: '#fff',
};

export const registerTitle: SxProps<Theme> = {
    color: '#fff',
};

export const fieldSx: SxProps<Theme> = {
    '& .MuiOutlinedInput-root': {
        color: '#fff',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
        '&:hover fieldset': { borderColor: 'rgba(0,212,170,0.4)' },
        '&.Mui-focused fieldset': { borderColor: '#00d4aa' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.45)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#00d4aa' },
};

export const switchLink: SxProps<Theme> = {
    cursor: 'pointer',
    color: '#00d4aa',
};

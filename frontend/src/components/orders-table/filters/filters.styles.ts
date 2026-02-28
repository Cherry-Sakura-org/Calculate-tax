import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const filterIconButton: SxProps<Theme> = {
    p: 0.25,
    ml: 0.5,
    color: 'text.secondary',
    opacity: 0.5,
    transition: 'all 0.15s ease',
    '&:hover': {
        opacity: 1,
        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
    },
    '& .MuiSvgIcon-root': {
        fontSize: '0.875rem',
    },
};

export const filterIconButtonActive: SxProps<Theme> = {
    ...filterIconButton,
    opacity: 1,
    color: 'primary.main',
    bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
    '&:hover': {
        bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
    },
};

export const filterPopover: SxProps<Theme> = {
    '& .MuiBackdrop-root': {
        backgroundColor: 'transparent',
        backdropFilter: 'none',
    },
    '& .MuiPaper-root': {
        mt: 0.5,
        borderRadius: 1.5,
        minWidth: 180,
        boxShadow: 'none',
        border: 1,
        borderColor: 'divider',
    },
};

export const filterPopoverContent: SxProps<Theme> = {
    p: 1.5,
};

export const filterTitle: SxProps<Theme> = {
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'text.secondary',
    mb: 1,
};

export const rangeInputsStack: SxProps<Theme> = {
    gap: 2,
};

export const rangeInput: SxProps<Theme> = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 1,
        fontSize: '0.8125rem',
    },
    '& .MuiOutlinedInput-input': {
        py: 0.5,
        px: 1,
    },
    '& .MuiInputLabel-root': {
        fontSize: '0.75rem',
    },
};

export const jurisdictionTree: SxProps<Theme> = {
    maxHeight: 300,
    overflowY: 'auto',
    overflowX: 'hidden',
};

export const jurisdictionNodeLabel: SxProps<Theme> = {
    fontSize: '0.8125rem',
    py: 0,
};

export const jurisdictionChildrenContainer: SxProps<Theme> = {
    pl: 2.5,
};

export const jurisdictionCheckbox: SxProps<Theme> = {
    p: 0.5,
    '& .MuiSvgIcon-root': {
        fontSize: '1.125rem',
    },
};

export const jurisdictionSearchInput: SxProps<Theme> = {
    mb: 1,
    '& .MuiOutlinedInput-root': {
        borderRadius: 1,
        fontSize: '0.8125rem',
    },
    '& .MuiOutlinedInput-input': {
        py: 0.5,
        px: 1,
    },
};

export const headerCellContent: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    position: 'relative',
};

export const sortArrow: SxProps<Theme> = {
    position: 'absolute',
    left: -14,
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.875rem',
    color: 'primary.main',
    transition: 'transform 0.15s ease, opacity 0.15s ease',
};

export const sortableLabel: SxProps<Theme> = {
    fontSize: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    cursor: 'pointer',
    userSelect: 'none',
    '&:hover': {
        color: 'primary.main',
    },
};

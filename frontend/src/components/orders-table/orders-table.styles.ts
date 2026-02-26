import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const loadingPaper: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: 8,
    animation: 'fadeIn 0.3s ease-out',
};

export const paper: SxProps<Theme> = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    '&:hover': {
        borderColor: (t) => alpha(t.palette.primary.main, 0.15),
    },
};

export const tableContainer: SxProps<Theme> = {
    flex: 1,
    overflow: 'auto',
    overscrollBehavior: 'none',
};

export const table: SxProps<Theme> = {
    tableLayout: 'fixed',
};

export const headerCell: SxProps<Theme> = {
    py: 1,
    bgcolor: '#e8efe9 !important',
};

export const emptyState: SxProps<Theme> = {
    py: 6,
};

export const emptySubtext: SxProps<Theme> = {
    mt: 0.5,
    display: 'block',
    opacity: 0.6,
};

export const dataRow: SxProps<Theme> = {
    transition: 'background-color 0.15s ease',
};

export const outOfStateRow: SxProps<Theme> = {
    transition: 'background-color 0.15s ease',
    bgcolor: (t) => alpha(t.palette.error.main, 0.08),
    '&:hover': {
        bgcolor: (t) => `${alpha(t.palette.error.main, 0.14)} !important`,
    },
};

export const highlightedCell: SxProps<Theme> = {
    bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
};

export const scrollStatus: SxProps<Theme> = {
    display: 'flex',
    justifyContent: 'center',
    py: 2,
    minHeight: 48,
};

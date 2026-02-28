import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material';

export const toolbar: SxProps<Theme> = {
    px: 2,
    py: 1.5,
    flexShrink: 0,
};

export const actionButton: SxProps<Theme> = {
    whiteSpace: 'nowrap',
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

export const headerContainer: SxProps<Theme> = {
    overflow: 'hidden',
    flexShrink: 0,
    borderRadius: 0,
};

export const headerCell: SxProps<Theme> = {
    py: 1,
    bgcolor: '#e8efe9 !important',
    borderRadius: '0 !important',
    '&:not(:last-child)::after': {
        content: '""',
        position: 'absolute',
        right: 0,
        top: '25%',
        height: '50%',
        width: '1px',
        bgcolor: (t: Theme) => alpha(t.palette.divider, 0.5),
    },
};

export const bodyContainer: SxProps<Theme> = {
    flex: 1,
    overflow: 'auto',
    overscrollBehavior: 'none',
    bgcolor: 'transparent',
};

export const table: SxProps<Theme> = {
    tableLayout: 'fixed',
    bgcolor: 'transparent',
};

export const stickyHeaderCell: SxProps<Theme> = {
    py: 1,
    bgcolor: '#e8efe9 !important',
    borderRadius: '0 !important',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    '&:not(:last-child)::after': {
        content: '""',
        position: 'absolute',
        right: 0,
        top: '25%',
        height: '50%',
        width: '1px',
        bgcolor: (t: Theme) => alpha(t.palette.divider, 0.5),
    },
};

export const emptyStateCell: SxProps<Theme> = {
    border: 'none',
};

export const emptyStateContainer: SxProps<Theme> = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
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

export const densityToggle: SxProps<Theme> = {
    '& .MuiToggleButton-root': {
        py: 0.5,
        px: 0.75,
        border: '1px solid',
        borderColor: 'divider',
    },
};

export const slimCell: SxProps<Theme> = {
    py: '2px',
    fontSize: '0.8rem',
    lineHeight: 1.2,
};

export const scrollStatus: SxProps<Theme> = {
    display: 'flex',
    justifyContent: 'center',
    py: 2,
    minHeight: 48,
};

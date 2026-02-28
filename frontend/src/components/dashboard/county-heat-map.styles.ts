import type { SxProps, Theme } from '@mui/material';

export const container: SxProps<Theme> = {
    p: 3,
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    mt: 3,
};

export const title: SxProps<Theme> = {
    fontWeight: 600,
    fontSize: '1.1rem',
    mb: 2,
};

export const content: SxProps<Theme> = {
    display: 'flex',
    gap: 3,
    flexDirection: { xs: 'column', md: 'row' },
};

export const mapWrapper: SxProps<Theme> = {
    flex: 1,
    minWidth: 0,
    position: 'relative',
};

export const zoomControls: SxProps<Theme> = {
    position: 'absolute',
    top: 8,
    right: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    bgcolor: 'background.paper',
    borderRadius: 1,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 1,
    p: 0.25,
};

export const sidebar: SxProps<Theme> = {
    width: { xs: '100%', md: 280 },
    flexShrink: 0,
};

export const sidebarTitle: SxProps<Theme> = {
    fontWeight: 600,
    fontSize: '0.875rem',
    mb: 1,
};

export const rankRow: SxProps<Theme> = {
    py: 0.75,
    px: 1,
    borderRadius: 1,
    '&:nth-of-type(odd)': {
        bgcolor: 'action.hover',
    },
};

export const rankHeader: SxProps<Theme> = {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 0.5,
};

export const rankName: SxProps<Theme> = {
    fontSize: '0.8rem',
    color: 'text.primary',
};

export const rankValue: SxProps<Theme> = {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'text.primary',
};

export const rankBarTrack: SxProps<Theme> = {
    height: 4,
    borderRadius: 0.5,
    bgcolor: 'action.hover',
    overflow: 'hidden',
};

export const rankBarFill = (pct: number): SxProps<Theme> => ({
    height: '100%',
    width: `${pct}%`,
    borderRadius: 0.5,
    bgcolor: '#2e7d5b',
    transition: 'width 0.3s ease',
});

export const tooltip: SxProps<Theme> = {
    position: 'absolute',
    pointerEvents: 'none',
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    px: 1.5,
    py: 1,
    boxShadow: 2,
    zIndex: 10,
};

export const tooltipCounty: SxProps<Theme> = {
    fontWeight: 600,
    fontSize: '0.8rem',
};

export const tooltipValue: SxProps<Theme> = {
    fontSize: '0.75rem',
    color: 'text.secondary',
};

export const toggleGroup: SxProps<Theme> = {
    mb: 2,
};

export const legend: SxProps<Theme> = {
    mt: 1,
    px: 1,
};

export const legendLabel: SxProps<Theme> = {
    fontSize: '0.7rem',
    color: 'text.secondary',
    whiteSpace: 'nowrap',
};

export const legendTicks: SxProps<Theme> = {
    display: 'flex',
    justifyContent: 'space-between',
    mt: 0.5,
};

export const legendGradient = (colors: string[]): SxProps<Theme> => ({
    height: 8,
    borderRadius: 0.5,
    background: `linear-gradient(to right, ${colors.join(', ')})`,
});

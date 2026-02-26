import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const pageRoot: SxProps<Theme> = {
    height: '100vh',
    overflow: 'auto',
    bgcolor: 'background.default',
};

export const container: SxProps<Theme> = {
    maxWidth: 1200,
    mx: 'auto',
    p: { xs: 2, sm: 3 },
    pb: 6,
};

export const pageTitle: SxProps<Theme> = {
    fontWeight: 700,
    mb: 0.5,
};

export const pageSubtitle: SxProps<Theme> = {
    color: 'text.secondary',
    mb: 3,
};

export const sectionCard: SxProps<Theme> = {
    p: 3,
    mb: 3,
};

export const sectionTitle: SxProps<Theme> = {
    fontWeight: 600,
    mb: 0.5,
};

export const sectionSubtitle: SxProps<Theme> = {
    color: 'text.secondary',
    mb: 2,
    fontSize: '0.85rem',
};

export const endpointChip: SxProps<Theme> = {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
};

export const statCard: SxProps<Theme> = (theme: Theme) => ({
    p: 2,
    borderRadius: 2,
    bgcolor: alpha(theme.palette.primary.main, 0.04),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    textAlign: 'center',
    minWidth: 140,
});

export const statValue: SxProps<Theme> = {
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: 1.2,
};

export const statLabel: SxProps<Theme> = {
    color: 'text.secondary',
    fontSize: '0.75rem',
    fontWeight: 500,
    mt: 0.5,
};

export const tableContainer: SxProps<Theme> = {
    maxHeight: 320,
    overflow: 'auto',
    borderRadius: 1,
    border: '1px solid',
    borderColor: 'divider',
};

export const jsonPreview: SxProps<Theme> = {
    maxHeight: 200,
    overflow: 'auto',
    bgcolor: '#1e1e2e',
    color: '#cdd6f4',
    p: 2,
    borderRadius: 1,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.75rem',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
};

export const backLink: SxProps<Theme> = {
    textDecoration: 'none',
    color: 'primary.main',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.5,
    mb: 2,
    '&:hover': { textDecoration: 'underline' },
};

export const errorAlert: SxProps<Theme> = {
    mb: 2,
};

export const refreshButton: SxProps<Theme> = {
    minWidth: 'auto',
};

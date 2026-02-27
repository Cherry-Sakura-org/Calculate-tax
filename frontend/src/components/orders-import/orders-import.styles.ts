import { SxProps, Theme, alpha } from '@mui/material';

export const paper: SxProps<Theme> = {
    px: 3,
    py: 3.25,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: (t: Theme) =>
            `linear-gradient(90deg, transparent, ${alpha(t.palette.primary.main, 0.5)}, transparent)`,
    },
};

export const dropzone = (dragOver: boolean): SxProps<Theme> => ({
    flex: 1,
    p: 3,
    textAlign: 'center',
    cursor: 'pointer',
    borderRadius: 1,
    border: '2px dashed',
    borderColor: (t: Theme) =>
        dragOver ? t.palette.primary.main : alpha(t.palette.divider, 1),
    bgcolor: (t: Theme) =>
        dragOver ? alpha(t.palette.primary.main, 0.05) : 'transparent',
    transition: 'all 0.15s ease',
    '&:hover': {
        borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.4),
        bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.03),
        '& .upload-icon': {
            transform: 'translateY(-3px)',
            color: 'primary.main',
        },
    },
});

export const uploadIcon: SxProps<Theme> = {
    fontSize: 40,
    color: 'text.disabled',
    transition: 'all 0.15s ease',
};

export const fileChip: SxProps<Theme> = {
    justifyContent: 'space-between',
    maxWidth: '100%',
    py: 2.5,
    px: 1,
    '& .MuiChip-label': {
        fontWeight: 600,
    },
    '& .MuiChip-deleteIcon': {
        ml: 'auto',
    },
};

export const fileIcon: SxProps<Theme> = {
    fontSize: '22px !important',
};

export const actionsStack: SxProps<Theme> = {
    alignSelf: 'stretch',
};

export const successAlert: SxProps<Theme> = {
    mt: 2.5,
};

export const errorAlert: SxProps<Theme> = {
    mt: 2,
};

export const dropzoneTitle: SxProps<Theme> = {
    mb: 0.25,
};

export const dropzoneSubtitle: SxProps<Theme> = {
    fontSize: '0.8rem',
};

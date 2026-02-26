import { createTheme, alpha } from '@mui/material/styles';

const GREEN = '#2e7d5b';
const GREEN_DARK = '#215c43';
const GREEN_LIGHT = '#e8f5ee';
const TEAL = '#1a6b6a';
const TEAL_DARK = '#145453';

const BG_DEFAULT = '#f7f8fa';
const BG_PAPER = '#ffffff';
const BG_ELEVATED = '#ffffff';

const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#5f6b7a';
const BORDER = '#d5dae1';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: GREEN,
            dark: GREEN_DARK,
            light: GREEN_LIGHT,
            contrastText: '#fff',
        },
        secondary: {
            main: TEAL,
            dark: TEAL_DARK,
            contrastText: '#fff',
        },
        background: {
            default: BG_DEFAULT,
            paper: BG_PAPER,
        },
        text: {
            primary: TEXT_PRIMARY,
            secondary: TEXT_SECONDARY,
        },
        divider: BORDER,
        success: {
            main: '#2e7d5b',
        },
        error: {
            main: '#c4403a',
        },
        action: {
            hover: alpha(GREEN, 0.05),
            selected: alpha(GREEN, 0.08),
        },
    },
    typography: {
        fontFamily: '"Inter", sans-serif',
        h1: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
        h2: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
        h3: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
        h4: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
        h5: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
        h6: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
        subtitle1: { fontWeight: 500 },
        subtitle2: { fontWeight: 500 },
        body1: { fontSize: '0.9375rem', lineHeight: 1.65 },
        body2: { fontSize: '0.875rem', lineHeight: 1.6 },
        button: {
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.01em',
            textTransform: 'none',
        },
        caption: {
            fontSize: '0.8rem',
            letterSpacing: '0.01em',
            color: TEXT_SECONDARY,
        },
        overline: {
            fontSize: '0.7rem',
            letterSpacing: '0.06em',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    overflow: 'hidden',
                    height: '100%',
                },
                body: {
                    backgroundColor: BG_DEFAULT,
                    overflow: 'hidden',
                    height: '100%',
                    overscrollBehavior: 'none',
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontSize: '0.875rem',
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: BG_PAPER,
                    border: `1px solid ${BORDER}`,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: BG_ELEVATED,
                    border: `1px solid ${BORDER}`,
                    boxShadow: `0 20px 60px ${alpha('#000', 0.12)}`,
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontWeight: 600,
                    fontSize: '1.25rem',
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: '#f1f4f8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: TEXT_SECONDARY,
                        borderBottom: `1px solid ${BORDER}`,
                        padding: '12px 16px',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                    borderBottom: `1px solid ${alpha(BORDER, 0.7)}`,
                    padding: '16px 16px',
                    color: TEXT_PRIMARY,
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                        backgroundColor: `${alpha(GREEN, 0.03)} !important`,
                    },
                },
            },
        },
        MuiTablePagination: {
            styleOverrides: {
                root: {
                    borderTop: `1px solid ${alpha(BORDER, 0.7)}`,
                    color: TEXT_SECONDARY,
                },
                selectIcon: {
                    color: TEXT_SECONDARY,
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    transition: 'all 0.15s ease',
                    '&:hover': {
                        backgroundColor: alpha(GREEN, 0.08),
                        color: GREEN_DARK,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontSize: '0.8rem',
                    borderRadius: 6,
                },
                outlined: {
                    borderColor: alpha(GREEN, 0.3),
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    border: '1px solid',
                    fontSize: '0.875rem',
                },
                standardSuccess: {
                    backgroundColor: alpha('#2e7d5b', 0.07),
                    borderColor: alpha('#2e7d5b', 0.2),
                    color: '#215c43',
                },
                standardError: {
                    backgroundColor: alpha('#c4403a', 0.07),
                    borderColor: alpha('#c4403a', 0.2),
                    color: '#a33530',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                    '& .MuiInputLabel-root': {
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 500,
                    },
                    '& .MuiInputBase-input': {
                        fontSize: '0.875rem',
                    },
                },
            },
        },
        MuiCircularProgress: {
            styleOverrides: {
                root: {
                    color: GREEN,
                },
            },
        },
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha('#000', 0.25),
                    backdropFilter: 'blur(4px)',
                },
            },
        },
    },
});

export default theme;

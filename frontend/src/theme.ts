import { createTheme, alpha } from '@mui/material/styles';

const CYAN = '#00e5ff';
const CYAN_DARK = '#00b8d4';
const ORANGE = '#ff6b35';
const ORANGE_DARK = '#e55a2b';

const BG_DEEP = '#070b14';
const BG_DEFAULT = '#0a0e17';
const BG_PAPER = '#111827';
const BG_ELEVATED = '#1a2235';

const TEXT_PRIMARY = '#e8eaf6';
const TEXT_SECONDARY = '#7b8ca0';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: CYAN,
            dark: CYAN_DARK,
            contrastText: '#000',
        },
        secondary: {
            main: ORANGE,
            dark: ORANGE_DARK,
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
        divider: alpha('#94a3b8', 0.12),
        action: {
            hover: alpha(CYAN, 0.06),
            selected: alpha(CYAN, 0.1),
        },
    },
    typography: {
        fontFamily: '"DM Sans", sans-serif',
        h1: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
        h2: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
        h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
        h4: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
        h5: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
        h6: { fontFamily: '"Syne", sans-serif', fontWeight: 600 },
        subtitle1: { fontWeight: 500, letterSpacing: '0.02em' },
        subtitle2: { fontWeight: 500, letterSpacing: '0.02em' },
        body1: { letterSpacing: '0.01em', lineHeight: 1.6 },
        body2: { letterSpacing: '0.01em', lineHeight: 1.6 },
        button: {
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'none',
        },
        caption: {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.75rem',
            letterSpacing: '0.03em',
        },
        overline: {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundImage: `
                        radial-gradient(ellipse 80% 50% at 50% -20%, ${alpha(CYAN, 0.08)} 0%, transparent 60%),
                        radial-gradient(ellipse 60% 40% at 100% 0%, ${alpha(ORANGE, 0.04)} 0%, transparent 50%)
                    `,
                    backgroundAttachment: 'fixed',
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                contained: {
                    background: `linear-gradient(135deg, ${CYAN} 0%, ${CYAN_DARK} 100%)`,
                    color: '#000',
                    '&:hover': {
                        background: `linear-gradient(135deg, ${CYAN} 20%, ${alpha(CYAN_DARK, 0.9)} 100%)`,
                        boxShadow: `0 4px 20px ${alpha(CYAN, 0.4)}`,
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                        background: alpha('#94a3b8', 0.15),
                        color: alpha(TEXT_PRIMARY, 0.3),
                    },
                },
                outlined: {
                    borderColor: alpha(CYAN, 0.3),
                    color: CYAN,
                    '&:hover': {
                        borderColor: CYAN,
                        backgroundColor: alpha(CYAN, 0.08),
                    },
                },
                text: {
                    color: TEXT_SECONDARY,
                    '&:hover': {
                        backgroundColor: alpha(CYAN, 0.06),
                        color: CYAN,
                    },
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
                    border: `1px solid ${alpha('#94a3b8', 0.08)}`,
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: BG_ELEVATED,
                    border: `1px solid ${alpha(CYAN, 0.15)}`,
                    boxShadow: `0 24px 80px ${alpha('#000', 0.6)}, 0 0 40px ${alpha(CYAN, 0.08)}`,
                    backdropFilter: 'blur(20px)',
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontFamily: '"Syne", sans-serif',
                    fontWeight: 600,
                    fontSize: '1.25rem',
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: alpha(CYAN, 0.04),
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: TEXT_SECONDARY,
                        borderBottom: `1px solid ${alpha(CYAN, 0.12)}`,
                        padding: '14px 16px',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.8rem',
                    borderBottom: `1px solid ${alpha('#94a3b8', 0.06)}`,
                    padding: '12px 16px',
                    color: TEXT_PRIMARY,
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                        backgroundColor: `${alpha(CYAN, 0.04)} !important`,
                    },
                },
            },
        },
        MuiTablePagination: {
            styleOverrides: {
                root: {
                    borderTop: `1px solid ${alpha('#94a3b8', 0.08)}`,
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
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: alpha(CYAN, 0.1),
                        color: CYAN,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '0.75rem',
                    borderRadius: 8,
                },
                outlined: {
                    borderColor: alpha(CYAN, 0.3),
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: '1px solid',
                },
                standardSuccess: {
                    backgroundColor: alpha('#22c55e', 0.1),
                    borderColor: alpha('#22c55e', 0.2),
                    color: '#4ade80',
                },
                standardError: {
                    backgroundColor: alpha('#ef4444', 0.1),
                    borderColor: alpha('#ef4444', 0.2),
                    color: '#f87171',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        transition: 'all 0.3s ease',
                        '& fieldset': {
                            borderColor: alpha('#94a3b8', 0.15),
                            transition: 'border-color 0.3s ease',
                        },
                        '&:hover fieldset': {
                            borderColor: alpha(CYAN, 0.4),
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: CYAN,
                            boxShadow: `0 0 0 3px ${alpha(CYAN, 0.1)}`,
                        },
                    },
                    '& .MuiInputLabel-root': {
                        fontFamily: '"DM Sans", sans-serif',
                        fontWeight: 500,
                    },
                    '& .MuiInputBase-input': {
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.875rem',
                    },
                },
            },
        },
        MuiCircularProgress: {
            styleOverrides: {
                root: {
                    color: CYAN,
                },
            },
        },
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha('#000', 0.7),
                    backdropFilter: 'blur(8px)',
                },
            },
        },
    },
});

export default theme;

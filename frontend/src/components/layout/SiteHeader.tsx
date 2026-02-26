import { Box, Typography, Stack, Chip, alpha } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const SiteHeader = () => {
    return (
        <Box
            component='header'
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1100,
                px: { xs: 2, md: 4 },
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(16px) saturate(1.4)',
                backgroundColor: (t) => alpha(t.palette.background.default, 0.8),
                borderBottom: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                animation: 'fadeIn 0.6s ease-out',
            }}
        >
            {/* Logo + Brand */}
            <Stack
                direction='row'
                alignItems='center'
                spacing={1.5}
                sx={{ animation: 'slideInLeft 0.5s ease-out' }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: (t) =>
                            `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.primary.dark} 100%)`,
                        boxShadow: (t) => `0 4px 16px ${alpha(t.palette.primary.main, 0.3)}`,
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                            transform: 'rotate(-8deg) scale(1.05)',
                            boxShadow: (t) =>
                                `0 6px 24px ${alpha(t.palette.primary.main, 0.5)}`,
                        },
                    }}
                >
                    <RocketLaunchIcon sx={{ fontSize: 22, color: '#000' }} />
                </Box>
                <Box>
                    <Typography
                        variant='h6'
                        sx={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            background: (t) =>
                                `linear-gradient(135deg, ${t.palette.text.primary} 0%, ${t.palette.primary.main} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Instant Wellness Kits
                    </Typography>
                    <Typography
                        variant='overline'
                        sx={{
                            display: 'block',
                            lineHeight: 1.4,
                            color: 'text.secondary',
                        }}
                    >
                        Drone Delivery Command Center
                    </Typography>
                </Box>
            </Stack>

            {/* Right Side Status */}
            <Stack direction='row' alignItems='center' spacing={2}>
                <Chip
                    icon={
                        <FiberManualRecordIcon
                            sx={{
                                fontSize: '10px !important',
                                color: '#22c55e !important',
                                animation: 'pulseGlow 2s infinite',
                            }}
                        />
                    }
                    label='System Online'
                    size='small'
                    variant='outlined'
                    sx={{
                        borderColor: (t) => alpha('#22c55e', 0.3),
                        color: '#4ade80',
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.7rem',
                        '& .MuiChip-icon': {
                            ml: '8px',
                        },
                    }}
                />
                <Typography
                    variant='caption'
                    sx={{
                        color: 'text.secondary',
                        display: { xs: 'none', sm: 'block' },
                    }}
                >
                    NY Region
                </Typography>
            </Stack>
        </Box>
    );
};

export default SiteHeader;

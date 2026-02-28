import { Navigate, Outlet, Link, useLocation } from 'react-router';
import { AppBar, Toolbar, Stack, Typography, Button } from '@mui/material';
import { useCurrentUser } from '../../hooks/auth';
import AuthHeaderButton from '../auth/AuthHeaderButton';
import * as styles from '../../app.styles';

const NAV_LINKS = [
    { label: 'Orders', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
];

export default function AuthenticatedLayout() {
    const { data: user, isLoading } = useCurrentUser();
    const { pathname } = useLocation();

    if (isLoading) return null;
    if (!user) return <Navigate to='/login' replace />;

    return (
        <Stack sx={styles.root}>
            <AppBar position='static' elevation={0} sx={styles.appBar}>
                <Toolbar sx={styles.toolbar}>
                    <Stack direction='row' alignItems='center' gap={2}>
                        <Typography variant='h6' sx={styles.logo}>
                            Instant Wellness Kits
                        </Typography>
                        <Stack direction='row' gap={0.5}>
                            {NAV_LINKS.map((link) => (
                                <Button
                                    key={link.to}
                                    component={Link}
                                    to={link.to}
                                    size='small'
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: pathname === link.to ? 700 : 500,
                                        color: pathname === link.to ? 'primary.main' : 'text.secondary',
                                        borderBottom: pathname === link.to ? '2px solid' : '2px solid transparent',
                                        borderColor: pathname === link.to ? 'primary.main' : 'transparent',
                                        borderRadius: 0,
                                        px: 1.5,
                                    }}
                                >
                                    {link.label}
                                </Button>
                            ))}
                        </Stack>
                    </Stack>
                    <AuthHeaderButton />
                </Toolbar>
            </AppBar>

            <Stack sx={styles.content}>
                <Outlet />
            </Stack>
        </Stack>
    );
}

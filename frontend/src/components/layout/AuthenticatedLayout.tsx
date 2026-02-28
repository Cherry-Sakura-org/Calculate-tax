import { Navigate, Outlet } from 'react-router';
import { AppBar, Toolbar, Stack, Typography } from '@mui/material';
import { useCurrentUser } from '../../hooks/auth';
import AuthHeaderButton from '../auth/AuthHeaderButton';
import Sidebar from '../sidebar/Sidebar';
import * as styles from '../../app.styles';

export default function AuthenticatedLayout() {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading) return null;
    if (!user) return <Navigate to='/login' replace />;

    return (
        <Stack sx={styles.root}>
            <AppBar position='static' elevation={0} sx={styles.appBar}>
                <Toolbar sx={styles.toolbar}>
                    <Typography variant='h6' sx={styles.logo}>
                        Instant Wellness Kits
                    </Typography>
                    <AuthHeaderButton />
                </Toolbar>
            </AppBar>

            <Stack direction='row' sx={{ flex: 1, overflow: 'hidden' }}>
                <Sidebar />
                <Stack sx={styles.content}>
                    <Outlet />
                </Stack>
            </Stack>
        </Stack>
    );
}

import { AppBar, Toolbar, Stack, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import OrdersTable from './components/orders-table/OrdersTable';
import AuthHeaderButton from './components/auth/AuthHeaderButton';
import * as styles from './app.styles';

const queryClient = new QueryClient();

function AppContent() {
    return (
        <>
            <Stack sx={styles.root}>
                {/* Header */}
                <AppBar position='static' elevation={0} sx={styles.appBar}>
                    <Toolbar sx={styles.toolbar}>
                        <Typography variant='h6' sx={styles.logo}>
                            Instant Wellness Kits
                        </Typography>
                        <AuthHeaderButton />
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Stack sx={styles.content}>
                    <OrdersTable />
                </Stack>
            </Stack>

            <ToastContainer />
        </>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppContent />
        </QueryClientProvider>
    );
}

export default App;

import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import SiteHeader from './components/layout/SiteHeader';
import NewOrderButton from './components/manual-order-create/NewOrderButton';
import OrdersImport from './components/orders-import/OrdersImport';
import OrdersTable from './components/orders-table/OrdersTable';
import  AuthHeaderButton  from './components/auth/AuthHeaderButton';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            {/* Header */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background: '#0f0f1a',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
                    {/* Left: existing NEW ORDER button */}
                    <NewOrderButton />

                    {/* Right: Auth */}
                    <AuthHeaderButton />
                </Toolbar>
            </AppBar>

            {/* Page content */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <OrdersImport />
                <OrdersTable />
            </Box>

            <ToastContainer />
            <ReactQueryDevtools />
        </QueryClientProvider>
    );
}

export default App;
import { Box, Container, Typography, Stack, alpha } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import SiteHeader from './components/layout/SiteHeader';
import NewOrderButton from './components/manual-order-create/NewOrderButton';
import OrdersImport from './components/orders-import/OrdersImport';
import OrdersTable from './components/orders-table/OrdersTable';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <SiteHeader />

                <Container
                    maxWidth='xl'
                    sx={{
                        flex: 1,
                        py: 4,
                        px: { xs: 2, md: 4 },
                    }}
                >
                    {/* Page Title + Actions */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent='space-between'
                        spacing={2}
                        sx={{
                            mb: 4,
                            animation: 'fadeInUp 0.6s ease-out',
                        }}
                    >
                        <Box>
                            <Typography
                                variant='h4'
                                sx={{
                                    fontWeight: 700,
                                    mb: 0.5,
                                }}
                            >
                                Orders Dashboard
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                Manage deliveries, imports, and tax calculations
                            </Typography>
                        </Box>
                        <NewOrderButton />
                    </Stack>

                    {/* Import Section */}
                    <Box
                        sx={{
                            mb: 4,
                            animation: 'fadeInUp 0.7s ease-out',
                            animationFillMode: 'backwards',
                            animationDelay: '0.1s',
                        }}
                    >
                        <OrdersImport />
                    </Box>

                    {/* Orders Table */}
                    <Box
                        sx={{
                            animation: 'fadeInUp 0.7s ease-out',
                            animationFillMode: 'backwards',
                            animationDelay: '0.2s',
                        }}
                    >
                        <Typography
                            variant='overline'
                            sx={{
                                display: 'block',
                                mb: 2,
                                color: 'text.secondary',
                            }}
                        >
                            Recent Orders
                        </Typography>
                        <OrdersTable />
                    </Box>
                </Container>

                {/* Footer */}
                <Box
                    component='footer'
                    sx={{
                        py: 2,
                        px: 4,
                        textAlign: 'center',
                        borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
                    }}
                >
                    <Typography variant='caption' color='text.secondary'>
                        Instant Wellness Kits — Drone Delivery Platform
                    </Typography>
                </Box>
            </Box>

            <ToastContainer
                theme='dark'
                position='bottom-right'
                toastStyle={{
                    background: '#1a2235',
                    borderRadius: '12px',
                    border: '1px solid rgba(148, 163, 184, 0.08)',
                    fontFamily: '"DM Sans", sans-serif',
                }}
            />
            <ReactQueryDevtools />
        </QueryClientProvider>
    );
}

export default App;

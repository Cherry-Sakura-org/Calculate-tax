import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import { CircularProgress, Box } from '@mui/material';
import theme from './theme';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/home/HomePage';
import OAuthCallbackPage from './pages/oauth/OAuthCallbackPage';
import ErrorBoundary from './components/ErrorBoundary';

const TestPage = lazy(() => import('./pages/test/TestPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const MapPage = lazy(() => import('./pages/map/MapPage'));

const queryClient = new QueryClient();

function PageLoader() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
        </Box>
    );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <BrowserRouter>
                        <Routes>
                            <Route element={<MainLayout />}>
                                <Route path="/" element={<HomePage />} />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <Suspense fallback={<PageLoader />}>
                                            <DashboardPage />
                                        </Suspense>
                                    }
                                />
                                <Route
                                    path="/map"
                                    element={
                                        <Suspense fallback={<PageLoader />}>
                                            <MapPage />
                                        </Suspense>
                                    }
                                />
                                <Route
                                    path="/test"
                                    element={
                                        <Suspense fallback={<PageLoader />}>
                                            <TestPage />
                                        </Suspense>
                                    }
                                />
                            </Route>
                            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
                        </Routes>
                    </BrowserRouter>
                </ErrorBoundary>
                <ToastContainer />
            </QueryClientProvider>
        </ThemeProvider>
    </React.StrictMode>,
);

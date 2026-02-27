import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import theme from './theme';
import App from './App.tsx';
import TestPage from './pages/test/TestPage';
import OAuthCallbackPage from './pages/oauth/OAuthCallbackPage';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <BrowserRouter>
                        <Routes>
                            <Route path='/' element={<App />} />
                            <Route path='/test' element={<TestPage />} />
                            <Route path='/oauth/callback' element={<OAuthCallbackPage />} />
                        </Routes>
                    </BrowserRouter>
                </ErrorBoundary>
                <ToastContainer />
            </QueryClientProvider>
        </ThemeProvider>
    </React.StrictMode>,
);

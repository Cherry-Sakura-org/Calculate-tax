import { Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import PublicLayout from './components/layout/PublicLayout';
import AuthenticatedLayout from './components/layout/AuthenticatedLayout';
import LoginPage from './components/login/LoginPage';
import OrdersPage from './components/OrdersPage';
import DashboardPage from './components/dashboard/DashboardPage';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path='/login' element={<LoginPage />} />
                </Route>
                <Route element={<AuthenticatedLayout />}>
                    <Route path='/' element={<OrdersPage />} />
                    <Route path='/dashboard' element={<DashboardPage />} />
                </Route>
            </Routes>

            <ToastContainer />
        </QueryClientProvider>
    );
}

export default App;

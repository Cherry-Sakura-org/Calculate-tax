import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import NewOrderButton from './components/manual-order-create/NewOrderButton';
import OrdersImport from './components/orders-import/OrdersImport';
import OrdersTable from './components/orders-table/OrdersTable';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Box>
                <NewOrderButton />
                <OrdersImport />
                <OrdersTable />
            </Box>
            <ToastContainer />
            <ReactQueryDevtools />
        </QueryClientProvider>
    );
}

export default App;

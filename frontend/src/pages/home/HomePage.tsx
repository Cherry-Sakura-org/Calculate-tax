import { Box } from '@mui/material';
import OrdersTable from '../../components/orders-table/OrdersTable';

export default function HomePage() {
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <OrdersTable />
        </Box>
    );
}

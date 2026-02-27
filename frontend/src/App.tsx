import { AppBar, Toolbar, Stack, Button } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NewOrderButton from './components/manual-order-create/NewOrderButton';
import OrdersImportDialog from './components/orders-import/OrdersImport';
import OrdersTable from './components/orders-table/OrdersTable';
import AuthHeaderButton from './components/auth/AuthHeaderButton';
import { useDialog } from './hooks/use-dialog';
import { useDownloadOrdersCsv } from './api/use-orders';
import * as styles from './app.styles';

const queryClient = new QueryClient();

function AppContent() {
    const [showImportDialog, openImportDialog, closeImportDialog, mountImportDialog] = useDialog();
    const { mutate: downloadCsv, isPending: isDownloading } = useDownloadOrdersCsv();

    return (
        <>
            <Stack sx={styles.root}>
                {/* Header */}
                <AppBar position='static' elevation={0} sx={styles.appBar}>
                    <Toolbar sx={styles.toolbar}>
                        {/* Left: actions */}
                        <Stack direction='row' spacing={1.5}>
                            <Button
                                variant='contained'
                                startIcon={<FileDownloadIcon />}
                                onClick={() => downloadCsv()}
                                disabled={isDownloading}
                                sx={styles.actionButton}
                            >
                                {isDownloading ? 'Downloading...' : 'Download CSV'}
                            </Button>
                            <NewOrderButton />
                            <Button
                                variant='outlined'
                                startIcon={<FileUploadIcon />}
                                onClick={openImportDialog}
                                sx={styles.actionButton}
                            >
                                Import CSV
                            </Button>
                        </Stack>

                        {/* Right: Auth */}
                        <AuthHeaderButton />
                    </Toolbar>
                </AppBar>

                {/* Page content */}
                <Stack sx={styles.content}>
                    <OrdersTable />
                </Stack>
            </Stack>

            {mountImportDialog && (
                <OrdersImportDialog open={showImportDialog} onClose={closeImportDialog} />
            )}

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

import { AppBar, Toolbar, Stack, Button } from '@mui/material';
import { Link } from 'react-router';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ScienceIcon from '@mui/icons-material/Science';
import NewOrderButton from './components/manual-order-create/NewOrderButton';
import OrdersImportDialog from './components/orders-import/OrdersImport';
import OrdersTable from './components/orders-table/OrdersTable';
import AuthHeaderButton from './components/auth/AuthHeaderButton';
import { useDialog } from './hooks/use-dialog';
import * as styles from './app.styles';

function App() {
    const [showImportDialog, openImportDialog, closeImportDialog, mountImportDialog] = useDialog();

    return (
        <>
            <Stack sx={styles.root}>
                {/* Header */}
                <AppBar position='static' elevation={0} sx={styles.appBar}>
                    <Toolbar sx={styles.toolbar}>
                        {/* Left: actions */}
                        <Stack direction='row' spacing={1.5}>
                            <NewOrderButton />
                            <Button
                                variant='outlined'
                                startIcon={<FileUploadIcon />}
                                onClick={openImportDialog}
                                sx={styles.importButton}
                            >
                                Import CSV
                            </Button>
                            <Button
                                component={Link}
                                to='/test'
                                variant='outlined'
                                startIcon={<ScienceIcon />}
                                sx={styles.importButton}
                            >
                                API Test
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
        </>
    );
}

export default App;

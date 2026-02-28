import { Box, AppBar, Toolbar, Stack, Button } from '@mui/material';
import { Outlet } from 'react-router';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import NewOrderButton from '../manual-order-create/NewOrderButton';
import AuthHeaderButton from '../auth/AuthHeaderButton';
import OrdersImportDialog from '../orders-import/OrdersImport';
import { useDialog } from '../../hooks/use-dialog';

export default function MainLayout() {
    const [showImportDialog, openImportDialog, closeImportDialog, mountImportDialog] = useDialog();

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    width: `calc(100% - ${DRAWER_WIDTH}px)`,
                }}
            >
                <AppBar
                    position="static"
                    elevation={0}
                    sx={{
                        background: '#ffffff',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
                        <Stack direction="row" spacing={1.5}>
                            <NewOrderButton />
                            <Button
                                variant="outlined"
                                startIcon={<FileUploadIcon />}
                                onClick={openImportDialog}
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                Import CSV
                            </Button>
                        </Stack>

                        <AuthHeaderButton />
                    </Toolbar>
                </AppBar>

                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: { xs: 2, sm: 3 },
                        backgroundColor: 'background.default',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>

            {mountImportDialog && (
                <OrdersImportDialog open={showImportDialog} onClose={closeImportDialog} />
            )}
        </Box>
    );
}

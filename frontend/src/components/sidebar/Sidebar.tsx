import { useState } from 'react';
import {
    Drawer,
    Box,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Tooltip,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import { useDialog } from '../../hooks/use-dialog';
import { useCurrentUser, useLogout } from '../../hooks/auth';
import { AuthDialog } from '../auth/AuthDialog';
import { AuthUser } from '../../types/auth';
import * as styles from './sidebar.styles';

function UserSection({ user }: { user: AuthUser }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const logout = useLogout();

    return (
        <>
            <Tooltip title={user.username} placement='right'>
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={styles.userButton}
                >
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {user.username.slice(0, 2)}
                    </Avatar>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <MenuItem>Profile</MenuItem>
                <MenuItem>History</MenuItem>
                <MenuItem onClick={() => logout()}>Exit</MenuItem>
            </Menu>
        </>
    );
}

function AuthSection() {
    const [showDialog, openDialog, closeDialog, mountDialog] = useDialog();
    const { data: user } = useCurrentUser();

    return (
        <Box sx={styles.authSection}>
            {user ? (
                <UserSection user={user} />
            ) : (
                <>
                    <Tooltip title='Sign In' placement='right'>
                        <IconButton onClick={openDialog} sx={styles.signInButton}>
                            <PersonIcon />
                        </IconButton>
                    </Tooltip>
                    {mountDialog && (
                        <AuthDialog open={showDialog} onClose={closeDialog} />
                    )}
                </>
            )}
        </Box>
    );
}

const Sidebar = () => {
    return (
        <Drawer variant='permanent' sx={styles.drawer}>
            <Box sx={styles.logoSection}>
                <Box sx={styles.iconBox}>
                    <LocalShippingIcon sx={styles.shippingIcon} />
                </Box>
            </Box>

            <AuthSection />
        </Drawer>
    );
};

export default Sidebar;

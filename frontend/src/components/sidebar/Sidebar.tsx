import { useState } from 'react';
import { useNavigate } from 'react-router';
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
import { useCurrentUser, useLogout } from '../../hooks/auth';
import { AuthUser } from '../../types/auth';
import * as styles from './sidebar.styles';

function UserSection({ user }: { user: AuthUser }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const logout = useLogout();
    const navigate = useNavigate();

    const handleLogout = () => {
        setAnchorEl(null);
        logout();
        navigate('/login');
    };

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
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    );
}

function AuthSection() {
    const { data: user } = useCurrentUser();

    if (!user) return null;

    return (
        <Box sx={styles.authSection}>
            <UserSection user={user} />
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

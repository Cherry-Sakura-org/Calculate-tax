import { useNavigate } from 'react-router';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useCurrentUser, useLogout } from '../../hooks/auth';

export function AuthHeaderButton() {
    const { data: user } = useCurrentUser();
    const logout = useLogout();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant='body2' color='text.primary'>{user.email}</Typography>
            <Tooltip title='Logout'>
                <IconButton size='small' onClick={handleLogout}>
                    <LogoutIcon fontSize='small' />
                </IconButton>
            </Tooltip>
        </Box>
    );
}

export default AuthHeaderButton;

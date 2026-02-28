import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Avatar, Menu, MenuItem, Typography } from '@mui/material';
import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useCurrentUser, useLogout } from '../../hooks/auth';

export function AuthHeaderButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { data: user } = useCurrentUser();
    const logout = useLogout();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = () => {
        setAnchorEl(null);
        logout();
        navigate('/login');
    };

    return (
        <>
            <Button onClick={(e) => setAnchorEl(e.currentTarget)} endIcon={<ArrowDownIcon />}>
                <Avatar>{user.username.slice(0, 2)}</Avatar>
                <Typography>{user.username}</Typography>
            </Button>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    );
}

export default AuthHeaderButton;

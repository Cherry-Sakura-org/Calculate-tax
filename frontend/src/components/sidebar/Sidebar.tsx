import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
    Drawer,
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import * as styles from './sidebar.styles';

const NAV_LINKS = [
    { label: 'Orders', to: '/', icon: <ListAltIcon fontSize='small' /> },
    { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon fontSize='small' /> },
];

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const { pathname } = useLocation();

    return (
        <Drawer variant='permanent' sx={styles.drawer(open)}>
            <Box sx={{ display: 'flex', justifyContent: open ? 'flex-end' : 'center', p: 1 }}>
                <Tooltip title={open ? 'Collapse' : 'Expand'} placement='right'>
                    <IconButton onClick={() => setOpen(!open)} sx={styles.toggleButton}>
                        {open ? <ChevronLeftIcon fontSize='small' /> : <MenuIcon fontSize='small' />}
                    </IconButton>
                </Tooltip>
            </Box>

            <List disablePadding sx={styles.navList}>
                {NAV_LINKS.map((link) => {
                    const active = pathname === link.to;
                    return (
                        <Tooltip
                            key={link.to}
                            title={open ? '' : link.label}
                            placement='right'
                            arrow
                        >
                            <ListItemButton
                                component={Link}
                                to={link.to}
                                selected={active}
                                sx={styles.navItem(open)}
                            >
                                <ListItemIcon sx={styles.navIcon(active, open)}>
                                    {link.icon}
                                </ListItemIcon>
                                {open && (
                                    <ListItemText
                                        primary={link.label}
                                        slotProps={{
                                            primary: {
                                                fontSize: '0.875rem',
                                                fontWeight: active ? 600 : 400,
                                                noWrap: true,
                                            },
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </Tooltip>
                    );
                })}
            </List>
        </Drawer>
    );
}

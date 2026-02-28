import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography, alpha } from '@mui/material';
import { NavLink, useLocation } from 'react-router';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MapIcon from '@mui/icons-material/Map';
import ScienceIcon from '@mui/icons-material/Science';

const DRAWER_WIDTH = 240;

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { path: '/', label: 'Orders', icon: <ShoppingCartIcon /> },
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/map', label: 'Map', icon: <MapIcon /> },
    { path: '/test', label: 'API Test', icon: <ScienceIcon /> },
];

export default function Sidebar() {
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                },
            }}
        >
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        letterSpacing: '-0.02em',
                    }}
                >
                    Wellness Kits
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Admin Dashboard
                </Typography>
            </Box>

            <List sx={{ px: 1.5, py: 2 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItemButton
                            key={item.path}
                            component={NavLink}
                            to={item.path}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                py: 1.25,
                                backgroundColor: isActive ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                color: isActive ? 'primary.main' : 'text.secondary',
                                '&:hover': {
                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                },
                                '& .MuiListItemIcon-root': {
                                    color: isActive ? 'primary.main' : 'text.secondary',
                                    minWidth: 40,
                                },
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '0.9rem',
                                }}
                            />
                        </ListItemButton>
                    );
                })}
            </List>
        </Drawer>
    );
}

export { DRAWER_WIDTH };

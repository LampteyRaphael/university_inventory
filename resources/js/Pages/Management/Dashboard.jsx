import React from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Inventory as InventoryIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as PurchaseIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { Link, usePage } from '@inertiajs/react';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { text: 'Purchase Orders', href: '/purchase-orders', icon: <PurchaseIcon /> },
  { text: 'Order Items', href: '/purchase-order-items', icon: <InventoryIcon /> },
  { text: 'Inventory', href: '/inventory', icon: <InventoryIcon /> },
  { text: 'Users', href: '/users', icon: <UsersIcon /> },
  { text: 'Settings', href: '/settings', icon: <SettingsIcon /> },
];

export default function AuthenticatedLayout({ auth, children, title = 'Dashboard', breadcrumbs = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" fontWeight="800" color="primary" gutterBottom>
          🏛️ UNI-INVENTORY
        </Typography>
        <Typography variant="body2" color="text.secondary">
          University Management System
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <MenuItem
            key={item.text}
            component={Link}
            href={item.href}
            sx={{
              borderRadius: 2,
              mb: 1,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '& .MuiSvgIcon-root': {
                  color: 'primary.contrastText',
                },
              },
              '&.active': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiSvgIcon-root': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              {item.icon}
              <Typography fontWeight="600">{item.text}</Typography>
            </Box>
          </MenuItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Breadcrumbs */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="700">
              {title}
            </Typography>
            {breadcrumbs.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {breadcrumbs.map((crumb, index) => (
                  <span key={index}>
                    {index > 0 && ' / '}
                    {crumb.href ? (
                      <Link href={crumb.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {crumb.icon} {crumb.label}
                      </Link>
                    ) : (
                      crumb.label
                    )}
                  </span>
                ))}
              </Typography>
            )}
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {auth.user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleUserMenuClose}>
                <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleUserMenuClose}>
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem component={Link} href={route('logout')} method="post">
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.12)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.12)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'grey.50',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
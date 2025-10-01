import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  Chip,
  Fab,
  Menu,
  MenuItem,
  CircularProgress,
  styled,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
  Inventory2,
  Category,
  Apartment,
  ExpandLess,
  ExpandMore,
  Store as SuppliersIcon,
  Group as CustomersIcon,
  Receipt as OrdersIcon,
  Analytics as AnalyticsIcon,
  School as UniversityIcon, // Added for universities
  Place as LocationIcon, // Added for locations
  Build as MaintenanceIcon, // Added for maintenance
  History as AuditIcon // Added for audit logs
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import { useForm } from '@inertiajs/react';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Styled components
const SidebarHeader = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
}));

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  transition: 'width 0.3s ease',
});

const CollapsedIconButton = styled(IconButton)({
  color: 'white',
  padding: 8,
});

const ProfileContainer = styled(Box)({
  padding: 16,
  textAlign: 'center',
  animation: `${fadeIn} 0.5s ease-in`,
  overflow: 'hidden',
});

const AnimatedListItem = styled(ListItem)({
  animation: `${slideIn} 0.3s ease-out`,
});

const drawerWidth = 260;
const collapsedDrawerWidth = 72;

const AuthenticatedLayout = ({ children, title, breadcrumbs = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openGroups, setOpenGroups] = useState({});
  const { post, get } = useForm();

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    post(route('logout'));
  };

  const handleGroupToggle = (groupKey, event) => {
    // Prevent the click from propagating if it's a navigation item
    if (event) {
      event.stopPropagation();
    }
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleItemClick = (item, event) => {
    if (item.route) {
      get(route(item.route));
    }
    // Don't close the group when an item is clicked
    event.stopPropagation();
  };

  const menuGroups = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      items: [
        { text: 'Dashboard', icon: <DashboardIcon />, route: 'dashboard' }
      ]
    },
    {
      key: 'inventory',
      title: 'Inventory Management',
      icon: <InventoryIcon />,
      items: [
        { text: 'Inventory Overview', icon: <InventoryIcon />, route: 'inventory-transactions.index' },
        { text: 'Items', icon: <Inventory2 />, route: 'item.index' },
        { text: 'Item Categories', icon: <Category />, route: 'item-categories.index' },
        { text: 'Departments', icon: <Apartment />, route: 'department.index' },
        { text: 'Stock Levels', icon: <BarChartIcon />, route: 'stock_levels' },
        { text: 'Locations', icon: <LocationIcon />, route: 'locations' }
      ]
    },
    {
      key: 'parties',
      title: 'Parties',
      icon: <PeopleIcon />,
      items: [
        { text: 'Suppliers', icon: <SuppliersIcon />, route: 'suppliers' },
        { text: 'Customers', icon: <CustomersIcon />, route: 'users.index' },
        { text: 'Universities', icon: <UniversityIcon />, route: 'universities' }
      ]
    },
    {
      key: 'transactions',
      title: 'Transactions',
      icon: <ShoppingCartIcon />,
      items: [
        { text: 'Orders', icon: <OrdersIcon />, badge: 5, route: 'orders_purchase' },
        { text: 'Purchases', icon: <ShoppingCartIcon />, route: 'purchase_order_items' }
      ]
    },
    {
      key: 'maintenance',
      title: 'Maintenance',
      icon: <MaintenanceIcon />,
      items: [
        { text: 'Maintenance Records', icon: <MaintenanceIcon />, route: 'maintenance_records.index' }
      ]
    },
    {
      key: 'reports',
      title: 'Reports & Analytics',
      icon: <BarChartIcon />,
      items: [
        { text: 'Analytics Dashboard', icon: <AnalyticsIcon /> },
        { text: 'Inventory Reports', icon: <BarChartIcon />, route:"inventory-report.index" },
        { text: 'Audit Logs', icon: <AuditIcon />, route: 'audit-logs.index' }
      ]
    },
    {
      key: 'settings',
      title: 'Settings',
      icon: <SettingsIcon />,
      items: [
        { text: 'System Settings', icon: <SettingsIcon /> },
        { text: 'User Management', icon: <PeopleIcon /> }
      ]
    }
  ];

  // Check if any item in a group is active
  const isGroupActive = (group) => {
    return group.items.some(item => item.active);
  };

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      background: 'linear-gradient(180deg, #2c3e50 0%, #3498db 100%)',
      color: 'white',
      overflowX: 'hidden',
    }}>
      <SidebarHeader>
        <LogoContainer sx={{ width: sidebarOpen ? 'auto' : 0 }}>
          <InventoryIcon sx={{ mr: 1, fontSize: 32, minWidth: 32 }} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            StockWise
          </Typography>
        </LogoContainer>
        <CollapsedIconButton onClick={handleDrawerToggle}>
          {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </CollapsedIconButton>
      </SidebarHeader>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      
      {/* User Profile */}
      {sidebarOpen && (
        <ProfileContainer>
          <Avatar 
            sx={{ 
              width: 70, 
              height: 70, 
              mx: 'auto', 
              mb: 1,
              border: '3px solid rgba(255,255,255,0.3)',
              animation: `${pulse} 2s infinite`
            }}
            src="https://randomuser.me/api/portraits/men/32.jpg"
          />
          <Typography variant="h6" sx={{ fontWeight: 'medium', fontSize: '1.1rem' }}>
            Michael Chen
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.8rem' }}>
            Inventory Manager
          </Typography>
          <Chip 
            label="Premium Plan" 
            size="small" 
            color="primary" 
            sx={{ mt: 1,mb:5, color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }} 
          />
        </ProfileContainer>
      )}
      
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      
      <List sx={{ px: 1, flexGrow: 1, overflow: 'auto' }}>
        {menuGroups.map((group) => (
          <React.Fragment key={group.key}>
            {/* Group Header - Always visible */}
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={(e) => handleGroupToggle(group.key, e)}
                selected={isGroupActive(group)}
                sx={{
                  borderRadius: 2,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: sidebarOpen ? 2 : 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'white',
                    minWidth: sidebarOpen ? 56 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {group.icon}
                </ListItemIcon>
                {sidebarOpen && (
                  <>
                    <ListItemText 
                      primary={group.title} 
                      sx={{ 
                        '& .MuiListItemText-primary': {
                          fontSize: '0.95rem',
                          fontWeight: '500'
                        }
                      }}
                    />
                    {openGroups[group.key] ? <ExpandLess /> : <ExpandMore />}
                  </>
                )}
              </ListItemButton>
            </ListItem>

            {/* Group Items - Collapsible */}
            {sidebarOpen && (
              <Collapse in={openGroups[group.key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 3 }}>
                  {group.items.map((item) => (
                    <AnimatedListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton 
                        onClick={(e) => handleItemClick(item, e)}
                        selected={item.active}
                        sx={{
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          '&.Mui-selected': {
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.2)',
                            },
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        <ListItemIcon 
                          sx={{ 
                            color: 'white',
                            minWidth: 35,
                            justifyContent: 'center',
                          }}
                        >
                          {item.badge && item.badge > 0 ? (
                            <Badge badgeContent={item.badge} color="error">
                              {item.icon}
                            </Badge>
                          ) : item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text} 
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              fontSize: '0.85rem'
                            }
                          }}
                        />
                      </ListItemButton>
                    </AnimatedListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      
      {/* Quick Actions Section */}
      {sidebarOpen && (
        <Box sx={{ p: 2, animation: `${fadeIn} 0.5s ease-in` }}>
          <Typography variant="subtitle2" sx={{ 
            color: 'white', 
            opacity: 0.8, 
            mb: 1, 
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            QUICK ACTIONS
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              icon={<AddIcon />} 
              onClick={(e) => handleItemClick(get(route('orders_purchase')))}
              label="New Order" 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                color: 'white', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } 
              }} 
            />
            <Chip 
              icon={<InventoryIcon />} 
              label="Add Item" 
              onClick={(e) => handleItemClick(get(route('item')))}
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.15)', 
                color: 'white', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } 
              }} 
            />
          </Box>
        </Box>
      )}
    </Box>
  );

  const defaultBreadcrumbs = [
    { label: 'Home', href: '/', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> },
    { label: title },
  ];

  const displayBreadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : defaultBreadcrumbs;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          ml: { md: sidebarOpen ? `${drawerWidth}px` : `${collapsedDrawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Search Bar */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'grey.100', 
            borderRadius: 2, 
            px: 2, 
            py: 0.5,
            flexGrow: 1,
            maxWidth: 500
          }}>
            <SearchIcon color="action" />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              style={{ 
                border: 'none', 
                background: 'transparent', 
                padding: '8px', 
                width: '100%', 
                outline: 'none',
                fontSize: '0.9rem'
              }} 
            />
            <IconButton>
              <FilterIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Notifications */}
          <IconButton sx={{ mr: 1 }}>
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          {/* User Profile */}
          <IconButton onClick={handleProfileMenuOpen}>
            <Avatar 
              sx={{ width: 36, height: 36 }} 
              src="https://randomuser.me/api/portraits/men/32.jpg"
            />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                width: 250,
                mt: 1.5,
                overflow: 'visible',
                filter: 'drop-shadow(0px 5px 10px rgba(0,0,0,0.1))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <EmailIcon fontSize="small" />
              </ListItemIcon>
              Messages
              <Chip label="3" size="small" color="primary" sx={{ ml: 2 }} />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
        
        {/* Breadcrumbs */}
        <Toolbar variant="dense" sx={{ bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'grey.200' }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            {displayBreadcrumbs.map((item, index) => 
              item.href ? (
                <Link 
                  key={index} 
                  underline="hover" 
                  color="inherit" 
                  href={item.href}
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <Typography key={index} color="text.primary">
                  {item.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Fab color="primary" size="small" sx={{ boxShadow: 'none', mr: 1 }}>
            <AddIcon />
          </Fab>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { 
            md: sidebarOpen ? drawerWidth : collapsedDrawerWidth 
          }, 
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={sidebarOpen && isMobile}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop */}
        <Drawer
          variant="permanent"
          open={sidebarOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            md: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px)` 
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'grey.50',
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Toolbar variant="dense" />
        
        {children}
      </Box>
    </Box>
  );
};

export default AuthenticatedLayout;
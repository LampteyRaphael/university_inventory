import React, { useState, useMemo, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Box, Chip, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, Card, CardContent,
  Grid, IconButton, Switch, FormControlLabel, Avatar, Paper, useTheme, useMediaQuery,
  alpha, FormHelperText, Tooltip, Badge, Accordion, AccordionSummary, AccordionDetails,
  Fade, Grow, Slide,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Block as BlockIcon, CheckCircle as ActiveIcon, Cancel as InactiveIcon,
  Person as UserIcon, Search as SearchIcon, Security as SecurityIcon,
  Close as CloseIcon, Email as EmailIcon, Phone as PhoneIcon,
  Business as BusinessIcon, Apartment as DepartmentIcon,
  ExpandMore as ExpandMoreIcon, Group as GroupIcon, Shield as ShieldIcon,
  People as PeopleIcon, AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingUpIcon, WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import Notification from '@/Components/Notification';

export default function UserManagement({ auth, users, universities, departments, flash }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { props } = usePage();
  
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // User form
  const { data: userData, setData: setUserData, post: postUser, put: putUser, delete: destroyUser, processing: userProcessing, errors: userErrors, reset: resetUser } = useForm({
    user_id: '',
    university_id: '',
    department_id: '',
    employee_id: '',
    username: '',
    email: '',
    name: '',
    first_name: '',
    last_name: '',
    phone: '',
    position: '',
    is_active: true,
    password: '',
    password_confirmation: '',
  });

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  // Process users data with roles and permissions
  const processedUsers = useMemo(() => {
    return (users || []).map(user => ({
      id: user.user_id,
      ...user,
      status: user.is_active ? 'active' : 'inactive',
      full_name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name,
      roles_count: user.roles?.length || 0,
      permissions_count: user.permissions?.length || 0,
      primary_role: user.roles?.[0]?.name || 'No Role',
    }));
  }, [users]);

  // User columns for DataGrid
  const userColumns = useMemo(() => [
    { 
      field: 'user', 
      headerName: 'User', 
      width: 240,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'left', gap: 1 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 44, 
              height: 44,
              fontWeight: 600,
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {params.row.name?.charAt(0) || params.row.first_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
              {params.row.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {params.row.email}
            </Typography>
            {params.row.employee_id && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>
                ID: {params.row.employee_id}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    { 
      field: 'primary_role', 
      headerName: 'Role', 
      width: 130,
      renderCell: (params) => (
        <Tooltip title={params.row.roles_count > 1 ? `${params.row.roles_count} roles` : '1 role'}>
          <Chip 
            icon={<GroupIcon sx={{ fontSize: '1rem' }} />}
            label={params.row.primary_role} 
            size="small"
            color={
              params.row.primary_role.toLowerCase().includes('admin') ? 'error' :
              params.row.primary_role.toLowerCase().includes('manager') ? 'warning' :
              params.row.primary_role.toLowerCase().includes('staff') ? 'primary' : 'default'
            }
            variant="filled"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 28,
            }}
          />
        </Tooltip>
      )
    },
    { 
      field: 'permissions', 
      headerName: 'Permissions', 
      width: 110,
      renderCell: (params) => (
        <Badge 
          badgeContent={params.row.permissions_count} 
          color="secondary" 
          showZero
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.7rem',
              fontWeight: 700,
              height: 20,
              minWidth: 20,
            }
          }}
        >
          <Tooltip title={`${params.row.permissions_count} direct permissions`}>
            <ShieldIcon color="action" sx={{ fontSize: '1.4rem' }} />
          </Tooltip>
        </Badge>
      )
    },
    { 
      field: 'university', 
      headerName: 'University', 
      width: 160,
      renderCell: (params) => (
        <Tooltip title={params.row.university?.name || 'No University'}>
          <Chip 
            icon={<BusinessIcon sx={{ fontSize: '1rem' }} />}
            label={params.row.university?.name || '—'} 
            size="small"
            variant="outlined"
            color={params.row.university ? "primary" : "default"}
            sx={{ 
              fontWeight: 500,
              fontSize: '0.75rem',
              height: 28,
              maxWidth: 140,
            }}
          />
        </Tooltip>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          icon={params.row.is_active ? <ActiveIcon sx={{ fontSize: '1rem' }} /> : <InactiveIcon sx={{ fontSize: '1rem' }} />}
          label={params.row.is_active ? 'Active' : 'Inactive'} 
          size="small"
          color={params.row.is_active ? 'success' : 'error'}
          variant="filled"
          sx={{ 
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 28,
          }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Edit User"><EditIcon /></Tooltip>}
          label="Edit"
          onClick={() => handleEditUser(params.row)}
          sx={{ 
            color: 'primary.main',
            '&:hover': { backgroundColor: 'primary.light', color: 'white' }
          }}
        />,
        <GridActionsCellItem
          icon={<Tooltip title={params.row.is_active ? 'Deactivate' : 'Activate'}>
            {params.row.is_active ? <BlockIcon /> : <ActiveIcon />}
          </Tooltip>}
          label="Toggle Status"
          onClick={() => handleToggleStatus(params.row)}
          sx={{ 
            color: params.row.is_active ? 'warning.main' : 'success.main',
            '&:hover': { 
              backgroundColor: params.row.is_active ? 'warning.light' : 'success.light',
              color: 'white'
            }
          }}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Delete User"><DeleteIcon /></Tooltip>}
          label="Delete"
          onClick={() => handleDeleteUser(params.row)}
          sx={{ 
            color: 'error.main',
            '&:hover': { backgroundColor: 'error.light', color: 'white' }
          }}
        />,
      ],
    },
  ], []);

  // Event handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    resetUser({
      university_id: auth.user?.university_id || '',
      is_active: true,
    });
    setOpenUserDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserData({
      user_id: user.user_id,
      university_id: user.university_id,
      department_id: user.department_id,
      employee_id: user.employee_id || '',
      username: user.username || '',
      email: user.email,
      name: user.name,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      position: user.position || '',
      is_active: user.is_active,
    });
    setOpenUserDialog(true);
  };

  const handleToggleStatus = (user) => {
    if (user.user_id === auth.user.user_id) {
      showAlert('You cannot deactivate your own account', 'error');
      return;
    }

    router.put(route('users.toggle-status', user.user_id), {}, {
      onSuccess: () => showAlert(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`),
      onError: () => showAlert('Failed to update user status', 'error'),
    });
  };

  const handleDeleteUser = (user) => {
    if (user.user_id === auth.user.user_id) {
      showAlert('You cannot delete your own account', 'error');
      return;
    }
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleUserSubmit = () => {
    if (selectedUser) {
      putUser(route('users.update', selectedUser.user_id), {
        onSuccess: () => {
          setOpenUserDialog(false);
          showAlert('User updated successfully');
        },
        onError: () => showAlert('Failed to update user', 'error'),
      });
    } else {
      postUser(route('users.store'), {
        onSuccess: () => {
          setOpenUserDialog(false);
          showAlert('User created successfully with default staff role');
        },
        onError: () => showAlert('Failed to create user', 'error'),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      destroyUser(route('users.destroy', selectedUser.user_id), {
        onSuccess: () => {
          setOpenDeleteDialog(false);
          showAlert('User deleted successfully');
        },
        onError: () => showAlert('Failed to delete user', 'error'),
      });
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = processedUsers;
    
    if (searchText) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.employee_id?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.primary_role?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }
    
    return filtered;
  }, [processedUsers, searchText, statusFilter]);

  // Handle flash messages
  useEffect(() => {
    if (props.flash?.success) {
      showAlert(props.flash.success, "success");
    }
    if (props.flash?.error) {
      showAlert(props.flash.error, "error");
    }
  }, [props.flash]);

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  // Summary statistics
  const summaryData = useMemo(() => {
    const total = processedUsers.length;
    const active = processedUsers.filter(user => user.is_active).length;
    const staffUsers = processedUsers.filter(user => 
      user.primary_role.toLowerCase().includes('staff')
    ).length;
    const adminUsers = processedUsers.filter(user => 
      user.primary_role.toLowerCase().includes('admin')
    ).length;
    
    return {
      totalUsers: total,
      activeUsers: active,
      staffUsers: staffUsers,
      adminUsers: adminUsers,
      inactiveUsers: total - active,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [processedUsers]);

  // Modern Stat Card Component
  const StatCard = ({ title, value, icon, color, delay = 0 }) => (
    <Grow in={true} timeout={800} style={{ transitionDelay: `${delay}ms` }}>
      <Card 
        sx={{ 
          p: 3,
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
          border: `1px solid ${color}20`,
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 16px 48px ${color}20`,
            borderColor: `${color}40`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
          }
        }}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography 
                variant="h3" 
                fontWeight={800}
                sx={{ 
                  background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2,
                }}
              >
                {value}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.primary" 
                fontWeight={600}
                sx={{ mt: 1 }}
              >
                {title}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 16px ${color}40`,
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );

  // User details component for showing roles and permissions
  const UserRolesPermissions = ({ user }) => {
    if (!user) return null;

    return (
      <Fade in={true} timeout={600}>
        <Box sx={{ mt: 3 }}>
          <Accordion 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: 0 },
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                borderRadius: 3,
                '&.Mui-expanded': { 
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SecurityIcon sx={{ fontSize: '1.2rem' }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="primary">
                    Roles & Permissions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    View assigned roles and permissions
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={700} color="primary">
                    Roles ({user.roles?.length || 0})
                  </Typography>
                  <Stack spacing={1}>
                    {user.roles?.map(role => (
                      <Chip
                        key={role.id}
                        label={role.name}
                        color={
                          role.name.toLowerCase().includes('admin') ? 'error' :
                          role.name.toLowerCase().includes('manager') ? 'warning' :
                          role.name.toLowerCase().includes('staff') ? 'primary' : 'default'
                        }
                        variant="filled"
                        size="medium"
                        sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                      />
                    ))}
                    {(!user.roles || user.roles.length === 0) && (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No roles assigned
                      </Typography>
                    )}
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight={700} color="primary">
                    Direct Permissions ({user.permissions?.length || 0})
                  </Typography>
                  <Stack spacing={1}>
                    {user.permissions?.slice(0, 5).map(permission => (
                      <Chip
                        key={permission.id}
                        label={permission.name}
                        variant="outlined"
                        size="medium"
                        icon={<ShieldIcon />}
                        sx={{ fontWeight: 500, fontSize: '0.8rem' }}
                      />
                    ))}
                    {user.permissions && user.permissions.length > 5 && (
                      <Typography variant="caption" color="text.secondary">
                        +{user.permissions.length - 5} more permissions
                      </Typography>
                    )}
                    {(!user.permissions || user.permissions.length === 0) && (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        No direct permissions
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Fade>
    );
  };

  return (
    <AuthenticatedLayout
      auth={auth}
      title="User Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'User Management' }
      ]}
    >
      <Box>
        {/* Header */}
        <Slide in={true} direction="down" timeout={500}>
          <Box sx={{ mb: 5 }}>
            <Typography 
              variant="h3" 
              fontWeight={800} 
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              User Management
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontSize: '1.1rem',
                fontWeight: 400,
              }}
            >
              Manage system users, roles, and permissions with ease
            </Typography>
          </Box>
        </Slide>

        <Notification 
          open={alert.open} 
          severity={alert.severity} 
          message={alert.message}
          onClose={handleCloseAlert}
        />

        {/* Modern Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Users"
              value={summaryData.totalUsers}
              icon={<PeopleIcon sx={{ fontSize: '1.8rem' }} />}
              color="#667eea"
              delay={100}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Active Users"
              value={summaryData.activeUsers}
              icon={<ActiveIcon sx={{ fontSize: '1.8rem' }} />}
              color="#4CAF50"
              delay={200}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Staff Members"
              value={summaryData.staffUsers}
              icon={<GroupIcon sx={{ fontSize: '1.8rem' }} />}
              color="#2196F3"
              delay={300}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Admin Users"
              value={summaryData.adminUsers}
              icon={<AdminIcon sx={{ fontSize: '1.8rem' }} />}
              color="#FF5722"
              delay={400}
            />
          </Grid>
        </Grid>

        {/* Modern Users Table */}
        <Fade in={true} timeout={800}>
          <Paper 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ 
              p: 4, 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            }}>
              <Stack 
                direction={isMobile ? 'column' : 'row'} 
                spacing={3} 
                alignItems="center" 
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    System Users
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    {filteredUsers.length} users found • {summaryData.activePercentage}% active
                  </Typography>
                </Box>
                <Stack 
                  direction="row" 
                  spacing={2} 
                  flexWrap="wrap" 
                  useFlexGap
                  sx={{ width: isMobile ? '100%' : 'auto' }}
                >
                  <TextField
                    size="medium"
                    placeholder="Search users by name, email, role..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1, fontSize: '1.3rem' }} />,
                    }}
                    sx={{ 
                      width: isMobile ? '100%' : 380,
                      minWidth: 300,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        fontSize: '1rem',
                        height: 48,
                      }
                    }}
                  />
                  <FormControl size="medium" sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                      sx={{ borderRadius: 3, height: 48 }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleCreateUser}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 700,
                      px: 4,
                      height: 48,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    Add User
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <DataGrid
              rows={filteredUsers}
              columns={userColumns}
              getRowId={(row) => row.user_id}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  py: 1.5,
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'scale(1.002)',
                  },
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                },
              }}
              autoHeight
              disableRowSelectionOnClick
            />
          </Paper>
        </Fade>

        {/* Modern User Dialog */}
        <Dialog 
          open={openUserDialog} 
          onClose={() => !userProcessing && setOpenUserDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              overflow: 'hidden',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 4,
            px: 4,
          }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {selectedUser ? 'Edit User' : 'Create New User'}
              </Typography>
              {!selectedUser && (
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 1, fontSize: '1rem' }}>
                  New users will be automatically assigned the 'staff' role
                </Typography>
              )}
            </Box>
            <IconButton
              onClick={() => !userProcessing && setOpenUserDialog(false)}
              sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.3s ease',
              }}
              disabled={userProcessing}
            >
              <CloseIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4, mt:3 }}>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="First Name *"
                  value={userData.first_name}
                  onChange={(e) => setUserData('first_name', e.target.value)}
                  error={!!userErrors.first_name}
                  helperText={userErrors.first_name}
                  disabled={userProcessing}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      fontSize: '1rem',
                    } 
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={userData.last_name}
                  onChange={(e) => setUserData('last_name', e.target.value)}
                  error={!!userErrors.last_name}
                  helperText={userErrors.last_name}
                  disabled={userProcessing}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      fontSize: '1rem',
                    } 
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={userData.username}
                  onChange={(e) => setUserData('username', e.target.value)}
                  error={!!userErrors.username}
                  helperText={userErrors.username}
                  disabled={userProcessing}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      fontSize: '1rem',
                    } 
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={userData.employee_id}
                  onChange={(e) => setUserData('employee_id', e.target.value)}
                  error={!!userErrors.employee_id}
                  helperText={userErrors.employee_id}
                  disabled={userProcessing}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      fontSize: '1rem',
                    } 
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData('email', e.target.value)}
                  error={!!userErrors.email}
                  helperText={userErrors.email}
                  disabled={userProcessing}
                  InputProps={{
                    startAdornment: <EmailIcon color="action" sx={{ mr: 1, fontSize: '1.2rem' }} />,
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      fontSize: '1rem',
                    } 
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={userData.phone}
                  onChange={(e) => setUserData('phone', e.target.value)}
                  error={!!userErrors.phone}
                  helperText={userErrors.phone}
                  disabled={userProcessing}
                  InputProps={{
                    startAdornment: <PhoneIcon color="action" sx={{ mr: 1, fontSize: '1.2rem' }} />,
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      fontSize: '1rem',
                    } 
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Position"
                  value={userData.position}
                  onChange={(e) => setUserData('position', e.target.value)}
                  error={!!userErrors.position}
                  helperText={userErrors.position}
                  disabled={userProcessing}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      fontSize: '1rem',
                    } 
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl 
                  fullWidth 
                  error={!!userErrors.university_id} 
                  disabled={userProcessing}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      fontSize: '1rem',
                    } 
                  }}
                >
                  <InputLabel>University *</InputLabel>
                  <Select
                    value={userData.university_id}
                    label="University *"
                    onChange={(e) => setUserData('university_id', e.target.value)}
                  >
                    {universities?.map(university => (
                      <MenuItem key={university.university_id} value={university.university_id}>
                        {university.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {userErrors.university_id && <FormHelperText>{userErrors.university_id}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl 
                  fullWidth 
                  error={!!userErrors.department_id} 
                  disabled={userProcessing}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      fontSize: '1rem',
                    } 
                  }}
                >
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={userData.department_id}
                    label="Department"
                    onChange={(e) => setUserData('department_id', e.target.value)}
                  >
                    <MenuItem value="">No Department</MenuItem>
                    {departments?.map(department => (
                      <MenuItem key={department.department_id} value={department.department_id}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {userErrors.department_id && <FormHelperText>{userErrors.department_id}</FormHelperText>}
                </FormControl>
              </Grid>
              {!selectedUser && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Password *"
                      type="password"
                      value={userData.password}
                      onChange={(e) => setUserData('password', e.target.value)}
                      error={!!userErrors.password}
                      helperText={userErrors.password}
                      disabled={userProcessing}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          fontSize: '1rem',
                        } 
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Confirm Password *"
                      type="password"
                      value={userData.password_confirmation}
                      onChange={(e) => setUserData('password_confirmation', e.target.value)}
                      error={!!userErrors.password_confirmation}
                      helperText={userErrors.password_confirmation}
                      disabled={userProcessing}
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          borderRadius: 2,
                          fontSize: '1rem',
                        } 
                      }}
                    />
                  </Grid>
                </>
              )}
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userData.is_active}
                      onChange={(e) => setUserData('is_active', e.target.checked)}
                      disabled={userProcessing}
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#4CAF50',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#4CAF50',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body1" fontWeight={600} color="text.primary">
                      Active User Account
                    </Typography>
                  }
                />
              </Grid>
            </Grid>

            {/* Show roles and permissions for existing users */}
            {selectedUser && (
              <UserRolesPermissions user={selectedUser} />
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 4, gap: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={() => setOpenUserDialog(false)}
              variant="outlined"
              disabled={userProcessing}
              sx={{ 
                borderRadius: 3, 
                fontWeight: 700, 
                px: 4, 
                py: 1,
                fontSize: '1rem',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleUserSubmit}
              disabled={userProcessing}
              sx={{ 
                borderRadius: 3, 
                fontWeight: 700, 
                px: 4, 
                py: 1,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {userProcessing ? 'Saving...' : (selectedUser ? 'Update User' : 'Create User')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modern Delete Confirmation Dialog */}
        <Dialog 
          open={openDeleteDialog} 
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 24px 80px rgba(244, 67, 54, 0.25)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fef7f7 100%)',
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'error.light',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 4,
            px: 4,
          }}>
            <Typography variant="h4" fontWeight={700}>
              Confirm Deletion
            </Typography>
            <IconButton
              onClick={() => setOpenDeleteDialog(false)}
              sx={{ 
                color: 'white',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CloseIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'warning.light',
                '& .MuiAlert-icon': { fontSize: '2rem' },
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Delete User Account
              </Typography>
              <Typography variant="body1">
                Are you sure you want to delete user: <strong style={{ color: '#d32f2f' }}>{selectedUser?.name}</strong>?
              </Typography>
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              This action cannot be undone. All user data, including roles, permissions, and associated records will be permanently removed from the system.
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ p: 4, gap: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={() => setOpenDeleteDialog(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 3, 
                fontWeight: 700, 
                px: 4, 
                py: 1,
                fontSize: '1rem',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleDeleteConfirm}
              disabled={userProcessing}
              sx={{ 
                borderRadius: 3, 
                fontWeight: 700, 
                px: 4, 
                py: 1,
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                boxShadow: '0 4px 16px rgba(244, 67, 54, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {userProcessing ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AuthenticatedLayout>
  );
}
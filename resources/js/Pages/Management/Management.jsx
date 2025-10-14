import React, { useState, useMemo, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Box, Chip, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, Card, CardContent,
  Grid, IconButton, Switch, FormControlLabel, Avatar, Paper, useTheme, useMediaQuery,
  alpha, Tab, Tabs, FormHelperText,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Key as KeyIcon,
  Block as BlockIcon, CheckCircle as ActiveIcon, Cancel as InactiveIcon,
  AdminPanelSettings as SuperAdminIcon, ManageAccounts as ManagerIcon,
  Person as UserIcon, Security as SecurityIcon, Search as SearchIcon,
} from '@mui/icons-material';
import Notification from '@/Components/Notification';

const PermissionMatrix = ({ permissions, selectedPermissions, onPermissionChange, disabled = false }) => {
  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach(permission => {
      const [module] = permission.name.split('.');
      if (!groups[module]) groups[module] = [];
      groups[module].push(permission);
    });
    return groups;
  }, [permissions]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Permission Matrix {selectedPermissions.length > 0 && `(${selectedPermissions.length} selected)`}
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
          <Grid size={{ xs: 12, md: 6 }} key={module}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {module.replace(/_/g, ' ').toUpperCase()}
              </Typography>
              <Stack spacing={1}>
                {modulePermissions.map(permission => {
                  const isSystemPermission = permission.is_system_permission;
                  
                  // ONLY use selectedPermissions array to determine switch state
                  // This allows user changes to override the initial database value
                  const isChecked = selectedPermissions.includes(permission.name);

                  return (
                    <FormControlLabel
                      key={permission.permission_id}
                      control={
                        <Switch
                          checked={isChecked}
                          onChange={(e) => onPermissionChange(permission.name, e.target.checked)}
                          size="small"
                          disabled={disabled}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {permission.action.replace(/_/g, ' ')}
                            {isSystemPermission && (
                              <Chip label="System" size="small" color="warning" sx={{ ml: 1, height: 20 }} />
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {permission.description}
                            {isSystemPermission && permission.is_system_permission && (
                              <Box component="span" sx={{ display: 'block', color: 'warning.main', mt: 0.5 }}>
                                Default: {permission.is_system_permission ? 'Enabled' : 'Disabled'}
                              </Box>
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                  );
                })}
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Role Permissions Dialog Component
const RolePermissionsDialog = ({ open, onClose, role, permissions, onSave, loading = false }) => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  React.useEffect(() => {
    if (role && open) {
      // Extract permission names from role permissions
      const rolePermissionNames = role.permissions?.map(p => p.name) || [];
      
      // For system permissions that aren't in role.permissions but have is_system_permission=true,
      // we need to include them in the initial selection
      const systemPermissions = permissions
        .filter(p => p.is_system_permission && !rolePermissionNames.includes(p.name))
        .map(p => p.name);
      
      setSelectedPermissions([...rolePermissionNames, ...systemPermissions]);
    }
  }, [role, open, permissions]);

  const handlePermissionChange = (permissionName, checked) => {
    setSelectedPermissions(prev =>
      checked 
        ? [...prev, permissionName] 
        : prev.filter(p => p !== permissionName)
    );
  };

  const handleSave = () => {
    onSave(role.role_id, selectedPermissions);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Manage Permissions: {role?.name}
      </DialogTitle>
      <DialogContent>
        {role?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {role.description}
          </Typography>
        )}
        <PermissionMatrix
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          onPermissionChange={handlePermissionChange}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function UserManagement({ auth, users, roles, universities, departments, permissions: allPermissions }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { flash } = usePage().props;
  
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // User form
  const { data: userData, setData: setUserData, post: postUser, put: putUser, delete: deleteUser, processing: userProcessing, errors: userErrors, reset: resetUser } = useForm({
    user_id: '',
    university_id: '',
    department_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_id: '',
    position: '',
    is_active: true,
    employee_id: '',
    username: '',
  });

  // Role form
  const { data: roleData, setData: setRoleData, post: postRole, put: putRole, delete: deleteRole, processing: roleProcessing, errors: roleErrors, reset: resetRole } = useForm({
    role_id: '',
    name: '',
    description: '',
    permissions: [],
    is_system_role: false,
    university_id: '',
  });

  // Permissions form
  const { post: postPermissions, processing: permissionsProcessing } = useForm();

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  // Process users data
  React.useEffect(() => {
    const processedUsers = (users || []).map(user => ({
      id: user.user_id,
      ...user,
      full_name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name,
      last_login: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never',
      status: user.is_active ? 'active' : 'inactive',
    }));
    setRows(processedUsers);
  }, [users]);

  // User columns for DataGrid
  const userColumns = useMemo(() => [
    { 
      field: 'user', 
      headerName: 'User', 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            {params.row.first_name?.charAt(0)}{params.row.last_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {params.row.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 150,
      renderCell: (params) => {
        const role = roles?.find(r => r.role_id === params.row.role_id);
        const getRoleIcon = (roleName) => {
          switch(roleName?.toLowerCase()) {
            case 'super_admin': return <SuperAdminIcon fontSize="small" />;
            case 'inventory_manager': return <ManagerIcon fontSize="small" />;
            case 'department_head': return <ManagerIcon fontSize="small" />;
            default: return <UserIcon fontSize="small" />;
          }
        };
        
        return (
          <Chip 
            icon={role ? getRoleIcon(role.name) : <UserIcon fontSize="small" />}
            label={role?.name ? role.name.replace(/_/g, ' ') : 'No Role'} 
            size="small"
            color={
              role?.name === 'super_admin' ? 'error' :
              role?.name === 'inventory_manager' ? 'warning' : 
              role?.name === 'department_head' ? 'primary' : 'default'
            }
            variant="outlined"
          />
        );
      }
    },
    { 
      field: 'department', 
      headerName: 'Department', 
      width: 150,
      renderCell: (params) => {
        const department = departments?.find(d => d.department_id === params.row.department_id);
        return department?.name || '—';
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          icon={params.row.is_active ? <ActiveIcon /> : <InactiveIcon />}
          label={params.row.is_active ? 'Active' : 'Inactive'} 
          size="small"
          color={params.row.is_active ? 'success' : 'error'}
          variant={params.row.is_active ? 'filled' : 'outlined'}
        />
      )
    },
    { 
      field: 'last_login', 
      headerName: 'Last Login', 
      width: 130 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit User"
          onClick={() => handleEditUser(params.row)}
        />,
        <GridActionsCellItem
          icon={<KeyIcon />}
          label="Change Role"
          onClick={() => handleChangeRole(params.row)}
        />,
        <GridActionsCellItem
          icon={params.row.is_active ? <BlockIcon /> : <ActiveIcon />}
          label={params.row.is_active ? 'Deactivate' : 'Activate'}
          onClick={() => handleToggleStatus(params.row)}
          color={params.row.is_active ? 'warning' : 'success'}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteUser(params.row)}
          color="error"
        />,
      ],
    },
  ], [roles, departments]);

  // Role columns for DataGrid
  const roleColumns = useMemo(() => [
    { 
      field: 'name', 
      headerName: 'Role Name', 
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.row.name.replace(/_/g, ' ')}
          </Typography>
          {params.row.is_system_role && (
            <Chip label="System" size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
          )}
        </Box>
      )
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      width: 250 
    },
    { 
      field: 'permissions_count', 
      headerName: 'Permissions', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={`${params.row.permissions?.length || 0} perms`}
          size="small"
          variant="outlined"
        />
      )
    },
    { 
      field: 'user_count', 
      headerName: 'Users', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {users?.filter(u => u.role_id === params.row.role_id)?.length || 0}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit Role"
          onClick={() => handleEditRole(params.row)}
          disabled={params.row.is_system_role}
        />,
        <GridActionsCellItem
          icon={<SecurityIcon />}
          label="Manage Permissions"
          onClick={() => handleManagePermissions(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteRole(params.row)}
          color="error"
          disabled={params.row.is_system_role || users?.some(u => u.role_id === params.row.role_id)}
        />,
      ],
    },
  ], [users]);

  // Event handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    resetUser({
      university_id: auth.user.university_id,
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
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      role_id: user.role_id,
      position: user.position || '',
      is_active: user.is_active,
      employee_id: user.employee_id || '',
      username: user.username || '',
    });
    setOpenUserDialog(true);
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    showAlert(`Change role for ${user.full_name}`, 'info');
  };

  const handleToggleStatus = (user) => {
    putUser(route('admin.users.toggle-status', user.user_id), {
      onSuccess: () => showAlert(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`),
      onError: () => showAlert('Failed to update user status', 'error'),
    });
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    resetRole({
      university_id: auth.user.university_id,
      permissions: [],
      is_system_role: false,
    });
    setOpenRoleDialog(true);
  };

 const handleEditRole = (role) => {
  setSelectedRole(role);
  
  // Get current role permissions
  const rolePermissionNames = role.permissions?.map(p => p.name) || [];
  
  // Include system permissions that should be enabled by default
  const systemPermissions = allPermissions
    .filter(p => p.is_system_permission && !rolePermissionNames.includes(p.name))
    .map(p => p.name);
  
  setRoleData({
    role_id: role.role_id,
    name: role.name,
    description: role.description,
    permissions: [...rolePermissionNames, ...systemPermissions], // Combine role + system permissions
    is_system_role: role.is_system_role,
    university_id: role.university_id,
  });
  setOpenRoleDialog(true);
};

  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    setOpenPermissionsDialog(true);
  };

  const handleDeleteRole = (role) => {
    setSelectedRole(role);
    showAlert(`Delete role: ${role.name}`, 'warning');
  };

  const handleSavePermissions = (roleId, permissions) => {
    postPermissions(route('admin.roles.update-permissions', roleId), {
      permissions: permissions,
    }, {
      onSuccess: () => {
        setOpenPermissionsDialog(false);
        showAlert('Permissions updated successfully');
      },
      onError: () => showAlert('Failed to update permissions', 'error'),
    });
  };

  const handleUserSubmit = () => {
    if (selectedUser) {
      putUser(route('admin.users.update', selectedUser.user_id), {
        onSuccess: () => {
          setOpenUserDialog(false);
          showAlert('User updated successfully');
        },
        onError: () => showAlert('Failed to update user', 'error'),
      });
    } else {
      postUser(route('admin.users.store'), {
        onSuccess: () => {
          setOpenUserDialog(false);
          showAlert('User created successfully');
        },
        onError: () => showAlert('Failed to create user', 'error'),
      });
    }
  };

  const handleRoleSubmit = () => {
    if (selectedRole) {
      putRole(route('admin.roles.update', selectedRole.role_id), {
        onSuccess: () => {
          setOpenRoleDialog(false);
          showAlert('Role updated successfully');
        },
        onError: () => showAlert('Failed to update role', 'error'),
      });
    } else {
      postRole(route('admin.roles.store'), {
        onSuccess: () => {
          setOpenRoleDialog(false);
          showAlert('Role created successfully');
        },
        onError: () => showAlert('Failed to create role', 'error'),
      });
    }
  };

  const handlePermissionChange = (permissionName, checked) => {
    const currentPermissions = roleData.permissions || [];
    const newPermissions = checked 
      ? [...currentPermissions, permissionName]
      : currentPermissions.filter(p => p !== permissionName);
    setRoleData('permissions', newPermissions);
  };

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchText) return rows;
    
    return rows.filter(user => 
      user.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [rows, searchText]);

  // Handle flash messages
  useEffect(() => {
    if (flash.success) {
      showAlert(flash.success, "success");
    }

    if (flash.error) {
      showAlert(flash.error, "error");
    }
  }, [flash]);

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <AuthenticatedLayout
      auth={auth}
      title="User Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin', href: '/admin' },
        { label: 'User Management' }
      ]}
    >
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system users, roles, and permissions
          </Typography>
        </Box>

        <Notification 
          open={alert.open} 
          severity={alert.severity} 
          message={alert.message}
          onClose={handleCloseAlert}
        />

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': { fontWeight: 600 }
            }}
          >
            <Tab icon={<UserIcon />} label={`Users (${users?.length || 0})`} />
            <Tab icon={<SecurityIcon />} label={`Roles (${roles?.length || 0})`} />
          </Tabs>
        </Paper>

        {/* Users Tab */}
        {activeTab === 0 && (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={600}>
                  System Users
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="Search users..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={{ width: isMobile ? '100%' : 300 }}
                  />
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleCreateUser}
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
                },
              }}
              autoHeight
            />
          </Paper>
        )}

        {/* Roles Tab */}
        {activeTab === 1 && (
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={600}>
                  System Roles
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleCreateRole}
                >
                  Create Role
                </Button>
              </Stack>
            </Box>

            <DataGrid
              rows={roles || []}
              columns={roleColumns}
              getRowId={(row) => row.role_id}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                },
              }}
              autoHeight
            />
          </Paper>
        )}

        {/* User Dialog */}
        <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={userData.first_name}
                  onChange={(e) => setUserData('first_name', e.target.value)}
                  error={!!userErrors.first_name}
                  helperText={userErrors.first_name}
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
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData('email', e.target.value)}
                  error={!!userErrors.email}
                  helperText={userErrors.email}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!userErrors.role_id}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={userData.role_id}
                    label="Role"
                    onChange={(e) => setUserData('role_id', e.target.value)}
                  >
                    {roles?.map(role => (
                      <MenuItem key={role.role_id} value={role.role_id}>
                        {role.name.replace(/_/g, ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                  {userErrors.role_id && <FormHelperText>{userErrors.role_id}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userData.is_active}
                      onChange={(e) => setUserData('is_active', e.target.checked)}
                    />
                  }
                  label="Active User"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleUserSubmit}
              disabled={userProcessing}
            >
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Role Dialog */}
        <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            {selectedRole ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Role Name"
                  value={roleData.name}
                  onChange={(e) => setRoleData('name', e.target.value)}
                  error={!!roleErrors.name}
                  helperText={roleErrors.name}
                  placeholder="e.g., inventory_manager"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={roleData.description}
                  onChange={(e) => setRoleData('description', e.target.value)}
                  error={!!roleErrors.description}
                  helperText={roleErrors.description}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <PermissionMatrix
                  permissions={allPermissions || []}
                  selectedPermissions={roleData.permissions || []}
                  onPermissionChange={handlePermissionChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleRoleSubmit}
              disabled={roleProcessing}
            >
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Permissions Dialog */}
        <RolePermissionsDialog
          key={selectedRole?.role_id || 'create'}
          open={openPermissionsDialog}
          onClose={() => setOpenPermissionsDialog(false)}
          role={selectedRole}
          permissions={allPermissions || []}
          onSave={handleSavePermissions}
          loading={permissionsProcessing}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Are you sure you want to delete user: {selectedUser?.full_name}?
            </Alert>
            <Typography>This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={() => {
                deleteUser(route('admin.users.destroy', selectedUser?.user_id), {
                  onSuccess: () => {
                    setOpenDeleteDialog(false);
                    showAlert('User deleted successfully');
                  },
                });
              }}
            >
              Delete User
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AuthenticatedLayout>
  );
}
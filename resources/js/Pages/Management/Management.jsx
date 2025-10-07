import React, { useState, useMemo, useCallback } from "react";
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  Box,
  Chip,
  Typography,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Switch,
  FormControlLabel,
  Avatar,
  LinearProgress,
  InputAdornment,
  FormHelperText,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
  Tab,
  Tabs,
} from "@mui/material";
import {DataGrid, GridActionsCellItem} from "@mui/x-data-grid";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Key as KeyIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  AdminPanelSettings as SuperAdminIcon,
  ManageAccounts as ManagerIcon,
  Person as UserIcon,
  Security as SecurityIcon,
  Groups as DepartmentIcon,
  School as UniversityIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import Notification from "@/Components/Notification";

// Permission Matrix Component
const PermissionMatrix = ({ permissions, selectedPermissions, onPermissionChange }) => {
  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach(permission => {
      const [module] = permission.split('.');
      if (!groups[module]) groups[module] = [];
      groups[module].push(permission);
    });
    return groups;
  }, [permissions]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Permissions</Typography>
      <Grid container spacing={2}>
        {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
          <Grid size={{ xs: 12, md: 6 }} key={module}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {module.replace('_', ' ').toUpperCase()}
              </Typography>
              <Stack spacing={1}>
                {modulePermissions.map(permission => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Switch
                        checked={selectedPermissions.includes(permission)}
                        onChange={(e) => onPermissionChange(permission, e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {permission.split('.')[1].replace('_', ' ')}
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default function UserManagement({ auth, users, roles, universities, departments, permissions }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { flash } = usePage().props;
  
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  // Available permissions
  const availablePermissions = [
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage_roles',
    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete', 'inventory.manage_categories',
    'purchase_orders.view', 'purchase_orders.create', 'purchase_orders.edit', 'purchase_orders.approve', 'purchase_orders.delete',
    'reports.view', 'reports.generate', 'reports.export',
    'settings.view', 'settings.edit', 'settings.manage_system',
    'departments.view', 'departments.create', 'departments.edit', 'departments.delete',
  ];

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

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  // Process users data
  React.useEffect(() => {
    const processedUsers = (users || []).map(user => ({
      id: user.user_id,
      ...user,
      full_name: `${user.first_name} ${user.last_name}`,
      last_login: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never',
      status: user.is_active ? 'active' : 'inactive',
    }));
    setRows(processedUsers);
  }, [users]);

  // Enhanced columns for user management
  const userColumns = useMemo(() => [
    { 
      field: 'user', 
      headerName: 'User', 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {params.row?.first_name?.charAt(0)}{params.row.last_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {params.row?.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row?.email}
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
        const role = roles?.find(r => r.role_id === params.row?.role_id);
        const getRoleIcon = (roleName) => {
          switch(roleName) {
            case 'super_admin': return <SuperAdminIcon />;
            case 'inventory_manager': return <ManagerIcon />;
            default: return <UserIcon />;
          }
        };
        
        return (
          <Chip 
            icon={role ? getRoleIcon(role.name) : <UserIcon />}
            label={role?.name?.replace('_', ' ') || 'No Role'} 
            size="small"
            color={
              role?.name === 'super_admin' ? 'error' :
              role?.name === 'inventory_manager' ? 'warning' : 'default'
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
        const department = departments?.find(d => d.department_id === params.row?.department_id);
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
      width: 180,
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

  const roleColumns = useMemo(() => [
    { 
      field: 'name', 
      headerName: 'Role Name', 
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.row.name.replace('_', ' ')}
          </Typography>
          {params.row.is_system_role && (
            <Chip label="System" size="small" color="primary" variant="outlined" />
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
      width: 150,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit Role"
          onClick={() => handleEditRole(params.row)}
          disabled={params.row.is_system_role}
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
    setOpenDialog(true);
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
    });
    setOpenDialog(true);
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    // Open role change dialog
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
    setRoleData({
      role_id: role.role_id,
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
      is_system_role: role.is_system_role,
      university_id: role.university_id,
    });
    setOpenRoleDialog(true);
  };

  const handleDeleteRole = (role) => {
    setSelectedRole(role);
    // Open role delete confirmation
    showAlert(`Delete role: ${role.name}`, 'warning');
  };

  const handleUserSubmit = () => {
    if (selectedUser) {
      putUser(route('admin.users.update', selectedUser.user_id), {
        onSuccess: () => {
          setOpenDialog(false);
          showAlert('User updated successfully');
        },
        onError: () => showAlert('Failed to update user', 'error'),
      });
    } else {
      postUser(route('admin.users.store'), {
        onSuccess: () => {
          setOpenDialog(false);
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

  const handlePermissionChange = (permission, checked) => {
    const currentPermissions = roleData.permissions || [];
    const newPermissions = checked 
      ? [...currentPermissions, permission]
      : current.filter(p => p !== permission);
    setRoleData('permissions', newPermissions);
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
        <Notification 
          open={alert.open} 
          severity={alert.severity} 
          message={alert.message}
          onClose={() => setAlert(prev => ({ ...prev, open: false }))}
        />

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system users, roles, and permissions
          </Typography>
        </Box>

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
            <Tab icon={<DepartmentIcon />} label="Departments" />
            <Tab icon={<UniversityIcon />} label="Universities" />
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
              rows={rows}
              columns={userColumns}
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
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            {selectedUser ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={userData.first_name}
                  onChange={(e) => setUserData('first_name', e.target.value)}
                  error={!!userErrors.first_name}
                  helperText={userErrors.first_name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={userData.last_name}
                  onChange={(e) => setUserData('last_name', e.target.value)}
                  error={!!userErrors.last_name}
                  helperText={userErrors.last_name}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData('email', e.target.value)}
                  error={!!userErrors.email}
                  helperText={userErrors.email}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={userData.phone}
                  onChange={(e) => setUserData('phone', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!userErrors.role_id}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role_id"
                    value={userData.role_id}
                    label="Role"
                    onChange={(e) => setUserData('role_id', e.target.value)}
                  >
                    {roles?.map(role => (
                      <MenuItem key={role.role_id} value={role.role_id}>
                        {role.name.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                  {userErrors.role_id && <FormHelperText>{userErrors.role_id}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Position"
                  name="position"
                  value={userData.position}
                  onChange={(e) => setUserData('position', e.target.value)}
                />
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
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
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
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            {selectedRole ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Role Name"
                  name="name"
                  value={roleData.name}
                  onChange={(e) => setRoleData('name', e.target.value)}
                  error={!!roleErrors.name}
                  helperText={roleErrors.name}
                  placeholder="e.g., inventory_manager"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={roleData.description}
                  onChange={(e) => setRoleData('description', e.target.value)}
                  error={!!roleErrors.description}
                  helperText={roleErrors.description}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <PermissionMatrix
                  permissions={availablePermissions}
                  selectedPermissions={roleData.permissions || []}
                  onPermissionChange={handlePermissionChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
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
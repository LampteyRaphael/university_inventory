import React, { useState, useMemo, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Box, Chip, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, Card, CardContent,
  Grid, IconButton, Switch, FormControlLabel, Avatar, Paper, useTheme, useMediaQuery,
  alpha, Tab, Tabs, FormHelperText, Tooltip, Badge, Divider, List, ListItem,
  ListItemText, ListItemIcon, Checkbox, ListItemButton, CardHeader,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Key as KeyIcon,
  Block as BlockIcon, CheckCircle as ActiveIcon, Cancel as InactiveIcon,
  AdminPanelSettings as SuperAdminIcon, ManageAccounts as ManagerIcon,
  Person as UserIcon, Security as SecurityIcon, Search as SearchIcon,
  Visibility as ViewIcon, PersonAdd as PersonAddIcon, FilterList as FilterIcon,
  Refresh as RefreshIcon, Download as DownloadIcon, Warning as WarningIcon,
  Info as InfoIcon, Shield as ShieldIcon, Close as CloseIcon,
  Group as GroupIcon, PermIdentity as PermIdentityIcon, Assignment as AssignmentIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import Notification from '@/Components/Notification';

const RolePermissionManager = () => {
  const { auth, roles, permissions, users } = usePage().props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // States for different modals
  const [roleModal, setRoleModal] = useState({ open: false, mode: 'create', role: null });
  const [permissionModal, setPermissionModal] = useState({ open: false, mode: 'create', permission: null });
  const [userRoleModal, setUserRoleModal] = useState({ open: false, user: null });
  const [userPermissionModal, setUserPermissionModal] = useState({ open: false, user: null });

  // Forms
  const roleForm = useForm({
    name: '',
    permissions: [],
  });

  const permissionForm = useForm({
    name: '',
    description: '',
  });

  const userRoleForm = useForm({
    roles: [],
  });

  const userPermissionForm = useForm({
    permissions: [],
  });

  // Role Management - UPDATED ROUTE NAMES
  const handleCreateRole = () => {
    setLoading(true);
    roleForm.post(route('admin.roles.store'), {
      onSuccess: () => {
        setNotification({ open: true, message: 'Role created successfully!', severity: 'success' });
        setRoleModal({ open: false, mode: 'create', role: null });
        roleForm.reset();
      },
      onError: (errors) => {
        setNotification({ open: true, message: 'Error creating role!', severity: 'error' });
      },
      onFinish: () => setLoading(false),
    });
  };

  const handleUpdateRole = () => {
    setLoading(true);
    roleForm.put(route('admin.roles.update', roleModal.role.id), {
      onSuccess: () => {
        setNotification({ open: true, message: 'Role updated successfully!', severity: 'success' });
        setRoleModal({ open: false, mode: 'create', role: null });
        roleForm.reset();
      },
      onFinish: () => setLoading(false),
    });
  };

  const handleDeleteRole = (role) => {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      router.delete(route('admin.roles.destroy', role.id), {
        onSuccess: () => {
          setNotification({ open: true, message: 'Role deleted successfully!', severity: 'success' });
        },
      });
    }
  };

  // Permission Management - UPDATED ROUTE NAMES
  const handleCreatePermission = () => {
    setLoading(true);
    permissionForm.post(route('admin.permissions.store'), {
      onSuccess: () => {
        setNotification({ open: true, message: 'Permission created successfully!', severity: 'success' });
        setPermissionModal({ open: false, mode: 'create', permission: null });
        permissionForm.reset();
      },
      onFinish: () => setLoading(false),
    });
  };

  const handleUpdatePermission = () => {
    setLoading(true);
    permissionForm.put(route('admin.permissions.update', permissionModal.permission.id), {
      onSuccess: () => {
        setNotification({ open: true, message: 'Permission updated successfully!', severity: 'success' });
        setPermissionModal({ open: false, mode: 'create', permission: null });
        permissionForm.reset();
      },
      onFinish: () => setLoading(false),
    });
  };

  // User Role Assignment - UPDATED ROUTE NAMES
  // const handleAssignUserRoles = () => {
  //   setLoading(true);
  //   userRoleForm.put(route('admin.users.roles.update', userRoleModal.user.id), {
  //     onSuccess: () => {
  //       setNotification({ open: true, message: 'User roles updated successfully!', severity: 'success' });
  //       setUserRoleModal({ open: false, user: null });
  //       userRoleForm.reset();
  //     },
  //     onFinish: () => setLoading(false),
  //   });
  // };
  // User Role Assignment - UPDATED ROUTE NAMES
const handleAssignUserRoles = () => {
  setLoading(true);
  userRoleForm.put(route('admin.users.roles.update', userRoleModal.user.user_id), { // Changed from .id to .user_id
    onSuccess: () => {
      setNotification({ open: true, message: 'User roles updated successfully!', severity: 'success' });
      setUserRoleModal({ open: false, user: null });
      userRoleForm.reset();
    },
    onFinish: () => setLoading(false),
  });
};

// User Permission Assignment - UPDATED ROUTE NAMES
const handleAssignUserPermissions = () => {
  setLoading(true);
  userPermissionForm.put(route('admin.users.permissions.update', userPermissionModal.user.user_id), { // Changed from .id to .user_id
    onSuccess: () => {
      setNotification({ open: true, message: 'User permissions updated successfully!', severity: 'success' });
      setUserPermissionModal({ open: false, user: null });
      userPermissionForm.reset();
    },
    onFinish: () => setLoading(false),
  });
};

  // User Permission Assignment - UPDATED ROUTE NAMES
  // const handleAssignUserPermissions = () => {
  //   setLoading(true);
  //   userPermissionForm.put(route('admin.users.permissions.update', userPermissionModal.user.id), {
  //     onSuccess: () => {
  //       setNotification({ open: true, message: 'User permissions updated successfully!', severity: 'success' });
  //       setUserPermissionModal({ open: false, user: null });
  //       userPermissionForm.reset();
  //     },
  //     onFinish: () => setLoading(false),
  //   });
  // };

  // DataGrid Columns
//   const roleColumns = [
//     { field: 'id', headerName: 'ID', width: 70 },
//     { 
//       field: 'name', 
//       headerName: 'Role Name', 
//       width: 200,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           {params.row.name === 'Super Admin' && <SuperAdminIcon color="primary" />}
//           {params.row.name === 'Administrator' && <ManagerIcon color="secondary" />}
//           {!['Super Admin', 'Administrator'].includes(params.row.name) && <SecurityIcon />}
//           <Typography variant="body2">{params.row.name}</Typography>
//         </Box>
//       )
//     },
//     { 
//       field: 'permissions_count', 
//       headerName: 'Permissions', 
//       width: 120,
//       renderCell: (params) => (
//         <Chip 
//           label={params?.row?.permissions_count} 
//           size="small" 
//           color="primary" 
//           variant="outlined" 
//         />
//       )
//     },
//     { 
//       field: 'users_count', 
//       headerName: 'Users', 
//       width: 100,
//       renderCell: (params) => (
//         <Chip 
//           label={params.row.users_count} 
//           size="small" 
//           color="secondary" 
//           variant="outlined" 
//         />
//       )
//     },
//     {
//       field: 'actions',
//       type: 'actions',
//       headerName: 'Actions',
//       width: 150,
//       getActions: (params) => [
//         <GridActionsCellItem
//           icon={<EditIcon />}
//           label="Edit"
//           onClick={() => {
//             setRoleModal({ open: true, mode: 'edit', role: params.row });
//             roleForm.setData({
//               name: params.row.name,
//               permissions: params?.row?.permissions?.map(p => p.id) || []
//             });
//           }}
//         />,
//         <GridActionsCellItem
//           icon={<DeleteIcon />}
//           label="Delete"
//           onClick={() => handleDeleteRole(params.row)}
//           disabled={params.row.name === 'Super Admin'}
//         />,
//       ],
//     },
//   ];
const roleColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { 
    field: 'name', 
    headerName: 'Role Name', 
    width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {params.row.name === 'Super Admin' && <SuperAdminIcon color="primary" />}
        {params.row.name === 'Administrator' && <ManagerIcon color="secondary" />}
        {!['Super Admin', 'Administrator'].includes(params.row.name) && <SecurityIcon />}
        <Typography variant="body2">{params.row.name}</Typography>
      </Box>
    )
  },
  { 
    field: 'permissions_count', 
    headerName: 'Permissions', 
    width: 120,
    renderCell: (params) => (
      <Chip 
        label={params.value || 0} 
        size="small" 
        color="primary" 
        variant="outlined" 
      />
    )
  },
  { 
    field: 'users_count', 
    headerName: 'Users', 
    width: 100,
    renderCell: (params) => (
      <Chip 
        label={params.value || 0} 
        size="small" 
        color="secondary" 
        variant="outlined" 
      />
    )
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 150,
    getActions: (params) => [
    <GridActionsCellItem
      icon={<EditIcon />}
      label="Edit"
      onClick={() => {
        setRoleModal({ open: true, mode: 'edit', role: params.row });
        roleForm.setData({
          name: params.row.name,
          permissions: params.row.permissions?.map(p => p.id) || []
        });
      }}
    />,
      <GridActionsCellItem
        icon={<DeleteIcon />}
        label="Delete"
        onClick={() => handleDeleteRole(params.row)}
        disabled={params.row.name === 'Super Admin'}
      />,
    ],
  },
];

  // const permissionColumns = [
  //   { field: 'id', headerName: 'ID', width: 70 },
  //   { 
  //     field: 'name', 
  //     headerName: 'Permission', 
  //     width: 250,
  //     renderCell: (params) => (
  //       <Box>
  //         <Typography variant="body2" fontWeight="bold">
  //           {params.row.name.split('.')[1]}
  //         </Typography>
  //         <Typography variant="caption" color="text.secondary">
  //           {params.row.name.split('.')[0]}
  //         </Typography>
  //       </Box>
  //     )
  //   },
  //   { 
  //     field: 'description', 
  //     headerName: 'Description', 
  //     width: 300,
  //     renderCell: (params) => (
  //       <Typography variant="body2">
  //         {params.row.description || `Can ${params.row.name.split('.')[1]} ${params.row.name.split('.')[0]}`}
  //       </Typography>
  //     )
  //   },
  //   { 
  //     field: 'roles_count', 
  //     headerName: 'Roles', 
  //     width: 100,
  //     renderCell: (params) => (
  //       <Chip label={params.row.roles_count} size="small" variant="outlined" />
  //     )
  //   },
  //   {
  //     field: 'actions',
  //     type: 'actions',
  //     headerName: 'Actions',
  //     width: 120,
  //     getActions: (params) => [
  //       <GridActionsCellItem
  //         icon={<EditIcon />}
  //         label="Edit"
  //         onClick={() => {
  //           setPermissionModal({ open: true, mode: 'edit', permission: params.row });
  //           permissionForm.setData({
  //             name: params.row.name,
  //             description: params.row.description
  //           });
  //         }}
  //       />,
  //     ],
  //   },
  // ];


  const permissionColumns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { 
    field: 'name', 
    headerName: 'Permission', 
    width: 250,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2" fontWeight="bold">
          {params.row.name.split('.')[1]}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {params.row.name.split('.')[0]}
        </Typography>
      </Box>
    )
  },
  { 
    field: 'description', 
    headerName: 'Description', 
    width: 300,
    renderCell: (params) => (
      <Typography variant="body2">
        {params.row.description || `Can ${params.row.name.split('.')[1]} ${params.row.name.split('.')[0]}`}
      </Typography>
    )
  },
  { 
    field: 'roles_count', 
    headerName: 'Roles', 
    width: 100,
    renderCell: (params) => (
      <Chip label={params.value || 0} size="small" variant="outlined" />
    )
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 120,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<EditIcon />}
        label="Edit"
        onClick={() => {
          setPermissionModal({ open: true, mode: 'edit', permission: params.row });
          permissionForm.setData({
            name: params.row.name,
            description: params.row.description
          });
        }}
      />,
    ],
  },
];


// const userColumns = [
//   { field: 'user_id', headerName: 'ID', width: 70 },
//   { 
//     field: 'name', 
//     headerName: 'User', 
//     width: 200,
//     renderCell: (params) => (
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//         <Avatar sx={{ width: 32, height: 32 }}>
//           {params.row.name?.charAt(0) || params.row.email?.charAt(0)}
//         </Avatar>
//         <Box>
//           <Typography variant="body2" fontWeight="bold">
//             {params.row.first_name && params.row.last_name 
//               ? `${params.row.first_name} ${params.row.last_name}`
//               : params.row.name
//             }
//           </Typography>
//           <Typography variant="caption" color="text.secondary">
//             {params.row.email}
//           </Typography>
//         </Box>
//       </Box>
//     )
//   },
//   { 
//     field: 'roles', 
//     headerName: 'Roles', 
//     width: 200,
//     renderCell: (params) => (
//       <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
//         {params.row.roles?.map((role, index) => (
//           <Chip 
//             key={`user-role-${role.id}-${index}`}
//             label={role.name} 
//             size="small" 
//             color={role.name === 'Super Admin' ? 'error' : 'primary'}
//             variant="outlined"
//           />
//         ))}
//       </Box>
//     )
//   },
//   { 
//     field: 'permissions', 
//     headerName: 'Direct Permissions', 
//     width: 150,
//     renderCell: (params) => (
//       <Chip 
//         label={params.row.permissions?.length || 0} 
//         size="small" 
//         color="secondary"
//         variant="outlined"
//       />
//     )
//   },
//   {
//     field: 'actions',
//     type: 'actions',
//     headerName: 'Actions',
//     width: 200,
//     getActions: (params) => [
//       <GridActionsCellItem
//         icon={<KeyIcon />}
//         label="Manage Roles"
//         onClick={() => {
//           setUserRoleModal({ open: true, user: params.row });
//           userRoleForm.setData({
//             roles: params.row.roles?.map(r => r.id) || [] // Changed from name to id
//           });
//         }}
//       />,
//       <GridActionsCellItem
//         icon={<ShieldIcon />}
//         label="Manage Permissions"
//         onClick={() => {
//           setUserPermissionModal({ open: true, user: params.row });
//           userPermissionForm.setData({
//             permissions: params.row.permissions?.map(p => p.id) || [] // Changed from name to id
//           });
//         }}
//       />,
//     ],
//   },
// ];

  // Group permissions by module
 
  const userColumns = [
  { field: 'user_id', headerName: 'ID', width: 70 },
  { 
    field: 'name', 
    headerName: 'User', 
    width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32 }}>
          {params.row.name?.charAt(0) || params.row.email?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {params.row.first_name && params.row.last_name 
              ? `${params.row.first_name} ${params.row.last_name}`
              : params.row.name
            }
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.email}
          </Typography>
        </Box>
      </Box>
    )
  },
  { 
    field: 'roles', 
    headerName: 'Roles', 
    width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {params.row.roles?.map((role, index) => (
          <Chip 
            key={`user-role-${role.id}-${index}`}
            label={role.name} 
            size="small" 
            color={role.name === 'Super Admin' ? 'error' : 'primary'}
            variant="outlined"
          />
        ))}
      </Box>
    )
  },
  { 
    field: 'permissions', 
    headerName: 'Direct Permissions', 
    width: 150,
    renderCell: (params) => (
      <Chip 
        label={params.row.permissions?.length || 0} 
        size="small" 
        color="secondary"
        variant="outlined"
      />
    )
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 200,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<KeyIcon />}
        label="Manage Roles"
        onClick={() => {
          setUserRoleModal({ open: true, user: params.row });
          userRoleForm.setData({
            roles: params.row.roles?.map(r => r.id) || [] // Make sure this uses IDs
          });
        }}
      />,
      <GridActionsCellItem
        icon={<ShieldIcon />}
        label="Manage Permissions"
        onClick={() => {
          setUserPermissionModal({ open: true, user: params.row });
          userPermissionForm.setData({
            permissions: params.row.permissions?.map(p => p.id) || [] // Make sure this uses IDs
          });
        }}
      />,
    ],
  },
];
 
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((groups, permission) => {
      const module = permission.name.split('.')[0];
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(permission);
      return groups;
    }, {});
  }, [permissions]);

  return (
    <AuthenticatedLayout
      title="Role & Permission Management"
      header={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon />
          <Typography variant="h6">Role & Permission Management</Typography>
        </Box>
      }
    >
      <Box sx={{ width: '100%' }}>
        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
          >
            <Tab icon={<GroupIcon />} label="Roles" />
            <Tab icon={<ShieldIcon />} label="Permissions" />
            <Tab icon={<PermIdentityIcon />} label="User Assignments" />
            <Tab icon={<AssignmentIcon />} label="System Overview" />
          </Tabs>
        </Paper>

        {/* Roles Tab */}
        {activeTab === 0 && (
          <Card>
            <CardHeader
              title="Roles Management"
              action={
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setRoleModal({ open: true, mode: 'create', role: null })}
                >
                  Create Role
                </Button>
              }
            />
            <CardContent>
              <DataGrid
                rows={roles}
                columns={roleColumns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                autoHeight
                disableSelectionOnClick
                getRowId={(row) => row.id}
              />
            </CardContent>
          </Card>
        )}

        {/* Permissions Tab */}
        {activeTab === 1 && (
          <Card>
            <CardHeader
              title="Permissions Management"
              action={
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setPermissionModal({ open: true, mode: 'create', permission: null })}
                >
                  Create Permission
                </Button>
              }
            />
            <CardContent>
              <DataGrid
                rows={permissions}
                columns={permissionColumns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                autoHeight
                disableSelectionOnClick
                getRowId={(row) => row.id}
              />
            </CardContent>
          </Card>
        )}

        {/* User Assignments Tab */}
   {/* User Assignments Tab */}
        {activeTab === 2 && (
          <Card>
            <CardHeader title="User Role & Permission Assignments" />
            <CardContent>
              <DataGrid
                rows={users}
                columns={userColumns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                autoHeight
                disableSelectionOnClick
                getRowId={(row) => row.user_id}
              />
            </CardContent>
          </Card>
        )}

        {/* System Overview Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            {/* System Statistics Card */}
            <Box sx={{ width: { xs: '100%', md: '50%' }, mb: 3, pr: { md: 1.5 } }}>
              <Card>
                <CardHeader title="System Statistics" />
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Total Roles:</Typography>
                      <Chip label={roles.length} color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Total Permissions:</Typography>
                      <Chip label={permissions.length} color="secondary" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Total Users:</Typography>
                      <Chip label={users.length} color="info" />
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Permission Modules:</Typography>
                      <Chip label={Object.keys(groupedPermissions).length} color="success" />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Role Distribution Card */}
            <Box sx={{ width: { xs: '100%', md: '50%' }, mb: 3, pl: { md: 1.5 } }}>
              <Card>
                <CardHeader title="Role Distribution" />
                <CardContent>
                  <List dense>
                    {roles.map((role) => (
                      <ListItem key={`role-${role.id}`}>
                        <ListItemIcon>
                          <Badge badgeContent={role.users_count} color="primary">
                            <GroupIcon />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText
                          primary={role.name}
                          secondary={`${role.permissions_count} permissions`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>

            {/* Permission Modules Card */}
            <Box sx={{ width: '100%' }}>
              <Card>
                <CardHeader title="Permission Modules" />
                <CardContent>
                  <Grid container spacing={2}>
                    {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                      <Box 
                        key={`module-${module}`}
                        sx={{ 
                          width: { xs: '100%', sm: '50%', md: '33.333%' },
                          p: 1
                        }}
                      >
                        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), height: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <FolderIcon color="primary" />
                            <Typography variant="h6" sx={{ textTransform: 'capitalize', fontSize: '1.1rem' }}>
                              {module}
                            </Typography>
                            <Chip label={modulePermissions.length} size="small" color="primary" />
                          </Box>
                          <Stack spacing={0.5}>
                            {modulePermissions.slice(0, 5).map((permission) => (
                              <Typography key={`perm-${permission.id}`} variant="body2" sx={{ pl: 3 }}>
                                • {permission.name.split('.')[1]}
                              </Typography>
                            ))}
                            {modulePermissions.length > 5 && (
                              <Typography variant="caption" color="text.secondary" sx={{ pl: 3 }}>
                                +{modulePermissions.length - 5} more permissions
                              </Typography>
                            )}
                          </Stack>
                        </Paper>
                      </Box>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        )}
      </Box>

      {/* Create/Edit Role Modal */}
      <Dialog 
        open={roleModal.open} 
        onClose={() => setRoleModal({ open: false, mode: 'create', role: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {roleModal.mode === 'create' ? 'Create New Role' : `Edit Role: ${roleModal.role?.name}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Role Name"
              value={roleForm.data.name}
              onChange={(e) => roleForm.setData('name', e.target.value)}
              error={!!roleForm.errors.name}
              helperText={roleForm.errors.name}
              fullWidth
              placeholder="e.g., Inventory Manager"
            />

            <FormControl fullWidth error={!!roleForm.errors.permissions}>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={roleForm.data.permissions}
                onChange={(e) => roleForm.setData('permissions', e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const permission = permissions.find(p => p.id === value);
                      return permission ? (
                        <Chip key={`role-perm-chip-${permission.id}`} label={permission.name} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {permissions.map((permission) => (
                  <MenuItem key={`role-perm-${permission.id}`} value={permission.id}>
                    <Checkbox checked={roleForm.data.permissions.indexOf(permission.id) > -1} />
                    <ListItemText 
                      primary={permission.name}
                      secondary={permission.description}
                    />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {roleForm.errors.permissions || 'Select permissions for this role'}
              </FormHelperText>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setRoleModal({ open: false, mode: 'create', role: null })}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={roleModal.mode === 'create' ? handleCreateRole : handleUpdateRole}
            variant="contained"
            disabled={loading || !roleForm.data.name}
          >
            {loading ? <CircularProgress size={24} /> : (roleModal.mode === 'create' ? 'Create Role' : 'Update Role')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Permission Modal */}
      <Dialog 
        open={permissionModal.open} 
        onClose={() => setPermissionModal({ open: false, mode: 'create', permission: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {permissionModal.mode === 'create' ? 'Create New Permission' : `Edit Permission: ${permissionModal.permission?.name}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Permission Name"
              value={permissionForm.data.name}
              onChange={(e) => permissionForm.setData('name', e.target.value)}
              error={!!permissionForm.errors.name}
              helperText={permissionForm.errors.name || 'Format: module.action (e.g., users.create)'}
              fullWidth
              placeholder="e.g., inventory.create"
            />
            <TextField
              label="Description"
              value={permissionForm.data.description}
              onChange={(e) => permissionForm.setData('description', e.target.value)}
              error={!!permissionForm.errors.description}
              helperText={permissionForm.errors.description}
              fullWidth
              multiline
              rows={3}
              placeholder="Describe what this permission allows..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPermissionModal({ open: false, mode: 'create', permission: null })}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={permissionModal.mode === 'create' ? handleCreatePermission : handleUpdatePermission}
            variant="contained"
            disabled={loading || !permissionForm.data.name}
          >
            {loading ? <CircularProgress size={24} /> : (permissionModal.mode === 'create' ? 'Create Permission' : 'Update Permission')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Role Assignment Modal */}
      {/* <Dialog 
        open={userRoleModal.open} 
        onClose={() => setUserRoleModal({ open: false, user: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Roles to {userRoleModal.user?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            User: {userRoleModal.user?.email}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={userRoleForm.data.roles}
              onChange={(e) => userRoleForm.setData('roles', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={`user-role-chip-${value}`} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {roles.map((role) => (
                <MenuItem key={`user-role-${role.id}`} value={role.name}>
                  <Checkbox checked={userRoleForm.data.roles.indexOf(role.name) > -1} />
                  <ListItemText 
                    primary={role.name}
                    secondary={`${role.permissions_count} permissions`}
                  />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select roles for this user</FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserRoleModal({ open: false, user: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignUserRoles}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Roles'}
          </Button>
        </DialogActions>
      </Dialog> */}
      {/* User Role Assignment Modal */}
      <Dialog 
        open={userRoleModal.open} 
        onClose={() => setUserRoleModal({ open: false, user: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Roles to {userRoleModal.user?.first_name && userRoleModal.user?.last_name 
            ? `${userRoleModal.user.first_name} ${userRoleModal.user.last_name}`
            : userRoleModal.user?.name
          }
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            User: {userRoleModal.user?.email}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={userRoleForm.data.roles}
              onChange={(e) => userRoleForm.setData('roles', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const role = roles.find(r => r.id === value);
                    return role ? (
                      <Chip key={`user-role-chip-${role.id}`} label={role.name} size="small" />
                    ) : null;
                  })}
                </Box>
              )}
            >
              {roles.map((role) => (
                <MenuItem key={`user-role-${role.id}`} value={role.id}>
                  <Checkbox checked={userRoleForm.data.roles.indexOf(role.id) > -1} />
                  <ListItemText 
                    primary={role.name}
                    secondary={`${role.permissions_count} permissions`}
                  />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select roles for this user</FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserRoleModal({ open: false, user: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignUserRoles}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Roles'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Permission Assignment Modal */}
      {/* <Dialog 
        open={userPermissionModal.open} 
        onClose={() => setUserPermissionModal({ open: false, user: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Assign Direct Permissions to {userPermissionModal.user?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            User: {userPermissionModal.user?.email}
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Direct permissions override role-based permissions. Use this for special cases only.
          </Alert>
          <FormControl fullWidth>
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={userPermissionForm.data.permissions}
              onChange={(e) => userPermissionForm.setData('permissions', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={`user-perm-chip-${value}`} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {permissions.map((permission) => (
                <MenuItem key={`user-perm-${permission.id}`} value={permission.name}>
                  <Checkbox checked={userPermissionForm.data.permissions.indexOf(permission.name) > -1} />
                  <ListItemText 
                    primary={permission.name}
                    secondary={permission.description}
                  />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select direct permissions for this user</FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserPermissionModal({ open: false, user: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignUserPermissions}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Permissions'}
          </Button>
        </DialogActions>
      </Dialog> */}
      {/* User Permission Assignment Modal */}
      <Dialog 
        open={userPermissionModal.open} 
        onClose={() => setUserPermissionModal({ open: false, user: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Assign Direct Permissions to {userPermissionModal.user?.first_name && userPermissionModal.user?.last_name 
            ? `${userPermissionModal.user.first_name} ${userPermissionModal.user.last_name}`
            : userPermissionModal.user?.name
          }
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            User: {userPermissionModal.user?.email}
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Direct permissions override role-based permissions. Use this for special cases only.
          </Alert>
          <FormControl fullWidth>
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={userPermissionForm.data.permissions}
              onChange={(e) => userPermissionForm.setData('permissions', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const permission = permissions.find(p => p.id === value);
                    return permission ? (
                      <Chip key={`user-perm-chip-${permission.id}`} label={permission.name} size="small" />
                    ) : null;
                  })}
                </Box>
              )}
            >
              {permissions.map((permission) => (
                <MenuItem key={`user-perm-${permission.id}`} value={permission.id}>
                  <Checkbox checked={userPermissionForm.data.permissions.indexOf(permission.id) > -1} />
                  <ListItemText 
                    primary={permission.name}
                    secondary={permission.description}
                  />
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select direct permissions for this user</FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserPermissionModal({ open: false, user: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignUserPermissions}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Permissions'}
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </AuthenticatedLayout>
  );
};

export default RolePermissionManager;
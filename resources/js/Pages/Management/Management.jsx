// import React, { useState, useMemo, useEffect } from 'react';
// import { useForm, usePage } from '@inertiajs/react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import {
//   Box, Chip, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent,
//   DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, Card, CardContent,
//   Grid, IconButton, Switch, FormControlLabel, Avatar, Paper, useTheme, useMediaQuery,
//   alpha, Tab, Tabs, FormHelperText, Tooltip, Badge, Divider,
// } from '@mui/material';
// import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
// import {
//   Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Key as KeyIcon,
//   Block as BlockIcon, CheckCircle as ActiveIcon, Cancel as InactiveIcon,
//   AdminPanelSettings as SuperAdminIcon, ManageAccounts as ManagerIcon,
//   Person as UserIcon, Security as SecurityIcon, Search as SearchIcon,
//   Visibility as ViewIcon, PersonAdd as PersonAddIcon, FilterList as FilterIcon,
//   Refresh as RefreshIcon, Download as DownloadIcon, Warning as WarningIcon,
//   Info as InfoIcon, Shield as ShieldIcon,
// } from '@mui/icons-material';
// import Notification from '@/Components/Notification';

// // Enhanced PermissionMatrix with search and filtering
// const PermissionMatrix = ({ permissions, selectedPermissions, onPermissionChange, disabled = false, showSystemPermissions = true }) => {
//   const theme = useTheme();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterModule, setFilterModule] = useState('all');

//   const groupedPermissions = useMemo(() => {
//     const groups = {};
//     permissions.forEach(permission => {
//       const [module] = permission.name.split('.');
//       if (!groups[module]) groups[module] = [];
      
//       // Filter permissions based on search and module filter
//       const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                            permission.description.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesModule = filterModule === 'all' || module === filterModule;
      
//       if (matchesSearch && matchesModule && (showSystemPermissions || !permission.is_system_permission)) {
//         groups[module].push(permission);
//       }
//     });
//     return groups;
//   }, [permissions, searchTerm, filterModule, showSystemPermissions]);

//   const modules = useMemo(() => {
//     const uniqueModules = [...new Set(permissions.map(p => p.name.split('.')[0]))];
//     return uniqueModules.sort();
//   }, [permissions]);

//   const selectedCount = selectedPermissions.length;
//   const totalCount = permissions.length;

//   return (
//     <Box sx={{ mt: 2 }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
//         <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
//           Permission Matrix 
//           <Chip 
//             label={`${selectedCount}/${totalCount} selected`} 
//             size="small" 
//             color="primary" 
//             variant={selectedCount > 0 ? "filled" : "outlined"}
//             sx={{ ml: 2 }}
//           />
//         </Typography>
        
//         <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
//           <TextField
//             size="small"
//             placeholder="Search permissions..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             sx={{ width: 200 }}
//             InputProps={{
//               startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
//             }}
//           />
//           <FormControl size="small" sx={{ minWidth: 120 }}>
//             <InputLabel>Module</InputLabel>
//             <Select
//               value={filterModule}
//               label="Module"
//               onChange={(e) => setFilterModule(e.target.value)}
//             >
//               <MenuItem value="all">All Modules</MenuItem>
//               {modules.map(module => (
//                 <MenuItem key={module} value={module}>
//                   {module.replace(/_/g, ' ').toUpperCase()}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Stack>
//       </Box>

//       <Grid container spacing={2}>
//         {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
//           <Grid size={{ xs:12, md:6 }} lg={4} key={module}>
//             <Card 
//               variant="outlined" 
//               sx={{ 
//                 p: 2, 
//                 height: '100%',
//                 border: selectedPermissions.some(p => p.startsWith(module)) ? 
//                   `2px solid ${theme.palette.primary.main}` : 
//                   undefined
//               }}
//             >
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
//                   {module.replace(/_/g, ' ').toUpperCase()}
//                 </Typography>
//                 <Chip 
//                   label={`${modulePermissions.length}`} 
//                   size="small" 
//                   variant="outlined"
//                 />
//               </Box>
              
//               <Stack spacing={1}>
//                 {modulePermissions.map(permission => {
//                   const isSystemPermission = permission.is_system_permission;
//                   const isChecked = selectedPermissions.includes(permission.name);

//                   return (
//                     <Card 
//                       key={permission.permission_id}
//                       variant="outlined"
//                       sx={{ 
//                         p: 1,
//                         borderColor: isChecked ? 'primary.main' : 'divider',
//                         backgroundColor: isChecked ? alpha(theme.palette.primary.main, 0.04) : 'background.paper'
//                       }}
//                     >
//                       <FormControlLabel
//                         control={
//                           <Tooltip title={isChecked ? 'Revoke permission' : 'Grant permission'}>
//                             <Switch
//                               checked={isChecked}
//                               onChange={(e) => onPermissionChange(permission.name, e.target.checked)}
//                               size="small"
//                               disabled={disabled}
//                               color="primary"
//                             />
//                           </Tooltip>
//                         }
//                         label={
//                           <Box sx={{ ml: 1 }}>
//                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
//                               <Typography variant="body2" fontWeight={600}>
//                                 {permission.action.replace(/_/g, ' ')}
//                               </Typography>
//                               {isSystemPermission && (
//                                 <Tooltip title="System permission">
//                                   <ShieldIcon fontSize="small" color="warning" sx={{ ml: 1 }} />
//                                 </Tooltip>
//                               )}
//                             </Box>
//                             <Typography variant="caption" color="text.secondary">
//                               {permission.description}
//                             </Typography>
//                           </Box>
//                         }
//                         sx={{ width: '100%', m: 0 }}
//                       />
//                     </Card>
//                   );
//                 })}
//               </Stack>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
      
//       {Object.keys(groupedPermissions).length === 0 && (
//         <Box sx={{ textAlign: 'center', py: 4 }}>
//           <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
//           <Typography variant="body1" color="text.secondary">
//             No permissions found matching your criteria
//           </Typography>
//         </Box>
//       )}
//     </Box>
//   );
// };

// // Enhanced RolePermissionsDialog
// const RolePermissionsDialog = ({ open, onClose, role, permissions, onSave, loading = false }) => {
//   const [selectedPermissions, setSelectedPermissions] = useState([]);

//   React.useEffect(() => {
//     if (role && open) {
//       const rolePermissionNames = role.permissions?.map(p => p.name) || [];
//       const systemPermissions = permissions
//         .filter(p => p.is_system_permission && !rolePermissionNames.includes(p.name))
//         .map(p => p.name);
      
//       setSelectedPermissions([...rolePermissionNames, ...systemPermissions]);
//     }
//   }, [role, open, permissions]);

//   const handlePermissionChange = (permissionName, checked) => {
//     setSelectedPermissions(prev =>
//       checked 
//         ? [...prev, permissionName] 
//         : prev.filter(p => p !== permissionName)
//     );
//   };

//   const handleSave = () => {
//     onSave(role.role_id, selectedPermissions);
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
//       <DialogTitle>
//         Manage Permissions: {role?.name}
//       </DialogTitle>
//       <DialogContent>
//         {role?.description && (
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//             {role.description}
//           </Typography>
//         )}
//         <PermissionMatrix
//           permissions={permissions}
//           selectedPermissions={selectedPermissions}
//           onPermissionChange={handlePermissionChange}
//           disabled={loading}
//         />
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} disabled={loading}>Cancel</Button>
//         <Button 
//           variant="contained" 
//           onClick={handleSave}
//           disabled={loading}
//         >
//           {loading ? 'Saving...' : 'Save Permissions'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// // User Permissions Dialog for individual permissions
// const UserPermissionsDialog = ({ open, onClose, user, permissions, onSave, loading = false }) => {
//   const [selectedPermissions, setSelectedPermissions] = useState([]);

//   React.useEffect(() => {
//     if (user && open) {
//       const userPermissionNames = user.individual_permissions?.map(p => p.name) || [];
//       setSelectedPermissions(userPermissionNames);
//     }
//   }, [user, open]);

//   const handlePermissionChange = (permissionName, checked) => {
//     setSelectedPermissions(prev =>
//       checked 
//         ? [...prev, permissionName] 
//         : prev.filter(p => p !== permissionName)
//     );
//   };

//   const handleSave = () => {
//     onSave(user.user_id, selectedPermissions);
//   };

//   const rolePermissions = user?.role?.permissions?.map(p => p.name) || [];

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
//       <DialogTitle>
//         Individual Permissions: {user?.full_name}
//       </DialogTitle>
//       <DialogContent>
//         <Alert severity="info" sx={{ mb: 2 }}>
//           These permissions are granted individually to this user, in addition to their role permissions.
//         </Alert>
//         <PermissionMatrix
//           permissions={permissions}
//           selectedPermissions={selectedPermissions}
//           onPermissionChange={handlePermissionChange}
//           disabled={loading}
//           showSystemPermissions={false}
//         />
        
//         {rolePermissions.length > 0 && (
//           <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
//             <Typography variant="subtitle2" gutterBottom color="text.secondary">
//               Role Permissions (from {user?.role?.name}):
//             </Typography>
//             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//               {rolePermissions.slice(0, 10).map(permission => (
//                 <Chip
//                   key={permission}
//                   label={permission.split('.')[1]}
//                   size="small"
//                   variant="outlined"
//                 />
//               ))}
//               {rolePermissions.length > 10 && (
//                 <Chip
//                   label={`+${rolePermissions.length - 10} more`}
//                   size="small"
//                   variant="outlined"
//                 />
//               )}
//             </Box>
//           </Box>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} disabled={loading}>Cancel</Button>
//         <Button 
//           variant="contained" 
//           onClick={handleSave}
//           disabled={loading}
//         >
//           {loading ? 'Saving...' : 'Save Individual Permissions'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default function UserManagement({ auth, users, roles, universities, departments, permissions: allPermissions }) {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const { flash } = usePage().props;
  
//   const [rows, setRows] = useState([]);
//   const [searchText, setSearchText] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [openUserDialog, setOpenUserDialog] = useState(false);
//   const [openRoleDialog, setOpenRoleDialog] = useState(false);
//   const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
//   const [openUserPermissionsDialog, setOpenUserPermissionsDialog] = useState(false);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [selectedRole, setSelectedRole] = useState(null);
//   const [activeTab, setActiveTab] = useState(0);
//   const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

//   // User form
//   const { data: userData, setData: setUserData, post: postUser, put: putUser, delete: deleteUser, processing: userProcessing, errors: userErrors, reset: resetUser } = useForm({
//     user_id: '',
//     university_id: '',
//     department_id: '',
//     first_name: '',
//     last_name: '',
//     email: '',
//     phone: '',
//     role_id: '',
//     position: '',
//     is_active: true,
//     employee_id: '',
//     username: '',
//   });

//   // Role form
//   const { data: roleData, setData: setRoleData, post: postRole, put: putRole, delete: deleteRole, processing: roleProcessing, errors: roleErrors, reset: resetRole } = useForm({
//     role_id: '',
//     name: '',
//     description: '',
//     permissions: [],
//     is_system_role: false,
//     university_id: '',
//   });

//   // Permissions forms
//   const { post: postPermissions, processing: permissionsProcessing } = useForm();
//   const { post: postUserPermissions, processing: userPermissionsProcessing } = useForm();

//   const showAlert = (message, severity = 'success') => {
//     setAlert({ open: true, message, severity });
//   };

//   // Process users data - PRESERVING ORIGINAL PATTERN
//   React.useEffect(() => {
//     const processedUsers = (users || []).map(user => ({
//       id: user.user_id,
//       ...user,
//       full_name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name,
//       last_login: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never',
//       status: user.is_active ? 'active' : 'inactive',
//       has_individual_permissions: user.individual_permissions?.length > 0,
//     }));
//     setRows(processedUsers);
//   }, [users]);

//   // User columns for DataGrid - PRESERVING ALL ORIGINAL COLUMNS
//   const userColumns = useMemo(() => [
//     { 
//       field: 'user', 
//       headerName: 'User', 
//       width: 200,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Badge
//             overlap="circular"
//             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//             badgeContent={
//               params.row.has_individual_permissions ? (
//                 <Tooltip title="Has individual permissions">
//                   <ShieldIcon sx={{ fontSize: 16, color: 'warning.main' }} />
//                 </Tooltip>
//               ) : null
//             }
//           >
//             <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
//               {params.row.first_name?.charAt(0)}{params.row.last_name?.charAt(0)}
//             </Avatar>
//           </Badge>
//           <Box>
//             <Typography variant="body2" fontWeight={600}>
//               {params.row.full_name}
//             </Typography>
//             <Typography variant="caption" color="text.secondary">
//               {params.row.email}
//             </Typography>
//           </Box>
//         </Box>
//       )
//     },
//     { 
//       field: 'role', 
//       headerName: 'Role', 
//       width: 150,
//       renderCell: (params) => {
//         const role = roles?.find(r => r.role_id === params.row.role_id);
//         const getRoleIcon = (roleName) => {
//           switch(roleName?.toLowerCase()) {
//             case 'super_admin': return <SuperAdminIcon fontSize="small" />;
//             case 'inventory_manager': return <ManagerIcon fontSize="small" />;
//             case 'department_head': return <ManagerIcon fontSize="small" />;
//             default: return <UserIcon fontSize="small" />;
//           }
//         };
        
//         return (
//           <Chip 
//             icon={role ? getRoleIcon(role.name) : <UserIcon fontSize="small" />}
//             label={role?.name ? role.name.replace(/_/g, ' ') : 'No Role'} 
//             size="small"
//             color={
//               role?.name === 'super_admin' ? 'error' :
//               role?.name === 'inventory_manager' ? 'warning' : 
//               role?.name === 'department_head' ? 'primary' : 'default'
//             }
//             variant="outlined"
//           />
//         );
//       }
//     },
//     { 
//       field: 'department', 
//       headerName: 'Department', 
//       width: 150,
//       renderCell: (params) => {
//         const department = departments?.find(d => d.department_id === params.row.department_id);
//         return department?.name || '—';
//       }
//     },
//     { 
//       field: 'status', 
//       headerName: 'Status', 
//       width: 120,
//       renderCell: (params) => (
//         <Chip 
//           icon={params.row.is_active ? <ActiveIcon /> : <InactiveIcon />}
//           label={params.row.is_active ? 'Active' : 'Inactive'} 
//           size="small"
//           color={params.row.is_active ? 'success' : 'error'}
//           variant={params.row.is_active ? 'filled' : 'outlined'}
//         />
//       )
//     },
//     { 
//       field: 'last_login', 
//       headerName: 'Last Login', 
//       width: 130 
//     },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       width: 280,
//       type: 'actions',
//       getActions: (params) => [
//         <GridActionsCellItem
//           icon={<Tooltip title="Edit User"><EditIcon /></Tooltip>}
//           label="Edit User"
//           onClick={() => handleEditUser(params.row)}
//         />,
//         <GridActionsCellItem
//           icon={<Tooltip title="Individual Permissions"><ShieldIcon /></Tooltip>}
//           label="Individual Permissions"
//           onClick={() => handleIndividualPermissions(params.row)}
//           color="warning"
//         />,
//         <GridActionsCellItem
//           icon={<Tooltip title="Change Role"><KeyIcon /></Tooltip>}
//           label="Change Role"
//           onClick={() => handleChangeRole(params.row)}
//         />,
//         <GridActionsCellItem
//           icon={<Tooltip title={params.row.is_active ? 'Deactivate' : 'Activate'}>
//             {params.row.is_active ? <BlockIcon /> : <ActiveIcon />}
//           </Tooltip>}
//           label={params.row.is_active ? 'Deactivate' : 'Activate'}
//           onClick={() => handleToggleStatus(params.row)}
//           color={params.row.is_active ? 'warning' : 'success'}
//         />,
//         <GridActionsCellItem
//           icon={<Tooltip title="Delete User"><DeleteIcon /></Tooltip>}
//           label="Delete"
//           onClick={() => handleDeleteUser(params.row)}
//           color="error"
//         />,
//       ],
//     },
//   ], [roles, departments]);

//   // Role columns for DataGrid - PRESERVING ALL ORIGINAL COLUMNS
//   const roleColumns = useMemo(() => [
//     { 
//       field: 'name', 
//       headerName: 'Role Name', 
//       width: 180,
//       renderCell: (params) => (
//         <Box>
//           <Typography variant="body2" fontWeight={600}>
//             {params.row.name.replace(/_/g, ' ')}
//           </Typography>
//           {params.row.is_system_role && (
//             <Chip label="System" size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
//           )}
//         </Box>
//       )
//     },
//     { 
//       field: 'description', 
//       headerName: 'Description', 
//       width: 250 
//     },
//     { 
//       field: 'permissions_count', 
//       headerName: 'Permissions', 
//       width: 120,
//       renderCell: (params) => (
//         <Chip 
//           label={`${params.row.permissions?.length || 0} perms`}
//           size="small"
//           variant="outlined"
//         />
//       )
//     },
//     { 
//       field: 'user_count', 
//       headerName: 'Users', 
//       width: 100,
//       renderCell: (params) => (
//         <Typography variant="body2" fontWeight={600}>
//           {users?.filter(u => u.role_id === params.row.role_id)?.length || 0}
//         </Typography>
//       )
//     },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       width: 200,
//       type: 'actions',
//       getActions: (params) => [
//         <GridActionsCellItem
//           icon={<EditIcon />}
//           label="Edit Role"
//           onClick={() => handleEditRole(params.row)}
//           disabled={params.row.is_system_role}
//         />,
//         <GridActionsCellItem
//           icon={<SecurityIcon />}
//           label="Manage Permissions"
//           onClick={() => handleManagePermissions(params.row)}
//         />,
//         <GridActionsCellItem
//           icon={<DeleteIcon />}
//           label="Delete"
//           onClick={() => handleDeleteRole(params.row)}
//           color="error"
//           disabled={params.row.is_system_role || users?.some(u => u.role_id === params.row.role_id)}
//         />,
//       ],
//     },
//   ], [users]);

//   // Event handlers - PRESERVING ALL ORIGINAL HANDLERS
//   const handleCreateUser = () => {
//     setSelectedUser(null);
//     resetUser({
//       university_id: auth.user.university_id,
//       is_active: true,
//     });
//     setOpenUserDialog(true);
//   };

//   const handleEditUser = (user) => {
//     setSelectedUser(user);
//     setUserData({
//       user_id: user.user_id,
//       university_id: user.university_id,
//       department_id: user.department_id,
//       first_name: user.first_name,
//       last_name: user.last_name,
//       email: user.email,
//       phone: user.phone || '',
//       role_id: user.role_id,
//       position: user.position || '',
//       is_active: user.is_active,
//       employee_id: user.employee_id || '',
//       username: user.username || '',
//     });
//     setOpenUserDialog(true);
//   };

//   // NEW: Individual permissions handler
//   const handleIndividualPermissions = (user) => {
//     setSelectedUser(user);
//     setOpenUserPermissionsDialog(true);
//   };

//   const handleChangeRole = (user) => {
//     setSelectedUser(user);
//     showAlert(`Change role for ${user.full_name}`, 'info');
//   };

//   const handleToggleStatus = (user) => {
//     putUser(route('admin.users.toggle-status', user.user_id), {
//       onSuccess: () => showAlert(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`),
//       onError: () => showAlert('Failed to update user status', 'error'),
//     });
//   };

//   const handleDeleteUser = (user) => {
//     setSelectedUser(user);
//     setOpenDeleteDialog(true);
//   };

//   const handleCreateRole = () => {
//     setSelectedRole(null);
//     resetRole({
//       university_id: auth.user.university_id,
//       permissions: [],
//       is_system_role: false,
//     });
//     setOpenRoleDialog(true);
//   };

//   const handleEditRole = (role) => {
//     setSelectedRole(role);
//     const rolePermissionNames = role.permissions?.map(p => p.name) || [];
//     const systemPermissions = allPermissions
//       .filter(p => p.is_system_permission && !rolePermissionNames.includes(p.name))
//       .map(p => p.name);
    
//     setRoleData({
//       role_id: role.role_id,
//       name: role.name,
//       description: role.description,
//       permissions: [...rolePermissionNames, ...systemPermissions],
//       is_system_role: role.is_system_role,
//       university_id: role.university_id,
//     });
//     setOpenRoleDialog(true);
//   };

//   const handleManagePermissions = (role) => {
//     setSelectedRole(role);
//     setOpenPermissionsDialog(true);
//   };

//   const handleDeleteRole = (role) => {
//     setSelectedRole(role);
//     showAlert(`Delete role: ${role.name}`, 'warning');
//   };

//   const handleSavePermissions = async (roleId, permissions) => {
//   try {
//     const response = await axios.post(route('admin.roles.update-permissions', roleId), {
//       permissions: permissions
//     });
    
//     setOpenPermissionsDialog(false);
//     showAlert('Permissions updated successfully');
//   } catch (error) {
//     console.error('Permission update error:', error);
//     showAlert('Failed to update permissions', 'error');
//   }
// };

// // const handleSavePermissions = (roleId, permissions) => {
// //   console.log("Sending permissions:", permissions);
  
// //   // Use putRole or postRole from your main role form
// //   postPermissions(route('admin.roles.update-permissions', roleId), {
// //     permissions: permissions,
// //   }, {
// //     onSuccess: () => {
// //       setOpenPermissionsDialog(false);
// //       showAlert('Permissions updated successfully');
// //     },
// //     onError: (errors) => {
// //       console.error('Permission update errors:', errors);
// //       showAlert('Failed to update permissions', 'error');
// //     },
// //   });
// // };

//   // NEW: Save individual user permissions
//   const handleSaveUserPermissions = (userId, permissions) => {
//     postUserPermissions(route('admin.users.update-permissions', userId), {
//       permissions: permissions,
//     }, {
//       onSuccess: () => {
//         setOpenUserPermissionsDialog(false);
//         showAlert('Individual permissions updated successfully');
//       },
//       onError: () => showAlert('Failed to update individual permissions', 'error'),
//     });
//   };

//   const handleUserSubmit = () => {
//     if (selectedUser) {
//       putUser(route('admin.users.update', selectedUser.user_id), {
//         onSuccess: () => {
//           setOpenUserDialog(false);
//           showAlert('User updated successfully');
//         },
//         onError: () => showAlert('Failed to update user', 'error'),
//       });
//     } else {
//       postUser(route('admin.users.store'), {
//         onSuccess: () => {
//           setOpenUserDialog(false);
//           showAlert('User created successfully');
//         },
//         onError: () => showAlert('Failed to create user', 'error'),
//       });
//     }
//   };

//   const handleRoleSubmit = () => {
//     if (selectedRole) {
//       putRole(route('admin.roles.update', selectedRole.role_id), {
//         data: {
//           name: roleData.name,
//           description: roleData.description,
//           permissions: roleData.permissions || [],
//           university_id: roleData.university_id,
//         },
//         onSuccess: () => {
//           setOpenRoleDialog(false);
//           showAlert('Role updated successfully');
//         },
//         onError: () => showAlert('Failed to update role', 'error'),
//       });
//     } else {
//       postRole(route('admin.roles.store'), {
//         data: {
//           name: roleData.name,
//           description: roleData.description,
//           permissions: roleData.permissions || [],
//           university_id: roleData.university_id,
//           is_system_role: roleData.is_system_role,
//         },
//         onSuccess: () => {
//           setOpenRoleDialog(false);
//           showAlert('Role created successfully');
//         },
//         onError: () => showAlert('Failed to create role', 'error'),
//       });
//     }
//   };

//   const handlePermissionChange = (permissionName, checked) => {
//     const currentPermissions = roleData.permissions || [];
//     const newPermissions = checked 
//       ? [...currentPermissions, permissionName]
//       : currentPermissions.filter(p => p !== permissionName);
//     setRoleData('permissions', newPermissions);
//   };

//   // Enhanced filtering while preserving original search
//   const filteredUsers = useMemo(() => {
//     let filtered = rows;
    
//     if (searchText) {
//       filtered = filtered.filter(user => 
//         user.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
//         user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
//         user.employee_id?.toLowerCase().includes(searchText.toLowerCase())
//       );
//     }
    
//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(user => 
//         statusFilter === 'active' ? user.is_active : !user.is_active
//       );
//     }
    
//     if (roleFilter !== 'all') {
//       filtered = filtered.filter(user => user.role_id === roleFilter);
//     }
    
//     return filtered;
//   }, [rows, searchText, statusFilter, roleFilter]);

//   // Handle flash messages
//   useEffect(() => {
//     if (flash.success) {
//       showAlert(flash.success, "success");
//     }

//     if (flash.error) {
//       showAlert(flash.error, "error");
//     }
//   }, [flash]);

//   const handleCloseAlert = () => {
//     setAlert((prev) => ({ ...prev, open: false }));
//   };

//   return (
//     <AuthenticatedLayout
//       auth={auth}
//       title="User Management"
//       breadcrumbs={[
//         { label: 'Dashboard', href: '/dashboard' },
//         { label: 'Admin', href: '/admin' },
//         { label: 'User Management' }
//       ]}
//     >
//       <Box>
//         {/* Header */}
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h4" fontWeight={800} gutterBottom>
//             User Management
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             Manage system users, roles, and permissions
//           </Typography>
//         </Box>

//         <Notification 
//           open={alert.open} 
//           severity={alert.severity} 
//           message={alert.message}
//           onClose={handleCloseAlert}
//         />

//         {/* Tabs */}
//         <Paper sx={{ mb: 3, borderRadius: 3 }}>
//           <Tabs 
//             value={activeTab} 
//             onChange={(e, newValue) => setActiveTab(newValue)}
//             sx={{ 
//               borderBottom: 1, 
//               borderColor: 'divider',
//               '& .MuiTab-root': { fontWeight: 600 }
//             }}
//           >
//             <Tab icon={<UserIcon />} label={`Users (${users?.length || 0})`} />
//             <Tab icon={<SecurityIcon />} label={`Roles (${roles?.length || 0})`} />
//           </Tabs>
//         </Paper>

//         {/* Users Tab */}
//         {activeTab === 0 && (
//           <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
//             <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
//               <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center" justifyContent="space-between">
//                 <Typography variant="h6" fontWeight={600}>
//                   System Users ({filteredUsers.length})
//                 </Typography>
//                 <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
//                   <TextField
//                     size="small"
//                     placeholder="Search users..."
//                     value={searchText}
//                     onChange={(e) => setSearchText(e.target.value)}
//                     InputProps={{
//                       startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
//                     }}
//                     sx={{ width: isMobile ? '100%' : 300 }}
//                   />
//                   <FormControl size="small" sx={{ minWidth: 120 }}>
//                     <InputLabel>Status</InputLabel>
//                     <Select
//                       value={statusFilter}
//                       label="Status"
//                       onChange={(e) => setStatusFilter(e.target.value)}
//                     >
//                       <MenuItem value="all">All Status</MenuItem>
//                       <MenuItem value="active">Active</MenuItem>
//                       <MenuItem value="inactive">Inactive</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl size="small" sx={{ minWidth: 140 }}>
//                     <InputLabel>Role</InputLabel>
//                     <Select
//                       value={roleFilter}
//                       label="Role"
//                       onChange={(e) => setRoleFilter(e.target.value)}
//                     >
//                       <MenuItem value="all">All Roles</MenuItem>
//                       {roles?.map(role => (
//                         <MenuItem key={role.role_id} value={role.role_id}>
//                           {role.name.replace(/_/g, ' ')}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                   <Button 
//                     variant="contained" 
//                     startIcon={<AddIcon />}
//                     onClick={handleCreateUser}
//                   >
//                     Add User
//                   </Button>
//                 </Stack>
//               </Stack>
//             </Box>

//             <DataGrid
//               rows={filteredUsers}
//               columns={userColumns}
//               getRowId={(row) => row.user_id}
//               pageSizeOptions={[10, 25, 50]}
//               initialState={{
//                 pagination: { paginationModel: { pageSize: 25 } },
//               }}
//               sx={{
//                 border: 'none',
//                 '& .MuiDataGrid-cell': {
//                   borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//                 },
//               }}
//               autoHeight
//             />
//           </Paper>
//         )}

//         {/* Roles Tab */}
//         {activeTab === 1 && (
//           <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
//             <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
//               <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center" justifyContent="space-between">
//                 <Typography variant="h6" fontWeight={600}>
//                   System Roles
//                 </Typography>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<AddIcon />}
//                   onClick={handleCreateRole}
//                 >
//                   Create Role
//                 </Button>
//               </Stack>
//             </Box>

//             <DataGrid
//               rows={roles || []}
//               columns={roleColumns}
//               getRowId={(row) => row.role_id}
//               pageSizeOptions={[10, 25, 50]}
//               initialState={{
//                 pagination: { paginationModel: { pageSize: 25 } },
//               }}
//               sx={{
//                 border: 'none',
//                 '& .MuiDataGrid-cell': {
//                   borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
//                 },
//               }}
//               autoHeight
//             />
//           </Paper>
//         )}

//         {/* User Dialog */}
//         <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="md" fullWidth>
//           <DialogTitle>
//             {selectedUser ? 'Edit User' : 'Create New User'}
//           </DialogTitle>
//           <DialogContent>
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               <Grid size={{ xs:12, md:6 }}>
//                 <TextField
//                   fullWidth
//                   label="First Name"
//                   value={userData.first_name}
//                   onChange={(e) => setUserData('first_name', e.target.value)}
//                   error={!!userErrors.first_name}
//                   helperText={userErrors.first_name}
//                 />
//               </Grid>
//               <Grid size={{ xs:12, md:6 }}>
//                 <TextField
//                   fullWidth
//                   label="Last Name"
//                   value={userData.last_name}
//                   onChange={(e) => setUserData('last_name', e.target.value)}
//                   error={!!userErrors.last_name}
//                   helperText={userErrors.last_name}
//                 />
//               </Grid>
//               <Grid size={{ xs:12, md:6 }}>
//                 <TextField
//                   fullWidth
//                   label="Email"
//                   type="email"
//                   value={userData.email}
//                   onChange={(e) => setUserData('email', e.target.value)}
//                   error={!!userErrors.email}
//                   helperText={userErrors.email}
//                 />
//               </Grid>
//               <Grid size={{ xs:12, md:6 }}>
//                 <FormControl fullWidth error={!!userErrors.role_id}>
//                   <InputLabel>Role</InputLabel>
//                   <Select
//                     value={userData.role_id}
//                     label="Role"
//                     onChange={(e) => setUserData('role_id', e.target.value)}
//                   >
//                     {roles?.map(role => (
//                       <MenuItem key={role.role_id} value={role.role_id}>
//                         {role.name.replace(/_/g, ' ')}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   {userErrors.role_id && <FormHelperText>{userErrors.role_id}</FormHelperText>}
//                 </FormControl>
//               </Grid>
//               <Grid size={{ xs:12 }}>
//                 <FormControlLabel
//                   control={
//                     <Switch
//                       checked={userData.is_active}
//                       onChange={(e) => setUserData('is_active', e.target.checked)}
//                     />
//                   }
//                   label="Active User"
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
//             <Button 
//               variant="contained" 
//               onClick={handleUserSubmit}
//               disabled={userProcessing}
//             >
//               {selectedUser ? 'Update User' : 'Create User'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Role Dialog */}
//         <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="lg" fullWidth>
//           <DialogTitle>
//             {selectedRole ? 'Edit Role' : 'Create New Role'}
//           </DialogTitle>
//           <DialogContent>
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               <Grid size={{ xs:12, md:6 }}>
//                 <TextField
//                   fullWidth
//                   label="University"
//                   value={roleData.university_id}
//                   onChange={(e) => setRoleData('university_id', e.target.value)}
//                   error={!!roleErrors.university_id}
//                   helperText={roleErrors.university_id}
//                   select
//                 >
//                   {universities?.map((item) => (
//                     <MenuItem key={item.university_id} value={item.university_id}>
//                       {item.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               </Grid>
//               <Grid size={{ xs:12, md:6 }}>
//                 <TextField
//                   fullWidth
//                   label="Role Name"
//                   value={roleData.name}
//                   onChange={(e) => setRoleData('name', e.target.value)}
//                   error={!!roleErrors.name}
//                   helperText={roleErrors.name}
//                   placeholder="e.g., inventory_manager"
//                 />
//               </Grid>
//               <Grid size={{ xs:12, md:6 }}>
//                 <TextField
//                   fullWidth
//                   label="Description"
//                   value={roleData.description}
//                   onChange={(e) => setRoleData('description', e.target.value)}
//                   error={!!roleErrors.description}
//                   helperText={roleErrors.description}
//                 />
//               </Grid>
//               <Grid size={{ xs:12 }}>
//                 <PermissionMatrix
//                   permissions={allPermissions || []}
//                   selectedPermissions={roleData.permissions || []}
//                   onPermissionChange={handlePermissionChange}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
//             <Button 
//               variant="contained" 
//               onClick={handleRoleSubmit}
//               disabled={roleProcessing}
//             >
//               {selectedRole ? 'Update Role' : 'Create Role'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Permissions Dialog */}
//         <RolePermissionsDialog
//           key={selectedRole?.role_id || 'role-permissions'}
//           open={openPermissionsDialog}
//           onClose={() => setOpenPermissionsDialog(false)}
//           role={selectedRole}
//           permissions={allPermissions || []}
//           onSave={handleSavePermissions}
//           loading={permissionsProcessing}
//         />

//         {/* NEW: User Permissions Dialog */}
//         <UserPermissionsDialog
//           key={selectedUser?.user_id || 'user-permission'}
//           open={openUserPermissionsDialog}
//           onClose={() => setOpenUserPermissionsDialog(false)}
//           user={selectedUser}
//           permissions={allPermissions || []}
//           onSave={handleSaveUserPermissions}
//           loading={userPermissionsProcessing}
//         />

//         {/* Delete Confirmation Dialog */}
//         <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
//           <DialogTitle>Confirm Deletion</DialogTitle>
//           <DialogContent>
//             <Alert severity="warning" sx={{ mb: 2 }}>
//               Are you sure you want to delete user: {selectedUser?.full_name}?
//             </Alert>
//             <Typography>This action cannot be undone.</Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
//             <Button 
//               variant="contained" 
//               color="error"
//               onClick={() => {
//                 deleteUser(route('admin.users.destroy', selectedUser?.user_id), {
//                   onSuccess: () => {
//                     setOpenDeleteDialog(false);
//                     showAlert('User deleted successfully');
//                   },
//                 });
//               }}
//             >
//               Delete User
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </AuthenticatedLayout>
//   );
// }
import React, { useState, useMemo, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Box, Chip, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, Card, CardContent,
  Grid, IconButton, Switch, FormControlLabel, Avatar, Paper, useTheme, useMediaQuery,
  alpha, Tab, Tabs, FormHelperText, Tooltip, Badge, Divider,
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
} from '@mui/icons-material';
import Notification from '@/Components/Notification';

// Enhanced PermissionMatrix with search and filtering
const PermissionMatrix = ({ permissions, selectedPermissions, onPermissionChange, disabled = false, showSystemPermissions = true }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  const groupedPermissions = useMemo(() => {
    const groups = {};
    permissions.forEach(permission => {
      const [module] = permission.name.split('.');
      if (!groups[module]) groups[module] = [];
      
      // Filter permissions based on search and module filter
      const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permission.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModule = filterModule === 'all' || module === filterModule;
      
      if (matchesSearch && matchesModule && (showSystemPermissions || !permission.is_system_permission)) {
        groups[module].push(permission);
      }
    });
    return groups;
  }, [permissions, searchTerm, filterModule, showSystemPermissions]);

  const modules = useMemo(() => {
    const uniqueModules = [...new Set(permissions.map(p => p.name.split('.')[0]))];
    return uniqueModules.sort();
  }, [permissions]);

  const selectedCount = selectedPermissions.length;
  const totalCount = permissions.length;

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
          Permission Matrix 
          <Chip 
            label={`${selectedCount}/${totalCount} selected`} 
            size="small" 
            color="primary" 
            variant={selectedCount > 0 ? "filled" : "outlined"}
            sx={{ ml: 2 }}
          />
        </Typography>
        
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Module</InputLabel>
            <Select
              value={filterModule}
              label="Module"
              onChange={(e) => setFilterModule(e.target.value)}
            >
              <MenuItem value="all">All Modules</MenuItem>
              {modules.map(module => (
                <MenuItem key={module} value={module}>
                  {module.replace(/_/g, ' ').toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
          <Grid size={{ xs:12, md:6 }} key={module}>
            <Card 
              variant="outlined" 
              sx={{ 
                p: 2, 
                height: '100%',
                border: selectedPermissions.some(p => p.startsWith(module)) ? 
                  `2px solid ${theme.palette.primary.main}` : 
                  undefined
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
                  {module.replace(/_/g, ' ').toUpperCase()}
                </Typography>
                <Chip 
                  label={`${modulePermissions.length}`} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
              
              <Stack spacing={1}>
                {modulePermissions.map(permission => {
                  const isSystemPermission = permission.is_system_permission;
                  const isChecked = selectedPermissions.includes(permission.name);

                  return (
                    <Card 
                      key={permission.permission_id}
                      variant="outlined"
                      sx={{ 
                        p: 1,
                        borderColor: isChecked ? 'primary.main' : 'divider',
                        backgroundColor: isChecked ? alpha(theme.palette.primary.main, 0.04) : 'background.paper'
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Tooltip title={isChecked ? 'Revoke permission' : 'Grant permission'}>
                            <Switch
                              checked={isChecked}
                              onChange={(e) => onPermissionChange(permission.name, e.target.checked)}
                              size="small"
                              disabled={disabled}
                              color="primary"
                            />
                          </Tooltip>
                        }
                        label={
                          <Box sx={{ ml: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {permission.action.replace(/_/g, ' ')}
                              </Typography>
                              {isSystemPermission && (
                                <Tooltip title="System permission">
                                  <ShieldIcon fontSize="small" color="warning" sx={{ ml: 1 }} />
                                </Tooltip>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {permission.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    </Card>
                  );
                })}
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {Object.keys(groupedPermissions).length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No permissions found matching your criteria
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Enhanced RolePermissionsDialog with modern design
const RolePermissionsDialog = ({ open, onClose, role, permissions, onSave, loading = false }) => {
  const theme = useTheme();
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  React.useEffect(() => {
    if (role && open) {
      const rolePermissionNames = role.permissions?.map(p => p.name) || [];
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Manage Permissions: {role?.name}
          </Typography>
          {role?.description && (
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {role.description}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <PermissionMatrix
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          onPermissionChange={handlePermissionChange}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          sx={{ borderRadius: 2, minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={loading}
          sx={{ 
            borderRadius: 2,
            minWidth: 120,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
        >
          {loading ? 'Saving...' : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// User Permissions Dialog for individual permissions
const UserPermissionsDialog = ({ open, onClose, user, permissions, onSave, loading = false }) => {
  const theme = useTheme();
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  React.useEffect(() => {
    if (user && open) {
      const userPermissionNames = user.individual_permissions?.map(p => p.name) || [];
      setSelectedPermissions(userPermissionNames);
    }
  }, [user, open]);

  const handlePermissionChange = (permissionName, checked) => {
    setSelectedPermissions(prev =>
      checked 
        ? [...prev, permissionName] 
        : prev.filter(p => p !== permissionName)
    );
  };

  const handleSave = () => {
    onSave(user.user_id, selectedPermissions);
  };

  const rolePermissions = user?.role?.permissions?.map(p => p.name) || [];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Individual Permissions: {user?.full_name}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Grant additional permissions beyond role-based access
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            background: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}
        >
          These permissions are granted individually to this user, in addition to their role permissions.
        </Alert>
        <PermissionMatrix
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          onPermissionChange={handlePermissionChange}
          disabled={loading}
          showSystemPermissions={false}
        />
        
        {rolePermissions.length > 0 && (
          <Card 
            variant="outlined" 
            sx={{ 
              mt: 3, 
              p: 2, 
              background: alpha(theme.palette.primary.main, 0.02),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle2" gutterBottom color="text.secondary" fontWeight={600}>
              Role Permissions (from {user?.role?.name}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {rolePermissions.slice(0, 10).map(permission => (
                <Chip
                  key={permission}
                  label={permission.split('.')[1]}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    background: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                />
              ))}
              {rolePermissions.length > 10 && (
                <Chip
                  label={`+${rolePermissions.length - 10} more`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Card>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          sx={{ borderRadius: 2, minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={loading}
          sx={{ 
            borderRadius: 2,
            minWidth: 120,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [openUserPermissionsDialog, setOpenUserPermissionsDialog] = useState(false);
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

  // Permissions forms
  const { post: postPermissions, processing: permissionsProcessing } = useForm();
  const { post: postUserPermissions, processing: userPermissionsProcessing } = useForm();

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  // Process users data - PRESERVING ORIGINAL PATTERN
  React.useEffect(() => {
    const processedUsers = (users || []).map(user => ({
      id: user.user_id,
      ...user,
      full_name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name,
      last_login: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never',
      status: user.is_active ? 'active' : 'inactive',
      has_individual_permissions: user.individual_permissions?.length > 0,
    }));
    setRows(processedUsers);
  }, [users]);

  // User columns for DataGrid - PRESERVING ALL ORIGINAL COLUMNS
  const userColumns = useMemo(() => [
    { 
      field: 'user', 
      headerName: 'User', 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              params.row.has_individual_permissions ? (
                <Tooltip title="Has individual permissions">
                  <ShieldIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                </Tooltip>
              ) : null
            }
          >
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              {params.row.first_name?.charAt(0)}{params.row.last_name?.charAt(0)}
            </Avatar>
          </Badge>
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
      width: 280,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Edit User"><EditIcon /></Tooltip>}
          label="Edit User"
          onClick={() => handleEditUser(params.row)}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Individual Permissions"><ShieldIcon /></Tooltip>}
          label="Individual Permissions"
          onClick={() => handleIndividualPermissions(params.row)}
          color="warning"
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Change Role"><KeyIcon /></Tooltip>}
          label="Change Role"
          onClick={() => handleChangeRole(params.row)}
        />,
        <GridActionsCellItem
          icon={<Tooltip title={params.row.is_active ? 'Deactivate' : 'Activate'}>
            {params.row.is_active ? <BlockIcon /> : <ActiveIcon />}
          </Tooltip>}
          label={params.row.is_active ? 'Deactivate' : 'Activate'}
          onClick={() => handleToggleStatus(params.row)}
          color={params.row.is_active ? 'warning' : 'success'}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Delete User"><DeleteIcon /></Tooltip>}
          label="Delete"
          onClick={() => handleDeleteUser(params.row)}
          color="error"
        />,
      ],
    },
  ], [roles, departments]);

  // Role columns for DataGrid - PRESERVING ALL ORIGINAL COLUMNS
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

  // Event handlers - PRESERVING ALL ORIGINAL HANDLERS
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

  // NEW: Individual permissions handler
  const handleIndividualPermissions = (user) => {
    setSelectedUser(user);
    setOpenUserPermissionsDialog(true);
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
    const rolePermissionNames = role.permissions?.map(p => p.name) || [];
    const systemPermissions = allPermissions
      .filter(p => p.is_system_permission && !rolePermissionNames.includes(p.name))
      .map(p => p.name);
    
    setRoleData({
      role_id: role.role_id,
      name: role.name,
      description: role.description,
      permissions: [...rolePermissionNames, ...systemPermissions],
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

  const handleSavePermissions = async (roleId, permissions) => {
  try {
    const response = await axios.post(route('admin.roles.update-permissions', roleId), {
      permissions: permissions
    });
    
    setOpenPermissionsDialog(false);
    showAlert('Permissions updated successfully');
  } catch (error) {
    console.error('Permission update error:', error);
    showAlert('Failed to update permissions', 'error');
  }
};

// const handleSavePermissions = (roleId, permissions) => {
//   console.log("Sending permissions:", permissions);
  
//   // Use putRole or postRole from your main role form
//   postPermissions(route('admin.roles.update-permissions', roleId), {
//     permissions: permissions,
//   }, {
//     onSuccess: () => {
//       setOpenPermissionsDialog(false);
//       showAlert('Permissions updated successfully');
//     },
//     onError: (errors) => {
//       console.error('Permission update errors:', errors);
//       showAlert('Failed to update permissions', 'error');
//     },
//   });
// };

  // NEW: Save individual user permissions
  const handleSaveUserPermissions = (userId, permissions) => {
    postUserPermissions(route('admin.users.update-permissions', userId), {
      permissions: permissions,
    }, {
      onSuccess: () => {
        setOpenUserPermissionsDialog(false);
        showAlert('Individual permissions updated successfully');
      },
      onError: () => showAlert('Failed to update individual permissions', 'error'),
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

  // const handleRoleSubmit = () => {
  //   if (selectedRole) {
  //     putRole(route('admin.roles.update', selectedRole.role_id), {
  //       data: {
  //         name: roleData.name,
  //         description: roleData.description,
  //         permissions: roleData.permissions || [],
  //         university_id: roleData.university_id,
  //       },
  //       onSuccess: () => {
  //         setOpenRoleDialog(false);
  //         showAlert('Role updated successfully');
  //       },
  //       onError: () => showAlert('Failed to update role', 'error'),
  //     });
  //   } else {
  //     postRole(route('admin.roles.store'), {
  //       data: {
  //         name: roleData.name,
  //         description: roleData.description,
  //         permissions: roleData.permissions || [],
  //         university_id: roleData.university_id,
  //         is_system_role: roleData.is_system_role,
  //       },
  //       onSuccess: () => {
  //         setOpenRoleDialog(false);
  //         showAlert('Role created successfully');
  //       },
  //       onError: () => showAlert('Failed to create role', 'error'),
  //     });
  //   }
  // };
//// Raphael
  const handleRoleSubmit = () => {
  if (selectedRole) {
    putRole(route('admin.roles.update', selectedRole.role_id), {
      data: {
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions || [], // This should only contain selected permissions
        university_id: roleData.university_id,
      },
      onSuccess: () => {
        setOpenRoleDialog(false);
        showAlert('Role updated successfully');
      },
      onError: () => showAlert('Failed to update role', 'error'),
    });
  } else {
    postRole(route('admin.roles.store'), {
      data: {
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions || [], // This should only contain selected permissions
        university_id: roleData.university_id,
        is_system_role: roleData.is_system_role,
      },
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

  // Enhanced filtering while preserving original search
  const filteredUsers = useMemo(() => {
    let filtered = rows;
    
    if (searchText) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.employee_id?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active : !user.is_active
      );
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role_id === roleFilter);
    }
    
    return filtered;
  }, [rows, searchText, statusFilter, roleFilter]);

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
                  System Users ({filteredUsers.length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={roleFilter}
                      label="Role"
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      {roles?.map(role => (
                        <MenuItem key={role.role_id} value={role.role_id}>
                          {role.name.replace(/_/g, ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
        <Dialog 
          open={openUserDialog} 
          onClose={() => setOpenUserDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h5" fontWeight={600}>
              {selectedUser ? 'Edit User' : 'Create New User'}
            </Typography>
            <IconButton
              onClick={() => setOpenUserDialog(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs:12, md:6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={userData.first_name}
                  onChange={(e) => setUserData('first_name', e.target.value)}
                  error={!!userErrors.first_name}
                  helperText={userErrors.first_name}
                />
              </Grid>
              <Grid size={{ xs:12, md:6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={userData.last_name}
                  onChange={(e) => setUserData('last_name', e.target.value)}
                  error={!!userErrors.last_name}
                  helperText={userErrors.last_name}
                />
              </Grid>
              <Grid size={{ xs:12, md:6 }}>
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
              <Grid size={{ xs:12, md:6 }}>
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
              <Grid size={{ xs:12 }}>
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
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setOpenUserDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2, minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleUserSubmit}
              disabled={userProcessing}
              sx={{ 
                borderRadius: 2,
                minWidth: 120,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Role Dialog */}
        <Dialog 
          open={openRoleDialog} 
          onClose={() => setOpenRoleDialog(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h5" fontWeight={600}>
              {selectedRole ? 'Edit Role' : 'Create New Role'}
            </Typography>
            <IconButton
              onClick={() => setOpenRoleDialog(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs:12, md:6 }}>
                <TextField
                  fullWidth
                  label="University"
                  value={roleData.university_id}
                  onChange={(e) => setRoleData('university_id', e.target.value)}
                  error={!!roleErrors.university_id}
                  helperText={roleErrors.university_id}
                  select
                >
                  {universities?.map((item) => (
                    <MenuItem key={item.university_id} value={item.university_id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs:12, md:6 }}>
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
              <Grid size={{ xs:12, md:6 }}>
                <TextField
                  fullWidth
                  label="Description"
                  value={roleData.description}
                  onChange={(e) => setRoleData('description', e.target.value)}
                  error={!!roleErrors.description}
                  helperText={roleErrors.description}
                />
              </Grid>
              <Grid size={{ xs:12 }}>
                <PermissionMatrix
                  permissions={allPermissions || []}
                  selectedPermissions={roleData.permissions || []}
                  onPermissionChange={handlePermissionChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setOpenRoleDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2, minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleRoleSubmit}
              disabled={roleProcessing}
              sx={{ 
                borderRadius: 2,
                minWidth: 120,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Permissions Dialog */}
        <RolePermissionsDialog
          key={selectedRole?.role_id || 'role-permissions'}
          open={openPermissionsDialog}
          onClose={() => setOpenPermissionsDialog(false)}
          role={selectedRole}
          permissions={allPermissions || []}
          onSave={handleSavePermissions}
          loading={permissionsProcessing}
        />

        {/* NEW: User Permissions Dialog */}
        <UserPermissionsDialog
          key={selectedUser?.user_id || 'user-permission'}
          open={openUserPermissionsDialog}
          onClose={() => setOpenUserPermissionsDialog(false)}
          user={selectedUser}
          permissions={allPermissions || []}
          onSave={handleSaveUserPermissions}
          loading={userPermissionsProcessing}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={openDeleteDialog} 
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningIcon />
              <Typography variant="h5" fontWeight={600}>
                Confirm Deletion
              </Typography>
            </Box>
            <IconButton
              onClick={() => setOpenDeleteDialog(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2,
                borderRadius: 2,
                background: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
              }}
            >
              Are you sure you want to delete user: <strong>{selectedUser?.full_name}</strong>?
            </Alert>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone. All user data and associations will be permanently removed from the system.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setOpenDeleteDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2, minWidth: 100 }}
            >
              Cancel
            </Button>
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
              sx={{ 
                borderRadius: 2,
                minWidth: 120,
                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
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
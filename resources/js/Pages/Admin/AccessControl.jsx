
// // import React, { useState, useMemo, useEffect } from 'react';
// // import { useForm, usePage, router } from '@inertiajs/react';
// // import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// // import {
// //   Box, Chip, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent,
// //   DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, Card, CardContent,
// //   Grid, IconButton, Switch, FormControlLabel, Avatar, Paper, useTheme, useMediaQuery,
// //   alpha, Tab, Tabs, FormHelperText, Tooltip, Badge, Divider, List, ListItem,
// //   ListItemText, ListItemIcon, Checkbox, ListItemButton, CardHeader,
// //   CircularProgress,
// // } from '@mui/material';
// // import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
// // import {
// //   Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Key as KeyIcon,
// //   Block as BlockIcon, CheckCircle as ActiveIcon, Cancel as InactiveIcon,
// //   AdminPanelSettings as SuperAdminIcon, ManageAccounts as ManagerIcon,
// //   Person as UserIcon, Security as SecurityIcon, Search as SearchIcon,
// //   Visibility as ViewIcon, PersonAdd as PersonAddIcon, FilterList as FilterIcon,
// //   Refresh as RefreshIcon, Download as DownloadIcon, Warning as WarningIcon,
// //   Info as InfoIcon, Shield as ShieldIcon, Close as CloseIcon,
// //   Group as GroupIcon, PermIdentity as PermIdentityIcon, Assignment as AssignmentIcon,
// // } from '@mui/icons-material';
// // import Notification from '@/Components/Notification';

// // Spatie Permission Matrix Component
// const SpatiePermissionMatrix = ({ permissions, selectedPermissions, onPermissionChange, disabled = false, title = "Permissions" }) => {
//   const theme = useTheme();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [expandedGroups, setExpandedGroups] = useState({});

//   // Group permissions by guard name and module
//   const groupedPermissions = useMemo(() => {
//     const groups = {};
    
//     permissions.forEach(permission => {
//       const guard = permission.guard_name || 'web';
//       if (!groups[guard]) groups[guard] = {};
      
//       // Extract module from permission name (e.g., 'users.create' -> 'users')
//       const [module] = permission.name.split('.');
//       const moduleKey = module || 'general';
//       if (!groups[guard][moduleKey]) groups[guard][moduleKey] = [];
      
//       groups[guard][moduleKey].push(permission);
//     });
    
//     return groups;
//   }, [permissions]);

//   const toggleGroup = (guard, module) => {
//     setExpandedGroups(prev => ({
//       ...prev,
//       [`${guard}-${module}`]: !prev[`${guard}-${module}`]
//     }));
//   };

//   const handleSelectAll = (guard, module, modulePermissions, select) => {
//     modulePermissions.forEach(permission => {
//       onPermissionChange(permission.name, select);
//     });
//   };

//   const selectedCount = selectedPermissions.length;
//   const totalCount = permissions.length;

//   return (
//     <Box sx={{ mt: 2 }}>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//         <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
//           {title}
//           <Chip 
//             label={`${selectedCount}/${totalCount} selected`} 
//             size="small" 
//             color="primary" 
//             variant={selectedCount > 0 ? "filled" : "outlined"}
//             sx={{ ml: 2 }}
//           />
//         </Typography>
        
//         <TextField
//           size="small"
//           placeholder="Search permissions..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           sx={{ width: 300 }}
//           InputProps={{
//             startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
//           }}
//         />
//       </Box>

//       {Object.entries(groupedPermissions).map(([guard, modules]) => (
//         <Card key={guard} sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
//           <CardHeader
//             title={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <ShieldIcon color="primary" />
//                 <Typography variant="h6">
//                   {guard.toUpperCase()} Guard
//                 </Typography>
//                 <Chip 
//                   label={`Guard`} 
//                   size="small" 
//                   color="primary" 
//                   variant="outlined"
//                 />
//               </Box>
//             }
//             sx={{ 
//               backgroundColor: alpha(theme.palette.primary.main, 0.02),
//               borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
//             }}
//           />
//           <CardContent>
//             {Object.entries(modules).map(([module, modulePermissions]) => {
//               const groupKey = `${guard}-${module}`;
//               const isExpanded = expandedGroups[groupKey];
              
//               // Filter permissions based on search term
//               const filteredPermissions = modulePermissions.filter(p => 
//                 p.name.toLowerCase().includes(searchTerm.toLowerCase()) 
//               );

//               if (filteredPermissions.length === 0) return null;

//               const selectedCount = filteredPermissions.filter(p => 
//                 selectedPermissions.includes(p.name)
//               ).length;

//               return (
//                 <Card key={module} variant="outlined" sx={{ mb: 2 }}>
//                   <ListItemButton 
//                     onClick={() => toggleGroup(guard, module)}
//                     sx={{ 
//                       backgroundColor: isExpanded ? alpha(theme.palette.primary.main, 0.02) : 'transparent',
//                       borderBottom: isExpanded ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none'
//                     }}
//                   >
//                     <ListItemIcon>
//                       <Checkbox
//                         checked={selectedCount === filteredPermissions.length}
//                         indeterminate={selectedCount > 0 && selectedCount < filteredPermissions.length}
//                         onChange={(e) => handleSelectAll(guard, module, filteredPermissions, e.target.checked)}
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           <Typography variant="subtitle1" fontWeight={600}>
//                             {module.replace(/_/g, ' ').toUpperCase()}
//                           </Typography>
//                           <Chip 
//                             label={`${selectedCount}/${filteredPermissions.length}`} 
//                             size="small" 
//                             color={selectedCount === filteredPermissions.length ? "primary" : "default"}
//                             variant={selectedCount > 0 ? "filled" : "outlined"}
//                           />
//                         </Box>
//                       }
//                       secondary={`${filteredPermissions.length} permissions`}
//                     />
//                     <Typography variant="body2" color="text.secondary">
//                       {isExpanded ? 'Collapse' : 'Expand'}
//                     </Typography>
//                   </ListItemButton>
                  
//                   {isExpanded && (
//                     <List dense sx={{ py: 0 }}>
//                       {filteredPermissions.map((permission) => {
//                         const isChecked = selectedPermissions.includes(permission.name);
//                         const action = permission.name.split('.')[1] || permission.name;

//                         return (
//                           <ListItem 
//                             key={permission.id} 
//                             sx={{ 
//                               py: 0.5,
//                               backgroundColor: isChecked ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
//                               borderLeft: isChecked ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent'
//                             }}
//                           >
//                             <ListItemIcon>
//                               <Checkbox
//                                 checked={isChecked}
//                                 onChange={(e) => onPermissionChange(permission.name, e.target.checked)}
//                                 disabled={disabled}
//                               />
//                             </ListItemIcon>
//                             <ListItemText
//                               primary={
//                                 <Typography variant="body2" fontWeight={500}>
//                                   {action.replace(/_/g, ' ').toUpperCase()}
//                                 </Typography>
//                               }
//                               secondary={
//                                 <Typography variant="caption" color="text.secondary">
//                                   {permission.name}
//                                 </Typography>
//                               }
//                             />
//                           </ListItem>
//                         );
//                       })}
//                     </List>
//                   )}
//                 </Card>
//               );
//             })}
//           </CardContent>
//         </Card>
//       ))}
//     </Box>
//   );
// };

// // UserEditDialog Component - Fixed version
// const UserEditDialog = ({ open, onClose, user, roles, permissions, onSave, loading = false }) => {
//   const theme = useTheme();
//   const [selectedRoles, setSelectedRoles] = useState([]);
//   const [selectedPermissions, setSelectedPermissions] = useState([]);
//   const [userData, setUserData] = useState({
//     name: '',
//     email: '',
//     is_active: true,
//   });

//   useEffect(() => {
//     if (user && open) {
//       setUserData({
//         name: user.name,
//         email: user.email,
//         is_active: user.is_active,
//       });
//       setSelectedRoles(user?.roles?.map(r => r.id) || []);
//       setSelectedPermissions(user?.permissions?.map(p => p.name) || []);
//     }
//   }, [user, open]);

//   const handleSave = () => {
//     onSave(user.id, {
//       ...userData,
//       roles: selectedRoles,
//       permissions: selectedPermissions
//     });
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
//       <DialogTitle>
//         Edit User: {user?.name}
//       </DialogTitle>
//       <DialogContent>
//         <Grid container spacing={3}>
//           {/* User Details */}
//           <Grid item xs={12} md={6}>
//             <Card>
//               <CardHeader title="User Details" />
//               <CardContent>
//                 <TextField
//                   fullWidth
//                   label="Name"
//                   value={userData.name}
//                   onChange={(e) => setUserData({...userData, name: e.target.value})}
//                   margin="normal"
//                 />
//                 <TextField
//                   fullWidth
//                   label="Email"
//                   type="email"
//                   value={userData.email}
//                   onChange={(e) => setUserData({...userData, email: e.target.value})}
//                   margin="normal"
//                 />
//                 <FormControlLabel
//                   control={
//                     <Switch
//                       checked={userData.is_active}
//                       onChange={(e) => setUserData({...userData, is_active: e.target.checked})}
//                     />
//                   }
//                   label="Active User"
//                 />
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* Additional Roles */}
//           <Grid item xs={12} md={6}>
//             <Card>
//               <CardHeader title="Additional Roles" />
//               <CardContent>
//                 <List>
//                   {roles.map(role => (
//                     <ListItem key={role.id} disablePadding> {/* Added disablePadding and proper key */}
//                       <ListItemButton 
//                         onClick={() => {
//                           if (selectedRoles.includes(role.id)) {
//                             setSelectedRoles(selectedRoles.filter(id => id !== role.id));
//                           } else {
//                             setSelectedRoles([...selectedRoles, role.id]);
//                           }
//                         }}
//                         sx={{ borderRadius: 1 }}
//                       >
//                         <ListItemIcon>
//                           <Checkbox
//                             checked={selectedRoles.includes(role.id)}
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 setSelectedRoles([...selectedRoles, role.id]);
//                               } else {
//                                 setSelectedRoles(selectedRoles.filter(id => id !== role.id));
//                               }
//                             }}
//                             onClick={(e) => e.stopPropagation()}
//                           />
//                         </ListItemIcon>
//                         <ListItemText 
//                           primary={role.name}
//                           secondary={`${role.permissions?.length || 0} permissions`}
//                         />
//                       </ListItemButton>
//                     </ListItem>
//                   ))}
//                 </List>
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* Additional Permissions */}
//           <Grid item xs={12}>
//             <Card>
//               <CardHeader 
//                 title="Additional Permissions" 
//                 subheader="These permissions are granted in addition to role permissions"
//               />
//               <CardContent>
//                 <SpatiePermissionMatrix
//                   permissions={permissions}
//                   selectedPermissions={selectedPermissions}
//                   onPermissionChange={(permissionName, checked) => {
//                     if (checked) {
//                       setSelectedPermissions([...selectedPermissions, permissionName]);
//                     } else {
//                       setSelectedPermissions(selectedPermissions.filter(p => p !== permissionName));
//                     }
//                   }}
//                   disabled={loading}
//                 />
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose}>Cancel</Button>
//         <Button onClick={handleSave} variant="contained" disabled={loading}>
//           Save Changes
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// // Role Permissions Dialog
// const RolePermissionsDialog = ({ open, onClose, role, permissions, onSave, loading = false }) => {
//   const theme = useTheme();
//   const [selectedPermissions, setSelectedPermissions] = useState([]);

//   useEffect(() => {
//     if (role && open) {
//       const rolePermissionNames = role.permissions?.map(p => p.name) || [];
//       setSelectedPermissions(rolePermissionNames);
//     }
//   }, [role, open]);

//   const handlePermissionChange = (permissionName, checked) => {
//     setSelectedPermissions(prev =>
//       checked 
//         ? [...prev, permissionName] 
//         : prev.filter(p => p !== permissionName)
//     );
//   };

//   const handleSave = () => {
//     onSave(role.id, selectedPermissions);
//   };

//   return (
//     <Dialog 
//       open={open} 
//       onClose={onClose} 
//       maxWidth="lg" 
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: 3,
//           boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
//           height: '80vh'
//         }
//       }}
//     >
//       <DialogTitle sx={{ 
//         background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
//         color: 'white',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between'
//       }}>
//         <Box>
//           <Typography variant="h5" fontWeight={600}>
//             Manage Role Permissions
//           </Typography>
//           <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
//             {role?.name} - Assign permissions to this role
//           </Typography>
//         </Box>
//         <IconButton onClick={onClose} sx={{ color: 'white' }}>
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>
      
//       <DialogContent sx={{ p: 3 }}>
//         <Alert severity="info" sx={{ mb: 3 }}>
//           Users with this role will inherit all assigned permissions. Permissions are organized by guard and module.
//         </Alert>
        
//         <SpatiePermissionMatrix
//           permissions={permissions}
//           selectedPermissions={selectedPermissions}
//           onPermissionChange={handlePermissionChange}
//           disabled={loading}
//           title={`Permissions for ${role?.name}`}
//         />
//       </DialogContent>
      
//       <DialogActions sx={{ p: 3, gap: 1 }}>
//         <Button onClick={onClose} disabled={loading} variant="outlined">
//           Cancel
//         </Button>
//         <Button 
//           variant="contained" 
//           onClick={handleSave}
//           disabled={loading}
//           startIcon={<SecurityIcon />}
//         >
//           {loading ? 'Saving...' : 'Save Role Permissions'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default function AccessControl({ auth, users = [], roles = [], permissions = [], flash }) {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const { props } = usePage();
  
//   const [searchText, setSearchText] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [openUserDialog, setOpenUserDialog] = useState(false);
//   const [openRoleDialog, setOpenRoleDialog] = useState(false);
//   const [openRolePermissionsDialog, setOpenRolePermissionsDialog] = useState(false);
//   const [openUserEditDialog, setOpenUserEditDialog] = useState(false);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [selectedRole, setSelectedRole] = useState(null);
//   const [activeTab, setActiveTab] = useState(0);
//   const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
//   const [loading, setLoading] = useState(false);

//   // User form
//   const { data: userData, setData: setUserData, post: postUser, put: putUser, processing: userProcessing, errors: userErrors, reset: resetUser } = useForm({
//     name: '',
//     email: '',
//     password: '',
//     password_confirmation: '',
//     is_active: true,
//   });

//   // Role form
//   const { data: roleData, setData: setRoleData, post: postRole, put: putRole, processing: roleProcessing, errors: roleErrors, reset: resetRole } = useForm({
//     name: '',
//     guard_name: 'web',
//   });

//   const showAlert = (message, severity = 'success') => {
//     setAlert({ open: true, message, severity });
//   };

//   // Process users data for Spatie
//   const processedUsers = useMemo(() => {
//     return users.map(user => ({
//       id: user.id,
//       ...user,
//       roles_list: user.roles?.map(r => r.name).join(', ') || 'No Roles',
//       direct_permissions_count: user.permissions?.length || 0,
//       role_permissions_count: user.roles?.flatMap(r => r.permissions || []).length || 0,
//       status: user.is_active ? 'active' : 'inactive',
//     }));
//   }, [users]);

//   // User columns for DataGrid
//   const userColumns = useMemo(() => [
//     { 
//       field: 'user', 
//       headerName: 'User', 
//       width: 200,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
//             {params.row.name?.charAt(0)}
//           </Avatar>
//           <Box>
//             <Typography variant="body2" fontWeight={600}>
//               {params.row.name}
//             </Typography>
//             <Typography variant="caption" color="text.secondary">
//               {params.row.email}
//             </Typography>
//           </Box>
//         </Box>
//       )
//     },
//     { 
//       field: 'roles_list', 
//       headerName: 'Roles', 
//       width: 150,
//       renderCell: (params) => (
//         <Tooltip title={params.row.roles_list}>
//           <Chip 
//             label={params.row.roles_list} 
//             size="small"
//             variant="outlined"
//             color={params.row.roles_list === 'No Roles' ? 'default' : 'primary'}
//           />
//         </Tooltip>
//       )
//     },
//     { 
//       field: 'permissions', 
//       headerName: 'Permissions', 
//       width: 130,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <Badge badgeContent={params.row.role_permissions_count} color="primary">
//             <GroupIcon fontSize="small" color="action" />
//           </Badge>
//           <Badge badgeContent={params.row.direct_permissions_count} color="secondary">
//             <AssignmentIcon fontSize="small" color="action" />
//           </Badge>
//         </Box>
//       )
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
//       field: 'actions',
//       headerName: 'Actions',
//       width: 150,
//       type: 'actions',
//       getActions: (params) => [
//         <GridActionsCellItem
//           icon={<Tooltip title="Edit User with Roles & Permissions"><EditIcon /></Tooltip>}
//           label="Edit"
//           onClick={() => handleEditUser(params.row)}
//         />,
//         <GridActionsCellItem
//           icon={<Tooltip title="Delete User and All Permissions"><DeleteIcon /></Tooltip>}
//           label="Delete"
//           onClick={() => handleDeleteUser(params.row)}
//           color="error"
//         />,
//       ],
//     },
//   ], []);

//   // Role columns for DataGrid
//   const roleColumns = useMemo(() => [
//     { 
//       field: 'name', 
//       headerName: 'Role Name', 
//       width: 150,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <GroupIcon color="primary" />
//           <Typography variant="body2" fontWeight={600}>
//             {params.row.name}
//           </Typography>
//         </Box>
//       )
//     },
//     { 
//       field: 'guard_name', 
//       headerName: 'Guard', 
//       width: 100,
//       renderCell: (params) => (
//         <Chip label={params.row.guard_name} size="small" variant="outlined" />
//       )
//     },
//     { 
//       field: 'permissions_count', 
//       headerName: 'Permissions', 
//       width: 120,
//       renderCell: (params) => (
//         <Chip 
//           label={params.row.permissions?.length || 0}
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
//         <Typography variant="body2" fontWeight={600}>
//           {params.row.users_count || 0}
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
//           label="Edit"
//           onClick={() => handleEditRole(params.row)}
//           disabled={['Super Admin', 'Administrator'].includes(params.row.name)}
//         />,
//         <GridActionsCellItem
//           icon={<SecurityIcon />}
//           label="Permissions"
//           onClick={() => handleManageRolePermissions(params.row)}
//         />,
//         <GridActionsCellItem
//           icon={<DeleteIcon />}
//           label="Delete"
//           onClick={() => handleDeleteRole(params.row)}
//           color="error"
//           disabled={['Super Admin', 'Administrator'].includes(params.row.name) || params.row.users_count > 0}
//         />,
//       ],
//     },
//   ], []);

//   // Event handlers
//   const handleCreateUser = () => {
//     setSelectedUser(null);
//     resetUser();
//     setOpenUserDialog(true);
//   };

//   const handleEditUser = (user) => {
//     setSelectedUser(user);
//     setOpenUserEditDialog(true);
//   };

//   const handleDeleteUser = (user) => {
//     setSelectedUser(user);
//     setOpenDeleteDialog(true);
//   };

//   const handleCreateRole = () => {
//     setSelectedRole(null);
//     resetRole();
//     setOpenRoleDialog(true);
//   };

//   const handleEditRole = (role) => {
//     setSelectedRole(role);
//     setRoleData({
//       name: role.name,
//       guard_name: role.guard_name,
//     });
//     setOpenRoleDialog(true);
//   };

//   const handleManageRolePermissions = (role) => {
//     setSelectedRole(role);
//     setOpenRolePermissionsDialog(true);
//   };


//   // API Handlers// In handleSaveUser
// const handleSaveUser = async (userId, data) => {

//   console.log('Saving user data:', { userId, data });
  
//   setLoading(true);
//   try {
//     await router.put(route('admin.users.sync-roles-permissions', { user: userId }), data);
//     setOpenUserEditDialog(false);
//     showAlert('User updated successfully with roles and permissions');
//   } catch (error) {
//     console.error('Error updating user:', error);
//     showAlert('Failed to update user', 'error');
//   } finally {
//     setLoading(false);
//   }
// };

// // In handleSaveRolePermissions
// const handleSaveRolePermissions = async (roleId, selectedPermissions) => {
//   setLoading(true);
//   try {
//     await router.put(route('admin.roles.sync-permissions', { role: roleId }), {
//       permissions: selectedPermissions
//     });
//     setOpenRolePermissionsDialog(false);
//     showAlert('Role permissions updated successfully');
//   } catch (error) {
//     console.error('Error updating role permissions:', error);
//     showAlert('Failed to update role permissions', 'error');
//   } finally {
//     setLoading(false);
//   }
// };

// // In handleUserSubmit
// const handleUserSubmit = () => {
//   const routeMethod = selectedUser ? putUser : postUser;
//   const routeName = selectedUser ? 'admin.users.update' : 'admin.users.store';

//   const submitData = { ...userData };
  
//   routeMethod(route(routeName, selectedUser ? { user: selectedUser.id } : undefined), submitData, {
//     onSuccess: () => {
//       setOpenUserDialog(false);
//       resetUser();
//       showAlert(selectedUser ? 'User updated successfully' : 'User created successfully');
//     },
//     onError: (errors) => {
//       console.error('User form errors:', errors);
//       showAlert('Failed to save user', 'error');
//     },
//   });
// };

// // In handleRoleSubmit
// const handleRoleSubmit = () => {
//   const routeMethod = selectedRole ? putRole : postRole;
//   const routeName = selectedRole ? 'admin.roles.update' : 'admin.roles.store';

//   routeMethod(route(routeName, selectedRole ? { role: selectedRole.id } : undefined), roleData, {
//     onSuccess: () => {
//       setOpenRoleDialog(false);
//       resetRole();
//       showAlert(selectedRole ? 'Role updated successfully' : 'Role created successfully');
//     },
//     onError: (errors) => {
//       console.error('Role form errors:', errors);
//       showAlert('Failed to save role', 'error');
//     },
//   });
// };

// // In handleConfirmDelete
// const handleConfirmDelete = () => {
//   if (!selectedUser?.id) {
//     showAlert('No user selected for deletion', 'error');
//     return;
//   }

//   router.delete(route('admin.users.destroy', { user: selectedUser.id }), {
//     onSuccess: () => {
//       setOpenDeleteDialog(false);
//       setSelectedUser(null);
//       showAlert('User deleted successfully along with all permissions');
//     },
//     onError: (errors) => {
//       console.error('Delete user error:', errors);
//       showAlert('Failed to delete user', 'error');
//     },
//   });
// };

// // In handleDeleteRole
// const handleDeleteRole = (role) => {
//   if (role.users_count > 0) {
//     showAlert('Cannot delete role that has users assigned', 'error');
//     return;
//   }
  
//   if (['Super Admin', 'Administrator'].includes(role.name)) {
//     showAlert('System roles cannot be deleted', 'error');
//     return;
//   }

//   router.delete(route('admin.roles.destroy', { role: role.id }), {
//     onSuccess: () => showAlert('Role deleted successfully'),
//     onError: () => showAlert('Failed to delete role', 'error'),
//   });
// };






// // In handleDeleteRole
// // const handleDeleteRole = (role) => {
// //   if (role.users_count > 0) {
// //     showAlert('Cannot delete role that has users assigned', 'error');
// //     return;
// //   }
  
// //   if (['Super Admin', 'Administrator'].includes(role.name)) {
// //     showAlert('System roles cannot be deleted', 'error');
// //     return;
// //   }

// //   router.delete(route('admin.roles.destroy', { role: role.id }), {
// //     onSuccess: () => showAlert('Role deleted successfully'),
// //     onError: () => showAlert('Failed to delete role', 'error'),
// //   });
// // };

// //   const handleSaveUser = async (userId, data) => {
// //     setLoading(true);
// //     try {
// //        router.put(route('admin.users.sync-roles-permissions', userId), data);
// //       setOpenUserEditDialog(false);
// //       showAlert('User updated successfully with roles and permissions');
// //     } catch (error) {
// //         console.log(error)
// //       showAlert('Failed to update user', 'error');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleConfirmDelete = () => {
// //     router.delete(route('admin.users.destroy', selectedUser?.id), {
// //       onSuccess: () => {
// //         setOpenDeleteDialog(false);
// //         showAlert('User deleted successfully along with all permissions');
// //       },
// //       onError: () => showAlert('Failed to delete user', 'error'),
// //     });
// //   };

// //   const handleUserSubmit = () => {
// //     const routeMethod = selectedUser ? putUser : postUser;
// //     const routeName = selectedUser ? 'admin.users.update' : 'admin.users.store';

// //     routeMethod(route(routeName, selectedUser?.id), userData, {
// //       onSuccess: () => {
// //         setOpenUserDialog(false);
// //         showAlert(selectedUser ? 'User updated successfully' : 'User created successfully');
// //       },
// //       onError: () => showAlert('Failed to save user', 'error'),
// //     });
// //   };

// //   const handleRoleSubmit = () => {
// //     const routeMethod = selectedRole ? putRole : postRole;
// //     const routeName = selectedRole ? 'admin.roles.update' : 'admin.roles.store';

// //     routeMethod(route(routeName, selectedRole?.id), roleData, {
// //       onSuccess: () => {
// //         setOpenRoleDialog(false);
// //         showAlert(selectedRole ? 'Role updated successfully' : 'Role created successfully');
// //       },
// //       onError: () => showAlert('Failed to save role', 'error'),
// //     });
// //   };

//   // Filter users
//   const filteredUsers = useMemo(() => {
//     let filtered = processedUsers;
    
//     if (searchText) {
//       filtered = filtered.filter(user => 
//         user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
//         user.email?.toLowerCase().includes(searchText.toLowerCase())
//       );
//     }
    
//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(user => 
//         statusFilter === 'active' ? user.is_active : !user.is_active
//       );
//     }
    
//     return filtered;
//   }, [processedUsers, searchText, statusFilter]);

//   // Handle flash messages
//   useEffect(() => {
//     if (props.flash?.success) {
//       showAlert(props.flash.success, "success");
//     }
//     if (props.flash?.error) {
//       showAlert(props.flash.error, "error");
//     }
//   }, [props.flash]);

//   const handleCloseAlert = () => {
//     setAlert((prev) => ({ ...prev, open: false }));
//   };

//   return (
//     <AuthenticatedLayout
//       auth={auth}
//       title="Access Control"
//       breadcrumbs={[
//         { label: 'Dashboard', href: '/dashboard' },
//         { label: 'Admin', href: '/admin' },
//         { label: 'Access Control' }
//       ]}
//     >
//       <Box>
//         {/* Header */}
//         <Box sx={{ mb: 4 }}>
//           <Typography variant="h4" fontWeight={800} gutterBottom>
//             Access Control
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             Manage users, roles, and permissions using Spatie Laravel Permission
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
//             <Tab icon={<GroupIcon />} label={`Roles (${roles?.length || 0})`} />
//             <Tab icon={<ShieldIcon />} label={`Permissions (${permissions?.length || 0})`} />
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
//                   <Button 
//                     variant="contained" 
//                     startIcon={<PersonAddIcon />}
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
//               getRowId={(row) => row.id || `user-${row.email}`}
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
//               rows={roles}
//               columns={roleColumns}
//               getRowId={(row) => row.id || `role-${row.name}`}
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

//         {/* Permissions Tab */}
//         {activeTab === 2 && (
//           <Paper sx={{ borderRadius: 3, p: 3 }}>
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 System Permissions
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 {permissions?.length || 0} permissions available across all guards
//               </Typography>
//             </Box>

//             <SpatiePermissionMatrix
//               permissions={permissions}
//               selectedPermissions={[]}
//               onPermissionChange={() => {}}
//               disabled={true}
//             />
//           </Paper>
//         )}

//         {/* User Dialog */}
//         <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
//           <DialogTitle>
//             {selectedUser ? 'Edit User' : 'Create New User'}
//           </DialogTitle>
//           <DialogContent>
//             <Grid container spacing={2} sx={{ mt: 1 }}>
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Full Name"
//                   value={userData.name}
//                   onChange={(e) => setUserData('name', e.target.value)}
//                   error={!!userErrors.name}
//                   helperText={userErrors.name}
//                 />
//               </Grid>
//               <Grid item xs={12}>
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
//               {!selectedUser && (
//                 <>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       fullWidth
//                       label="Password"
//                       type="password"
//                       value={userData.password}
//                       onChange={(e) => setUserData('password', e.target.value)}
//                       error={!!userErrors.password}
//                       helperText={userErrors.password}
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       fullWidth
//                       label="Confirm Password"
//                       type="password"
//                       value={userData.password_confirmation}
//                       onChange={(e) => setUserData('password_confirmation', e.target.value)}
//                       error={!!userErrors.password_confirmation}
//                       helperText={userErrors.password_confirmation}
//                     />
//                   </Grid>
//                 </>
//               )}
//               <Grid item xs={12}>
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
//             <Button onClick={handleUserSubmit} variant="contained" disabled={userProcessing}>
//               {selectedUser ? 'Update User' : 'Create User'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Role Dialog */}
//         <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="sm" fullWidth>
//           <DialogTitle>
//             {selectedRole ? 'Edit Role' : 'Create New Role'}
//           </DialogTitle>
//           <DialogContent>
//             <Grid container spacing={2} sx={{ mt: 1 }}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Role Name"
//                   value={roleData.name}
//                   onChange={(e) => setRoleData('name', e.target.value)}
//                   error={!!roleErrors.name}
//                   helperText={roleErrors.name}
//                   placeholder="e.g., admin, manager"
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Guard Name"
//                   value={roleData.guard_name}
//                   onChange={(e) => setRoleData('guard_name', e.target.value)}
//                   error={!!roleErrors.guard_name}
//                   helperText={roleErrors.guard_name}
//                   disabled={!!selectedRole}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
//             <Button onClick={handleRoleSubmit} variant="contained" disabled={roleProcessing}>
//               {selectedRole ? 'Update Role' : 'Create Role'}
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Role Permissions Dialog */}
//         <RolePermissionsDialog
//           open={openRolePermissionsDialog}
//           onClose={() => setOpenRolePermissionsDialog(false)}
//           role={selectedRole}
//           permissions={permissions}
//           onSave={handleSaveRolePermissions}
//           loading={loading}
//         />

//         {/* User Edit Dialog */}
//         <UserEditDialog
//           open={openUserEditDialog}
//           onClose={() => setOpenUserEditDialog(false)}
//           user={selectedUser}
//           roles={roles}
//           permissions={permissions}
//           onSave={handleSaveUser}
//           loading={loading}
//         />

//         {/* Delete Confirmation Dialog */}
//         <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
//           <DialogTitle>
//             Confirm User Deletion
//           </DialogTitle>
//           <DialogContent>
//             <Alert severity="warning" sx={{ mb: 2 }}>
//               Are you sure you want to delete user: <strong>{selectedUser?.name}</strong>?
//             </Alert>
//             <Typography variant="body2" color="text.secondary">
//               This will permanently delete the user and all their assigned roles and permissions.
//               This action cannot be undone.
//             </Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
//             <Button onClick={handleConfirmDelete} variant="contained" color="error">
//               Delete User & All Permissions
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </AuthenticatedLayout>
//   );
// }

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
  Folder,
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

  // Role Management
  const handleCreateRole = () => {
    setLoading(true);
    roleForm.post(route('roles.store'), {
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
    roleForm.put(route('roles.update', roleModal.role.id), {
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
      router.delete(route('roles.destroy', role.id), {
        onSuccess: () => {
          setNotification({ open: true, message: 'Role deleted successfully!', severity: 'success' });
        },
      });
    }
  };

  // Permission Management
  const handleCreatePermission = () => {
    setLoading(true);
    permissionForm.post(route('permissions.store'), {
      onSuccess: () => {
        setNotification({ open: true, message: 'Permission created successfully!', severity: 'success' });
        setPermissionModal({ open: false, mode: 'create', permission: null });
        permissionForm.reset();
      },
      onFinish: () => setLoading(false),
    });
  };

  // User Role Assignment
  const handleAssignUserRoles = () => {
    setLoading(true);
    userRoleForm.put(route('users.roles.update', userRoleModal.user.id), {
      onSuccess: () => {
        setNotification({ open: true, message: 'User roles updated successfully!', severity: 'success' });
        setUserRoleModal({ open: false, user: null });
        userRoleForm.reset();
      },
      onFinish: () => setLoading(false),
    });
  };

  // User Permission Assignment
  const handleAssignUserPermissions = () => {
    setLoading(true);
    userPermissionForm.put(route('users.permissions.update', userPermissionModal.user.id), {
      onSuccess: () => {
        setNotification({ open: true, message: 'User permissions updated successfully!', severity: 'success' });
        setUserPermissionModal({ open: false, user: null });
        userPermissionForm.reset();
      },
      onFinish: () => setLoading(false),
    });
  };

  // DataGrid Columns
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
          label={params.row.permissions_count} 
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
          label={params.row.users_count} 
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
        <Chip label={params.row.roles_count} size="small" variant="outlined" />
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

  const userColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
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
              {params.row.name}
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
              key={index}
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
              roles: params.row.roles?.map(r => r.name) || []
            });
          }}
        />,
        <GridActionsCellItem
          icon={<ShieldIcon />}
          label="Manage Permissions"
          onClick={() => {
            setUserPermissionModal({ open: true, user: params.row });
            userPermissionForm.setData({
              permissions: params.row.permissions?.map(p => p.name) || []
            });
          }}
        />,
      ],
    },
  ];

  // Group permissions by module
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
              />
            </CardContent>
          </Card>
        )}

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
              />
            </CardContent>
          </Card>
        )}

        {/* System Overview Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="System Statistics" />
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Roles:</Typography>
                      <Chip label={roles.length} color="primary" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Permissions:</Typography>
                      <Chip label={permissions.length} color="secondary" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Users:</Typography>
                      <Chip label={users.length} color="info" />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Permission Modules" />
                <CardContent>
                  <List dense>
                    {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                      <ListItem key={module}>
                        <ListItemIcon>
                          <Badge badgeContent={modulePermissions.length} color="primary">
                            <Folder />
                          </Badge>
                        </ListItemIcon>
                        <ListItemText
                          primary={module.charAt(0).toUpperCase() + module.slice(1)}
                          secondary={`${modulePermissions.length} permissions`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
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
          {roleModal.mode === 'create' ? 'Create New Role' : 'Edit Role'}
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
            />

            <FormControl fullWidth>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={roleForm.data.permissions}
                onChange={(e) => roleForm.setData('permissions', e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={permissions.find(p => p.id === value)?.name} size="small" />
                    ))}
                  </Box>
                )}
              >
                {permissions.map((permission) => (
                  <MenuItem key={permission.id} value={permission.id}>
                    <Checkbox checked={roleForm.data.permissions.indexOf(permission.id) > -1} />
                    <ListItemText 
                      primary={permission.name}
                      secondary={permission.description}
                    />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select permissions for this role</FormHelperText>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleModal({ open: false, mode: 'create', role: null })}>
            Cancel
          </Button>
          <Button 
            onClick={roleModal.mode === 'create' ? handleCreateRole : handleUpdateRole}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (roleModal.mode === 'create' ? 'Create' : 'Update')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Role Assignment Modal */}
      <Dialog 
        open={userRoleModal.open} 
        onClose={() => setUserRoleModal({ open: false, user: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Roles to {userRoleModal.user?.name}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Roles</InputLabel>
            <Select
              multiple
              value={userRoleForm.data.roles}
              onChange={(e) => userRoleForm.setData('roles', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.name}>
                  <Checkbox checked={userRoleForm.data.roles.indexOf(role.name) > -1} />
                  <ListItemText primary={role.name} />
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
      <Dialog 
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
            Direct permissions override role-based permissions
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Permissions</InputLabel>
            <Select
              multiple
              value={userPermissionForm.data.permissions}
              onChange={(e) => userPermissionForm.setData('permissions', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {permissions.map((permission) => (
                <MenuItem key={permission.id} value={permission.name}>
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
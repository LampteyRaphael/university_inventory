// // import React, { useState, useMemo, useEffect } from 'react';
// // import { useForm, usePage } from '@inertiajs/react';
// // import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// // import {
// //   Box, Chip, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent,
// //   DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, Card, CardContent,
// //   Grid, IconButton, Switch, FormControlLabel, Avatar, Paper, useTheme, useMediaQuery,
// //   alpha, Tab, Tabs, FormHelperText, Tooltip, Badge, Divider,
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
// // } from '@mui/icons-material';
// // import Notification from '@/Components/Notification';

// // // Enhanced PermissionMatrix with search and filtering
// // const PermissionMatrix = ({ permissions, selectedPermissions, onPermissionChange, disabled = false, showSystemPermissions = true }) => {
// //   const theme = useTheme();
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [filterModule, setFilterModule] = useState('all');

// //   const groupedPermissions = useMemo(() => {
// //     const groups = {};
// //     permissions.forEach(permission => {
// //       const [module] = permission.name.split('.');
// //       if (!groups[module]) groups[module] = [];
      
// //       // Filter permissions based on search and module filter
// //       const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //                            permission.description?.toLowerCase().includes(searchTerm.toLowerCase());
// //       const matchesModule = filterModule === 'all' || module === filterModule;
      
// //       if (matchesSearch && matchesModule && (showSystemPermissions || !permission.is_system_permission)) {
// //         groups[module].push(permission);
// //       }
// //     });
// //     return groups;
// //   }, [permissions, searchTerm, filterModule, showSystemPermissions]);

// //   const modules = useMemo(() => {
// //     const uniqueModules = [...new Set(permissions.map(p => p.name.split('.')[0]))];
// //     return uniqueModules.sort();
// //   }, [permissions]);

// //   const selectedCount = selectedPermissions.length;
// //   const totalCount = permissions.length;

// //   return (
// //     <Box sx={{ mt: 2 }}>
// //       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
// //         <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
// //           Permission Matrix 
// //           <Chip 
// //             label={`${selectedCount}/${totalCount} selected`} 
// //             size="small" 
// //             color="primary" 
// //             variant={selectedCount > 0 ? "filled" : "outlined"}
// //             sx={{ ml: 2 }}
// //           />
// //         </Typography>
        
// //         <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
// //           <TextField
// //             size="small"
// //             placeholder="Search permissions..."
// //             value={searchTerm}
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //             sx={{ width: 200 }}
// //             InputProps={{
// //               startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
// //             }}
// //           />
// //           <FormControl size="small" sx={{ minWidth: 120 }}>
// //             <InputLabel>Module</InputLabel>
// //             <Select
// //               value={filterModule}
// //               label="Module"
// //               onChange={(e) => setFilterModule(e.target.value)}
// //             >
// //               <MenuItem value="all">All Modules</MenuItem>
// //               {modules.map(module => (
// //                 <MenuItem key={module} value={module}>
// //                   {module.replace(/_/g, ' ').toUpperCase()}
// //                 </MenuItem>
// //               ))}
// //             </Select>
// //           </FormControl>
// //         </Stack>
// //       </Box>

// //       <Grid container spacing={2}>
// //         {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
// //           <Grid size={{ xs:12, md:6 }} key={module}>
// //             <Card 
// //               variant="outlined" 
// //               sx={{ 
// //                 p: 2, 
// //                 height: '100%',
// //                 border: selectedPermissions.some(p => p.startsWith(module)) ? 
// //                   `2px solid ${theme.palette.primary.main}` : 
// //                   undefined
// //               }}
// //             >
// //               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
// //                 <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
// //                   {module.replace(/_/g, ' ').toUpperCase()}
// //                 </Typography>
// //                 <Chip 
// //                   label={`${modulePermissions.length}`} 
// //                   size="small" 
// //                   variant="outlined"
// //                 />
// //               </Box>
              
// //               <Stack spacing={1}>
// //                 {modulePermissions.map(permission => {
// //                   const isSystemPermission = permission.is_system_permission;
// //                   const isChecked = selectedPermissions.includes(permission.name);

// //                   return (
// //                     <Card 
// //                       key={permission.id || permission.permission_id}
// //                       variant="outlined"
// //                       sx={{ 
// //                         p: 1,
// //                         borderColor: isChecked ? 'primary.main' : 'divider',
// //                         backgroundColor: isChecked ? alpha(theme.palette.primary.main, 0.04) : 'background.paper'
// //                       }}
// //                     >
// //                       <FormControlLabel
// //                         control={
// //                           <Tooltip title={isChecked ? 'Revoke permission' : 'Grant permission'}>
// //                             <Switch
// //                               checked={isChecked}
// //                               onChange={(e) => onPermissionChange(permission.name, e.target.checked)}
// //                               size="small"
// //                               disabled={disabled}
// //                               color="primary"
// //                             />
// //                           </Tooltip>
// //                         }
// //                         label={
// //                           <Box sx={{ ml: 1 }}>
// //                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
// //                               <Typography variant="body2" fontWeight={600}>
// //                                 {permission.name.split('.')[1]?.replace(/_/g, ' ') || permission.name.replace(/_/g, ' ')}
// //                               </Typography>
// //                               {isSystemPermission && (
// //                                 <Tooltip title="System permission">
// //                                   <ShieldIcon fontSize="small" color="warning" sx={{ ml: 1 }} />
// //                                 </Tooltip>
// //                               )}
// //                             </Box>
// //                             <Typography variant="caption" color="text.secondary">
// //                               {permission.description || permission.name}
// //                             </Typography>
// //                           </Box>
// //                         }
// //                         sx={{ width: '100%', m: 0 }}
// //                       />
// //                     </Card>
// //                   );
// //                 })}
// //               </Stack>
// //             </Card>
// //           </Grid>
// //         ))}
// //       </Grid>
      
// //       {Object.keys(groupedPermissions).length === 0 && (
// //         <Box sx={{ textAlign: 'center', py: 4 }}>
// //           <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
// //           <Typography variant="body1" color="text.secondary">
// //             No permissions found matching your criteria
// //           </Typography>
// //         </Box>
// //       )}
// //     </Box>
// //   );
// // };

// // // Enhanced RolePermissionsDialog with modern design
// // const RolePermissionsDialog = ({ open, onClose, role, permissions, onSave, loading = false }) => {
// //   const theme = useTheme();
// //   const [selectedPermissions, setSelectedPermissions] = useState([]);

// //   React.useEffect(() => {
// //     if (role && open) {
// //       const rolePermissionNames = role.permissions?.map(p => p.name) || [];
// //       setSelectedPermissions(rolePermissionNames);
// //     }
// //   }, [role, open]);

// //   const handlePermissionChange = (permissionName, checked) => {
// //     setSelectedPermissions(prev =>
// //       checked 
// //         ? [...prev, permissionName] 
// //         : prev.filter(p => p !== permissionName)
// //     );
// //   };

// //   const handleSave = () => {
// //     onSave(role.id, selectedPermissions);
// //   };

// //   return (
// //     <Dialog 
// //       open={open} 
// //       onClose={onClose} 
// //       maxWidth="xl" 
// //       fullWidth
// //       PaperProps={{
// //         sx: {
// //           borderRadius: 3,
// //           boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
// //         }
// //       }}
// //     >
// //       <DialogTitle sx={{ 
// //         background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
// //         color: 'white',
// //         display: 'flex',
// //         alignItems: 'center',
// //         justifyContent: 'space-between'
// //       }}>
// //         <Box>
// //           <Typography variant="h5" fontWeight={600}>
// //             Manage Permissions: {role?.name}
// //           </Typography>
// //           {role?.description && (
// //             <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
// //               {role.description}
// //             </Typography>
// //           )}
// //         </Box>
// //         <IconButton
// //           onClick={onClose}
// //           sx={{ color: 'white' }}
// //         >
// //           <CloseIcon />
// //         </IconButton>
// //       </DialogTitle>
// //       <DialogContent sx={{ p: 3 }}>
// //         <PermissionMatrix
// //           permissions={permissions}
// //           selectedPermissions={selectedPermissions}
// //           onPermissionChange={handlePermissionChange}
// //           disabled={loading}
// //         />
// //       </DialogContent>
// //       <DialogActions sx={{ p: 3, gap: 1 }}>
// //         <Button 
// //           onClick={onClose} 
// //           disabled={loading}
// //           variant="outlined"
// //           sx={{ borderRadius: 2, minWidth: 100 }}
// //         >
// //           Cancel
// //         </Button>
// //         <Button 
// //           variant="contained" 
// //           onClick={handleSave}
// //           disabled={loading}
// //           sx={{ 
// //             borderRadius: 2,
// //             minWidth: 120,
// //             background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
// //           }}
// //         >
// //           {loading ? 'Saving...' : 'Save Permissions'}
// //         </Button>
// //       </DialogActions>
// //     </Dialog>
// //   );
// // };

// // // User Permissions Dialog for individual permissions
// // const UserPermissionsDialog = ({ open, onClose, user, permissions, onSave, loading = false }) => {
// //   const theme = useTheme();
// //   const [selectedPermissions, setSelectedPermissions] = useState([]);

// //   React.useEffect(() => {
// //     if (user && open) {
// //       const userPermissionNames = user.permissions?.map(p => p.name) || [];
// //       setSelectedPermissions(userPermissionNames);
// //     }
// //   }, [user, open]);

// //   const handlePermissionChange = (permissionName, checked) => {
// //     setSelectedPermissions(prev =>
// //       checked 
// //         ? [...prev, permissionName] 
// //         : prev.filter(p => p !== permissionName)
// //     );
// //   };

// //   const handleSave = () => {
// //     onSave(user.id, selectedPermissions);
// //   };

// //   const rolePermissions = user?.roles?.[0]?.permissions?.map(p => p.name) || [];

// //   return (
// //     <Dialog 
// //       open={open} 
// //       onClose={onClose} 
// //       maxWidth="xl" 
// //       fullWidth
// //       PaperProps={{
// //         sx: {
// //           borderRadius: 3,
// //           boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
// //         }
// //       }}
// //     >
// //       <DialogTitle sx={{ 
// //         background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
// //         color: 'white',
// //         display: 'flex',
// //         alignItems: 'center',
// //         justifyContent: 'space-between'
// //       }}>
// //         <Box>
// //           <Typography variant="h5" fontWeight={600}>
// //             Direct Permissions: {user?.name}
// //           </Typography>
// //           <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
// //             Grant additional permissions beyond role-based access
// //           </Typography>
// //         </Box>
// //         <IconButton
// //           onClick={onClose}
// //           sx={{ color: 'white' }}
// //         >
// //           <CloseIcon />
// //         </IconButton>
// //       </DialogTitle>
// //       <DialogContent sx={{ p: 3 }}>
// //         <Alert 
// //           severity="info" 
// //           sx={{ 
// //             mb: 3,
// //             borderRadius: 2,
// //             background: alpha(theme.palette.info.main, 0.05),
// //             border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
// //           }}
// //         >
// //           These permissions are granted individually to this user, in addition to their role permissions.
// //         </Alert>
// //         <PermissionMatrix
// //           permissions={permissions}
// //           selectedPermissions={selectedPermissions}
// //           onPermissionChange={handlePermissionChange}
// //           disabled={loading}
// //           showSystemPermissions={false}
// //         />
        
// //         {rolePermissions.length > 0 && (
// //           <Card 
// //             variant="outlined" 
// //             sx={{ 
// //               mt: 3, 
// //               p: 2, 
// //               background: alpha(theme.palette.primary.main, 0.02),
// //               border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
// //               borderRadius: 2
// //             }}
// //           >
// //             <Typography variant="subtitle2" gutterBottom color="text.secondary" fontWeight={600}>
// //               Role Permissions (from {user?.roles?.[0]?.name}):
// //             </Typography>
// //             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
// //               {rolePermissions.slice(0, 10).map(permission => (
// //                 <Chip
// //                   key={permission}
// //                   label={permission.split('.')[1] || permission}
// //                   size="small"
// //                   variant="outlined"
// //                   sx={{ 
// //                     background: alpha(theme.palette.primary.main, 0.1),
// //                     border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
// //                   }}
// //                 />
// //               ))}
// //               {rolePermissions.length > 10 && (
// //                 <Chip
// //                   label={`+${rolePermissions.length - 10} more`}
// //                   size="small"
// //                   variant="outlined"
// //                 />
// //               )}
// //             </Box>
// //           </Card>
// //         )}
// //       </DialogContent>
// //       <DialogActions sx={{ p: 3, gap: 1 }}>
// //         <Button 
// //           onClick={onClose} 
// //           disabled={loading}
// //           variant="outlined"
// //           sx={{ borderRadius: 2, minWidth: 100 }}
// //         >
// //           Cancel
// //         </Button>
// //         <Button 
// //           variant="contained" 
// //           onClick={handleSave}
// //           disabled={loading}
// //           sx={{ 
// //             borderRadius: 2,
// //             minWidth: 120,
// //             background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
// //           }}
// //         >
// //           {loading ? 'Saving...' : 'Save Permissions'}
// //         </Button>
// //       </DialogActions>
// //     </Dialog>
// //   );
// // };

// // export default function UserManagement({ auth, users, roles, universities, departments, permissions: allPermissions }) {
// //   const theme = useTheme();
// //   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
// //   const { flash } = usePage().props;
  
// //   const [rows, setRows] = useState([]);
// //   const [searchText, setSearchText] = useState('');
// //   const [statusFilter, setStatusFilter] = useState('all');
// //   const [roleFilter, setRoleFilter] = useState('all');
// //   const [openUserDialog, setOpenUserDialog] = useState(false);
// //   const [openRoleDialog, setOpenRoleDialog] = useState(false);
// //   const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
// //   const [openUserPermissionsDialog, setOpenUserPermissionsDialog] = useState(false);
// //   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
// //   const [selectedUser, setSelectedUser] = useState(null);
// //   const [selectedRole, setSelectedRole] = useState(null);
// //   const [activeTab, setActiveTab] = useState(0);
// //   const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

// //   // User form
// //   const { data: userData, setData: setUserData, post: postUser, put: putUser, delete: deleteUser, processing: userProcessing, errors: userErrors, reset: resetUser } = useForm({
// //     id: '',
// //     university_id: '',
// //     department_id: '',
// //     name: '',
// //     email: '',
// //     phone: '',
// //     role_id: '',
// //     position: '',
// //     is_active: true,
// //     employee_id: '',
// //     username: '',
// //     password: '',
// //     password_confirmation: '',
// //   });

// //   // Role form
// //   const { data: roleData, setData: setRoleData, post: postRole, put: putRole, delete: deleteRole, processing: roleProcessing, errors: roleErrors, reset: resetRole } = useForm({
// //     id: '',
// //     name: '',
// //     description: '',
// //     permissions: [],
// //     guard_name: 'web',
// //   });

// //   // Permissions forms
// //   const { post: postPermissions, processing: permissionsProcessing } = useForm();
// //   const { post: postUserPermissions, processing: userPermissionsProcessing } = useForm();

// //   const showAlert = (message, severity = 'success') => {
// //     setAlert({ open: true, message, severity });
// //   };

// //   // Process users data for Spatie
// // // Process users data - COMPLETE FIXED VERSION
// // React.useEffect(() => {
// //   const processedUsers = (users || []).map(user => ({
// //     id: user.user_id, // This is crucial for DataGrid
// //     user_id: user.user_id,
// //     university_id: user.university_id,
// //     department_id: user.department_id,
// //     role_id: user.role_id,
// //     employee_id: user.employee_id,
// //     username: user.username,
// //     email: user.email,
// //     name: user.name,
// //     first_name: user.first_name,
// //     last_name: user.last_name,
// //     phone: user.phone,
// //     position: user.position,
// //     is_active: user.is_active,
// //     last_login_at: user.last_login_at,
// //     role: user.role,
// //     university: user.university,
// //     department: user.department,
// //     full_name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name,
// //     last_login: user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never',
// //     status: user.is_active ? 'active' : 'inactive',
// //     has_direct_permissions: user.permissions?.length > 0,
// //     role_name: user.roles?.[0]?.name || 'No Role',
// //   }));
// //   setRows(processedUsers);
// // }, [users]);

// //   // User columns for DataGrid - Updated for Spatie
// //   const userColumns = useMemo(() => [
// //     { 
// //       field: 'user', 
// //       headerName: 'User', 
// //       width: 200,
// //       renderCell: (params) => (
// //         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
// //           <Badge
// //             overlap="circular"
// //             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
// //             badgeContent={
// //               params.row.has_direct_permissions ? (
// //                 <Tooltip title="Has direct permissions">
// //                   <ShieldIcon sx={{ fontSize: 16, color: 'warning.main' }} />
// //                 </Tooltip>
// //               ) : null
// //             }
// //           >
// //             <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
// //               {params.row.name?.charAt(0)}
// //             </Avatar>
// //           </Badge>
// //           <Box>
// //             <Typography variant="body2" fontWeight={600}>
// //               {params.row.name}
// //             </Typography>
// //             <Typography variant="caption" color="text.secondary">
// //               {params.row.email}
// //             </Typography>
// //           </Box>
// //         </Box>
// //       )
// //     },
// //     { 
// //       field: 'role', 
// //       headerName: 'Role', 
// //       width: 150,
// //       renderCell: (params) => {
// //         const roleName = params.row.role_name;
// //         const getRoleIcon = (roleName) => {
// //           switch(roleName?.toLowerCase()) {
// //             case 'super admin': return <SuperAdminIcon fontSize="small" />;
// //             case 'admin': return <ManagerIcon fontSize="small" />;
// //             case 'manager': return <ManagerIcon fontSize="small" />;
// //             default: return <UserIcon fontSize="small" />;
// //           }
// //         };
        
// //         return (
// //           <Chip 
// //             icon={roleName ? getRoleIcon(roleName) : <UserIcon fontSize="small" />}
// //             label={roleName} 
// //             size="small"
// //             color={
// //               roleName === 'Super Admin' ? 'error' :
// //               roleName === 'Admin' ? 'warning' : 
// //               roleName === 'Manager' ? 'primary' : 'default'
// //             }
// //             variant="outlined"
// //           />
// //         );
// //       }
// //     },
// //     { 
// //       field: 'department', 
// //       headerName: 'Department', 
// //       width: 150,
// //       renderCell: (params) => {
// //         const department = departments?.find(d => d.id === params.row.department_id);
// //         return department?.name || '—';
// //       }
// //     },
// //     { 
// //       field: 'status', 
// //       headerName: 'Status', 
// //       width: 120,
// //       renderCell: (params) => (
// //         <Chip 
// //           icon={params.row.is_active ? <ActiveIcon /> : <InactiveIcon />}
// //           label={params.row.is_active ? 'Active' : 'Inactive'} 
// //           size="small"
// //           color={params.row.is_active ? 'success' : 'error'}
// //           variant={params.row.is_active ? 'filled' : 'outlined'}
// //         />
// //       )
// //     },
// //     { 
// //       field: 'last_login', 
// //       headerName: 'Last Login', 
// //       width: 130 
// //     },
// //     {
// //       field: 'actions',
// //       headerName: 'Actions',
// //       width: 280,
// //       type: 'actions',
// //       getActions: (params) => [
// //         <GridActionsCellItem
// //           icon={<Tooltip title="Edit User"><EditIcon /></Tooltip>}
// //           label="Edit User"
// //           onClick={() => handleEditUser(params.row)}
// //         />,
// //         <GridActionsCellItem
// //           icon={<Tooltip title="Direct Permissions"><ShieldIcon /></Tooltip>}
// //           label="Direct Permissions"
// //           onClick={() => handleDirectPermissions(params.row)}
// //           color="warning"
// //         />,
// //         <GridActionsCellItem
// //           icon={<Tooltip title="Assign Role"><KeyIcon /></Tooltip>}
// //           label="Assign Role"
// //           onClick={() => handleAssignRole(params.row)}
// //         />,
// //         <GridActionsCellItem
// //           icon={<Tooltip title={params.row.is_active ? 'Deactivate' : 'Activate'}>
// //             {params.row.is_active ? <BlockIcon /> : <ActiveIcon />}
// //           </Tooltip>}
// //           label={params.row.is_active ? 'Deactivate' : 'Activate'}
// //           onClick={() => handleToggleStatus(params.row)}
// //           color={params.row.is_active ? 'warning' : 'success'}
// //         />,
// //         <GridActionsCellItem
// //           icon={<Tooltip title="Delete User"><DeleteIcon /></Tooltip>}
// //           label="Delete"
// //           onClick={() => handleDeleteUser(params.row)}
// //           color="error"
// //         />,
// //       ],
// //     },
// //   ], [roles, departments]);

// //   // Role columns for DataGrid - Updated for Spatie
// //   const roleColumns = useMemo(() => [
// //     { 
// //       field: 'name', 
// //       headerName: 'Role Name', 
// //       width: 180,
// //       renderCell: (params) => (
// //         <Box>
// //           <Typography variant="body2" fontWeight={600}>
// //             {params.row.name}
// //           </Typography>
// //           {params.row.guard_name && (
// //             <Chip label={params.row.guard_name} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />
// //           )}
// //         </Box>
// //       )
// //     },
// //     { 
// //       field: 'description', 
// //       headerName: 'Description', 
// //       width: 250 
// //     },
// //     { 
// //       field: 'permissions_count', 
// //       headerName: 'Permissions', 
// //       width: 120,
// //       renderCell: (params) => (
// //         <Chip 
// //           label={`${params.row.permissions?.length || 0} perms`}
// //           size="small"
// //           variant="outlined"
// //         />
// //       )
// //     },
// //     { 
// //       field: 'users_count', 
// //       headerName: 'Users', 
// //       width: 100,
// //       renderCell: (params) => (
// //         <Typography variant="body2" fontWeight={600}>
// //           {params.row.users_count || users?.filter(u => u.roles?.some(r => r.id === params.row.id))?.length || 0}
// //         </Typography>
// //       )
// //     },
// //     {
// //       field: 'actions',
// //       headerName: 'Actions',
// //       width: 200,
// //       type: 'actions',
// //       getActions: (params) => [
// //         <GridActionsCellItem
// //           icon={<EditIcon />}
// //           label="Edit Role"
// //           onClick={() => handleEditRole(params.row)}
// //           disabled={params.row.name === 'Super Admin'}
// //         />,
// //         <GridActionsCellItem
// //           icon={<SecurityIcon />}
// //           label="Manage Permissions"
// //           onClick={() => handleManagePermissions(params.row)}
// //         />,
// //         <GridActionsCellItem
// //           icon={<DeleteIcon />}
// //           label="Delete"
// //           onClick={() => handleDeleteRole(params.row)}
// //           color="error"
// //           disabled={params.row.name === 'Super Admin' || (users?.some(u => u.roles?.some(r => r.id === params.row.id)))}
// //         />,
// //       ],
// //     },
// //   ], [users]);

// //   // Event handlers - Updated for Spatie
// //   const handleCreateUser = () => {
// //     setSelectedUser(null);
// //     resetUser({
// //       university_id: auth.user.university_id,
// //       is_active: true,
// //     });
// //     setOpenUserDialog(true);
// //   };

// //   ///////////////////////////////////////////////////////////////////////////////////////////////////////
// // const handleEditUser = (user) => {
// //   setSelectedUser(user);
// //   setUserData({
// //     user_id: user.user_id, // Use user_id instead of id
// //     university_id: user.university_id,
// //     department_id: user.department_id,
// //     name: user.name,
// //     first_name: user.first_name,
// //     last_name: user.last_name,
// //     email: user.email,
// //     phone: user.phone || '',
// //     role_id: user.role_id || user.roles?.[0]?.id,
// //     position: user.position || '',
// //     is_active: user.is_active,
// //     employee_id: user.employee_id || '',
// //     username: user.username || '',
// //   });
// //   setOpenUserDialog(true);
// // };

// // const handleToggleStatus = (user) => {
// //   putUser(route('users.toggle-status', user.user_id), { // Use user_id
// //     onSuccess: () => showAlert(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`),
// //     onError: () => showAlert('Failed to update user status', 'error'),
// //   });
// // };

// // const handleDeleteUser = (user) => {
// //   setSelectedUser(user);
// //   setOpenDeleteDialog(true);
// // };

// // // In the delete confirmation:
// // // deleteUser(route('users.destroy', selectedUser?.user_id), { // Use user_id
// // //   onSuccess: () => {
// // //     setOpenDeleteDialog(false);
// // //     showAlert('User deleted successfully');
// // //   },
// // // });

// // // Update the user form submission:
// // const handleUserSubmit = () => {
// //   if (selectedUser) {
// //     putUser(route('users.update', selectedUser.user_id), { // Use user_id
// //       onSuccess: () => {
// //         setOpenUserDialog(false);
// //         showAlert('User updated successfully');
// //       },
// //       onError: () => showAlert('Failed to update user', 'error'),
// //     });
// //   } else {
// //     postUser(route('users.store'), {
// //       onSuccess: () => {
// //         setOpenUserDialog(false);
// //         showAlert('User created successfully');
// //       },
// //       onError: () => showAlert('Failed to create user', 'error'),
// //     });
// //   }
// // };
// //   ////////////////////////////////////////////////////////////////////////////////////////////////////



// //   const handleDirectPermissions = (user) => {
// //     setSelectedUser(user);
// //     setOpenUserPermissionsDialog(true);
// //   };

// //   const handleAssignRole = (user) => {
// //     setSelectedUser(user);
// //     // Implementation for role assignment
// //     showAlert(`Assign role for ${user.name}`, 'info');
// //   };



// //   const handleCreateRole = () => {
// //     setSelectedRole(null);
// //     resetRole({
// //       guard_name: 'web',
// //       permissions: [],
// //     });
// //     setOpenRoleDialog(true);
// //   };

// //   const handleEditRole = (role) => {
// //     setSelectedRole(role);
// //     const rolePermissionNames = role.permissions?.map(p => p.name) || [];
    
// //     setRoleData({
// //       id: role.id,
// //       name: role.name,
// //       description: role.description,
// //       permissions: rolePermissionNames,
// //       guard_name: role.guard_name || 'web',
// //     });
// //     setOpenRoleDialog(true);
// //   };

// //   const handleManagePermissions = (role) => {
// //     setSelectedRole(role);
// //     setOpenPermissionsDialog(true);
// //   };

// //   const handleDeleteRole = (role) => {
// //     setSelectedRole(role);
// //     // Implementation for role deletion
// //     showAlert(`Delete role: ${role.name}`, 'warning');
// //   };

// // const handleSavePermissions = (roleId, permissions) => {
// //   postPermissions(route('roles.update-permissions', roleId), {
// //     permissions: permissions,
// //   }, {
// //     onSuccess: () => {
// //       setOpenPermissionsDialog(false);
// //       showAlert('Permissions updated successfully');
// //     },
// //     onError: () => showAlert('Failed to update permissions', 'error'),
// //   });
// // };

// // const handleSaveUserPermissions = (userId, permissions) => {
// //   postUserPermissions(route('users.update-permissions', userId), {
// //     permissions: permissions,
// //   }, {
// //     onSuccess: () => {
// //       setOpenUserPermissionsDialog(false);
// //       showAlert('Direct permissions updated successfully');
// //     },
// //     onError: () => showAlert('Failed to update direct permissions', 'error'),
// //   });
// // };

// //   const handleRoleSubmit = () => {
// //     if (selectedRole) {
// //       putRole(route('roles.update', selectedRole.id), {
// //         onSuccess: () => {
// //           setOpenRoleDialog(false);
// //           showAlert('Role updated successfully');
// //         },
// //         onError: () => showAlert('Failed to update role', 'error'),
// //       });
// //     } else {
// //       postRole(route('roles.store'), {
// //         onSuccess: () => {
// //           setOpenRoleDialog(false);
// //           showAlert('Role created successfully');
// //         },
// //         onError: () => showAlert('Failed to create role', 'error'),
// //       });
// //     }
// //   };

// //   const handlePermissionChange = (permissionName, checked) => {
// //     const currentPermissions = roleData.permissions || [];
// //     const newPermissions = checked 
// //       ? [...currentPermissions, permissionName]
// //       : currentPermissions.filter(p => p !== permissionName);
// //     setRoleData('permissions', newPermissions);
// //   };

  

// //   // Enhanced filtering
// //   const filteredUsers = useMemo(() => {
// //     let filtered = rows;
    
// //     if (searchText) {
// //       filtered = filtered.filter(user => 
// //         user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
// //         user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
// //         user.employee_id?.toLowerCase().includes(searchText.toLowerCase())
// //       );
// //     }
    
// //     if (statusFilter !== 'all') {
// //       filtered = filtered.filter(user => 
// //         statusFilter === 'active' ? user.is_active : !user.is_active
// //       );
// //     }
    
// //     if (roleFilter !== 'all') {
// //       filtered = filtered.filter(user => user.role_id === roleFilter);
// //     }
    
// //     return filtered;
// //   }, [rows, searchText, statusFilter, roleFilter]);

// //   // Handle flash messages
// //   useEffect(() => {
// //     if (flash.success) {
// //       showAlert(flash.success, "success");
// //     }

// //     if (flash.error) {
// //       showAlert(flash.error, "error");
// //     }
// //   }, [flash]);

// //   const handleCloseAlert = () => {
// //     setAlert((prev) => ({ ...prev, open: false }));
// //   };

// //   return (
// //     <AuthenticatedLayout
// //       auth={auth}
// //       title="User Management"
// //       breadcrumbs={[
// //         { label: 'Dashboard', href: '/dashboard' },
// //         { label: 'Admin', href: '/admin' },
// //         { label: 'User Management' }
// //       ]}
// //     >
// //       <Box>
// //         {/* Header */}
// //         <Box sx={{ mb: 4 }}>
// //           <Typography variant="h4" fontWeight={800} gutterBottom>
// //             User Management
// //           </Typography>
// //           <Typography variant="body1" color="text.secondary">
// //             Manage system users, roles, and permissions using Spatie
// //           </Typography>
// //         </Box>

// //         <Notification 
// //           open={alert.open} 
// //           severity={alert.severity} 
// //           message={alert.message}
// //           onClose={handleCloseAlert}
// //         />

// //         {/* Tabs */}
// //         <Paper sx={{ mb: 3, borderRadius: 3 }}>
// //           <Tabs 
// //             value={activeTab} 
// //             onChange={(e, newValue) => setActiveTab(newValue)}
// //             sx={{ 
// //               borderBottom: 1, 
// //               borderColor: 'divider',
// //               '& .MuiTab-root': { fontWeight: 600 }
// //             }}
// //           >
// //             <Tab icon={<UserIcon />} label={`Users (${users?.length || 0})`} />
// //             <Tab icon={<SecurityIcon />} label={`Roles (${roles?.length || 0})`} />
// //           </Tabs>
// //         </Paper>

// //         {/* Users Tab */}
// //         {activeTab === 0 && (
// //           <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
// //             <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
// //               <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center" justifyContent="space-between">
// //                 <Typography variant="h6" fontWeight={600}>
// //                   System Users ({filteredUsers.length})
// //                 </Typography>
// //                 <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
// //                   <TextField
// //                     size="small"
// //                     placeholder="Search users..."
// //                     value={searchText}
// //                     onChange={(e) => setSearchText(e.target.value)}
// //                     InputProps={{
// //                       startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
// //                     }}
// //                     sx={{ width: isMobile ? '100%' : 300 }}
// //                   />
// //                   <FormControl size="small" sx={{ minWidth: 120 }}>
// //                     <InputLabel>Status</InputLabel>
// //                     <Select
// //                       value={statusFilter}
// //                       label="Status"
// //                       onChange={(e) => setStatusFilter(e.target.value)}
// //                     >
// //                       <MenuItem value="all">All Status</MenuItem>
// //                       <MenuItem value="active">Active</MenuItem>
// //                       <MenuItem value="inactive">Inactive</MenuItem>
// //                     </Select>
// //                   </FormControl>
// //                   <FormControl size="small" sx={{ minWidth: 140 }}>
// //                     <InputLabel>Role</InputLabel>
// //                     <Select
// //                       value={roleFilter}
// //                       label="Role"
// //                       onChange={(e) => setRoleFilter(e.target.value)}
// //                     >
// //                       <MenuItem value="all">All Roles</MenuItem>
// //                       {roles?.map(role => (
// //                         <MenuItem key={role.id} value={role.id}>
// //                           {role.name}
// //                         </MenuItem>
// //                       ))}
// //                     </Select>
// //                   </FormControl>
// //                   <Button 
// //                     variant="contained" 
// //                     startIcon={<AddIcon />}
// //                     onClick={handleCreateUser}
// //                   >
// //                     Add User
// //                   </Button>
// //                 </Stack>
// //               </Stack>
// //             </Box>

// //             <DataGrid
// //               rows={filteredUsers}
// //               columns={userColumns}
// //               getRowId={(row) => row.user_id} // Use user_id as the unique identifier
// //               pageSizeOptions={[10, 25, 50]}
// //               initialState={{
// //                 pagination: { paginationModel: { pageSize: 25 } },
// //               }}
// //               sx={{
// //                 border: 'none',
// //                 '& .MuiDataGrid-cell': {
// //                   borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
// //                 },
// //               }}
// //               autoHeight
// //             />

// //           </Paper>
// //         )}

// //         {/* Roles Tab */}
// //         {activeTab === 1 && (
// //           <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
// //             <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
// //               <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center" justifyContent="space-between">
// //                 <Typography variant="h6" fontWeight={600}>
// //                   System Roles
// //                 </Typography>
// //                 <Button 
// //                   variant="contained" 
// //                   startIcon={<AddIcon />}
// //                   onClick={handleCreateRole}
// //                 >
// //                   Create Role
// //                 </Button>
// //               </Stack>
// //             </Box>


// //           <DataGrid
// //             rows={roles || []}
// //             columns={roleColumns}
// //             getRowId={(row) => row.role_id || row.id} // Use role_id or id as fallback
// //             pageSizeOptions={[10, 25, 50]}
// //             initialState={{
// //               pagination: { paginationModel: { pageSize: 25 } },
// //             }}
// //             sx={{
// //               border: 'none',
// //               '& .MuiDataGrid-cell': {
// //                 borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
// //               },
// //             }}
// //             autoHeight
// //           />
// //           </Paper>
// //         )}

// //         {/* User Dialog */}
// //         <Dialog 
// //           open={openUserDialog} 
// //           onClose={() => setOpenUserDialog(false)} 
// //           maxWidth="md" 
// //           fullWidth
// //           PaperProps={{
// //             sx: {
// //               borderRadius: 3,
// //               boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
// //             }
// //           }}
// //         >
// //           <DialogTitle sx={{ 
// //             background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
// //             color: 'white',
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'space-between'
// //           }}>
// //             <Typography variant="h5" fontWeight={600}>
// //               {selectedUser ? 'Edit User' : 'Create New User'}
// //             </Typography>
// //             <IconButton
// //               onClick={() => setOpenUserDialog(false)}
// //               sx={{ color: 'white' }}
// //             >
// //               <CloseIcon />
// //             </IconButton>
// //           </DialogTitle>
// //           <DialogContent sx={{ p: 3 }}>
// //             <Grid container spacing={3} sx={{ mt: 1 }}>
// //               <Grid size={{ xs:12, md:6 }}>
// //                 <TextField
// //                   fullWidth
// //                   label="Full Name"
// //                   value={userData.name}
// //                   onChange={(e) => setUserData('name', e.target.value)}
// //                   error={!!userErrors.name}
// //                   helperText={userErrors.name}
// //                 />
// //               </Grid>
// //               <Grid size={{ xs:12, md:6 }}>
// //                 <TextField
// //                   fullWidth
// //                   label="Email"
// //                   type="email"
// //                   value={userData.email}
// //                   onChange={(e) => setUserData('email', e.target.value)}
// //                   error={!!userErrors.email}
// //                   helperText={userErrors.email}
// //                 />
// //               </Grid>
// //               {!selectedUser && (
// //                 <>
// //                   <Grid size={{ xs:12, md:6 }}>
// //                     <TextField
// //                       fullWidth
// //                       label="Password"
// //                       type="password"
// //                       value={userData.password}
// //                       onChange={(e) => setUserData('password', e.target.value)}
// //                       error={!!userErrors.password}
// //                       helperText={userErrors.password}
// //                     />
// //                   </Grid>
// //                   <Grid size={{ xs:12, md:6 }}>
// //                     <TextField
// //                       fullWidth
// //                       label="Confirm Password"
// //                       type="password"
// //                       value={userData.password_confirmation}
// //                       onChange={(e) => setUserData('password_confirmation', e.target.value)}
// //                       error={!!userErrors.password_confirmation}
// //                       helperText={userErrors.password_confirmation}
// //                     />
// //                   </Grid>
// //                 </>
// //               )}
// //               <Grid size={{ xs:12, md:6 }}>
// //                 <FormControl fullWidth error={!!userErrors.role_id}>
// //                   <InputLabel>Role</InputLabel>
// //                   <Select
// //                     value={userData.role_id}
// //                     label="Role"
// //                     onChange={(e) => setUserData('role_id', e.target.value)}
// //                   >
// //                     {roles?.map(role => (
// //                       <MenuItem key={role.id} value={role.id}>
// //                         {role.name}
// //                       </MenuItem>
// //                     ))}
// //                   </Select>
// //                   {userErrors.role_id && <FormHelperText>{userErrors.role_id}</FormHelperText>}
// //                 </FormControl>
// //               </Grid>
// //               <Grid size={{ xs:12 }}>
// //                 <FormControlLabel
// //                   control={
// //                     <Switch
// //                       checked={userData.is_active}
// //                       onChange={(e) => setUserData('is_active', e.target.checked)}
// //                     />
// //                   }
// //                   label="Active User"
// //                 />
// //               </Grid>
// //             </Grid>
// //           </DialogContent>
// //           <DialogActions sx={{ p: 3, gap: 1 }}>
// //             <Button 
// //               onClick={() => setOpenUserDialog(false)}
// //               variant="outlined"
// //               sx={{ borderRadius: 2, minWidth: 100 }}
// //             >
// //               Cancel
// //             </Button>
// //             <Button 
// //               variant="contained" 
// //               onClick={handleUserSubmit}
// //               disabled={userProcessing}
// //               sx={{ 
// //                 borderRadius: 2,
// //                 minWidth: 120,
// //                 background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
// //               }}
// //             >
// //               {selectedUser ? 'Update User' : 'Create User'}
// //             </Button>
// //           </DialogActions>
// //         </Dialog>

// //         {/* Role Dialog */}
// //         <Dialog 
// //           open={openRoleDialog} 
// //           onClose={() => setOpenRoleDialog(false)} 
// //           maxWidth="lg" 
// //           fullWidth
// //           PaperProps={{
// //             sx: {
// //               borderRadius: 3,
// //               boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
// //             }
// //           }}
// //         >
// //           <DialogTitle sx={{ 
// //             background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
// //             color: 'white',
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'space-between'
// //           }}>
// //             <Typography variant="h5" fontWeight={600}>
// //               {selectedRole ? 'Edit Role' : 'Create New Role'}
// //             </Typography>
// //             <IconButton
// //               onClick={() => setOpenRoleDialog(false)}
// //               sx={{ color: 'white' }}
// //             >
// //               <CloseIcon />
// //             </IconButton>
// //           </DialogTitle>
// //           <DialogContent sx={{ p: 3 }}>
// //             <Grid container spacing={3} sx={{ mt: 1 }}>
// //               <Grid size={{ xs:12, md:6 }}>
// //                 <TextField
// //                   fullWidth
// //                   label="Role Name"
// //                   value={roleData.name}
// //                   onChange={(e) => setRoleData('name', e.target.value)}
// //                   error={!!roleErrors.name}
// //                   helperText={roleErrors.name}
// //                   placeholder="e.g., admin, manager, user"
// //                 />
// //               </Grid>
// //               <Grid size={{ xs:12, md:6 }}>
// //                 <TextField
// //                   fullWidth
// //                   label="Guard Name"
// //                   value={roleData.guard_name}
// //                   onChange={(e) => setRoleData('guard_name', e.target.value)}
// //                   error={!!roleErrors.guard_name}
// //                   helperText={roleErrors.guard_name}
// //                   disabled={!!selectedRole}
// //                 />
// //               </Grid>
// //               <Grid size={{ xs:12 }}>
// //                 <TextField
// //                   fullWidth
// //                   label="Description"
// //                   value={roleData.description}
// //                   onChange={(e) => setRoleData('description', e.target.value)}
// //                   error={!!roleErrors.description}
// //                   helperText={roleErrors.description}
// //                   multiline
// //                   rows={2}
// //                 />
// //               </Grid>
// //               <Grid size={{ xs:12 }}>
// //                 <PermissionMatrix
// //                   permissions={allPermissions || []}
// //                   selectedPermissions={roleData.permissions || []}
// //                   onPermissionChange={handlePermissionChange}
// //                 />
// //               </Grid>
// //             </Grid>
// //           </DialogContent>
// //           <DialogActions sx={{ p: 3, gap: 1 }}>
// //             <Button 
// //               onClick={() => setOpenRoleDialog(false)}
// //               variant="outlined"
// //               sx={{ borderRadius: 2, minWidth: 100 }}
// //             >
// //               Cancel
// //             </Button>
// //             <Button 
// //               variant="contained" 
// //               onClick={handleRoleSubmit}
// //               disabled={roleProcessing}
// //               sx={{ 
// //                 borderRadius: 2,
// //                 minWidth: 120,
// //                 background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
// //               }}
// //             >
// //               {selectedRole ? 'Update Role' : 'Create Role'}
// //             </Button>
// //           </DialogActions>
// //         </Dialog>

// //         {/* Permissions Dialog */}
// //         <RolePermissionsDialog
// //           key={selectedRole?.id || 'role-permissions'}
// //           open={openPermissionsDialog}
// //           onClose={() => setOpenPermissionsDialog(false)}
// //           role={selectedRole}
// //           permissions={allPermissions || []}
// //           onSave={handleSavePermissions}
// //           loading={permissionsProcessing}
// //         />

// //         {/* User Permissions Dialog */}
// //         <UserPermissionsDialog
// //           key={selectedUser?.id || 'user-permission'}
// //           open={openUserPermissionsDialog}
// //           onClose={() => setOpenUserPermissionsDialog(false)}
// //           user={selectedUser}
// //           permissions={allPermissions || []}
// //           onSave={handleSaveUserPermissions}
// //           loading={userPermissionsProcessing}
// //         />

// //         {/* Delete Confirmation Dialog */}
// //         <Dialog 
// //           open={openDeleteDialog} 
// //           onClose={() => setOpenDeleteDialog(false)}
// //           PaperProps={{
// //             sx: {
// //               borderRadius: 3,
// //               boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
// //             }
// //           }}
// //         >
// //           <DialogTitle sx={{ 
// //             background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
// //             color: 'white',
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'space-between'
// //           }}>
// //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
// //               <WarningIcon />
// //               <Typography variant="h5" fontWeight={600}>
// //                 Confirm Deletion
// //               </Typography>
// //             </Box>
// //             <IconButton
// //               onClick={() => setOpenDeleteDialog(false)}
// //               sx={{ color: 'white' }}
// //             >
// //               <CloseIcon />
// //             </IconButton>
// //           </DialogTitle>
// //           <DialogContent sx={{ p: 3 }}>
// //             <Alert 
// //               severity="warning" 
// //               sx={{ 
// //                 mb: 2,
// //                 borderRadius: 2,
// //                 background: alpha(theme.palette.warning.main, 0.05),
// //                 border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
// //               }}
// //             >
// //               Are you sure you want to delete user: <strong>{selectedUser?.name}</strong>?
// //             </Alert>
// //             <Typography variant="body2" color="text.secondary">
// //               This action cannot be undone. All user data and associations will be permanently removed from the system.
// //             </Typography>
// //           </DialogContent>
// //           <DialogActions sx={{ p: 3, gap: 1 }}>
// //             <Button 
// //               onClick={() => setOpenDeleteDialog(false)}
// //               variant="outlined"
// //               sx={{ borderRadius: 2, minWidth: 100 }}
// //             >
// //               Cancel
// //             </Button>
// //             <Button 
// //               variant="contained" 
// //               color="error"
// //               onClick={() => {
// //                 deleteUser(route('users.destroy', selectedUser?.id), {
// //                   onSuccess: () => {
// //                     setOpenDeleteDialog(false);
// //                     showAlert('User deleted successfully');
// //                   },
// //                 });
// //               }}
// //               sx={{ 
// //                 borderRadius: 2,
// //                 minWidth: 120,
// //                 background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
// //               }}
// //             >
// //               Delete User
// //             </Button>
// //           </DialogActions>
// //         </Dialog>
// //       </Box>
// //     </AuthenticatedLayout>
// //   );
// // }
// import React, { useState, useMemo, useEffect } from 'react';
// import { useForm, usePage, router } from '@inertiajs/react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import {
//   Box, Chip, Typography, TextField, Button, Stack, Dialog, DialogTitle, DialogContent,
//   DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, Card, CardContent,
//   Grid, IconButton, Switch, FormControlLabel, Avatar, Paper, useTheme, useMediaQuery,
//   alpha, Tab, Tabs, FormHelperText, Tooltip, Badge, Divider, List, ListItem,
//   ListItemText, ListItemIcon, Checkbox, ListItemButton, CardHeader,
// } from '@mui/material';
// import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
// import {
//   Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Key as KeyIcon,
//   Block as BlockIcon, CheckCircle as ActiveIcon, Cancel as InactiveIcon,
//   AdminPanelSettings as SuperAdminIcon, ManageAccounts as ManagerIcon,
//   Person as UserIcon, Security as SecurityIcon, Search as SearchIcon,
//   Visibility as ViewIcon, PersonAdd as PersonAddIcon, FilterList as FilterIcon,
//   Refresh as RefreshIcon, Download as DownloadIcon, Warning as WarningIcon,
//   Info as InfoIcon, Shield as ShieldIcon, Close as CloseIcon,
//   Group as GroupIcon, PermIdentity as PermIdentityIcon,
// } from '@mui/icons-material';
// import Notification from '@/Components/Notification';

// // Spatie Permission Matrix Component
// const SpatiePermissionMatrix = ({ permissions, selectedPermissions, onPermissionChange, disabled = false }) => {
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
//       if (!groups[guard][module]) groups[guard][module] = [];
      
//       groups[guard][module].push(permission);
//     });
    
//     return groups;
//   }, [permissions]);

//   const toggleGroup = (guard, module) => {
//     setExpandedGroups(prev => ({
//       ...prev,
//       [`${guard}-${module}`]: !prev[`${guard}-${module}`]
//     }));
//   };

//   const handleSelectAll = (guard, module, permissions, select) => {
//     permissions.forEach(permission => {
//       onPermissionChange(permission.name, select);
//     });
//   };

//   return (
//     <Box sx={{ mt: 2 }}>
//       <Box sx={{ mb: 3 }}>
//         <TextField
//           fullWidth
//           size="small"
//           placeholder="Search permissions..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
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
//               const filteredPermissions = modulePermissions.filter(p => 
//                 p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 p.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
//                                   {permission.description || permission.name}
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
//           {loading ? 'Saving...' : 'Save Permissions'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// // User Roles & Permissions Dialog
// const UserRolesPermissionsDialog = ({ open, onClose, user, roles, permissions, onSave, loading = false }) => {
//   const theme = useTheme();
//   const [selectedRoles, setSelectedRoles] = useState([]);
//   const [selectedPermissions, setSelectedPermissions] = useState([]);

//   useEffect(() => {
//     if (user && open) {
//       const userRoleIds = user.roles?.map(r => r.id) || [];
//       const userPermissionNames = user.permissions?.map(p => p.name) || [];
//       setSelectedRoles(userRoleIds);
//       setSelectedPermissions(userPermissionNames);
//     }
//   }, [user, open]);

//   const handleRoleChange = (roleId, checked) => {
//     setSelectedRoles(prev =>
//       checked 
//         ? [...prev, roleId] 
//         : prev.filter(id => id !== roleId)
//     );
//   };

//   const handlePermissionChange = (permissionName, checked) => {
//     setSelectedPermissions(prev =>
//       checked 
//         ? [...prev, permissionName] 
//         : prev.filter(p => p !== permissionName)
//     );
//   };

//   const handleSave = () => {
//     onSave(user.id, {
//       roles: selectedRoles,
//       permissions: selectedPermissions
//     });
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
//             Manage User Access
//           </Typography>
//           <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
//             {user?.name} - Assign roles and direct permissions
//           </Typography>
//         </Box>
//         <IconButton onClick={onClose} sx={{ color: 'white' }}>
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>
      
//       <DialogContent sx={{ p: 3 }}>
//         <Grid container spacing={3}>
//           {/* Roles Section */}
//           <Grid size={{ xs:12, md:6 }}>
//             <Card sx={{ height: '100%' }}>
//               <CardHeader
//                 title={
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <GroupIcon color="primary" />
//                     <Typography variant="h6">Roles</Typography>
//                   </Box>
//                 }
//                 subheader="Assign roles to user"
//                 sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}
//               />
//               <CardContent>
//                 <List>
//                   {roles?.map(role => (
//                     <ListItem key={role.id} disablePadding>
//                       <ListItemButton 
//                         onClick={() => handleRoleChange(role.id, !selectedRoles.includes(role.id))}
//                         sx={{ borderRadius: 1 }}
//                       >
//                         <ListItemIcon>
//                           <Checkbox
//                             checked={selectedRoles.includes(role.id)}
//                             onChange={(e) => handleRoleChange(role.id, e.target.checked)}
//                           />
//                         </ListItemIcon>
//                         <ListItemText
//                           primary={role.name}
//                           secondary={
//                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
//                               <Chip 
//                                 label={role.guard_name} 
//                                 size="small" 
//                                 variant="outlined"
//                               />
//                               <Typography variant="caption">
//                                 {role.permissions?.length || 0} permissions
//                               </Typography>
//                             </Box>
//                           }
//                         />
//                       </ListItemButton>
//                     </ListItem>
//                   ))}
//                 </List>
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* Direct Permissions Section */}
//           <Grid size={{ xs:12, md:6 }}>
//             <Card sx={{ height: '100%' }}>
//               <CardHeader
//                 title={
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                     <ShieldIcon color="secondary" />
//                     <Typography variant="h6">Direct Permissions</Typography>
//                   </Box>
//                 }
//                 subheader="Assign permissions directly to user"
//                 sx={{ backgroundColor: alpha(theme.palette.secondary.main, 0.02) }}
//               />
//               <CardContent>
//                 <Alert severity="warning" sx={{ mb: 2 }}>
//                   Direct permissions are granted in addition to role permissions
//                 </Alert>
//                 <SpatiePermissionMatrix
//                   permissions={permissions}
//                   selectedPermissions={selectedPermissions}
//                   onPermissionChange={handlePermissionChange}
//                   disabled={loading}
//                 />
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
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
//           {loading ? 'Saving...' : 'Save Access Settings'}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default function UserManagement({ auth, users, roles, permissions, flash }) {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
//   const [searchText, setSearchText] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [openUserDialog, setOpenUserDialog] = useState(false);
//   const [openRoleDialog, setOpenRoleDialog] = useState(false);
//   const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
//   const [openUserAccessDialog, setOpenUserAccessDialog] = useState(false);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [selectedRole, setSelectedRole] = useState(null);
//   const [activeTab, setActiveTab] = useState(0);
//   const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

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
//     permissions: [],
//   });

//   const showAlert = (message, severity = 'success') => {
//     setAlert({ open: true, message, severity });
//   };

//   // Process users data for Spatie
//   const processedUsers = useMemo(() => {
//     return (users || []).map(user => ({
//       id: user.id,
//       ...user,
//       roles_list: user.roles?.map(r => r.name).join(', ') || 'No Roles',
//       direct_permissions_count: user.permissions?.length || 0,
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
//       field: 'direct_permissions_count', 
//       headerName: 'Direct Perms', 
//       width: 120,
//       renderCell: (params) => (
//         <Badge badgeContent={params.row.direct_permissions_count} color="secondary" showZero>
//           <ShieldIcon fontSize="small" color="action" />
//         </Badge>
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
//       width: 200,
//       type: 'actions',
//       getActions: (params) => [
//         <GridActionsCellItem
//           icon={<Tooltip title="Edit User"><EditIcon /></Tooltip>}
//           label="Edit"
//           onClick={() => handleEditUser(params.row)}
//         />,
//         <GridActionsCellItem
//           icon={<Tooltip title="Manage Access"><SecurityIcon /></Tooltip>}
//           label="Access"
//           onClick={() => handleManageUserAccess(params.row)}
//           color="primary"
//         />,
//         <GridActionsCellItem
//           icon={<Tooltip title={params.row.is_active ? 'Deactivate' : 'Activate'}>
//             {params.row.is_active ? <BlockIcon /> : <ActiveIcon />}
//           </Tooltip>}
//           label="Toggle Status"
//           onClick={() => handleToggleStatus(params.row)}
//           color={params.row.is_active ? 'warning' : 'success'}
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
//           {users?.filter(u => u.roles?.some(r => r.id === params.row.id))?.length || 0}
//         </Typography>
//       )
//     },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       width: 150,
//       type: 'actions',
//       getActions: (params) => [
//         <GridActionsCellItem
//           icon={<EditIcon />}
//           label="Edit"
//           onClick={() => handleEditRole(params.row)}
//           disabled={params.row.name === 'super-admin'}
//         />,
//         <GridActionsCellItem
//           icon={<SecurityIcon />}
//           label="Permissions"
//           onClick={() => handleManagePermissions(params.row)}
//         />,
//       ],
//     },
//   ], [users]);

//   // Event handlers
//   const handleCreateUser = () => {
//     setSelectedUser(null);
//     resetUser();
//     setOpenUserDialog(true);
//   };

//   const handleEditUser = (user) => {
//     setSelectedUser(user);
//     setUserData({
//       name: user.name,
//       email: user.email,
//       is_active: user.is_active,
//     });
//     setOpenUserDialog(true);
//   };

//   const handleManageUserAccess = (user) => {
//     setSelectedUser(user);
//     setOpenUserAccessDialog(true);
//   };

//   const handleToggleStatus = (user) => {
//     router.put(route('admin.users.toggle-status', user.id), {}, {
//       onSuccess: () => showAlert(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`),
//       onError: () => showAlert('Failed to update user status', 'error'),
//     });
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
//       permissions: role.permissions?.map(p => p.name) || [],
//     });
//     setOpenRoleDialog(true);
//   };

//   const handleManagePermissions = (role) => {
//     setSelectedRole(role);
//     setOpenPermissionsDialog(true);
//   };

//   const handleSavePermissions = (roleId, selectedPermissions) => {
//     router.put(route('admin.roles.sync-permissions', roleId), {
//       permissions: selectedPermissions
//     }, {
//       onSuccess: () => {
//         setOpenPermissionsDialog(false);
//         showAlert('Role permissions updated successfully');
//       },
//       onError: () => showAlert('Failed to update role permissions', 'error'),
//     });
//   };

//   const handleSaveUserAccess = (userId, data) => {
//     router.put(route('admin.users.sync-roles-permissions', userId), data, {
//       onSuccess: () => {
//         setOpenUserAccessDialog(false);
//         showAlert('User access updated successfully');
//       },
//       onError: () => showAlert('Failed to update user access', 'error'),
//     });
//   };

//   const handleUserSubmit = () => {
//     const routeMethod = selectedUser ? putUser : postUser;
//     const routeName = selectedUser ? 'admin.users.update' : 'admin.users.store';
//     const successMessage = selectedUser ? 'User updated successfully' : 'User created successfully';

//     routeMethod(route(routeName, selectedUser?.id), {
//       onSuccess: () => {
//         setOpenUserDialog(false);
//         showAlert(successMessage);
//       },
//       onError: () => showAlert('Failed to save user', 'error'),
//     });
//   };

//   const handleRoleSubmit = () => {
//     const routeMethod = selectedRole ? putRole : postRole;
//     const routeName = selectedRole ? 'admin.roles.update' : 'admin.roles.store';
//     const successMessage = selectedRole ? 'Role updated successfully' : 'Role created successfully';

//     routeMethod(route(routeName, selectedRole?.id), {
//       onSuccess: () => {
//         setOpenRoleDialog(false);
//         showAlert(successMessage);
//       },
//       onError: () => showAlert('Failed to save role', 'error'),
//     });
//   };

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
//               permissions={permissions || []}
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
//               <Grid size={{ xs:12 }}>
//                 <TextField
//                   fullWidth
//                   label="Full Name"
//                   value={userData.name}
//                   onChange={(e) => setUserData('name', e.target.value)}
//                   error={!!userErrors.name}
//                   helperText={userErrors.name}
//                 />
//               </Grid>
//               <Grid size={{ xs:12 }}>
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
//                   <Grid size={{ xs:12, md:6 }}>
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
//                   <Grid size={{ xs:12, md:6 }}>
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
//               <Grid size={{ xs:12, md:6 }}>
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
//               <Grid size={{ xs:12, md:6 }}>
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
//           open={openPermissionsDialog}
//           onClose={() => setOpenPermissionsDialog(false)}
//           role={selectedRole}
//           permissions={permissions || []}
//           onSave={handleSavePermissions}
//         />

//         {/* User Roles & Permissions Dialog */}
//         <UserRolesPermissionsDialog
//           open={openUserAccessDialog}
//           onClose={() => setOpenUserAccessDialog(false)}
//           user={selectedUser}
//           roles={roles || []}
//           permissions={permissions || []}
//           onSave={handleSaveUserAccess}
//         />
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
  Group as GroupIcon, PermIdentity as PermIdentityIcon,
} from '@mui/icons-material';
import Notification from '@/Components/Notification';

// Spatie Permission Matrix Component
const SpatiePermissionMatrix = ({ permissions, selectedPermissions, onPermissionChange, disabled = false }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  // Group permissions by guard name and module
  const groupedPermissions = useMemo(() => {
    const groups = {};
    
    permissions.forEach(permission => {
      const guard = permission.guard_name || 'web';
      if (!groups[guard]) groups[guard] = {};
      
      // Extract module from permission name (e.g., 'users.create' -> 'users')
      const [module] = permission.name.split('.');
      if (!groups[guard][module]) groups[guard][module] = [];
      
      groups[guard][module].push(permission);
    });
    
    return groups;
  }, [permissions]);

  const toggleGroup = (guard, module) => {
    setExpandedGroups(prev => ({
      ...prev,
      [`${guard}-${module}`]: !prev[`${guard}-${module}`]
    }));
  };

  const handleSelectAll = (guard, module, modulePermissions, select) => {
    modulePermissions.forEach(permission => {
      onPermissionChange(permission.name, select);
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
        />
      </Box>

      {Object.entries(groupedPermissions).map(([guard, modules]) => (
        <Card key={guard} sx={{ mb: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon color="primary" />
                <Typography variant="h6">
                  {guard.toUpperCase()} Guard
                </Typography>
                <Chip 
                  label={`Guard`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            }
            sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
              borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          />
          <CardContent>
            {Object.entries(modules).map(([module, modulePermissions]) => {
              const groupKey = `${guard}-${module}`;
              const isExpanded = expandedGroups[groupKey];
              
              // Filter permissions based on search term
              const filteredPermissions = modulePermissions.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) 
              );

              if (filteredPermissions.length === 0) return null;

              const selectedCount = filteredPermissions.filter(p => 
                selectedPermissions.includes(p.name)
              ).length;

              return (
                <Card key={module} variant="outlined" sx={{ mb: 2 }}>
                  <ListItemButton 
                    onClick={() => toggleGroup(guard, module)}
                    sx={{ 
                      backgroundColor: isExpanded ? alpha(theme.palette.primary.main, 0.02) : 'transparent',
                      borderBottom: isExpanded ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none'
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={selectedCount === filteredPermissions.length}
                        indeterminate={selectedCount > 0 && selectedCount < filteredPermissions.length}
                        onChange={(e) => handleSelectAll(guard, module, filteredPermissions, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {module.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                          <Chip 
                            label={`${selectedCount}/${filteredPermissions.length}`} 
                            size="small" 
                            color={selectedCount === filteredPermissions.length ? "primary" : "default"}
                            variant={selectedCount > 0 ? "filled" : "outlined"}
                          />
                        </Box>
                      }
                      secondary={`${filteredPermissions.length} permissions`}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </Typography>
                  </ListItemButton>
                  
                  {isExpanded && (
                    <List dense sx={{ py: 0 }}>
                      {filteredPermissions.map((permission) => {
                        const isChecked = selectedPermissions.includes(permission.name);
                        const action = permission.name.split('.')[1] || permission.name;

                        return (
                          <ListItem 
                            key={permission.id} 
                            sx={{ 
                              py: 0.5,
                              backgroundColor: isChecked ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                              borderLeft: isChecked ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent'
                            }}
                          >
                            <ListItemIcon>
                              <Checkbox
                                checked={isChecked}
                                onChange={(e) => onPermissionChange(permission.name, e.target.checked)}
                                disabled={disabled}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight={500}>
                                  {action.replace(/_/g, ' ').toUpperCase()}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {permission.name}
                                </Typography>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </Card>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

// Role Permissions Dialog
const RolePermissionsDialog = ({ open, onClose, role, permissions, onSave, loading = false }) => {
  const theme = useTheme();
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (role && open) {
      // Extract permission names from role permissions
      const rolePermissionNames = role.permissions?.map(p => p.name) || [];
      setSelectedPermissions(rolePermissionNames);
    }
  }, [role, open]);

  const handlePermissionChange = (permissionName, checked) => {
    setSelectedPermissions(prev =>
      checked 
        ? [...prev, permissionName] 
        : prev.filter(p => p !== permissionName)
    );
  };

  const handleSave = () => {
    onSave(role.id, selectedPermissions);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          height: '80vh'
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
            Manage Role Permissions
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {role?.name} - Assign permissions to this role
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Users with this role will inherit all assigned permissions. Permissions are organized by guard and module.
        </Alert>
        
        <SpatiePermissionMatrix
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          onPermissionChange={handlePermissionChange}
          disabled={loading}
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={loading}
          startIcon={<SecurityIcon />}
        >
          {loading ? 'Saving...' : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// User Roles & Permissions Dialog
const UserRolesPermissionsDialog = ({ open, onClose, user, roles, permissions, onSave, loading = false }) => {
  const theme = useTheme();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (user && open) {
      // Extract role IDs and permission names
      const userRoleIds = user.roles?.map(r => r.id) || [];
      const userPermissionNames = user.permissions?.map(p => p.name) || [];
      setSelectedRoles(userRoleIds);
      setSelectedPermissions(userPermissionNames);
    }
  }, [user, open]);

  const handleRoleChange = (roleId, checked) => {
    setSelectedRoles(prev =>
      checked 
        ? [...prev, roleId] 
        : prev.filter(id => id !== roleId)
    );
  };

  const handlePermissionChange = (permissionName, checked) => {
    setSelectedPermissions(prev =>
      checked 
        ? [...prev, permissionName] 
        : prev.filter(p => p !== permissionName)
    );
  };

  const handleSave = () => {
    onSave(user.id, {
      roles: selectedRoles,
      permissions: selectedPermissions
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          height: '80vh'
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
            Manage User Access
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {user?.name} - Assign roles and direct permissions
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Roles Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon color="primary" />
                    <Typography variant="h6">Roles</Typography>
                  </Box>
                }
                subheader="Assign roles to user"
                sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}
              />
              <CardContent>
                <List>
                  {roles?.map(role => (
                    <ListItem key={role.id} disablePadding>
                      <ListItemButton 
                        onClick={() => handleRoleChange(role.id, !selectedRoles.includes(role.id))}
                        sx={{ borderRadius: 1 }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={selectedRoles.includes(role.id)}
                            onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={role.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip 
                                label={role.guard_name} 
                                size="small" 
                                variant="outlined"
                              />
                              <Typography variant="caption">
                                {role.permissions?.length || 0} permissions
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Direct Permissions Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldIcon color="secondary" />
                    <Typography variant="h6">Direct Permissions</Typography>
                  </Box>
                }
                subheader="Assign permissions directly to user"
                sx={{ backgroundColor: alpha(theme.palette.secondary.main, 0.02) }}
              />
              <CardContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Direct permissions are granted in addition to role permissions
                </Alert>
                <SpatiePermissionMatrix
                  permissions={permissions}
                  selectedPermissions={selectedPermissions}
                  onPermissionChange={handlePermissionChange}
                  disabled={loading}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={loading}
          startIcon={<SecurityIcon />}
        >
          {loading ? 'Saving...' : 'Save Access Settings'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function UserManagement({ auth, users, roles, permissions, flash }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { props } = usePage();
  
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [openUserAccessDialog, setOpenUserAccessDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // User form
  const { data: userData, setData: setUserData, post: postUser, put: putUser, processing: userProcessing, errors: userErrors, reset: resetUser } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    is_active: true,
  });

  // Role form
  const { data: roleData, setData: setRoleData, post: postRole, put: putRole, processing: roleProcessing, errors: roleErrors, reset: resetRole } = useForm({
    name: '',
    guard_name: 'web',
  });

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };

  // Process users data for Spatie
  const processedUsers = useMemo(() => {
    return (users || []).map(user => ({
      id: user.id,
      ...user,
      roles_list: user.roles?.map(r => r.name).join(', ') || 'No Roles',
      direct_permissions_count: user.permissions?.length || 0,
      status: user.is_active ? 'active' : 'inactive',
    }));
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
            {params.row.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
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
      field: 'roles_list', 
      headerName: 'Roles', 
      width: 150,
      renderCell: (params) => (
        <Tooltip title={params.row.roles_list}>
          <Chip 
            label={params.row.roles_list} 
            size="small"
            variant="outlined"
            color={params.row.roles_list === 'No Roles' ? 'default' : 'primary'}
          />
        </Tooltip>
      )
    },
    { 
      field: 'direct_permissions_count', 
      headerName: 'Direct Perms', 
      width: 120,
      renderCell: (params) => (
        <Badge badgeContent={params.row.direct_permissions_count} color="secondary">
          <ShieldIcon fontSize="small" color="action" />
        </Badge>
      )
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
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Edit User"><EditIcon /></Tooltip>}
          label="Edit"
          onClick={() => handleEditUser(params.row)}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Manage Access"><SecurityIcon /></Tooltip>}
          label="Access"
          onClick={() => handleManageUserAccess(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<Tooltip title={params.row.is_active ? 'Deactivate' : 'Activate'}>
            {params.row.is_active ? <BlockIcon /> : <ActiveIcon />}
          </Tooltip>}
          label="Toggle Status"
          onClick={() => handleToggleStatus(params.row)}
          color={params.row.is_active ? 'warning' : 'success'}
        />,
      ],
    },
  ], []);

  // Role columns for DataGrid
  const roleColumns = useMemo(() => [
    { 
      field: 'name', 
      headerName: 'Role Name', 
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon color="primary" />
          <Typography variant="body2" fontWeight={600}>
            {params.row.name}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'guard_name', 
      headerName: 'Guard', 
      width: 100,
      renderCell: (params) => (
        <Chip label={params.row.guard_name} size="small" variant="outlined" />
      )
    },
    { 
      field: 'permissions_count', 
      headerName: 'Permissions', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.row.permissions?.length || 0}
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
        <Typography variant="body2" fontWeight={600}>
          {users?.filter(u => u.roles?.some(r => r.id === params.row.id))?.length || 0}
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
          label="Edit"
          onClick={() => handleEditRole(params.row)}
          disabled={params.row.name === 'super-admin'}
        />,
        <GridActionsCellItem
          icon={<SecurityIcon />}
          label="Permissions"
          onClick={() => handleManagePermissions(params.row)}
        />,
      ],
    },
  ], [users]);

  // Event handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    resetUser();
    setOpenUserDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserData({
      name: user.name,
      email: user.email,
      is_active: user.is_active,
    });
    setOpenUserDialog(true);
  };

  const handleManageUserAccess = (user) => {
    setSelectedUser(user);
    setOpenUserAccessDialog(true);
  };

  const handleToggleStatus = (user) => {
    router.put(route('admin.users.toggle-status', user.id), {}, {
      onSuccess: () => showAlert(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`),
      onError: () => showAlert('Failed to update user status', 'error'),
    });
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    resetRole();
    setOpenRoleDialog(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setRoleData({
      name: role.name,
      guard_name: role.guard_name,
    });
    setOpenRoleDialog(true);
  };

  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    setOpenPermissionsDialog(true);
  };

  const handleSavePermissions = (roleId, selectedPermissions) => {
    router.put(route('admin.roles.sync-permissions', roleId), {
      permissions: selectedPermissions
    }, {
      onSuccess: () => {
        setOpenPermissionsDialog(false);
        showAlert('Role permissions updated successfully');
      },
      onError: () => showAlert('Failed to update role permissions', 'error'),
    });
  };

  const handleSaveUserAccess = (userId, data) => {
    router.put(route('admin.users.sync-roles-permissions', userId), data, {
      onSuccess: () => {
        setOpenUserAccessDialog(false);
        showAlert('User access updated successfully');
      },
      onError: () => showAlert('Failed to update user access', 'error'),
    });
  };

  const handleUserSubmit = () => {
    const routeMethod = selectedUser ? putUser : postUser;
    const routeName = selectedUser ? 'admin.users.update' : 'admin.users.store';

    routeMethod(route(routeName, selectedUser?.id), userData, {
      onSuccess: () => {
        setOpenUserDialog(false);
        showAlert(selectedUser ? 'User updated successfully' : 'User created successfully');
      },
      onError: () => showAlert('Failed to save user', 'error'),
    });
  };

  const handleRoleSubmit = () => {
    const routeMethod = selectedRole ? putRole : postRole;
    const routeName = selectedRole ? 'admin.roles.update' : 'admin.roles.store';

    routeMethod(route(routeName, selectedRole?.id), roleData, {
      onSuccess: () => {
        setOpenRoleDialog(false);
        showAlert(selectedRole ? 'Role updated successfully' : 'Role created successfully');
      },
      onError: () => showAlert('Failed to save role', 'error'),
    });
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = processedUsers;
    
    if (searchText) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase())
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

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Access Control"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin', href: '/admin' },
        { label: 'Access Control' }
      ]}
    >
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Access Control
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, roles, and permissions using Spatie Laravel Permission
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
            <Tab icon={<GroupIcon />} label={`Roles (${roles?.length || 0})`} />
            <Tab icon={<ShieldIcon />} label={`Permissions (${permissions?.length || 0})`} />
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
                  <Button 
                    variant="contained" 
                    startIcon={<PersonAddIcon />}
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

        {/* Permissions Tab */}
        {activeTab === 2 && (
          <Paper sx={{ borderRadius: 3, p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                System Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {permissions?.length || 0} permissions available across all guards
              </Typography>
            </Box>

            <SpatiePermissionMatrix
              permissions={permissions || []}
              selectedPermissions={[]}
              onPermissionChange={() => {}}
              disabled={true}
            />
          </Paper>
        )}

        {/* User Dialog */}
        <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userData.name}
                  onChange={(e) => setUserData('name', e.target.value)}
                  error={!!userErrors.name}
                  helperText={userErrors.name}
                />
              </Grid>
              <Grid item xs={12}>
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
              {!selectedUser && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={userData.password}
                      onChange={(e) => setUserData('password', e.target.value)}
                      error={!!userErrors.password}
                      helperText={userErrors.password}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      value={userData.password_confirmation}
                      onChange={(e) => setUserData('password_confirmation', e.target.value)}
                      error={!!userErrors.password_confirmation}
                      helperText={userErrors.password_confirmation}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
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
            <Button onClick={handleUserSubmit} variant="contained" disabled={userProcessing}>
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Role Dialog */}
        <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedRole ? 'Edit Role' : 'Create New Role'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Role Name"
                  value={roleData.name}
                  onChange={(e) => setRoleData('name', e.target.value)}
                  error={!!roleErrors.name}
                  helperText={roleErrors.name}
                  placeholder="e.g., admin, manager"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Guard Name"
                  value={roleData.guard_name}
                  onChange={(e) => setRoleData('guard_name', e.target.value)}
                  error={!!roleErrors.guard_name}
                  helperText={roleErrors.guard_name}
                  disabled={!!selectedRole}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
            <Button onClick={handleRoleSubmit} variant="contained" disabled={roleProcessing}>
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Role Permissions Dialog */}
        <RolePermissionsDialog
          open={openPermissionsDialog}
          onClose={() => setOpenPermissionsDialog(false)}
          role={selectedRole}
          permissions={permissions || []}
          onSave={handleSavePermissions}
        />

        {/* User Roles & Permissions Dialog */}
        <UserRolesPermissionsDialog
          open={openUserAccessDialog}
          onClose={() => setOpenUserAccessDialog(false)}
          user={selectedUser}
          roles={roles || []}
          permissions={permissions || []}
          onSave={handleSaveUserAccess}
        />
      </Box>
    </AuthenticatedLayout>
  );
}
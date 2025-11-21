import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import {
  Box, Paper, Typography, Button, Chip, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Grid, IconButton, Tooltip, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Checkbox, Stack, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon,
  ToggleOn as ActiveIcon, ToggleOff as InactiveIcon,
  Security as SecurityIcon, Refresh as RefreshIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Notification from '@/Components/Notification';

const RolePermissionManager = ({ role_permissions=[], roles=[], permissions=[], flash, auth }) => {
  const { props } = usePage();
  
  // Initialize state with proper array checks
  const [rolePermissions, setRolePermissions] = useState(() => {
    return Array.isArray(role_permissions) ? role_permissions : [];
  });
  
  const [selectedRole, setSelectedRole] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Use Inertia form for bulk assignment
  const { data, setData, post, processing, errors, reset } = useForm({
    role_id: '',
    permission_ids: [],
    is_enabled: true,
  });

  // Separate forms for other operations to avoid conflicts
  const deleteForm = useForm();
  const toggleForm = useForm();

  // Handle flash messages from Inertia
  useEffect(() => {
    if (flash?.success) {
      setAlert({ open: true, message: flash.success, severity: 'success' });
    }
    if (flash?.error) {
      setAlert({ open: true, message: flash.error, severity: 'error' });
    }
  }, [flash]);

  // Update rolePermissions when props change
  useEffect(() => {
    if (Array.isArray(role_permissions)) {
      setRolePermissions(role_permissions);
    }
  }, [role_permissions]);

  // Fetch role permissions when role is selected
  const fetchRolePermissions = (roleId = '') => {
    if (roleId) {
      setLoading(true);
      router.get(`/admin/role-permissions/role/${roleId}`, {}, {
        preserveState: true,
        onSuccess: (page) => {
          const newPermissions = page.props.role_permissions || [];
          setRolePermissions(Array.isArray(newPermissions) ? newPermissions : []);
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
          showAlert('Failed to fetch role permissions', 'error');
        },
        onFinish: () => setLoading(false)
      });
    } else {
      setRolePermissions([]);
    }
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({ open: true, message, severity });
  };


  const handleAssignPermission = () => {
  if (!selectedRole || selectedPermissionIds.length === 0) {
    showAlert('Please select a role and at least one permission', 'warning');
    return;
  }

  const formData = {
    role_id: selectedRole,
    permission_ids: selectedPermissionIds,
    _method: 'post'
  };

  // Use router.post directly instead of the form helper
  router.post('/admin/role-permissions/bulk-assign', formData, {
    onSuccess: () => {
      showAlert('Permissions assigned successfully');
      setOpenDialog(false);
      setSelectedPermissionIds([]);
      fetchRolePermissions(selectedRole);
    },
    onError: (errors) => {
      showAlert('Failed to assign permissions', 'error');
    }
  });
  };

  // FIXED: Delete permission with separate form
  const handleRemovePermission = (permissionId) => {
    if (confirm('Are you sure you want to remove this permission?')) {
      deleteForm.delete(`/admin/role-permissions/${permissionId}`, {
        preserveState: true,
        onSuccess: () => {
          showAlert('Permission removed successfully');
          fetchRolePermissions(selectedRole);
        },
        onError: () => {
          showAlert('Failed to remove permission', 'error');
        }
      });
    }
  };

  // FIXED: Toggle status with separate form
  const handleToggleStatus = (permissionId, currentStatus) => {
    toggleForm.patch(`/admin/role-permissions/${permissionId}/toggle-status`, {}, {
      preserveState: true,
      onSuccess: () => {
        showAlert(`Permission ${currentStatus ? 'disabled' : 'enabled'} successfully`);
        fetchRolePermissions(selectedRole);
      },
      onError: () => {
        showAlert('Failed to update permission status', 'error');
      }
    });
  };

  // Filter available permissions (not already assigned to selected role)
  const availablePermissions = Array.isArray(permissions) && Array.isArray(rolePermissions) 
    ? permissions.filter(permission => 
        !rolePermissions.some(rp => rp.permission_id === permission.permission_id)
      )
    : [];

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  // Reset dialog when opening
  const handleOpenDialog = () => {
    if (!selectedRole) {
      showAlert('Please select a role first', 'warning');
      return;
    }
    setSelectedPermissionIds([]);
    setOpenDialog(true);
  };

  // Get current role name
  const getCurrentRoleName = () => {
    if (!Array.isArray(roles) || !selectedRole) return '';
    const role = roles.find(r => r.role_id === selectedRole);
    return role ? `${role.name} (${role.slug})` : '';
  };

  // Debug component to see current state
  const DebugInfo = () => (
    <Box sx={{ p: 2, bgcolor: 'grey.100', mt: 2, borderRadius: 1 }}>
      <Typography variant="h6">Debug Info:</Typography>
      <Typography variant="body2">
        Selected Role: {selectedRole}
      </Typography>
      <Typography variant="body2">
        Selected Permission IDs: {JSON.stringify(selectedPermissionIds)}
      </Typography>
      <Typography variant="body2">
        Selected Permission IDs Length: {selectedPermissionIds.length}
      </Typography>
      <Typography variant="body2">
        Form Data: {JSON.stringify(data)}
      </Typography>
      <Typography variant="body2">
        Errors: {JSON.stringify(errors)}
      </Typography>
    </Box>
  );

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Role Permissions Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> },
        { label: 'Role Permissions' }
      ]}
    >
      <Box>
        <Notification 
          open={alert.open} 
          severity={alert.severity} 
          message={alert.message}
          onClose={handleCloseAlert}
        />

        {/* Uncomment for debugging */}
        {/* <DebugInfo /> */}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              Role Permissions Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              disabled={!selectedRole}
            >
              Assign Permissions
            </Button>
          </Box>

          {/* Role Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Role</InputLabel>
            <Select
              value={selectedRole}
              label="Select Role"
              onChange={(e) => {
                const newRoleId = e.target.value;
                setSelectedRole(newRoleId);
                fetchRolePermissions(newRoleId);
              }}
            >
              <MenuItem value="">
                <em>Select a role</em>
              </MenuItem>
              {Array.isArray(roles) && roles.map(role => (
                <MenuItem key={role.role_id} value={role.role_id}>
                  {role.name} ({role.slug})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Role Permissions Table */}
          {selectedRole && !loading && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Permission</TableCell>
                    <TableCell>Module</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Granted At</TableCell>
                    <TableCell>Expires At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rolePermissions.length > 0 ? (
                    rolePermissions.map(rp => (
                      <TableRow key={rp.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {rp.permission?.name || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {rp.permission?.description || 'No description'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={rp.permission?.module || 'N/A'} 
                            size="small" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={rp.is_enabled ? 'Disable permission' : 'Enable permission'}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={rp.is_enabled}
                                  onChange={() => handleToggleStatus(rp.id, rp.is_enabled)}
                                  color="primary"
                                  disabled={toggleForm.processing}
                                />
                              }
                              label={rp.is_enabled ? 'Active' : 'Inactive'}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {rp.granted_at ? new Date(rp.granted_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {rp.expires_at ? new Date(rp.expires_at).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Remove permission">
                            <IconButton
                              color="error"
                              onClick={() => handleRemovePermission(rp.id)}
                              disabled={deleteForm.processing}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No permissions assigned to this role
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!selectedRole && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <SecurityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Please select a role to view and manage permissions
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Assign Permissions Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Assign Permissions to Role
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                label="Role"
                disabled
              >
                <MenuItem value={selectedRole}>
                  {getCurrentRoleName()}
                </MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>
              Available Permissions ({availablePermissions.length})
            </Typography>

            {availablePermissions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  All available permissions are already assigned to this role
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {availablePermissions.map(permission => (
                  <Grid item xs={12} md={6} key={permission.permission_id}>
                    <Card 
                      variant="outlined"
                      sx={{
                        borderColor: selectedPermissionIds.includes(permission.permission_id) 
                          ? 'primary.main' 
                          : 'divider'
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedPermissionIds.includes(permission.permission_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPermissionIds(prev => [...prev, permission.permission_id]);
                                } else {
                                  setSelectedPermissionIds(prev => prev.filter(id => id !== permission.permission_id));
                                }
                              }}
                              disabled={processing}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {permission.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {permission.description}
                              </Typography>
                              <Box sx={{ mt: 0.5 }}>
                                <Chip 
                                  label={permission.module} 
                                  size="small" 
                                  variant="outlined" 
                                />
                              </Box>
                            </Box>
                          }
                          sx={{ width: '100%', alignItems: 'flex-start' }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Show validation errors */}
            {errors.role_id && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.role_id}
              </Alert>
            )}
            {errors.permission_ids && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.permission_ids}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDialog(false)} 
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleAssignPermission}
              disabled={!selectedRole || selectedPermissionIds.length === 0 || processing}
              startIcon={processing ? <CircularProgress size={16} /> : <AddIcon />}
            >
              {processing ? 'Assigning...' : `Assign Selected (${selectedPermissionIds.length})`}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AuthenticatedLayout>
  );
};

export default RolePermissionManager;
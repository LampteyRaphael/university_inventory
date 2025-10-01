import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  Slide,
  Fade,
  Tooltip,
  Avatar,
  LinearProgress,
  InputAdornment,
  FormHelperText,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import moment from "moment";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon,
  Language as LanguageIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  CloudUpload,
  Download,
  Visibility as ViewIcon,
  Block as BlockIcon,
  PlayArrow as ActivateIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { router, useForm, usePage } from "@inertiajs/react";
import Notification from "@/Components/Notification";

// Custom Modern Components (same as your example)
const ModernCard = ({ children, sx = {} }) => (
  <Card sx={{
    borderRadius: 3,
    p: 2,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    },
    ...sx
  }}>
    {children}
  </Card>
);

const SummaryCard = ({ title, value, icon, color, subtitle }) => (
  <ModernCard>
    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={800} color={color} sx={{ mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ 
          bgcolor: alpha(color, 0.1), 
          color: color,
          width: 48,
          height: 48
        }}>
          {icon}
        </Avatar>
      </Stack>
    </CardContent>
  </ModernCard>
);

export default function UserManagement({ users, auth, roles, universities, departments, languages }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { flash } = usePage().props;

  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [formErrors, setFormErrors] = useState({});

  // Empty form template
  const emptyForm = {
    user_id: "",
    employee_id: "",
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    position: "",
    role: "staff",
    university_id: "",
    department_id: "",
    is_active: true,
    hire_date: "",
    termination_date: "",
    timezone: "UTC",
    language: "en",
    password: "",
    password_confirmation: "",
  };

  // Use Inertia form hook
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(emptyForm);

  // Role display configuration
  const roleConfig = {
    super_admin: { label: 'Super Admin', color: 'error' },
    inventory_manager: { label: 'Inventory Manager', color: 'warning' },
    department_head: { label: 'Department Head', color: 'info' },
    procurement_officer: { label: 'Procurement Officer', color: 'secondary' },
    faculty: { label: 'Faculty', color: 'primary' },
    staff: { label: 'Staff', color: 'default' },
    student: { label: 'Student', color: 'success' },
  };

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    console.log(users);
    
    const processData = setTimeout(() => {
      const formatted = users?.map((user, index) => ({
        id: user?.user_id ?? index + 1,
        ...user,
        full_name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`
          : user.name,
        university_name: user.university || 'N/A',
        department_name: user.department || 'N/A',
        last_login_formatted: user.last_login_at 
          ? moment(user.last_login_at).format("MMM Do YYYY, h:mm a")
          : "Never",
      }));
      
      setRows(formatted || []);
      setGridLoading(false);
    }, 800);

    return () => clearTimeout(processData);
  }, [users]);

  // Calculate summary statistics
  const { totalUsers, activeUsers, adminUsers, inactiveUsers } = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(row => row.is_active).length;
    const admin = rows.filter(row => row.role === 'super_admin').length;
    const inactive = rows.filter(row => !row.is_active).length;
    
    return {
      totalUsers: total,
      activeUsers: active,
      adminUsers: admin,
      inactiveUsers: inactive,
    };
  }, [rows]);

  // DataGrid columns
  const columns = useMemo(() => [
    {
      field: 'employee_id',
      headerName: 'Employee ID',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'username',
      headerName: 'Username',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'full_name',
      headerName: 'Full Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" fontWeight="bold" noWrap>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 160,
      renderCell: (params) => {
        const role = roleConfig[params.value];
        return (
          <Chip
            label={role?.label || params.value}
            size="small"
            color={role?.color || 'default'}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'university_name',
      headerName: 'University',
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'department_name',
      headerName: 'Department',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Tooltip title={params.value ? "Active" : "Inactive"}>
          <Chip
            icon={params.value ? <ActiveIcon /> : <InactiveIcon />}
            label={params.value ? "Active" : "Inactive"}
            color={params.value ? "success" : "error"}
            size="small"
            variant="outlined"
          />
        </Tooltip>
      ),
    },
    {
      field: 'last_login_formatted',
      headerName: 'Last Login',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Edit"><EditIcon fontSize="small" /></Tooltip>}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Delete"><DeleteIcon fontSize="small" /></Tooltip>}
          label="Delete"
          onClick={() => handleDeleteClick(params.row)}
          color="error"
        />,
      ],
    },
  ], [roleConfig]);

  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    const query = searchText.toLowerCase();
    return rows.filter(row => 
      row.username?.toLowerCase().includes(query) ||
      row.email?.toLowerCase().includes(query) ||
      row.first_name?.toLowerCase().includes(query) ||
      row.last_name?.toLowerCase().includes(query) ||
      row.employee_id?.toLowerCase().includes(query) ||
      row.position?.toLowerCase().includes(query)
    );
  }, [rows, searchText]);

  // Event handlers
  const handleCreate = useCallback(() => {
    setSelectedUser(null);
    reset({
      ...emptyForm,
      university_id: auth.user?.university_id || "",
    });
    setOpenDialog(true);
    clearErrors();
  }, [auth, reset, clearErrors]);

  const handleEdit = useCallback((row) => {
    setSelectedUser(row);
    setData({
      ...emptyForm,
      ...row,
      user_id: row.user_id,
      hire_date: row.hire_date ? moment(row.hire_date).format('YYYY-MM-DD') : "",
      termination_date: row.termination_date ? moment(row.termination_date).format('YYYY-MM-DD') : "",
      password: "", // Clear password for edits
      password_confirmation: "",
    });
    setOpenDialog(true);
    clearErrors();
  }, [setData, clearErrors]);

  const handleDeleteClick = useCallback((row) => {
    setSelectedUser(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!selectedUser) return;
    
    router.delete(route('users.destroy', selectedUser.user_id), {
      onSuccess: () => {
        setOpenDeleteDialog(false);
        setSelectedUser(null);
        setAlert({ 
          open: true, 
          message: 'User deleted successfully', 
          severity: 'success' 
        });
      },
      onError: (errors) => {
        setOpenDeleteDialog(false);
        setAlert({ 
          open: true, 
          message: 'Error deleting user', 
          severity: 'error' 
        });
      }
    });
  }, [selectedUser]);

  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setData(name, newValue);
  }, [setData]);

  const validateForm = useCallback(() => {
    const validationErrors = {};
    
    if (!data.email) validationErrors.email = 'Email is required';
    if (!data.first_name) validationErrors.first_name = 'First name is required';
    if (!data.last_name) validationErrors.last_name = 'Last name is required';
    if (!data.role) validationErrors.role = 'Role is required';
    
    // Password validation for new users
    if (!selectedUser && (!data.password || data.password.length < 8)) {
      validationErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!selectedUser && data.password !== data.password_confirmation) {
      validationErrors.password_confirmation = 'Passwords do not match';
    }
    
    return validationErrors;
  }, [data, selectedUser]);

  const handleSubmit = useCallback(() => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    // Prepare the data for submission
    const submitData = {
      ...data,
      _method: selectedUser ? 'put' : 'post'
    };

    // Remove password confirmation from the data
    delete submitData.password_confirmation;

    if (selectedUser) {
      // Update existing user
      put(route('users.update', selectedUser.user_id), submitData, {
        onSuccess: () => {
          setAlert({ open: true, message: 'User updated successfully', severity: 'success' });
          setOpenDialog(false);
          setSelectedUser(null);
          reset();
        },
        onError: (errors) => {
          setAlert({ open: true, message: 'Error updating user', severity: 'error' });
        }
      });
    } else {
      // Create new user
      post(route('users.store'), submitData, {
        onSuccess: () => {
          setAlert({ open: true, message: 'User created successfully', severity: 'success' });
          setOpenDialog(false);
          reset();
        },
        onError: (errors) => {
          setAlert({ open: true, message: 'Error creating user', severity: 'error' });
        }
      });
    }
  }, [data, selectedUser, validateForm, put, post, reset]);

  const handleRefresh = useCallback(() => {
    setGridLoading(true);
    router.visit(route('users.index'), {
      preserveState: true,
      onFinish: () => setGridLoading(false),
    });
  }, []);

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  useEffect(() => {
    if (flash.success) {
      showAlert(flash.success, "success");
    }

    if (flash.error) {
      showAlert(flash.error, "error");
    }
  }, [flash]);

  return (
    <AuthenticatedLayout
      auth={auth}
      title="User Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'User Management' }
      ]}
    >
      <Fade in timeout={500}>
        <Box>
          <Notification 
            open={alert.open} 
            severity={alert.severity} 
            message={alert.message}
            onClose={handleCloseAlert}
          />

          {/* Header Section */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: "background.paper",
              boxShadow: 1,
            }}
          >
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <PersonIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      User Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Manage system users, roles, and permissions
                    </Typography>
                  </Box>
                  {searchText && (
                    <Chip
                      label={`${filteredRows.length} of ${rows.length} users`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: "auto" }}>
                <Grid
                  container
                  spacing={1.5}
                  alignItems="center"
                  justifyContent={{ xs: "flex-start", md: "flex-end" }}
                  wrap="wrap"
                >
                  <Grid>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreate}
                      size="small"
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      New User
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      variant="outlined"
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Export
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Total Users" 
                value={totalUsers} 
                icon={<GroupIcon />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Active Users" 
                value={activeUsers} 
                icon={<ActiveIcon />} 
                color={theme.palette.success.main} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Admin Users" 
                value={adminUsers} 
                icon={<SecurityIcon />} 
                color={theme.palette.warning.main} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Inactive Users" 
                value={inactiveUsers} 
                icon={<InactiveIcon />} 
                color={theme.palette.error.main} 
              />
            </Grid>
          </Grid>

          {/* Data Grid Section */}
          <Paper
            sx={{
              height: "100%",
              width: "100%",
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 3,
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "background.paper",
                p: 2,
                borderRadius: 2,
                boxShadow: 1,
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PersonIcon color="primary" fontSize="medium" />
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  User List
                </Typography>
                {searchText && (
                  <Chip
                    label={`${filteredRows.length} of ${rows.length} users`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search users..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: { xs: "100%", sm: 250 },
                    backgroundColor: "background.default",
                    borderRadius: 1,
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleRefresh}
                  startIcon={<RefreshIcon />}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>

            <DataGrid
              autoHeight
              rows={filteredRows}
              columns={columns}
              pageSizeOptions={[5, 10, 20, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'grey.50',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                },
              }}
              loading={gridLoading}
              disableRowSelectionOnClick
            />

            {gridLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={60} thickness={4} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading users...
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Create/Edit User Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)} 
            maxWidth="md" 
            fullWidth 
            TransitionComponent={Slide}
            transitionDuration={300}
            fullScreen={isMobile}
          >
            <DialogTitle sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              py: 2
            }}>
              <Box display="flex" alignItems="center">
                {selectedUser ? (
                  <>
                    <EditIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Edit User</Typography>
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Create User</Typography>
                  </>
                )}
              </Box>
              <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {loading && <LinearProgress />}
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Basic Information */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="First Name" 
                    name="first_name" 
                    value={data.first_name} 
                    onChange={handleInputChange}
                    error={!!formErrors.first_name}
                    helperText={formErrors.first_name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Last Name" 
                    name="last_name" 
                    value={data.last_name} 
                    onChange={handleInputChange}
                    error={!!formErrors.last_name}
                    helperText={formErrors.last_name}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Email" 
                    name="email" 
                    type="email"
                    value={data.email} 
                    onChange={handleInputChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Username" 
                    name="username" 
                    value={data.username} 
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Employee ID" 
                    name="employee_id" 
                    value={data.employee_id} 
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Phone" 
                    name="phone" 
                    value={data.phone} 
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Position" 
                    name="position" 
                    value={data.position} 
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Role and Organization */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!formErrors.role}>
                    <InputLabel>Role</InputLabel>
                    <Select 
                      name="role" 
                      value={data.role} 
                      label="Role" 
                      onChange={handleInputChange}
                      startAdornment={
                        <InputAdornment position="start">
                          <SecurityIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {Object.entries(roleConfig).map(([value, config]) => (
                        <MenuItem key={value} value={value}>
                          {config.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.role && (
                      <FormHelperText>{formErrors.role}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>University</InputLabel>
                    <Select 
                      name="university_id" 
                      value={data.university_id} 
                      label="University" 
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">None</MenuItem>
                      {universities?.map(university => (
                        <MenuItem key={university.university_id} value={university.university_id}>
                          {university.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select 
                      name="department_id" 
                      value={data.department_id} 
                      label="Department" 
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">None</MenuItem>
                      {departments?.map(department => (
                        <MenuItem key={department.department_id} value={department.department_id}>
                          {department.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Dates */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Hire Date" 
                    name="hire_date" 
                    type="date" 
                    value={data.hire_date} 
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Termination Date" 
                    name="termination_date" 
                    type="date" 
                    value={data.termination_date} 
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Password Fields (only show for new users or when explicitly changing) */}
                {!selectedUser && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField 
                        fullWidth 
                        label="Password" 
                        name="password" 
                        type="password"
                        value={data.password} 
                        onChange={handleInputChange}
                        error={!!formErrors.password}
                        helperText={formErrors.password}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField 
                        fullWidth 
                        label="Confirm Password" 
                        name="password_confirmation" 
                        type="password"
                        value={data.password_confirmation} 
                        onChange={handleInputChange}
                        error={!!formErrors.password_confirmation}
                        helperText={formErrors.password_confirmation}
                      />
                    </Grid>
                  </>
                )}

                {/* Settings */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select 
                      name="language" 
                      value={data.language} 
                      label="Language" 
                      onChange={handleInputChange}
                    >
                      {Object.entries(languages || { en: 'English', es: 'Spanish', fr: 'French' }).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select 
                      name="timezone" 
                      value={data.timezone} 
                      label="Timezone" 
                      onChange={handleInputChange}
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="America/New_York">Eastern Time</MenuItem>
                      <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                      <MenuItem value="Europe/London">London</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="is_active"
                        checked={data.is_active}
                        onChange={handleInputChange}
                        color="success"
                      />
                    }
                    label="Active User"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button 
                onClick={() => setOpenDialog(false)} 
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
              
              <Button 
                onClick={handleSubmit} 
                variant="contained" 
                disabled={processing}
                startIcon={processing ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {processing ? 'Saving...' : (selectedUser ? 'Update User' : 'Create User')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog 
            open={openDeleteDialog} 
            onClose={() => setOpenDeleteDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete user "{selectedUser?.full_name}"? 
                This action cannot be undone.
              </Typography>
              {selectedUser && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedUser.email}<br />
                    <strong>Role:</strong> {roleConfig[selectedUser.role]?.label}<br />
                    <strong>Status:</strong> {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleDeleteConfirm}
                startIcon={<DeleteIcon />}
                disabled={processing}
              >
                Delete User
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
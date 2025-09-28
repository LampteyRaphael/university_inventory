import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router, useForm, usePage } from '@inertiajs/react';
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
  Switch,
  FormControlLabel,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import moment from "moment";
import {
  UploadFile as UploadFileIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  AccountBalance as DepartmentIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Person as ContactPersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BuildingIcon,
  MeetingRoom as RoomIcon,
  AttachMoney as BudgetIcon,
  AccountCircle as HeadIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  TrendingUp as BudgetUtilizationIcon,
  Warning as BudgetWarningIcon,
  AddCircleOutline,
  CloudUpload,
  Download,
  Inventory,
} from "@mui/icons-material";
import Notification from "@/Components/Notification";

// Custom Modern Components
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

const CustomToolbar = ({ onCreate, onImport, onExport, onRefresh }) => (
  <GridToolbarContainer sx={{ p: 2, gap: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Button 
      variant="contained" 
      startIcon={<AddIcon />} 
      onClick={onCreate}
      sx={{
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
        '&:hover': {
          background: 'linear-gradient(45deg, #1976D2 30%, #00ACC1 90%)',
        }
      }}
    >
      New Department
    </Button>
    <Button 
      variant="outlined" 
      onClick={onRefresh} 
      startIcon={<RefreshIcon />}
    >
      Refresh
    </Button>
    <GridToolbarColumnsButton />
    <GridToolbarFilterButton />
    <GridToolbarExport />
    <input
      type="file"
      accept=".xlsx,.xls"
      style={{ display: 'none' }}
      id="upload-file"
      onChange={onImport}
    />
    <Button 
      variant="outlined" 
      component="label"
      htmlFor="upload-file"
      startIcon={<UploadFileIcon />}
    >
      Import
    </Button>
  </GridToolbarContainer>
);

const ModernTextField = ({ label, ...props }) => (
  <TextField
    {...props}
    label={label}
    variant="outlined"
    size="small"
    fullWidth
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        backgroundColor: 'white',
        '&:hover fieldset': {
          borderColor: 'primary.main',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'primary.main',
          borderWidth: 2,
        },
      },
    }}
  />
);

export default function Departments({ departments = [], auth, universities=[], users=[] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const { flash } = usePage().props;
  
  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert({ ...alert, open: false }), 5000);
  };
  
  // Inertia.js Form Handling
  const { data, setData, post, put, processing, errors, reset } = useForm({
    department_id: "",
    university_id: "",
    department_code: "",
    name: "",
    building: "",
    floor: "",
    room_number: "",
    contact_person: "",
    contact_email: "",
    contact_phone: "",
    annual_budget: 0,
    remaining_budget: 0,
    department_head_id: "",
    is_active: true,
    custom_fields: "",
  });

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    const processData = setTimeout(() => {
      const formatted = (departments || []).map((dept, index) => ({
        id: dept?.department_id ?? index + 1,
        ...dept,
        annual_budget: Number(dept?.annual_budget ?? 0),
        remaining_budget: Number(dept?.remaining_budget ?? 0),
        university_id: dept?.university_id,
        created_at: dept?.created_at ? 
          moment(dept.created_at).format("MMM Do YYYY, h:mm a") : "",
        updated_at: dept?.updated_at ? 
          moment(dept.updated_at).format("MMM Do YYYY, h:mm a") : "",
        deleted_at: dept?.deleted_at ? 
          moment(dept.deleted_at).format("MMM Do YYYY, h:mm a") : "",
      }));
      
      setRows(formatted);
      setGridLoading(false);
    }, 800);

    return () => clearTimeout(processData);
  }, [departments]);

  // Calculate summary statistics
  const { totalDepartments, activeDepartments, totalBudget, budgetUtilization } = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(row => row.is_active).length;
    const budget = rows.reduce((sum, row) => sum + (row.annual_budget || 0), 0);
    const utilized = rows.reduce((sum, row) => sum + (row.annual_budget - row.remaining_budget || 0), 0);
    const utilization = budget > 0 ? (utilized / budget) * 100 : 0;
    
    return {
      totalDepartments: total,
      activeDepartments: active,
      totalBudget: budget,
      budgetUtilization: utilization,
    };
  }, [rows]);

  // Column definitions
  const columns = useMemo(() => [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      )
    },
    { 
      field: 'department_code', 
      headerName: 'CODE', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'name', 
      headerName: 'DEPARTMENT NAME', 
      width: 200,
      flex: isMobile ? 1 : 0,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.building} • {params.row.room_number}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'university_id', 
      headerName: 'UNIVERSITY', 
      width: 200,
      renderCell: (params) => {
        return (
          <Chip 
            label={params.row.university_name || "N/A"} 
            size="small" 
            variant="outlined"
            color="secondary"
          />
        );
      }
    },
    { 
      field: 'contact_person', 
      headerName: 'CONTACT', 
      width: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.contact_email}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'annual_budget', 
      headerName: 'BUDGET', 
      width: 140, 
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          ₵{Number(params.value).toLocaleString()}
        </Typography>
      )
    },
    { 
      field: 'remaining_budget', 
      headerName: 'REMAINING', 
      width: 130, 
      type: 'number',
      renderCell: (params) => {
        const value = Number(params.value);
        const color = value < 0 ? 'error' : value < (params.row.annual_budget * 0.1) ? 'warning' : 'success';
        return (
          <Chip 
            label={`₵${value.toLocaleString()}`} 
            size="small" 
            color={color}
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        );
      }
    },
    { 
      field: 'budget_utilization', 
      headerName: 'UTILIZATION', 
      width: 120,
      valueGetter: (params) => {
        if (!params || !params.row) return 0;
        const row = params.row;
        if (!row.annual_budget || row.annual_budget <= 0) return 0;
        return ((row.annual_budget - (row.remaining_budget || 0)) / row.annual_budget) * 100;
      },
      renderCell: (params) => {
        if (!params || params.value === undefined || params.value === "") {
          return <Chip label="N/A" size="small" color="default" />;
        }
        const utilization = Number(params.value);
        let color = 'success';
        if (utilization >= 90) color = 'error';
        else if (utilization >= 75) color = 'warning';
        
        return (
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="body2" fontWeight={600} color={`${color}.main`}>
              {utilization.toFixed(1)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={utilization} 
              color={color}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        );
      }
    },
    { 
      field: 'is_active', 
      headerName: 'STATUS', 
      width: 110, 
      renderCell: (params) => (
        <Chip 
          icon={params.value ? <ActiveIcon /> : <InactiveIcon />} 
          label={params.value ? "ACTIVE" : "INACTIVE"} 
          color={params.value ? "success" : "default"} 
          size="small" 
          variant="filled"
        />
      ) 
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 120,
      sortable: false,
      filterable: false,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Edit"><EditIcon fontSize="small" /></Tooltip>}
          label="Edit"
          onClick={() => handleEdit(params.row)}
          sx={{ color: 'primary.main' }}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Delete"><DeleteIcon fontSize="small" /></Tooltip>}
          label="Delete"
          onClick={() => handleDeleteClick(params.row)}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ], [universities, users, isMobile]);

  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    const query = searchText.toLowerCase();
    return rows.filter(row => 
      row.name?.toLowerCase().includes(query) ||
      row.department_code?.toLowerCase().includes(query) ||
      row.building?.toLowerCase().includes(query) ||
      row.contact_person?.toLowerCase().includes(query) ||
      row.contact_email?.toLowerCase().includes(query) ||
      (universities.find(u => u.university_id === row.university_id)?.name || "").toLowerCase().includes(query)
    );
  }, [rows, searchText, universities]);

  // Event handlers
  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows?.map(row => ({
        'Department Code': row.department_code,
        'Name': row.name,
        'University': universities.find(u => u.university_id === row.university_id)?.name || row.university_id,
        'Building': row.building,
        'Floor': row.floor,
        'Room': row.room_number,
        'Contact Person': row.contact_person,
        'Contact Email': row.contact_email,
        'Contact Phone': row.contact_phone,
        'Annual Budget': row.annual_budget,
        'Remaining Budget': row.remaining_budget,
        'Budget Utilization': `${((row.annual_budget - row.remaining_budget) / row.annual_budget * 100).toFixed(1)}%`,
        'Department Head': users.find(u => u.id === row.department_head_id) ? 
          `${users.find(u => u.id === row.department_head_id).first_name} ${users.find(u => u.id === row.department_head_id).last_name}` : '',
        'Status': row.is_active ? 'Active' : 'Inactive',
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');
    XLSX.writeFile(workbook, `departments_export_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
    setAlert({ open: true, message: 'Department data exported successfully', severity: 'success' });
  }, [filteredRows, universities, users]);

  const handleUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setGridLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const uploadedData = XLSX.utils.sheet_to_json(worksheet);
        
        const mappedData = uploadedData?.map((item, index) => ({
          id: `uploaded_${Date.now()}_${index}`,
          department_id: `uploaded_${Date.now()}_${index}`,
          ...item,
          annual_budget: Number(item.annual_budget) || 0,
          remaining_budget: Number(item.remaining_budget) || 0,
          is_active: item.status === 'Active',
          created_at: moment().format("MMM Do YYYY, h:mm a"),
        }));
        
        setRows(prev => [...mappedData, ...prev]);
        setAlert({ open: true, message: `${mappedData.length} departments imported successfully`, severity: 'success' });
      } catch (error) {
        setAlert({ open: true, message: 'Error processing file: ' + error.message, severity: 'error' });
      } finally {
        setGridLoading(false);
      }
    };
    
    reader.onerror = () => {
      setAlert({ open: true, message: 'Error reading file', severity: 'error' });
      setGridLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedDepartment("");
    reset({
      university_id: auth.user?.university_id || "",
      department_code: "",
      name: "",
      building: "",
      floor: "",
      room_number: "",
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      annual_budget: 0,
      remaining_budget: 0,
      department_head_id: "",
      is_active: true,
      custom_fields: "",
    });
    setOpenDialog(true);
  }, [auth, reset]);

  const handleEdit = useCallback((row) => {
    setSelectedDepartment(row);
    setData({
      department_id: row.department_id,
      university_id: row.university_id,
      department_code: row.department_code,
      name: row.name,
      building: row.building,
      floor: row.floor,
      room_number: row.room_number,
      contact_person: row.contact_person,
      contact_email: row.contact_email,
      contact_phone: row.contact_phone,
      annual_budget: row.annual_budget,
      remaining_budget: row.remaining_budget,
      department_head_id: row.department_head_id,
      is_active: row.is_active,
      custom_fields: row.custom_fields,
    });
    setOpenDialog(true);
  }, [setData]);

  const handleDeleteClick = useCallback((row) => {
    setSelectedDepartment(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    // Inertia.js delete request
    router.delete(route('department.destroy', { id: selectedDepartment.department_id }), {
      onSuccess: () => {
        setRows(prev => prev.filter(r => r.id !== selectedDepartment.id));
        setOpenDeleteDialog(false);
        setAlert({ open: true, message: 'Department deleted successfully', severity: 'success' });
      },
      onError: () => {
        setAlert({ open: true, message: 'Failed to delete department', severity: 'error' });
      },
    });
  }, [selectedDepartment, post]);

  const handleSubmit = useCallback(() => {
    if (selectedDepartment) {
      // Update existing department
      put(route('department.update', { id: selectedDepartment.department_id }), {
        onSuccess: () => {
          setOpenDialog(false);
          setAlert({ open: true, message: 'Department updated successfully', severity: 'success' });
        },
        onError: () => {
          setAlert({ open: true, message: 'Failed to update department', severity: 'error' });
        },
      });
    } else {
      // Create new department
      post(route('department.store'), {
        onSuccess: () => {
          setOpenDialog(false);
          setAlert({ open: true, message: 'Department created successfully', severity: 'success' });
        },
        onError: () => {
          setAlert({ open: true, message: 'Failed to create department', severity: 'error' });
        },
      });
    }
  }, [selectedDepartment, post, put]);

  const handleRefresh = useCallback(() => {
    setGridLoading(true);
    setTimeout(() => {
      setGridLoading(false);
      setAlert({ open: true, message: 'Data refreshed', severity: 'info' });
    }, 800);
  }, []);

    useEffect(() => {
      if (flash?.success) {
        showAlert(flash.success, "success");
      }
  
      if (flash?.error) {
        showAlert(flash.error, "error");
      }
    }, [flash]);
  
    const handleCloseAlert = () => {
      setAlert((prev) => ({ ...prev, open: false }));
    };

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Department Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'Departments' }
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
                  <Inventory color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      Inventory Department
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Manage your inventory Department, track stock levels, and monitor Department performance
                    </Typography>
                  </Box>
                  {searchText && (
                    <Chip
                      label={`${rows.length} items filtered`}
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
                      startIcon={<AddCircleOutline />}
                      onClick={handleCreate}
                      size="small"
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      New Department
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      size="small"
                      startIcon={<CloudUpload />}
                      component="label"
                      variant="outlined"
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Import
                      <input
                        hidden
                        accept=".xlsx,.xls,.csv"
                        type="file"
                        onChange={handleUpload}
                      />
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={handleExport}
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
            <Grid size={{ xs:12, sm: 6}}>
              <SummaryCard 
                title="Total Departments" 
                value={totalDepartments} 
                icon={<DepartmentIcon />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid size={{ xs:12, sm: 6}}>
              <SummaryCard 
                title="Active Departments" 
                value={activeDepartments} 
                icon={<ActiveIcon />} 
                color={theme.palette.success.main} 
                subtitle={`${((activeDepartments / totalDepartments) * 100).toFixed(0)}% active`}
              />
            </Grid>
            <Grid size={{ xs:12, sm: 6}}>
              <SummaryCard 
                title="Total Budget" 
                value={`₵${totalBudget.toLocaleString()}`} 
                icon={<BudgetIcon />} 
                color={theme.palette.info.main} 
              />
            </Grid>
            <Grid size={{ xs:12, sm: 6}}>
              <SummaryCard 
                title="Budget Utilization" 
                value={`${budgetUtilization.toFixed(1)}%`} 
                icon={<BudgetUtilizationIcon />} 
                color={budgetUtilization >= 90 ? theme.palette.error.main : 
                       budgetUtilization >= 75 ? theme.palette.warning.main : 
                       theme.palette.success.main} 
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
                <DepartmentIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Departments
                </Typography>
                {searchText && (
                  <Chip 
                    label={`${filteredRows.length} of ${rows.length} departments`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search departments..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    sx: { width: isMobile ? '100%' : 250 }
                  }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleRefresh} 
                  startIcon={<RefreshIcon />}
                >
                  Refresh
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={handleCreate}
                >
                  New Department
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
                slots={{
                  toolbar: () => (
                    <CustomToolbar
                      onCreate={handleCreate}
                      onImport={handleUpload}
                      onExport={handleExport}
                      onRefresh={handleRefresh}
                    />
                  ),
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
                  '& .MuiDataGrid-toolbarContainer': {
                    p: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                }}
                loading={gridLoading}
                disableRowSelectionOnClick
              />
          </Paper>

          {/* End of Data Grid */}

          {/* Create/Edit Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)} 
            maxWidth="md" 
            fullWidth 
            transitionDuration={300}
            fullScreen={isMobile}
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
              }
            }}
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
                {selectedDepartment ? (
                  <>
                    <EditIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight={700}>Edit Department</Typography>
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight={700}>Create New Department</Typography>
                  </>
                )}
              </Box>
              <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto', p: 3 }}>
              {processing && <LinearProgress sx={{ mb: 2 }} />}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 12, md:12 }}>
                    <FormControl fullWidth error={!!errors.university_id}>
                      <InputLabel>University</InputLabel>
                      <Select 
                        name="university_id" 
                        value={data.university_id || ""} 
                        label="University" 
                        onChange={(e) => setData('university_id', e.target.value)}
                      >
                        {universities?.map(university => (
                          <MenuItem key={university.university_id} value={university.university_id}>
                            {university.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.university_id && (
                        <FormHelperText>{errors.university_id}</FormHelperText>
                      )}
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm:4  }}>
                  <TextField 
                    label="Department Code" 
                    name="department_code" 
                    fullWidth
                    value={data.department_code || ""} 
                    onChange={(e) => setData('department_code', e.target.value)} 
                    error={!!errors.department_code}
                    helperText={errors.department_code}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DepartmentIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm:4,  md:4  }}>
                  <TextField 
                    label="Department Name" 
                    fullWidth
                    name="name" 
                    value={data.name || ""} 
                    onChange={(e) => setData('name', e.target.value)} 
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    label="Building" 
                    name="building" 
                    fullWidth
                    value={data.building || ""} 
                    onChange={(e) => setData('building', e.target.value)} 
                    error={!!errors.building}
                    helperText={errors.building}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BuildingIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 4, sm: 4 }}>
                  <TextField 
                    label="Floor" 
                    name="floor" 
                    fullWidth
                    value={data.floor || ""} 
                    onChange={(e) => setData('floor', e.target.value)} 
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    label="Room Number" 
                    name="room_number" 
                    fullWidth
                    value={data.room_number || ""} 
                    onChange={(e) => setData('room_number', e.target.value)} 
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <RoomIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    label="Contact Person" 
                    name="contact_person" 
                    fullWidth
                    value={data.contact_person || ""} 
                    onChange={(e) => setData('contact_person', e.target.value)} 
                    error={!!errors.contact_person}
                    helperText={errors.contact_person}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ContactPersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    label="Contact Email" 
                    name="contact_email" 
                    type="email"
                    fullWidth
                    value={data.contact_email || ""} 
                    onChange={(e) => setData('contact_email', e.target.value)} 
                    error={!!errors.contact_email}
                    helperText={errors.contact_email}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm:4 }}>
                  <TextField 
                    label="Contact Phone" 
                    name="contact_phone"
                    fullWidth 
                    value={data.contact_phone || ""} 
                    onChange={(e) => setData('contact_phone', e.target.value)} 
                    error={!!errors.contact_phone}
                    helperText={errors.contact_phone}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm:4 }}>
                  <TextField 
                    label="Annual Budget" 
                    name="annual_budget" 
                    type="number" 
                    fullWidth
                    value={data.annual_budget || ""} 
                    onChange={(e) => setData('annual_budget', e.target.value)} 
                    error={!!errors.annual_budget}
                    helperText={errors.annual_budget}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <BudgetIcon color="action" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.01 } 
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    label="Remaining Budget" 
                    name="remaining_budget" 
                    type="number" 
                    fullWidth
                    value={data.remaining_budget || ""} 
                    onChange={(e) => setData('remaining_budget', e.target.value)} 
                    error={!!errors.remaining_budget}
                    helperText={errors.remaining_budget}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <BudgetWarningIcon color="action" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.01 } 
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Department Head</InputLabel>
                    <Select 
                      name="department_head_id" 
                      value={data.department_head_id || ""} 
                      label="Department Head" 
                      onChange={(e) => setData('department_head_id', e.target.value)}
                    >
                      <MenuItem value="">Not assigned</MenuItem>
                      {users?.map(user => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name} {user.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControlLabel 
                    control={
                      <Switch 
                        name="is_active" 
                        checked={!!data.is_active} 
                        onChange={(e) => setData('is_active', e.target.checked)} 
                        color="success"
                      />
                    } 
                    label={data.is_active ? "Department is Active" : "Department is Inactive"} 
                    sx={{ mt: 1 }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="custom_fields (JSON)"
                    value={data.custom_fields ||""}
                    onChange={(e) => setData('custom_fields', e.target.value)}
                    error={!!errors.custom_fields}
                    helperText={errors.custom_fields || 'Enter a valid JSON object (optional).'}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider', gap: 1 }}>
              <Button 
                onClick={() => setOpenDialog(false)} 
                startIcon={<CloseIcon />}
                variant="outlined"
                disabled={processing}
              >
                Cancel
              </Button>
              
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                disabled={processing}
                startIcon={processing ? <CircularProgress size={16} /> : <AddIcon />}
              >
                {selectedDepartment ? 'Update Department' : 'Create Department'}
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
                Are you sure you want to delete the department <strong>{selectedDepartment?.name}</strong>? 
                This action cannot be undone.
              </Typography>
              {selectedDepartment?.is_active && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This department is currently active. Deactivating instead of deleting is recommended.
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleDeleteConfirm}
                startIcon={processing ? <CircularProgress size={16} /> : <DeleteIcon />}
              >
                Delete Department
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
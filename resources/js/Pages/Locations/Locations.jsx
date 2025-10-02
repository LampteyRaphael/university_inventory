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
  Fade,
  Tooltip,
  Avatar,
  InputAdornment,
  FormHelperText,
  Paper,
  useTheme,
  useMediaQuery,
  Switch,
  FormControlLabel,
  alpha,
  LinearProgress,
  IconButton,
  Grid,
  createTheme,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import moment from "moment";
import { router, useForm, usePage } from "@inertiajs/react";
import {
  UploadFile as UploadFileIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Business as BuildingIcon,
  School as UniversityIcon,
  CorporateFare as DepartmentIcon,
  Security as SecureIcon,
  AcUnit as ClimateIcon,
  Storage as StorageIcon,
  MeetingRoom as OfficeIcon,
  Science as LabIcon,
  Class as ClassroomIcon,
  Build as WorkshopIcon,
  Park as OutdoorIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  TrendingUp as UtilizationIcon,
  Warehouse as CapacityIcon,
  Download as DownloadIcon,
  AddCircle as AddCircleIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { orange } from "@mui/material/colors";
import Notification from "@/Components/Notification";

// Enhanced SummaryCard with modern design
const SummaryCard = ({ title, value, icon, color, subtitle, trend, onClick }) => (
  <Card 
    sx={{ 
      borderRadius: 3,
      p: 2.5,
      background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
      border: `1px solid ${alpha(color, 0.1)}`,
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: onClick ? 'translateY(-6px)' : 'none',
        boxShadow: onClick ? `0 12px 40px ${alpha(color, 0.2)}` : '0 8px 32px rgba(0,0,0,0.12)',
        borderColor: alpha(color, 0.3),
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
      }
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" fontWeight={800} color={color} sx={{ mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Chip 
              label={trend.value} 
              size="small" 
              color={trend.positive ? 'success' : 'error'}
              variant="filled"
              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
            />
          )}
        </Box>
        <Avatar 
          sx={{ 
            bgcolor: alpha(color, 0.1), 
            color: color,
            width: 56,
            height: 56,
            boxShadow: `0 4px 12px ${alpha(color, 0.2)}`,
          }}
        >
          {icon}
        </Avatar>
      </Stack>
    </CardContent>
  </Card>
);

// Utilization Progress Component
const UtilizationProgress = ({ value, color = 'primary' }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
    <LinearProgress 
      value={Math.min(value, 100)} 
      variant="determinate" 
      color={color}
      sx={{ 
        flex: 1, 
        height: 8, 
        borderRadius: 4,
        backgroundColor: alpha(theme.palette[color].main, 0.1),
        '& .MuiLinearProgress-bar': {
          borderRadius: 4,
        }
      }}
    />
    <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ minWidth: 45 }}>
      {value.toFixed(1)}%
    </Typography>
  </Box>
);

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: orange[500],
    },
  },
});

export default function Locations({ locations, auth, universities, departments }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { flash, errors } = usePage().props;
  
  // Inertia useForm for form handling
  const { data, setData, post, put, delete: destroy, processing, reset } = useForm({
    location_id: "",
    university_id: auth.user?.university_id || "",
    department_id: "",
    location_code: "",
    name: "",
    building: "",
    floor: "",
    room_number: "",
    aisle: "",
    shelf: "",
    bin: "",
    capacity: 0,
    current_utilization: 0,
    location_type: "storage",
    is_secured: false,
    is_climate_controlled: false,
    temperature_min: null,
    temperature_max: null,
    humidity_min: null,
    humidity_max: null,
    is_active: true,
    managed_by: "",
  });

  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    utilization: 'all'
  });

  // Enhanced location types with better visuals
  const locationTypes = [
    { value: 'storage', label: 'Storage', icon: <StorageIcon />, color: 'primary', description: 'General storage areas' },
    { value: 'office', label: 'Office', icon: <OfficeIcon />, color: 'info', description: 'Administrative workspaces' },
    { value: 'lab', label: 'Laboratory', icon: <LabIcon />, color: 'success', description: 'Research and testing labs' },
    { value: 'classroom', label: 'Classroom', icon: <ClassroomIcon />, color: 'warning', description: 'Teaching spaces' },
    { value: 'workshop', label: 'Workshop', icon: <WorkshopIcon />, color: 'error', description: 'Technical workspaces' },
    { value: 'outdoor', label: 'Outdoor', icon: <OutdoorIcon />, color: 'default', description: 'External storage areas' },
  ];

  // Enhanced status indicators
  const statusTypes = [
    { value: true, label: 'Active', color: 'success', icon: <ActiveIcon /> },
    { value: false, label: 'Inactive', color: 'error', icon: <InactiveIcon /> },
  ];

  // Enhanced alert system
  const showAlert = useCallback((message, severity = "success") => {
    setAlert({ open: true, message, severity });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, open: false }));
    }, 6000);
  }, []);

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    
    const processData = setTimeout(() => {
      const formatted = (locations || []).map((location, index) => {
        const utilizationRate = location.capacity > 0 ? 
          (location.current_utilization / location.capacity) * 100 : 0;
        
        let utilizationStatus = 'low';
        let utilizationColor = 'success';
        if (utilizationRate >= 90) {
          utilizationStatus = 'high';
          utilizationColor = 'error';
        } else if (utilizationRate >= 70) {
          utilizationStatus = 'medium';
          utilizationColor = 'warning';
        }
        
        return {
          id: location?.location_id ?? index + 1,
          ...location,
          capacity: Number(location?.capacity ?? 0),
          current_utilization: Number(location?.current_utilization ?? 0),
          utilization_rate: utilizationRate,
          utilization_status: utilizationStatus,
          utilization_color: utilizationColor,
          temperature_min: location?.temperature_min ? Number(location.temperature_min) : null,
          temperature_max: location?.temperature_max ? Number(location.temperature_max) : null,
          humidity_min: location?.humidity_min ? Number(location.humidity_min) : null,
          humidity_max: location?.humidity_max ? Number(location.humidity_max) : null,
          created_at: location?.created_at ? 
            moment(location.created_at).format("MMM Do YYYY") : "",
          updated_at: location?.updated_at ? 
            moment(location.updated_at).format("MMM Do YYYY") : "",
        };
      });
      
      setRows(formatted);
      setGridLoading(false);
    }, 500);

    return () => clearTimeout(processData);
  }, [locations]);

  // Enhanced summary statistics with trends
  const { totalLocations, activeLocations, totalCapacity, avgUtilization, highUtilizationCount } = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(row => row.is_active).length;
    const capacity = rows.reduce((sum, row) => sum + (row.capacity || 0), 0);
    const utilization = rows.length > 0 ? 
      rows.reduce((sum, row) => sum + row.utilization_rate, 0) / rows.length : 0;
    const highUtilization = rows.filter(row => row.utilization_rate >= 90).length;
    
    return {
      totalLocations: total,
      activeLocations: active,
      totalCapacity: capacity,
      avgUtilization: utilization,
      highUtilizationCount: highUtilization,
    };
  }, [rows]);

  // Enhanced column definitions
  const columns = useMemo(() => [
    { 
      field: 'location_code', 
      headerName: 'CODE', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600" fontFamily="monospace">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'name', 
      headerName: 'LOCATION NAME', 
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="600" noWrap>
            {params.row.name||""}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.row.building} {params.row.room_number && `• ${params.row.room_number}`}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'department', 
      headerName: 'DEPARTMENT', 
      width: 150,
      renderCell: (params) => {
        return (

        <Box>
          <Typography variant="body2" fontWeight="600" noWrap>
            {params.row.department_name|| ""}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.row.university_name || ""}
          </Typography>
        </Box>
        );
      }
    },
    { 
      field: 'capacity', 
      headerName: 'CAPACITY', 
      width: 120, 
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="500">
          {params.value ? params.value.toLocaleString() : '0'}
        </Typography>
      )
    },
    { 
      field: 'utilization', 
      headerName: 'UTILIZATION', 
      width: 140,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <UtilizationProgress 
            value={params.row.utilization_rate} 
            color={params.row.utilization_color}
          />
        </Box>
      )
    },
    { 
      field: 'location_type', 
      headerName: 'TYPE', 
      width: 130,
      renderCell: (params) => {
        const type = locationTypes.find(t => t.value === params.value);
        return (
          <Tooltip title={type?.description}>
            <Chip 
              icon={type?.icon} 
              label={type?.label} 
              size="small" 
              color={type?.color}
              variant="filled"
              sx={{ fontWeight: 600 }}
            />
          </Tooltip>
        );
      }
    },
    { 
      field: 'security', 
      headerName: 'SECURITY', 
      width: 110,
      renderCell: (params) => (
        <Tooltip title={params.row.is_secured ? 'Secured Location' : 'Unsecured Location'}>
          <Avatar sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: params.row.is_secured ? 'success.main' : 'grey.400',
            boxShadow: 1
          }}>
            {params.row.is_secured ? <SecureIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
          </Avatar>
        </Tooltip>
      )
    },
    { 
      field: 'status', 
      headerName: 'STATUS', 
      width: 100, 
      renderCell: (params) => {
        const status = statusTypes.find(s => s.value === params.row.is_active);
        return (
          <Chip 
            icon={status?.icon} 
            label={status?.label} 
            size="small" 
            color={status?.color}
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        );
      } 
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
          icon={
            <Tooltip title="Edit Location">
              <IconButton size="small" sx={{ color: 'primary.main' }}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          }
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete Location">
              <IconButton size="small" sx={{ color: 'error.main' }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          }
          label="Delete"
          onClick={() => handleDeleteClick(params.row)}
          showInMenu
        />,
      ],
    },
  ], [departments, locationTypes, statusTypes]);

  // Enhanced filtering with multiple criteria
  const filteredRows = useMemo(() => {
    let filtered = rows;
    
    if (searchText) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(row => 
        row.name.toLowerCase().includes(query) ||
        row.location_code.toLowerCase().includes(query) ||
        row.building.toLowerCase().includes(query) ||
        (row.room_number && row.room_number.toLowerCase().includes(query))
      );
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(row => 
        filters.status === 'active' ? row.is_active : !row.is_active
      );
    }
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(row => row.location_type === filters.type);
    }
    
    if (filters.utilization !== 'all') {
      filtered = filtered.filter(row => {
        switch (filters.utilization) {
          case 'high': return row.utilization_rate >= 90;
          case 'medium': return row.utilization_rate >= 70 && row.utilization_rate < 90;
          case 'low': return row.utilization_rate < 70;
          default: return true;
        }
      });
    }
    
    return filtered;
  }, [rows, searchText, filters]);

  // Enhanced event handlers with Inertia.js
  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows.map(row => ({
        'Location Code': row.location_code,
        'Name': row.name,
        'University': universities.find(u => u.university_id === row.university_id)?.name || row.university_id,
        'Department': departments.find(d => d.department_id === row.department_id)?.name || row.department_id,
        'Building': row.building,
        'Floor': row.floor || '-',
        'Room Number': row.room_number || '-',
        'Capacity': row.capacity || '-',
        'Current Utilization': row.current_utilization || '0',
        'Utilization Rate': `${(row.utilization_rate || 0).toFixed(1)}%`,
        'Location Type': locationTypes.find(t => t.value === row.location_type)?.label || row.location_type,
        'Secured': row.is_secured ? 'Yes' : 'No',
        'Climate Controlled': row.is_climate_controlled ? 'Yes' : 'No',
        'Status': row.is_active ? 'Active' : 'Inactive',
        'Created': row.created_at,
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Locations');
    XLSX.writeFile(workbook, `locations_export_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
    
    showAlert('Location data exported successfully', 'success');
  }, [filteredRows, universities, departments, locationTypes, showAlert]);

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
        
        router.post(route('locations.import'), {
          data: uploadedData
        }, {
          onSuccess: () => {
            showAlert(`${uploadedData.length} locations imported successfully`, 'success');
            setGridLoading(false);
          },
          onError: () => {
            showAlert('Error importing locations', 'error');
            setGridLoading(false);
          }
        });
      } catch (error) {
        showAlert('Error processing file: ' + error.message, 'error');
        setGridLoading(false);
      }
    };
    
    reader.onerror = () => {
      showAlert('Error reading file', 'error');
      setGridLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  }, [showAlert]);

  const handleCreate = useCallback(() => {
    setSelectedLocation(null);
    reset();
    setOpenDialog(true);
  }, [reset]);

  const handleEdit = useCallback((row) => {
    setSelectedLocation(row);
    setData({
      location_id: row.location_id,
      university_id: row.university_id,
      department_id: row.department_id,
      location_code: row.location_code,
      name: row.name,
      building: row.building,
      floor: row.floor,
      room_number: row.room_number,
      aisle: row.aisle,
      shelf: row.shelf,
      bin: row.bin,
      capacity: row.capacity,
      current_utilization: row.current_utilization,
      location_type: row.location_type,
      is_secured: row.is_secured,
      is_climate_controlled: row.is_climate_controlled,
      temperature_min: row.temperature_min,
      temperature_max: row.temperature_max,
      humidity_min: row.humidity_min,
      humidity_max: row.humidity_max,
      is_active: row.is_active,
      managed_by: row.managed_by,
    });
    setOpenDialog(true);
  }, [setData]);

  const handleDeleteClick = useCallback((row) => {
    setSelectedLocation(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedLocation) {
      put(route('locations.update', selectedLocation.location_id), {
        preserveScroll: true,
        onSuccess: () => {
          setOpenDialog(false);
          setSelectedLocation(null);
          reset();
          showAlert('Location updated successfully', 'success');
        },
        onError: () => {
          showAlert('Error updating location', 'error');
        },
      });
    } else {
      post(route('locations.store'), {
        preserveScroll: true,
        onSuccess: () => {
          setOpenDialog(false);
          reset();
          showAlert('Location created successfully', 'success');
        },
        onError: () => {
          showAlert('Error creating location', 'error');
        },
      });
    }
  }, [selectedLocation, post, put, reset, showAlert]);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedLocation) {
      destroy(route('locations.destroy', selectedLocation.location_id), {
        preserveScroll: true,
        onSuccess: () => {
          setOpenDeleteDialog(false);
          setSelectedLocation(null);
          showAlert('Location deleted successfully', 'success');
        },
        onError: () => {
          showAlert('Error deleting location', 'error');
        },
      });
    }
  }, [selectedLocation, destroy, showAlert]);

  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setData(name, newValue);
  }, [setData]);

  const handleRefresh = useCallback(() => {
    router.reload({ only: ['locations'] });
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  }, []);

  // Enhanced alert handling
  useEffect(() => {
    if (flash.success) {
      showAlert(flash.success, "success");
    }
    if (flash.error) {
      showAlert(flash.error, "error");
    }
  }, [flash, showAlert]);

    const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Locations Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'Locations' }
      ]}
    >
      <Fade in timeout={500}>
        <Box>
          {/* Enhanced Alert System */}
          <Notification 
            open={alert.open} 
            severity={alert.severity} 
            message={alert.message}
            onClose={handleCloseAlert}
          />

          {/* Enhanced Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Total Locations" 
                value={totalLocations} 
                icon={<LocationIcon />} 
                color={theme.palette.primary.main}
                subtitle="All registered locations"
                trend={{ value: '+12%', positive: true }}
                onClick={() => handleFilterChange('status', 'all')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Active Locations" 
                value={activeLocations} 
                icon={<ActiveIcon />} 
                color={theme.palette.success.main}
                subtitle={`${((activeLocations / totalLocations) * 100).toFixed(1)}% of total`}
                onClick={() => handleFilterChange('status', 'active')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Total Capacity" 
                value={totalCapacity.toLocaleString()} 
                icon={<CapacityIcon />} 
                color={theme.palette.info.main}
                subtitle="Available storage units"
                trend={{ value: '+5%', positive: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="High Utilization" 
                value={highUtilizationCount} 
                icon={<UtilizationIcon />} 
                color={theme.palette.warning.main}
                subtitle="Locations above 90% capacity"
                onClick={() => handleFilterChange('utilization', 'high')}
              />
            </Grid>
          </Grid>

          {/* Enhanced Data Grid Section */}
          <Paper
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Enhanced Responsive Header */}
            <Box sx={{ 
              p: 3,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: 'background.paper',
            }}>
              <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                {/* Left Section */}
                <Grid size={{ xs: 12, md: 'auto' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      width: 48, 
                      height: 48,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}>
                      <LocationIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        Locations Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage and monitor all storage locations
                      </Typography>
                    </Box>
                    {searchText && (
                      <Chip 
                        label={`${filteredRows.length} results`} 
                        size="small" 
                        color="primary"
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                </Grid>

                {/* Right Section - Responsive Actions */}
                <Grid size={{ xs: 12, md: 'auto' }}>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={1} 
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                  >
                    {/* Search */}
                    <TextField
                      size="small"
                      placeholder="Search locations..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: { 
                          minWidth: { xs: '100%', sm: 280 },
                          borderRadius: 2,
                        }
                      }}
                    />

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                      <Tooltip title="Refresh Data">
                        <IconButton onClick={handleRefresh} color="primary">
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                      <Button 
                        variant="contained" 
                        startIcon={<AddCircleIcon />} 
                        onClick={handleCreate}
                        sx={{ 
                          borderRadius: 2,
                          px: 3,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        New Location
                      </Button>
                    </Stack>
                  </Stack>

                  {/* Quick Filters */}
                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      icon={<FilterIcon />}
                      label="All"
                      variant={filters.status === 'all' ? 'filled' : 'outlined'}
                      onClick={() => handleFilterChange('status', 'all')}
                      color="primary"
                    />
                    <Chip
                      label="Active"
                      variant={filters.status === 'active' ? 'filled' : 'outlined'}
                      onClick={() => handleFilterChange('status', 'active')}
                      color="success"
                    />
                    <Chip
                      label="High Usage"
                      variant={filters.utilization === 'high' ? 'filled' : 'outlined'}
                      onClick={() => handleFilterChange('utilization', 'high')}
                      color="warning"
                    />
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={handleExport}
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    >
                      Export
                    </Button>
                    <Button
                      size="small"
                      startIcon={<UploadFileIcon />}
                      component="label"
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    >
                      Import
                      <input hidden accept=".xlsx,.xls,.csv" type="file" onChange={handleUpload} />
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Data Grid */}
            <Box sx={{ height: 600 }}>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 25 },
                  },
                }}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  },
                }}
                loading={gridLoading}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>

          {/* Enhanced Create/Edit Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)} 
            maxWidth="md" 
            fullWidth
            scroll="paper"
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
              }
            }}
          >
            <DialogTitle sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              py: 3,
              px: 4,
            }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                  {selectedLocation ? <EditIcon /> : <AddIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedLocation ? "Edit Location" : "Create New Location"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedLocation ? "Update location details" : "Add a new storage location to the system"}
                  </Typography>
                </Box>
              </Stack>
            </DialogTitle>
            
            <DialogContent dividers sx={{ p: 0 }}>
              <Box sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  {/* Basic Information */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 2 }}>
                      Basic Information
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Location Code *"
                      name="location_code"
                      value={data.location_code}
                      onChange={handleInputChange}
                      error={!!errors.location_code}
                      helperText={errors.location_code}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Location Name *"
                      name="name"
                      value={data.name}
                      onChange={handleInputChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth error={!!errors.university_id}>
                      <InputLabel>University *</InputLabel>
                      <Select
                        name="university_id"
                        value={data.university_id}
                        onChange={handleInputChange}
                        label="University *"
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

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth error={!!errors.department_id}>
                      <InputLabel>Department *</InputLabel>
                      <Select
                        name="department_id"
                        value={data.department_id}
                        onChange={handleInputChange}
                        label="Department *"
                      >
                        {departments?.map(department => (
                          <MenuItem key={department.department_id} value={department.department_id}>
                            {department.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.department_id && (
                        <FormHelperText>{errors.department_id}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Location Details */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 2, mt: 2 }}>
                      Location Details
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Building *"
                      name="building"
                      value={data.building}
                      onChange={handleInputChange}
                      error={!!errors.building}
                      helperText={errors.building}
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth error={!!errors.location_type}>
                      <InputLabel>Location Type *</InputLabel>
                      <Select
                        name="location_type"
                        value={data.location_type}
                        onChange={handleInputChange}
                        label="Location Type *"
                      >
                        {locationTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ color: `${type.color}.main` }}>
                                {type.icon}
                              </Box>
                              <Box>
                                <Typography>{type.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {type.description}
                                </Typography>
                              </Box>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.location_type && (
                        <FormHelperText>{errors.location_type}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Capacity Information */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" fontWeight={600} color="primary" sx={{ mb: 2, mt: 2 }}>
                      Capacity & Settings
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Capacity"
                      name="capacity"
                      value={data.capacity}
                      onChange={handleInputChange}
                      error={!!errors.capacity}
                      helperText={errors.capacity}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Current Utilization"
                      name="current_utilization"
                      value={data.current_utilization}
                      onChange={handleInputChange}
                      error={!!errors.current_utilization}
                      helperText={errors.current_utilization}
                    />
                  </Grid>

                  {/* Features */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="is_secured"
                          checked={data.is_secured}
                          onChange={handleInputChange}
                          color="success"
                        />
                      }
                      label={
                        <Box>
                          <Typography>Secured Location</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Requires special access
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="is_climate_controlled"
                          checked={data.is_climate_controlled}
                          onChange={handleInputChange}
                          color="info"
                        />
                      }
                      label={
                        <Box>
                          <Typography>Climate Controlled</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Temperature and humidity regulated
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>

                  {/* Status */}
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
                      label={
                        <Box>
                          <Typography>Active Location</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Available for use in the system
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Button 
                onClick={() => setOpenDialog(false)} 
                startIcon={<CloseIcon />}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                startIcon={<SaveIcon />} 
                variant="contained" 
                disabled={processing}
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                {processing ? "Saving..." : (selectedLocation ? "Update Location" : "Create Location")}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Enhanced Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
              }
            }}
          >
            <DialogTitle sx={{ 
              backgroundColor: 'error.main', 
              color: 'white',
              py: 3,
            }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'white', color: 'error.main' }}>
                  <DeleteIcon />
                </Avatar>
                <Typography variant="h5" fontWeight={700}>
                  Delete Location
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Typography variant="body1" fontWeight={500}>
                  Are you sure you want to delete the following location? This action cannot be undone.
                </Typography>
                
                {selectedLocation && (
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Stack spacing={2}>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedLocation.name}
                      </Typography>
                      <Stack direction="row" spacing={3} flexWrap="wrap">
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Location Code
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {selectedLocation.location_code}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Building
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {selectedLocation.building}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Type
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {locationTypes.find(t => t.value === selectedLocation.location_type)?.label}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Paper>
                )}
                
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={500}>
                    This will permanently remove the location and all associated data from the system.
                  </Typography>
                </Alert>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setOpenDeleteDialog(false)}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                color="error" 
                startIcon={<DeleteIcon />}
                variant="contained"
                disabled={processing}
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                }}
              >
                {processing ? "Deleting..." : "Delete Location"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
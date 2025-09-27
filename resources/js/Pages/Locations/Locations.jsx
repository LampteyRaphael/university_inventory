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
} from "@mui/material";
import {
  DataGrid,
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
} from "@mui/icons-material";

// Custom components
const SummaryCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ 
    borderRadius: 2, 
    p: 2, 
    boxShadow: 3, 
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 6,
    }
  }}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700} color={color}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}08`, color }}>
          {icon}
        </Avatar>
      </Stack>
    </CardContent>
  </Card>
);

export default function Locations({ locations, auth, universities, departments }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // Location types with icons
  const locationTypes = [
    { value: 'storage', label: 'Storage', icon: <StorageIcon />, color: 'primary' },
    { value: 'office', label: 'Office', icon: <OfficeIcon />, color: 'info' },
    { value: 'lab', label: 'Laboratory', icon: <LabIcon />, color: 'success' },
    { value: 'classroom', label: 'Classroom', icon: <ClassroomIcon />, color: 'warning' },
    { value: 'workshop', label: 'Workshop', icon: <WorkshopIcon />, color: 'error' },
    { value: 'outdoor', label: 'Outdoor', icon: <OutdoorIcon />, color: 'default' },
  ];

  // Status indicators
  const statusTypes = [
    { value: true, label: 'Active', color: 'success', icon: <ActiveIcon /> },
    { value: false, label: 'Inactive', color: 'error', icon: <InactiveIcon /> },
  ];

  // Form structure
  const emptyForm = {
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
  };

  const [formData, setFormData] = useState(emptyForm);

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    
    const processData = setTimeout(() => {
      const formatted = (locations || []).map((location, index) => {
        const utilizationRate = location.capacity > 0 ? 
          (location.current_utilization / location.capacity) * 100 : 0;
        
        let utilizationStatus = 'low';
        if (utilizationRate >= 90) utilizationStatus = 'high';
        else if (utilizationRate >= 70) utilizationStatus = 'medium';
        
        return {
          id: location?.location_id ?? index + 1,
          ...location,
          capacity: Number(location?.capacity ?? 0),
          current_utilization: Number(location?.current_utilization ?? 0),
          utilization_rate: utilizationRate,
          utilization_status: utilizationStatus,
          temperature_min: location?.temperature_min ? Number(location.temperature_min) : null,
          temperature_max: location?.temperature_max ? Number(location.temperature_max) : null,
          humidity_min: location?.humidity_min ? Number(location.humidity_min) : null,
          humidity_max: location?.humidity_max ? Number(location.humidity_max) : null,
          created_at: location?.created_at ? 
            moment(location.created_at).format("MMM Do YYYY, h:mm a") : "",
          updated_at: location?.updated_at ? 
            moment(location.updated_at).format("MMM Do YYYY, h:mm a") : "",
        };
      });
      
      setRows(formatted);
      setGridLoading(false);
    }, 800);

    return () => clearTimeout(processData);
  }, [locations]);

  // Calculate summary statistics
  const { totalLocations, activeLocations, totalCapacity, avgUtilization } = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(row => row.is_active).length;
    const capacity = rows.reduce((sum, row) => sum + (row.capacity || 0), 0);
    const utilization = rows.length > 0 ? 
      rows.reduce((sum, row) => sum + row.utilization_rate, 0) / rows.length : 0;
    
    return {
      totalLocations: total,
      activeLocations: active,
      totalCapacity: capacity,
      avgUtilization: utilization,
    };
  }, [rows]);

  // Column definitions
  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'location_code', 
      headerName: 'Location Code', 
      width: 130,
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 180,
    },
    { 
      field: 'university_id', 
      headerName: 'University', 
      width: 150,
      renderCell: (params) => {
        const university = universities?.find(u => u.university_id === params.value);
        return university ? university.name : params.value;
      }
    },
    { 
      field: 'department_id', 
      headerName: 'Department', 
      width: 150,
      renderCell: (params) => {
        const department = departments?.find(d => d.department_id === params.value);
        return department ? department.name : params.value;
      }
    },
    { 
      field: 'building', 
      headerName: 'Building', 
      width: 120,
    },
    { 
      field: 'floor', 
      headerName: 'Floor', 
      width: 80,
      renderCell: (params) => params.value || '-'
    },
    { 
      field: 'room_number', 
      headerName: 'Room', 
      width: 80,
      renderCell: (params) => params.value || '-'
    },
    { 
      field: 'capacity', 
      headerName: 'Capacity', 
      width: 100, 
      type: 'number',
      renderCell: (params) => params.value ? params.value.toLocaleString() : '-'
    },
    { 
      field: 'current_utilization', 
      headerName: 'Utilization', 
      width: 100, 
      type: 'number',
      renderCell: (params) => params.value ? params.value.toLocaleString() : '0'
    },
    { 
      field: 'utilization_rate', 
      headerName: 'Utilization %', 
      width: 120, 
      type: 'number',
      renderCell: (params) => {
        const rate = params.value || 0;
        let color = 'success';
        if (rate >= 90) color = 'error';
        else if (rate >= 70) color = 'warning';
        
        return (
          <Chip 
            label={`${rate.toFixed(1)}%`} 
            size="small" 
            color={color}
            variant="filled"
          />
        );
      }
    },
    { 
      field: 'location_type', 
      headerName: 'Type', 
      width: 120,
      renderCell: (params) => {
        const type = locationTypes.find(t => t.value === params.value);
        return (
          <Chip 
            icon={type?.icon} 
            label={type?.label || params.value} 
            size="small" 
            color={type?.color || 'default'}
            variant="outlined"
          />
        );
      }
    },
    { 
      field: 'is_secured', 
      headerName: 'Secured', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          icon={params.value ? <SecureIcon /> : <CloseIcon />} 
          label={params.value ? 'Yes' : 'No'} 
          size="small" 
          color={params.value ? 'success' : 'default'}
          variant="outlined"
        />
      )
    },
    { 
      field: 'is_climate_controlled', 
      headerName: 'Climate Ctrl', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          icon={params.value ? <ClimateIcon /> : <CloseIcon />} 
          label={params.value ? 'Yes' : 'No'} 
          size="small" 
          color={params.value ? 'info' : 'default'}
          variant="outlined"
        />
      )
    },
    { 
      field: 'is_active', 
      headerName: 'Status', 
      width: 100, 
      renderCell: (params) => {
        const status = statusTypes.find(s => s.value === params.value);
        return (
          <Chip 
            icon={status?.icon} 
            label={status?.label} 
            size="small" 
            color={status?.color}
            variant="filled"
          />
        );
      } 
    },
    { 
      field: 'created_at', 
      headerName: 'Created', 
      width: 150,
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
  ], [universities, departments, locationTypes, statusTypes]);

  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    const query = searchText.toLowerCase();
    return rows.filter(row => 
      row.name.toLowerCase().includes(query) ||
      row.location_code.toLowerCase().includes(query) ||
      row.building.toLowerCase().includes(query) ||
      (row.room_number && row.room_number.toLowerCase().includes(query)) ||
      locationTypes.find(t => t.value === row.location_type)?.label.toLowerCase().includes(query)
    );
  }, [rows, searchText, locationTypes]);

  // Event handlers
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
        'Aisle': row.aisle || '-',
        'Shelf': row.shelf || '-',
        'Bin': row.bin || '-',
        'Capacity': row.capacity || '-',
        'Current Utilization': row.current_utilization || '0',
        'Utilization Rate': `${(row.utilization_rate || 0).toFixed(1)}%`,
        'Location Type': locationTypes.find(t => t.value === row.location_type)?.label || row.location_type,
        'Secured': row.is_secured ? 'Yes' : 'No',
        'Climate Controlled': row.is_climate_controlled ? 'Yes' : 'No',
        'Temperature Range': row.temperature_min && row.temperature_max ? 
          `${row.temperature_min}°C - ${row.temperature_max}°C` : '-',
        'Humidity Range': row.humidity_min && row.humidity_max ? 
          `${row.humidity_min}% - ${row.humidity_max}%` : '-',
        'Status': row.is_active ? 'Active' : 'Inactive',
        'Created': row.created_at,
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Locations');
    XLSX.writeFile(workbook, `locations_export_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
    setAlert({ open: true, message: 'Location data exported successfully', severity: 'success' });
  }, [filteredRows, universities, departments, locationTypes]);

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
        
        const mappedData = uploadedData.map((item, index) => ({
          id: `uploaded_${Date.now()}_${index}`,
          location_id: `uploaded_${Date.now()}_${index}`,
          ...item,
          capacity: Number(item.capacity) || 0,
          current_utilization: Number(item.current_utilization) || 0,
          temperature_min: item.temperature_min ? Number(item.temperature_min) : null,
          temperature_max: item.temperature_max ? Number(item.temperature_max) : null,
          humidity_min: item.humidity_min ? Number(item.humidity_min) : null,
          humidity_max: item.humidity_max ? Number(item.humidity_max) : null,
          is_secured: Boolean(item.is_secured),
          is_climate_controlled: Boolean(item.is_climate_controlled),
          is_active: Boolean(item.is_active),
          created_at: moment().format("MMM Do YYYY, h:mm a"),
        }));
        
        setRows(prev => [...mappedData, ...prev]);
        setAlert({ open: true, message: `${mappedData.length} locations imported successfully`, severity: 'success' });
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
    setSelectedLocation(null);
    setFormData({ 
      ...emptyForm, 
      university_id: auth.user?.university_id || "",
    });
    setFormErrors({});
    setOpenDialog(true);
  }, [auth, emptyForm]);

  const handleEdit = useCallback((row) => {
    setSelectedLocation(row);
    setFormData({ 
      ...emptyForm, 
      ...row,
    });
    setFormErrors({});
    setOpenDialog(true);
  }, [emptyForm]);

  const handleDeleteClick = useCallback((row) => {
    setSelectedLocation(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setGridLoading(true);
    setTimeout(() => {
      setRows(prev => prev.filter(r => r.id !== selectedLocation.id));
      setOpenDeleteDialog(false);
      setAlert({ open: true, message: 'Location deleted successfully', severity: 'success' });
      setGridLoading(false);
    }, 300);
  }, [selectedLocation]);

  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.location_code) errors.location_code = 'Location code is required';
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.university_id) errors.university_id = 'University is required';
    if (!formData.department_id) errors.department_id = 'Department is required';
    if (!formData.building) errors.building = 'Building is required';
    if (!formData.location_type) errors.location_type = 'Location type is required';
    if (formData.capacity < 0) errors.capacity = 'Capacity cannot be negative';
    if (formData.current_utilization < 0) errors.current_utilization = 'Utilization cannot be negative';
    if (formData.current_utilization > formData.capacity) errors.current_utilization = 'Utilization cannot exceed capacity';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const payload = {
        ...formData,
        id: selectedLocation ? selectedLocation.id : `location_${Date.now()}`,
        location_id: selectedLocation ? selectedLocation.location_id : `location_${Date.now()}`,
        created_at: selectedLocation ? selectedLocation.created_at : moment().format('MMM Do YYYY, h:mm a'),
        updated_at: moment().format('MMM Do YYYY, h:mm a'),
        utilization_rate: formData.capacity > 0 ? 
          (formData.current_utilization / formData.capacity) * 100 : 0,
      };

      if (selectedLocation) {
        setRows(prev => prev.map(r => r.id === selectedLocation.id ? { ...r, ...payload } : r));
        setAlert({ open: true, message: 'Location updated successfully', severity: 'success' });
      } else {
        setRows(prev => [payload, ...prev]);
        setAlert({ open: true, message: 'Location created successfully', severity: 'success' });
      }

      setLoading(false);
      setOpenDialog(false);
      setSelectedLocation(null);
    }, 500);
  }, [formData, selectedLocation, validateForm]);

  const handleRefresh = useCallback(() => {
    setGridLoading(true);
    setTimeout(() => {
      setGridLoading(false);
      setAlert({ open: true, message: 'Data refreshed', severity: 'info' });
    }, 800);
  }, []);

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Locations"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'Locations' }
      ]}
    >
      <Fade in timeout={500}>
        <Box>
          {alert.open && (
            <Alert 
              severity={alert.severity} 
              onClose={() => setAlert(prev => ({...prev, open: false}))} 
              sx={{ mb: 2 }}
            >
              {alert.message}
            </Alert>
          )}

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard 
                title="Total Locations" 
                value={totalLocations} 
                icon={<LocationIcon />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard 
                title="Active Locations" 
                value={activeLocations} 
                icon={<ActiveIcon />} 
                color={theme.palette.success.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard 
                title="Total Capacity" 
                value={totalCapacity.toLocaleString()} 
                icon={<CapacityIcon />} 
                color={theme.palette.info.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard 
                title="Avg Utilization" 
                value={`${avgUtilization.toFixed(1)}%`} 
                icon={<UtilizationIcon />} 
                color={theme.palette.warning.main} 
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
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center', 
              justifyContent: 'space-between', 
              p: 2, 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              gap: 2
            }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Locations
                </Typography>
                {searchText && (
                  <Chip 
                    label={`${filteredRows.length} of ${rows.length} locations`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
              </Stack>

              <Stack 
                direction={isMobile ? 'column' : 'row'} 
                spacing={1} 
                alignItems="center"
                width={isMobile ? '100%' : 'auto'}
              >
                <TextField
                  size="small"
                  placeholder="Search locations..."
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
                  New Location
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1, flexWrap: 'wrap' }}>
                <Button size="small" startIcon={<UploadFileIcon />} component="label" variant="outlined">
                    Import
                    <input hidden accept=".xlsx,.xls,.csv" type="file" onChange={handleUpload} />
                </Button>
                <Button size="small" startIcon={<SaveIcon />} onClick={handleExport} variant="outlined">
                    Export
                </Button>
              </Stack>
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
          </Paper>

          {/* Create/Edit Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)} 
            maxWidth="md" 
            fullWidth
            scroll="paper"
          >
            <DialogTitle sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              py: 2
            }}>
              {selectedLocation ? "Edit Location" : "New Location"}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Location Code */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location Code"
                    name="location_code"
                    value={formData.location_code}
                    onChange={handleInputChange}
                    error={!!formErrors.location_code}
                    helperText={formErrors.location_code}
                    required
                  />
                </Grid>

                {/* Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    required
                  />
                </Grid>

                {/* University */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.university_id}>
                    <InputLabel>University</InputLabel>
                    <Select
                      name="university_id"
                      value={formData.university_id}
                      onChange={handleInputChange}
                      label="University"
                    >
                      {universities?.map(university => (
                        <MenuItem key={university.university_id} value={university.university_id}>
                          {university.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.university_id && (
                      <FormHelperText>{formErrors.university_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Department */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.department_id}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleInputChange}
                      label="Department"
                    >
                      {departments?.map(department => (
                        <MenuItem key={department.department_id} value={department.department_id}>
                          {department.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.department_id && (
                      <FormHelperText>{formErrors.department_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Building */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Building"
                    name="building"
                    value={formData.building}
                    onChange={handleInputChange}
                    error={!!formErrors.building}
                    helperText={formErrors.building}
                    required
                  />
                </Grid>

                {/* Floor */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Floor"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                  />
                </Grid>

                {/* Room Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Room Number"
                    name="room_number"
                    value={formData.room_number}
                    onChange={handleInputChange}
                  />
                </Grid>

                {/* Location Type */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.location_type}>
                    <InputLabel>Location Type</InputLabel>
                    <Select
                      name="location_type"
                      value={formData.location_type}
                      onChange={handleInputChange}
                      label="Location Type"
                    >
                      {locationTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {type.icon}
                            <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.location_type && (
                      <FormHelperText>{formErrors.location_type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Capacity */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    error={!!formErrors.capacity}
                    helperText={formErrors.capacity}
                  />
                </Grid>

                {/* Current Utilization */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Current Utilization"
                    name="current_utilization"
                    value={formData.current_utilization}
                    onChange={handleInputChange}
                    error={!!formErrors.current_utilization}
                    helperText={formErrors.current_utilization}
                  />
                </Grid>

                {/* Security and Climate Controls */}
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="is_secured"
                        checked={formData.is_secured}
                        onChange={handleInputChange}
                        color="success"
                      />
                    }
                    label="Secured Location"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="is_climate_controlled"
                        checked={formData.is_climate_controlled}
                        onChange={handleInputChange}
                        color="info"
                      />
                    }
                    label="Climate Controlled"
                  />
                </Grid>

                {/* Temperature Range */}
                {formData.is_climate_controlled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Min Temperature (°C)"
                        name="temperature_min"
                        value={formData.temperature_min || ''}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max Temperature (°C)"
                        name="temperature_max"
                        value={formData.temperature_max || ''}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </>
                )}

                {/* Humidity Range */}
                {formData.is_climate_controlled && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Min Humidity (%)"
                        name="humidity_min"
                        value={formData.humidity_min || ''}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Max Humidity (%)"
                        name="humidity_max"
                        value={formData.humidity_max || ''}
                        onChange={handleInputChange}
                      />
                    </Grid>
                  </>
                )}

                {/* Status */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        color="success"
                      />
                    }
                    label="Active Location"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} startIcon={<CloseIcon />}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                startIcon={<SaveIcon />} 
                variant="contained" 
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
          >
            <DialogTitle>Delete Location</DialogTitle>
            <DialogContent dividers>
              <Typography>
                Are you sure you want to delete the location "{selectedLocation?.name}"?
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                color="error" 
                startIcon={<DeleteIcon />}
                variant="contained"
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
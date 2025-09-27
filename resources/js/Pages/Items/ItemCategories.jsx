import React, { useEffect, useState, useRef } from "react";
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
  Zoom,
  Tooltip,
  Avatar,
  LinearProgress,
  InputAdornment,
  FormHelperText,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridToolbarContainer } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import moment from "moment";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import InventoryIcon from "@mui/icons-material/Inventory";
import SummarizeIcon from "@mui/icons-material/Summarize";
import SearchIcon from "@mui/icons-material/Search";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BuildIcon from "@mui/icons-material/Build";
import NumbersIcon from "@mui/icons-material/Numbers";
import { keyframes } from "@emotion/react";
import { Home } from "@mui/icons-material";

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

export default function ItemCategories({ items, auth, categories }) {
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    category_code: "",
    parent_category_id: "",
    warranty_period_days: 0,
    depreciation_rate: 0,
    depreciation_method: "straight_line",
    requires_serial_number: false,
    requires_maintenance: false,
    maintenance_interval_days: null,
    specification_template: null,
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Simulate data loading
    const loadData = () => {
      setLoading(true);
      setGridLoading(true);
      
      setTimeout(() => {
        const formattedRows = items?.map((data, i) => ({
          id: data?.category_id ?? i + 1,
          category_id: data?.category_id ?? "",
          university_id: data?.university_id ?? "",
          parent_category_id: data?.parent_category_id ?? "",
          category_code: data?.category_code ?? "",
          name: data?.name ?? "",
          description: data?.description ?? "",
          image_url: data?.image_url ?? "",
          warranty_period_days: data?.warranty_period_days ?? 0,
          depreciation_rate: data?.depreciation_rate ?? 0,
          depreciation_method: data?.depreciation_method ?? "straight_line",
          requires_serial_number: data?.requires_serial_number ?? false,
          requires_maintenance: data?.requires_maintenance ?? false,
          maintenance_interval_days: data?.maintenance_interval_days ?? null,
          specification_template: data?.specification_template ? JSON.stringify(data.specification_template) : "",
          lft: data?.lft ?? null,
          rgt: data?.rgt ?? null,
          depth: data?.depth ?? 0,
          is_active: data?.is_active ?? true,
          created_at: data?.created_at ? moment(data.created_at).format("Do MMM YYYY h:mm") : "",
          updated_at: data?.updated_at ? moment(data.updated_at).format("Do MMM YYYY h:mm") : "",
          deleted_at: data?.deleted_at ? moment(data.deleted_at).format("Do MMM YYYY h:mm") : "",
        }));
        setRows(formattedRows);
        setLoading(false);
        setGridLoading(false);
      }, 1500);
    };

    loadData();
  }, [items]);

  // Calculate summary statistics
  const totalCategories = rows.length;
  const activeCategories = rows.filter(row => row.is_active).length;
  const categoriesRequiringMaintenance = rows.filter(row => row.requires_maintenance).length;
  const categoriesRequiringSerial = rows.filter(row => row.requires_serial_number).length;

  const columns = [
    { 
      field: "id", 
      headerName: "#", 
      width: 70,
      renderCell: (params) => (
        <Zoom in={true} style={{ transitionDelay: params.rowIndex * 100 + 'ms' }}>
          <span>{params.value}</span>
        </Zoom>
      )
    },
    { 
      field: "category_code", 
      headerName: "Category Code", 
      width: 120 
    },
    { 
      field: "name", 
      headerName: "Name", 
      width: 180 
    },
    { 
      field: "description", 
      headerName: "Description", 
      width: 220 
    },
    {
      field: "parent_category_id",
      headerName: "Parent Category",
      width: 150,
      renderCell: (params) => (
        params.row.parent_category_id ? (
          <Chip 
            label={params.row.parent_category_id} 
            color="primary" 
            size="small" 
            variant="outlined"
          />
        ) : (
          <Chip 
            label="Root Category" 
            color="success" 
            size="small" 
          />
        )
      ),
    },
    { 
      field: "warranty_period_days", 
      headerName: "Warranty Days", 
      width: 120,
      renderCell: (params) => `${params.value} days`
    },
    {
      field: "depreciation_rate",
      headerName: "Dep. Rate (%)",
      width: 120,
      renderCell: (params) => `${params.value}%`
    },
    { 
      field: "depreciation_method", 
      headerName: "Dep. Method", 
      width: 140,
      renderCell: (params) => (
        <Chip 
          label={params.value.replace('_', ' ').toUpperCase()} 
          color="info" 
          size="small" 
          variant="outlined"
        />
      )
    },
    {
      field: "requires_serial_number",
      headerName: "Req. Serial No.",
      width: 140,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Yes" color="warning" size="small" />
        ) : (
          <Chip label="No" color="default" size="small" variant="outlined" />
        ),
    },
    {
      field: "requires_maintenance",
      headerName: "Req. Maintenance",
      width: 160,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Yes" color="warning" size="small" />
        ) : (
          <Chip label="No" color="default" size="small" variant="outlined" />
        ),
    },
    {
      field: "maintenance_interval_days",
      headerName: "Maint. Interval",
      width: 140,
      renderCell: (params) => params.value ? `${params.value} days` : "N/A"
    },
    {
      field: "depth",
      headerName: "Depth",
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={`Level ${params.value}`} 
          color={params.value === 0 ? "success" : "secondary"} 
          size="small" 
        />
      )
    },
    {
      field: "is_active",
      headerName: "Status",
      width: 120,
      renderCell: (params) => {
        return params.value ? (
          <Chip label="ACTIVE" color="success" size="small" />
        ) : (
          <Chip label="INACTIVE" color="error" size="small" />
        );
      },
    },
    { 
      field: "created_at", 
      headerName: "Created At", 
      width: 180 
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit Category">
            <IconButton onClick={() => handleEdit(params.row)} color="primary" size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Category">
            <IconButton onClick={() => handleDeleteClick(params.row)} color="error" size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const filteredRows = rows.filter((row) => {
    return (
      row.name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.category_code.toLowerCase().includes(searchText.toLowerCase()) ||
      row.description.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    XLSX.utils.book_append_sheet(wb, ws, "Item Categories");
    XLSX.writeFile(wb, "ItemCategories.xlsx");
    
    setAlert({
      open: true,
      message: "Categories data exported successfully!",
      severity: "success"
    });
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setGridLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const uploadedRows = XLSX.utils.sheet_to_json(sheet);
      setRows((prev) => [...prev, ...uploadedRows]);
      
      setAlert({
        open: true,
        message: "File uploaded successfully!",
        severity: "success"
      });
      setGridLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCreate = () => {
    setOpenCreateDialog(true);
    setFormData({
      name: "",
      description: "",
      category_id: "",
      category_code: "",
      parent_category_id: "",
      warranty_period_days: 0,
      depreciation_rate: 0,
      depreciation_method: "straight_line",
      requires_serial_number: false,
      requires_maintenance: false,
      maintenance_interval_days: null,
      specification_template: null,
      is_active: true
    });
    setFormErrors({});
  };

  const handleEdit = (row) => {
    setSelectedItem(row);
    setFormData({
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      category_code: row.category_code,
      parent_category_id: row.parent_category_id,
      warranty_period_days: row.warranty_period_days,
      depreciation_rate: row.depreciation_rate,
      depreciation_method: row.depreciation_method,
      requires_serial_number: row.requires_serial_number,
      requires_maintenance: row.requires_maintenance,
      maintenance_interval_days: row.maintenance_interval_days,
      specification_template: row.specification_template,
      is_active: row.is_active
    });
    setOpenCreateDialog(true);
  };

  const handleDeleteClick = (row) => {
    setSelectedItem(row);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    setGridLoading(true);
    // In a real app, you would make an API call here
    setTimeout(() => {
      setRows(rows.filter(row => row.id !== selectedItem.id));
      setOpenDeleteDialog(false);
      
      setAlert({
        open: true,
        message: "Category deleted successfully!",
        severity: "success"
      });
      setGridLoading(false);
    }, 500);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name) errors.name = "Name is required";
    if (!formData.category_code) errors.category_code = "Category code is required";
    if (formData.warranty_period_days && isNaN(formData.warranty_period_days)) errors.warranty_period_days = "Must be a valid number";
    if (formData.depreciation_rate && (formData.depreciation_rate < 0 || formData.depreciation_rate > 100)) {
      errors.depreciation_rate = "Must be between 0 and 100";
    }
    if (formData.maintenance_interval_days && isNaN(formData.maintenance_interval_days)) {
      errors.maintenance_interval_days = "Must be a valid number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setGridLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedItem) {
        // Update existing category
        setRows(rows.map(row => 
          row.id === selectedItem.id 
            ? { 
                ...row, 
                name: formData.name,
                description: formData.description,
                category_code: formData.category_code,
                parent_category_id: formData.parent_category_id,
                warranty_period_days: formData.warranty_period_days,
                depreciation_rate: formData.depreciation_rate,
                depreciation_method: formData.depreciation_method,
                requires_serial_number: formData.requires_serial_number,
                requires_maintenance: formData.requires_maintenance,
                maintenance_interval_days: formData.maintenance_interval_days,
                specification_template: formData.specification_template,
                is_active: formData.is_active,
                updated_at: moment().format("Do MMM YYYY h:mm")
              }
            : row
        ));
        
        setAlert({
          open: true,
          message: "Category updated successfully!",
          severity: "success"
        });
      } else {
        // Add new category
        const newCategory = {
          id: Math.max(...rows.map(row => row.id), 0) + 1,
          category_id: `cat_${Math.random().toString(36).substr(2, 9)}`,
          university_id: "univ_1", // Default university ID
          parent_category_id: formData.parent_category_id,
          category_code: formData.category_code,
          name: formData.name,
          description: formData.description,
          image_url: "",
          warranty_period_days: formData.warranty_period_days || 0,
          depreciation_rate: formData.depreciation_rate || 0,
          depreciation_method: formData.depreciation_method,
          requires_serial_number: formData.requires_serial_number,
          requires_maintenance: formData.requires_maintenance,
          maintenance_interval_days: formData.maintenance_interval_days,
          specification_template: formData.specification_template,
          lft: null,
          rgt: null,
          depth: formData.parent_category_id ? 1 : 0,
          is_active: formData.is_active,
          created_at: moment().format("Do MMM YYYY h:mm"),
          updated_at: moment().format("Do MMM YYYY h:mm"),
          deleted_at: ""
        };
        
        setRows([...rows, newCategory]);
        
        setAlert({
          open: true,
          message: "Category created successfully!",
          severity: "success"
        });
      }
      
      setLoading(false);
      setGridLoading(false);
      setOpenCreateDialog(false);
      setSelectedItem(null);
    }, 1000);
  };

  return (
    <AuthenticatedLayout 
      auth={auth} 
      title="Item Categories"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <Home sx={{ mr: 0.5, fontSize: 18 }} /> },
        { label: 'Item Categories' },
      ]}
    >
      <Fade in={true} timeout={800}>
        <Box>
          {alert.open && (
            <Alert 
              severity={alert.severity} 
              onClose={() => setAlert({...alert, open: false})}
              sx={{ mb: 2 }}
            >
              {alert.message}
            </Alert>
          )}
          
          {/* Summary Cards */}
          <Slide in={true} direction="right" timeout={500}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                    color: 'white',
                    animation: `${fadeIn} 0.5s ease-in`
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {totalCategories}
                        </Typography>
                        <Typography variant="body2">
                          Total Categories
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <InventoryIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                    color: 'white',
                    animation: `${fadeIn} 0.5s ease-in`,
                    animationDelay: '0.1s'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {activeCategories}
                        </Typography>
                        <Typography variant="body2">
                          Active Categories
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <SummarizeIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #ff9800 30%, #ffc107 90%)',
                    color: 'white',
                    animation: `${fadeIn} 0.5s ease-in`,
                    animationDelay: '0.2s'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {categoriesRequiringMaintenance}
                        </Typography>
                        <Typography variant="body2">
                          Need Maintenance
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <EditIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #9c27b0 30%, #e91e63 90%)',
                    color: 'white',
                    animation: `${fadeIn} 0.5s ease-in`,
                    animationDelay: '0.3s'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h3" fontWeight="bold">
                          {categoriesRequiringSerial}
                        </Typography>
                        <Typography variant="body2">
                          Require Serial Numbers
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <SaveIcon />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Slide>
          {/* Data Grid with Loading */}
          <Box
            sx={{
              height: "100%",
              width: "100%",
              backgroundColor: "background.paper",
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 3,
              animation: `${slideIn} 0.5s ease-in`,
              position: 'relative'
            }}
          >
            {/* Custom Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InventoryIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Item Categories
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Search..."
                  variant="outlined"
                  size="small"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  inputRef={searchInputRef}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 200 }}
                />
                
                <Tooltip title="Refresh Data">
                  <IconButton color="primary" size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  color="primary"
                  onClick={handleCreate}
                  size="small"
                  sx={{ animation: `${pulse} 2s infinite` }}
                >
                  New
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  color="success"
                  onClick={handleExport}
                  size="small"
                >
                  Export
                </Button>
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  color="secondary"
                  size="small"
                >
                  Import
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls,.csv"
                    onChange={handleUpload}
                  />
                </Button>
              </Stack>
            </Box>
            
            {/* Data Grid with Loading Overlay */}
            {/* < sx={{ position: 'relative' }}> */}
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
              />
              
              {/* Custom Loading Overlay */}
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
                      Loading categories...
                    </Typography>
                  </Box>
                </Box>
              )}
            {/* </> */}
          </Box>
          
          {/* Create/Edit Dialog */}
          <Dialog 
            open={openCreateDialog} 
            onClose={() => setOpenCreateDialog(false)}
            maxWidth="md"
            fullWidth
            TransitionComponent={Slide}
            transitionDuration={400}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: 'primary.main',
              color: 'white'
            }}>
              <Typography variant="h6">
                {selectedItem ? "Edit Item Category" : "Create New Item Category"}
              </Typography>
              <IconButton onClick={() => setOpenCreateDialog(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ pt: 3 }}>
              {loading && <LinearProgress />}
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Category Code"
                    name="category_code"
                    value={formData.category_code}
                    onChange={handleInputChange}
                    error={!!formErrors.category_code}
                    helperText={formErrors.category_code}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Parent Category</InputLabel>
                    <Select
                      name="parent_category_id"
                      value={formData.parent_category_id}
                      label="Parent Category"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">None (Root Category)</MenuItem>
                      {rows.filter(row => !row.parent_category_id).map((category) => (
                        <MenuItem key={category.id} value={category.category_id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Warranty Period (Days)"
                    name="warranty_period_days"
                    type="number"
                    value={formData.warranty_period_days}
                    onChange={handleInputChange}
                    error={!!formErrors.warranty_period_days}
                    helperText={formErrors.warranty_period_days}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Depreciation Rate (%)"
                    name="depreciation_rate"
                    type="number"
                    value={formData.depreciation_rate}
                    onChange={handleInputChange}
                    error={!!formErrors.depreciation_rate}
                    helperText={formErrors.depreciation_rate}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Depreciation Method</InputLabel>
                    <Select
                      name="depreciation_method"
                      value={formData.depreciation_method}
                      label="Depreciation Method"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="straight_line">Straight Line</MenuItem>
                      <MenuItem value="reducing_balance">Reducing Balance</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maintenance Interval (Days)"
                    name="maintenance_interval_days"
                    type="number"
                    value={formData.maintenance_interval_days}
                    onChange={handleInputChange}
                    error={!!formErrors.maintenance_interval_days}
                    helperText={formErrors.maintenance_interval_days}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="requires_serial_number"
                        checked={formData.requires_serial_number}
                        onChange={handleInputChange}
                        color="primary"
                      />
                    }
                    label="Requires Serial Number"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="requires_maintenance"
                        checked={formData.requires_maintenance}
                        onChange={handleInputChange}
                        color="primary"
                      />
                    }
                    label="Requires Maintenance"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        color="primary"
                      />
                    }
                    label="Active Category"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={() => setOpenCreateDialog(false)}
                color="inherit"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                variant="contained"
                disabled={loading}
                startIcon={selectedItem ? <SaveIcon /> : <AddIcon />}
              >
                {selectedItem ? "Update Category" : "Create Category"}
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
            <DialogTitle>
              Confirm Delete
            </DialogTitle>
            
            <DialogContent>
              <Typography>
                Are you sure you want to delete the category "{selectedItem?.name}"? This action cannot be undone.
              </Typography>
            </DialogContent>
            
            <DialogActions>
              <Button 
                onClick={() => setOpenDeleteDialog(false)}
                color="inherit"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
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
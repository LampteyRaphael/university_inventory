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
  alpha,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { keyframes } from "@emotion/react";
import moment from "moment";
import { useForm, router, usePage } from "@inertiajs/react";
import {
  UploadFile as UploadFileIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  Summarize as SummarizeIcon,
  Search as SearchIcon,
  Build as BuildIcon,
  Numbers as NumbersIcon,
  Home as HomeIcon,
  AddCircleOutline,
  CloudUpload,
  Download,
  School as SchoolIcon,
  Image as ImageIcon,
  AccountTree as AccountTreeIcon,
} from "@mui/icons-material";
import Notification from "@/Components/Notification";

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

export default function ItemCategories({ categories=[], auth, filters: initialFilters = {}, universities  }) {
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  
  // Use Inertia's form handling with all fields from migration
  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    name: "",
    description: "",
    category_code: "",
    university_id: "",
    parent_category_id: "",
    warranty_period_days: 0,
    depreciation_rate: 0,
    depreciation_method: "",
    requires_serial_number: false,
    requires_maintenance: false,
    maintenance_interval_days: "",
    specification_template: "",
    image_url: "",
    lft: "",
    rgt: "",
    depth: 0,
    is_active: true
  });

  const { flash } = usePage().props;
  const searchInputRef = useRef("");
  
  useEffect(() => {
    setGridLoading(true);
    // console.log(categories)
    const timer = setTimeout(() => {
      const formattedRows = categories?.map((item, index) => ({
        id: item?.category_id ?? index + 1,
        ...item,
        university_id: item?.university_id ?? "",
        lft: item?.lft ?? "",
        rgt: item?.rgt ?? "",
        depth: item?.depth ?? 0,
        image_url: item?.image_url ?? "",
        warranty_period_days: item?.warranty_period_days ?? 0,
        depreciation_rate: item?.depreciation_rate ?? 0,
        depreciation_method:item?.depreciation_method??'',
        requires_serial_number: item?.requires_serial_number ?? false,
        requires_maintenance: item?.requires_maintenance ?? false,
        requirement:item??"",
        is_active: item?.is_active ?? true,
        university: item?.university?.name,
        created_at: item?.created_at ? moment(item.created_at).format("Do MMM YYYY h:mm") : "",
        updated_at: item?.updated_at ? moment(item.updated_at).format("Do MMM YYYY h:mm") : "",
      }));
      setRows(formattedRows || []);
      setGridLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [categories]);

  // Calculate summary statistics
  const totalCategories = rows.length;
  const activeCategories = rows.filter(row => row.is_active).length;
  const categoriesRequiringMaintenance = rows.filter(row => row.requires_maintenance).length;
  const categoriesRequiringSerial = rows.filter(row => row.requires_serial_number).length;
  const categoriesWithImages = rows.filter(row => row.image_url).length;

  const columns = [
    { 
      field: "category_code", 
      headerName: "CODE", 
      width: 90,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600" fontFamily="monospace">
          {params.row.category_id}
        </Typography>
      )
    },
    { 
      field: "name", 
      headerName: "CATEGORY", 
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.image_url && (
            <Avatar 
              src={params.row.image_url || ""} 
              sx={{ width: 32, height: 32 }}
              variant="rounded"
            >
              <InventoryIcon />
            </Avatar>
          )}
          <Box>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.parent_category_id ? "Child Category" : "Root Category"}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: "university",
      headerName: "UNIVERSITY",
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SchoolIcon fontSize="small" color="action" />
          <Typography variant="caption">
            {params.row.university_name || "—"}
          </Typography>
        </Box>
      )
    },
    {
      field: "parent_category",
      headerName: "PARENT",
      width: 130,
      renderCell: (params) => (
        <Typography variant="caption">
          {params.row.parent_category_name || "—"}
        </Typography>
      )
    },
    {
      field: "items_count",
      headerName: "ITEMS",
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="500" textAlign="center">
          {params.row.items_count || 0}
        </Typography>
      )
    },
    {
      field: "depth",
      headerName: "DEPTH",
      width: 80,
      renderCell: (params) => (
        <Chip 
          label={params.row.depth || 0} 
          size="small" 
          color={params.row.depth === 0 ? "primary" : "default"}
          variant={params.row.depth === 0 ? "filled" : "outlined"}
        />
      )
    },
    {
      field: "tree_position",
      headerName: "TREE POS",
      width: 100,
      renderCell: (params) => (
        <Box>
          <Typography variant="caption" display="block">
            L: {params.row.lft || 0}
          </Typography>
          <Typography variant="caption" display="block">
            R: {params.row.rgt || 0}
          </Typography>
        </Box>
      )
    },
{
  field: "specifications",
  headerName: "SPECS",
  width: 350,
  renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* First row: Quantity left, Unit cost right */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="body2" fontWeight="bold">
             Warranty 🛡️{params.row.warranty_period_days || 0}d
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Depreciation 📉 {params.row.depreciation_rate || 0}%
            </Typography>
          </Box>
    
          {/* Second row: Total value aligned to the right */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
            <Typography variant="caption" color="text.secondary">
             Method 📊 {params.row.depreciation_method === 'straight_line' ? 'Straight Line' : 'Reducing Balance'}
            </Typography>
          </Box>
        </Box>
  )
},
    {
      field: "requirement",
      headerName: "REQS",
      width: 100,
      renderCell: (params) => (
        <Box>
          {params.row.requires_serial_number && (
            <Typography variant="caption" display="block">📋 Serial: ✅ </Typography>
          )}
          {params.row.requires_maintenance && (
            <Typography variant="caption" display="block">🔧 Maint: ✅ </Typography>
          )}
          {params.row.requires_calibration && (
            <Typography variant="caption" display="block">⚖️ Calib:✅ </Typography>
          )}
        </Box>
      )
    },
    {
      field: "maintenance",
      headerName: "MAINT",
      width: 80,
      renderCell: (params) => (
        params.row.requires_maintenance ? (
          <Typography variant="caption">
            {params.row.maintenance_interval_days}d
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        )
      )
    },
    {
      field: "image",
      headerName: "IMAGE",
      width: 80,
      renderCell: (params) => (
        params.row.image_url ? (
          <Avatar 
            src={params.row.image_url} 
            sx={{ width: 32, height: 32 }}
            variant="rounded"
          >
            <ImageIcon />
          </Avatar>
        ) : (
          <Typography variant="caption" color="text.secondary">No Image</Typography>
        )
      )
    },
    {
      field: "updated_at",
      headerName: "UPDATED",
      width: 180,
    },
    {
      field: "status",
      headerName: "STATUS",
      width: 90,
      renderCell: (params) => (
        params.row.is_active ? (
          <Chip label="ACTIVE" color="success" size="small" />
        ) : (
          <Chip label="INACTIVE" color="error" size="small" />
        )
      )
    },
    {
      field: "created_at",
      headerName: "CREATED",
      width: 180
    },
    {
      field: "actions",
      headerName: "ACTIONS",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit Category">
            <IconButton onClick={() => handleEdit(params.row)} size="small" color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Category">
            <IconButton onClick={() => handleDeleteClick(params.row)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const filteredRows = rows.filter((row) => {
    return (
      row.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.category_code?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.university_name?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    XLSX.utils.book_append_sheet(wb, ws, "Item Categories");
    XLSX.writeFile(wb, `ItemCategories_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
    
    showAlert("Categories data exported successfully!", "success");
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setGridLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const uploadedData = XLSX.utils.sheet_to_json(sheet);
        
        showAlert(`${uploadedData.length} categories imported successfully!`, "success");
      } catch (error) {
        showAlert("Error importing file", "error");
      } finally {
        setGridLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert({ ...alert, open: false }), 5000);
  };

  const handleCreate = () => {
    setSelectedItem("");
    reset();
    setData({
      name: "",
      description: "",
      category_code: "",
      university_id: "",
      parent_category_id: "",
      warranty_period_days: 0,
      depreciation_rate: 0,
      depreciation_method: "straight_line",
      requires_serial_number: false,
      requires_maintenance: false,
      maintenance_interval_days: "",
      specification_template: "",
      image_url: "",
      lft: "",
      rgt: "",
      depth: 0,
      is_active: true
    });
    setOpenCreateDialog(true);
  };

  const handleEdit = (row) => {
    setSelectedItem(row);
    setData({
      name: row.name || "",
      description: row.description || "",
      category_code: row.category_code || "",
      university_id: row.university_id || "",
      parent_category_id: row.parent_category_id || "",
      warranty_period_days: row.warranty_period_days || 0,
      depreciation_rate: row.depreciation_rate || 0,
      depreciation_method: row.depreciation_method || "straight_line",
      requires_serial_number: row.requires_serial_number || false,
      requires_maintenance: row.requires_maintenance || false,
      maintenance_interval_days: row.maintenance_interval_days || "",
      specification_template: row.specification_template || "",
      image_url: row.image_url || "",
      lft: row.lft || "",
      rgt: row.rgt || "",
      depth: row.depth || 0,
      is_active: row.is_active !== undefined ? row.is_active : true
    });
    setOpenCreateDialog(true);
  };

  const handleDeleteClick = (row) => {
    setSelectedItem(row);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;

    destroy(route('item-categories.destroy', selectedItem.category_id), {
      preserveScroll: true,
      onSuccess: () => {
        showAlert("Category deleted successfully!", "success");
        setOpenDeleteDialog(false);
      },
      onError: () => {
        showAlert("Error deleting category", "error");
      }
    });
  };

  const handleSubmit = () => {
    if (selectedItem) {
      // Update existing category
      put(route('item-categories.update', selectedItem.category_id), {
        preserveScroll: true,
        onSuccess: () => {
          showAlert("Category updated successfully!", "success");
          setOpenCreateDialog(false);
          reset();
        },
        onError: () => {
          showAlert("Error updating category", "error");
        }
      });
    } else {
      // Create new category
      post(route('item-categories.store'), {
        preserveScroll: true,
        onSuccess: () => {
          showAlert("Category created successfully!", "success");
          setOpenCreateDialog(false);
          reset();
        },
        onError: () => {
          showAlert("Error creating category", "error");
        }
      });
    }
  };

  const handleRefresh = () => {
    router.reload({ preserveScroll: true });
  };

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

  return (
    <AuthenticatedLayout 
      auth={auth} 
      title="Item Categories"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> },
        { label: 'Item Categories' },
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
              {/* Left Section - Title and Info */}
              <Grid size={{ xs:12, md:6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <InventoryIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      Item Categories
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Manage and organize your inventory categories with nested tree structure
                    </Typography>
                  </Box>
                  {searchText && (
                    <Chip
                      label={`${filteredRows.length} of ${rows.length} categories`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                </Box>
              </Grid>

              {/* Right Section - Buttons */}
              <Grid size={{ xs: 12, md:"auto" }}>
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
                      New Category
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
          <Grid container spacing={2}  sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Total Categories" 
                value={totalCategories} 
                icon={<InventoryIcon />} 
                color="#2196f3" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Active Categories" 
                value={activeCategories} 
                icon={<SummarizeIcon />} 
                color="#4caf50" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Need Maintenance" 
                value={categoriesRequiringMaintenance} 
                icon={<BuildIcon />} 
                color="#ff9800" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="With Images" 
                value={categoriesWithImages} 
                icon={<ImageIcon />} 
                color="#9c27b0" 
              />
            </Grid>
          </Grid>

          {/* Data Grid */}
          <Box sx={{
            height: "100%",
            width: "100%",
            backgroundColor: "background.paper",
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 3,
            position: 'relative'
          }}>
            {/* Custom Header */}
            <Box sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountTreeIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                <Typography variant="h6" fontWeight="bold" color="primary">
                  C.Tree Structure
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Search categories..."
                  variant="outlined"
                  size="small"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 250 }}
                />
                
                <Tooltip title="Refresh Data">
                  <IconButton color="primary" size="small" onClick={handleRefresh}>
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
                  New Category
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
                  <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleUpload} />
                </Button>
              </Stack>
            </Box>
            
            {/* Data Grid */}
            <DataGrid
              autoHeight
              rows={filteredRows}
              columns={columns}
              pageSizeOptions={[5, 10, 20, 50, 100]}
              initialState={{
                pagination: { paginationModel: { page: 0, pageSize: 10 } },
                sorting: { sortModel: [{ field: 'lft', sort: 'asc' }] }
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': { borderBottom: '1px solid', borderColor: 'divider' },
                '& .MuiDataGrid-columnHeaders': { 
                  backgroundColor: 'grey.50', 
                  borderBottom: '2px solid',
                  borderColor: 'divider' 
                },
              }}
              loading={gridLoading}
            />
            
            {/* Custom Loading Overlay */}
            {gridLoading && (
              <Box sx={{
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
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={60} thickness={4} />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading categories...
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Create/Edit Dialog */}
          <Dialog 
            open={openCreateDialog} 
            onClose={() => !processing && setOpenCreateDialog(false)}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Slide}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: 'primary.main',
              color: 'white'
            }}>
              <Typography variant="h6" component={"span"}>
                {selectedItem ? "Edit Category" : "Create New Category"}
              </Typography>
              <IconButton 
                onClick={() => !processing && setOpenCreateDialog(false)} 
                sx={{ color: 'white' }}
                disabled={processing}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ pt: 3 }}>
              {processing && <LinearProgress />}
              
              <Grid container spacing={3}>

                <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                  <FormControl fullWidth error={!!errors.university_id}>
                    <InputLabel>University </InputLabel>
                    <Select 
                      value={data.university_id} 
                      label="University" 
                      onChange={(e) => setData('university_id', e.target.value)}
                    >
                      {universities?.map(university => (
                        <MenuItem key={university.university_id} value={university.university_id}>
                          {university.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.university_id && <FormHelperText>{errors.university_id}</FormHelperText>}
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={processing}
                    required
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="Category Code"
                    name="category_code"
                    value={data.category_code}
                    onChange={(e) => setData('category_code', e.target.value)}
                    error={!!errors.category_code}
                    helperText={errors.category_code}
                    disabled={processing}
                    required
                  />
                </Grid>
              
                {/* <Grid size={{ xs: 12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="University ID"
                    name="university_id"
                    value={data.university_id}
                    onChange={(e) => setData('university_id', e.target.value)}
                    error={!!errors.university_id}
                    helperText={errors.university_id}
                    disabled={processing}
                    required
                  />
                </Grid> */}
                
                <Grid size={{ xs: 12, sm: 6}}>
                  <FormControl fullWidth>
                    <InputLabel>Parent Category</InputLabel>
                    <Select
                      name="parent_category_id"
                      value={data.parent_category_id}
                      label="Parent Category"
                      onChange={(e) => setData('parent_category_id', e.target.value)}
                      disabled={processing}
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
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    multiline
                    rows={2}
                    disabled={processing}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    name="image_url"
                    value={data.image_url}
                    onChange={(e) => setData('image_url', e.target.value)}
                    error={!!errors.image_url}
                    helperText={errors.image_url}
                    disabled={processing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ImageIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="Warranty Period (Days)"
                    name="warranty_period_days"
                    type="number"
                    value={data.warranty_period_days}
                    onChange={(e) => setData('warranty_period_days', parseInt(e.target.value) || 0)}
                    error={!!errors.warranty_period_days}
                    helperText={errors.warranty_period_days}
                    disabled={processing}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="Depreciation Rate (%)"
                    name="depreciation_rate"
                    type="number"
                    value={data.depreciation_rate}
                    onChange={(e) => setData('depreciation_rate', parseFloat(e.target.value) || 0)}
                    error={!!errors.depreciation_rate}
                    helperText={errors.depreciation_rate}
                    disabled={processing}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6}}>
                  <FormControl fullWidth>
                    <InputLabel>Depreciation Method</InputLabel>
                    <Select
                      name="depreciation_method"
                      value={data.depreciation_method}
                      label="Depreciation Method"
                      onChange={(e) => setData('depreciation_method', e.target.value)}
                      disabled={processing}
                    >
                      <MenuItem value="straight_line">Straight Line</MenuItem>
                      <MenuItem value="reducing_balance">Reducing Balance</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="Maintenance Interval (Days)"
                    name="maintenance_interval_days"
                    type="number"
                    value={data.maintenance_interval_days}
                    onChange={(e) => setData('maintenance_interval_days', parseInt(e.target.value) || "")}
                    error={!!errors.maintenance_interval_days}
                    helperText={errors.maintenance_interval_days}
                    disabled={processing}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="Depth"
                    name="depth"
                    type="number"
                    value={data.depth}
                    onChange={(e) => setData('depth', parseInt(e.target.value) || 0)}
                    error={!!errors.depth}
                    helperText={errors.depth}
                    disabled={processing}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="Left Position (LFT)"
                    name="lft"
                    type="number"
                    value={data.lft}
                    onChange={(e) => setData('lft', parseInt(e.target.value) || "")}
                    error={!!errors.lft}
                    helperText={errors.lft}
                    disabled={processing}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6}}>
                  <TextField
                    fullWidth
                    label="Right Position (RGT)"
                    name="rgt"
                    type="number"
                    value={data.rgt}
                    onChange={(e) => setData('rgt', parseInt(e.target.value) || "")}
                    error={!!errors.rgt}
                    helperText={errors.rgt}
                    disabled={processing}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.requires_serial_number}
                        onChange={(e) => setData('requires_serial_number', e.target.checked)}
                        disabled={processing}
                      />
                    }
                    label="Requires Serial Number"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.requires_maintenance}
                        onChange={(e) => setData('requires_maintenance', e.target.checked)}
                        disabled={processing}
                      />
                    }
                    label="Requires Maintenance"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm:6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        disabled={processing}
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
                disabled={processing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                variant="contained"
                disabled={processing}
                startIcon={processing ? <CircularProgress size={16} /> : (selectedItem ? <SaveIcon /> : <AddIcon />)}
              >
                {processing ? 'Processing...' : (selectedItem ? "Update Category" : "Create Category")}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete the category "{selectedItem?.name}"? This action cannot be undone.
              </Typography>
              {selectedItem?.items_count > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This category contains {selectedItem.items_count} items. Deleting it may affect those items.
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} variant="contained" color="error" startIcon={<DeleteIcon />}>
                Delete Category
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
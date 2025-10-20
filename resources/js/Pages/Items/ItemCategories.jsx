import React, { useEffect, useState, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  Box,
  Chip,
  Typography,
  Button,
  Stack,
  Grid,
  IconButton,
  Tooltip,
  Avatar,
  Fade,
  alpha,
} from "@mui/material";
import {
  UploadFile as UploadFileIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  Summarize as SummarizeIcon,
  Build as BuildIcon,
  Image as ImageIcon,
  School as SchoolIcon,
  AccountTree as AccountTreeIcon,
  Numbers as NumbersIcon,
  Home as HomeIcon,
  AddCircleOutline,
  CloudUpload,
  Download,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { keyframes } from "@emotion/react";
import moment from "moment";
import { useForm, router, usePage } from "@inertiajs/react";

// Import reusable components
import Notification from "@/Components/Notification";
import PageHeader from "@/Components/PageHeader";
import SummaryCard from "@/Components/SummaryCard";
import EnhancedDataGrid from "@/Components/EnhancedDataGrid";
import CategoryDialog from "@/Components/CategoryDialog";
import DeleteDialog from "@/Components/DeleteDialog";
import formatNumber from "../Service/FormatNumber";

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

export default function ItemCategories({ categories = [], auth, filters: initialFilters = {}, universities }) {
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
        depreciation_method: item?.depreciation_method ?? '',
        requires_serial_number: item?.requires_serial_number ?? false,
        requires_maintenance: item?.requires_maintenance ?? false,
        requirement: item ?? "",
        parent_category_id: item?.parent_category_id ?? '',
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
              {params.row.parent_category_name || "—"}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: "university",
      headerName: "UNIVERSITY",
      width: 250,
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="body2" fontWeight="bold">
             Warranty 🛡️{params.row.warranty_period_days || 0}d
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Depreciation 📉 {params.row.depreciation_rate || 0}%
            </Typography>
          </Box>
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
        onSuccess: (response) => {
          // showAlert("Category updated successfully!", "success");
          setAlert({ open: true, message: response.props.flash.error, severity: 'success' });
          setOpenCreateDialog(false);
          reset();
        },
        onError: (error) => {
          // setAlert({ open: true, message: response.props.flash.error, severity: 'error' });
          // console.log(Object.values(error).join('\n'))
          showAlert("Error updating category:"+Object.values(error).join('\n'), "error");
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
        onError: (error) => {
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

  // Create action buttons for header
  const actionButtons = [
    <Button
      key="new-category"
      variant="contained"
      startIcon={<AddCircleOutline />}
      onClick={handleCreate}
      size="medium"
      sx={{
        borderRadius: 2.5,
        textTransform: "none",
        fontWeight: 700,
        px: 3,
        py: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.3s ease'
      }}
    >
      New Category
    </Button>,
    <Button
      key="import"
      size="medium"
      startIcon={<CloudUpload />}
      component="label"
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        textTransform: "none",
        fontWeight: 600,
        px: 2.5,
        py: 1,
        border: '2px solid',
        borderColor: 'grey.200',
        color: 'text.primary',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'rgba(102, 126, 234, 0.04)',
          color: 'primary.main',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        transition: 'all 0.3s ease'
      }}
    >
      Import
      <input
        hidden
        accept=".xlsx,.xls,.csv"
        type="file"
        onChange={handleUpload}
      />
    </Button>,
    <Button
      key="export"
      size="medium"
      startIcon={<Download />}
      onClick={handleExport}
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        textTransform: "none",
        fontWeight: 600,
        px: 2.5,
        py: 1,
        border: '2px solid',
        borderColor: 'grey.200',
        color: 'text.primary',
        '&:hover': {
          borderColor: 'success.main',
          backgroundColor: 'rgba(16, 185, 129, 0.04)',
          color: 'success.main',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        transition: 'all 0.3s ease'
      }}
    >
      Export
    </Button>
  ];

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
          <PageHeader
            title="Item Categories"
            subtitle="Manage and organize your inventory categories with nested tree structure"
            icon={<InventoryIcon sx={{ fontSize: 28 }} />}
            actionButtons={actionButtons}
            searchText={searchText}
            onSearchClear={() => setSearchText('')}
            filteredCount={filteredRows.length}
            totalCount={rows.length}
          />
          
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Total Categories" 
                change={"+"+formatNumber(totalCategories)?? 0}
                value={formatNumber(totalCategories)} 
                animationDelay="1"
                icon={<InventoryIcon />} 
                color="#2196f3" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Active Categories" 
                value={formatNumber(activeCategories??0)} 
                change={"+"+formatNumber(activeCategories)}
                icon={<SummarizeIcon />} 
                color="#4caf50" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Need Maintenance" 
                value={formatNumber(categoriesRequiringMaintenance)} 
                change={"+"+formatNumber(categoriesRequiringMaintenance)}
                icon={<BuildIcon />} 
                color="#ff9800" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="With Images" 
                value={formatNumber(categoriesWithImages)} 
                change={"+"+formatNumber(categoriesWithImages)}
                icon={<ImageIcon />} 
                color="#9c27b0" 
              />
            </Grid>
          </Grid>

          {/* Data Grid */}
          <EnhancedDataGrid
            rows={rows}
            columns={columns}
            loading={gridLoading}
            searchText={searchText}
            onSearchChange={setSearchText}
            onSearchClear={() => setSearchText('')}
            onAdd={handleCreate}
            onExport={handleExport}
            onImport={handleUpload}
            onRefresh={handleRefresh}
            title="Category Hierarchy"
            subtitle="Hierarchical view of your inventory categories"
            icon={<AccountTreeIcon />}
            addButtonText="New Category"
            pageSizeOptions={[5, 10, 20, 50, 100]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
              sorting: { sortModel: [{ field: 'lft', sort: 'asc' }] }
            }}
          />

          {/* Dialogs */}
          <CategoryDialog
            open={openCreateDialog}
            onClose={() => setOpenCreateDialog(false)}
            selectedItem={selectedItem}
            data={data}
            setData={setData}
            errors={errors}
            processing={processing}
            universities={universities}
            categories={rows}
            onSubmit={handleSubmit}
          />
          
          <DeleteDialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            selectedItem={selectedItem}
            onConfirm={handleDeleteConfirm}
            gridLoading={processing}
          />
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
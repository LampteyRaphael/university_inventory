
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
  Grid,
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
  Inventory as StockIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  AttachMoney as AmountIcon,
  CalendarToday as DateIcon,
  CheckCircle as ApprovedIcon,
  TrendingUp as TrendIcon,
  Warning as OverdueIcon,
  Warning,
  Inventory,
  Download,
  CloudUpload,
  AddCircleOutline,
} from "@mui/icons-material";
import { useForm, usePage } from "@inertiajs/react";
import Notification from "@/Components/Notification";

// Custom components
const SummaryCard = ({ title, value, icon, color, subtitle }) => (
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

export default function StockLevels({ stockLevels, auth, universities, items, departments, locations }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { flash } = usePage().props;
  
  // Inertia useForm for form handling
  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    stock_id: "",
    university_id: auth.user?.university_id || "",
    item_id: "",
    department_id: "",
    location_id: "",
    current_quantity: 0,
    committed_quantity: 0,
    on_order_quantity: 0,
    average_cost: 0,
    last_count_date: "",
    // moment().format('YYYY-MM-DD'),
    next_count_date: "",
    // /moment().add(30, 'days').format('YYYY-MM-DD'),
    count_frequency: "monthly",
    reorder_level: 0,
    max_level: 0,
    safety_stock: 0,
    lead_time_days: 7,
    service_level: 95,
  });

  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const fileInputRef = useRef(null);

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  // Count frequencies
  const countFrequencies = [
    { value: 'daily', label: 'Daily', color: 'primary' },
    { value: 'weekly', label: 'Weekly', color: 'info' },
    { value: 'monthly', label: 'Monthly', color: 'success' },
    { value: 'quarterly', label: 'Quarterly', color: 'warning' },
    { value: 'yearly', label: 'Yearly', color: 'error' },
  ];

  // Status indicators for stock levels
  const stockStatuses = [
    { value: 'normal', label: 'Normal', color: 'success', icon: <ApprovedIcon /> },
    { value: 'low', label: 'Low Stock', color: 'warning', icon: <OverdueIcon /> },
    { value: 'critical', label: 'Critical', color: 'error', icon: <Warning /> },
    { value: 'overstock', label: 'Overstock', color: 'info', icon: <TrendIcon /> },
  ];

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    
    const processData = setTimeout(() => {
      const formatted = (stockLevels || []).map((stock, index) => {
        const availableQty = stock.current_quantity - stock.committed_quantity;
        let status = 'normal';
        
        if (availableQty <= stock.safety_stock) {
          status = 'critical';
        } else if (availableQty <= stock.reorder_level) {
          status = 'low';
        } else if (stock.current_quantity > (stock.max_level || stock.reorder_level * 2)) {
          status = 'overstock';
        }
        
        return {
          id: stock?.stock_id ?? index + 1,
          ...stock,
          current_quantity: Number(stock?.current_quantity ?? 0),
          universities: stock?.university_id??null,
          committed_quantity: Number(stock?.committed_quantity ?? 0),
          available_quantity: availableQty,
          on_order_quantity: Number(stock?.on_order_quantity ?? 0),
          average_cost: Number(stock?.average_cost ?? 0),
          total_value: Number(stock?.total_value ?? 0),
          reorder_level: Number(stock?.reorder_level ?? 0),
          max_level: Number(stock?.max_level ?? 0),
          safety_stock: Number(stock?.safety_stock ?? 0),
          lead_time_days: Number(stock?.lead_time_days ?? 0),
          service_level: Number(stock?.service_level ?? 95),
          last_count_date: stock?.last_count_date ? 
          moment(stock.last_count_date).format("YYYY-MM-DD") : "Never",
          next_count_date: stock?.next_count_date ? 
            moment(stock.next_count_date).format("YYYY-MM-DD") : "",
          last_updated: stock?.last_updated ? 
            moment(stock.last_updated).format("MMM Do YYYY, h:mm a") : "",
          created_at: stock?.created_at ? 
            moment(stock.created_at).format("MMM Do YYYY, h:mm a") : "",
          updated_at: stock?.updated_at ? 
            moment(stock.updated_at).format("MMM Do YYYY, h:mm a") : "",
          status: status,
        };
      });
      
      setRows(formatted);
      setGridLoading(false);
    }, 800);

    return () => clearTimeout(processData);
  }, [stockLevels]);

  // Calculate summary statistics
  const { totalItems, totalValue, lowStockItems, criticalStockItems } = useMemo(() => {
    const total = rows.length;
    const value = rows.reduce((sum, row) => sum + (row.total_value || 0), 0);
    const low = rows.filter(row => row.status === 'low').length;
    const critical = rows.filter(row => row.status === 'critical').length;
    
    return {
      totalItems: total,
      totalValue: value,
      lowStockItems: low,
      criticalStockItems: critical,
    };
  }, [rows]);

  // Helper function for frequency colors
  const getFrequencyColor = (frequency) => {
    const colors = {
      daily: 'primary',
      weekly: 'secondary',
      monthly: 'success',
      quarterly: 'warning',
      yearly: 'error'
    };
    return colors[frequency] || 'default';
  };

  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    const query = searchText.toLowerCase();
    return rows.filter(row => 
      (items?.find(i => i.item_id === row.item_id)?.name || "").toLowerCase().includes(query) ||
      (departments?.find(d => d.department_id === row.department_id)?.name || "").toLowerCase().includes(query) ||
      stockStatuses?.find(s => s.value === row.status)?.label.toLowerCase().includes(query)
    );
  }, [rows, searchText, items, departments, stockStatuses]);

  // Event handlers with Inertia.js
  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows.map(row => ({
        'Item': items.find(i => i.item_id === row.item_id)?.name || row.item_id,
        'University': universities?.find(u => u.university_id === row.university_id)?.name || row.university_id,
        'Department': departments?.find(d => d.department_id === row.department_id)?.name || row.department_id,
        'Location': row.location_id ? (locations.find(l => l.location_id === row.location_id)?.name || row.location_id) : '-',
        'Current Quantity': row.current_quantity,
        'Committed Quantity': row.committed_quantity,
        'Available Quantity': row.available_quantity,
        'On Order Quantity': row.on_order_quantity,
        'Average Cost': `$${row.average_cost}`,
        'Total Value': `$${row.total_value}`,
        'Reorder Level': row.reorder_level,
        'Safety Stock': row.safety_stock,
        'Max Level': row.max_level || '-',
        'Lead Time (Days)': row.lead_time_days,
        'Service Level': `${row.service_level}%`,
        'Count Frequency': countFrequencies.find(f => f.value === row.count_frequency)?.label || row.count_frequency,
        'Last Count Date': row.last_count_date,
        'Next Count Date': row.next_count_date,
        'Status': stockStatuses.find(s => s.value === row.status)?.label || row.status,
        'Last Updated': row.last_updated,
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Levels');
    XLSX.writeFile(workbook, `stock_levels_export_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
    setAlert({ open: true, message: 'Stock level data exported successfully', severity: 'success' });
  }, [filteredRows, items, departments, universities, locations, countFrequencies, stockStatuses]);

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
        
        // Use Inertia to post the uploaded data
        post(route('stock-levels.import'), {
          data: uploadedData,
          onSuccess: () => {
            setAlert({ open: true, message: `${uploadedData.length} stock levels imported successfully`, severity: 'success' });
            setGridLoading(false);
          },
          onError: (errors) => {
            setAlert({ open: true, message: 'Error importing file', severity: 'error' });
            setGridLoading(false);
          }
        });
      } catch (error) {
        setAlert({ open: true, message: 'Error processing file: ' + error.message, severity: 'error' });
        setGridLoading(false);
      }
    };
    
    reader.onerror = () => {
      setAlert({ open: true, message: 'Error reading file', severity: 'error' });
      setGridLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  }, [post]);

  const handleCreate = useCallback(() => {
    setSelectedStock(null);
    reset();
    setOpenDialog(true);
  }, [reset]);

  const handleEdit = useCallback((row) => {
    setSelectedStock(row);
    setData({
      stock_id: row.stock_id,
      university_id: row.university_id || auth.user?.university_id,
      item_id: row.item_id,
      department_id: row.department_id,
      location_id: row.location_id,
      current_quantity: row.current_quantity,
      committed_quantity: row.committed_quantity,
      on_order_quantity: row.on_order_quantity,
      average_cost: row.average_cost,
      last_count_date: row.last_count_date ? moment(row.last_count_date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      next_count_date: row.next_count_date ? moment(row.next_count_date).format('YYYY-MM-DD') : moment().add(30, 'days').format('YYYY-MM-DD'),
      count_frequency: row.count_frequency || "monthly",
      reorder_level: row.reorder_level,
      max_level: row.max_level,
      safety_stock: row.safety_stock,
      lead_time_days: row.lead_time_days,
      service_level: row.service_level,
    });
    setOpenDialog(true);
  }, [setData, auth]);

  const handleDeleteClick = useCallback((row) => {
    setSelectedStock(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedStock) {
      // Update existing stock
      put(route('stock-levels.update', selectedStock.id), {
        preserveScroll: true,
        onSuccess: () => {
          setOpenDialog(false);
          setSelectedStock(null);
          reset();
        },
        onError: (errors) => {
          console.error('Update error:', errors);
        },
      });
    } else {
      // Create new stock
      post(route('stock-levels.store'), {
        preserveScroll: true,
        onSuccess: () => {
          setOpenDialog(false);
          reset();
        },
        onError: (errors) => {
          console.error('Create error:', errors);
        },
      });
    }
  }, [selectedStock, post, put, reset]);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedStock) {
      destroy(route('stock-levels.destroy', selectedStock.id), {
        preserveScroll: true,
        onSuccess: () => {
          setOpenDeleteDialog(false);
          setSelectedStock(null);
        },
        onError: (errors) => {
          console.error('Delete error:', errors);
        },
      });
    }
  }, [selectedStock, destroy]);

  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setData(name, newValue);
  }, [setData]);

  const handleRefresh = useCallback(() => {
    setGridLoading(true);
    // Inertia will automatically refetch the data when we visit the same page
    window.location.reload();
  }, []);

  // Handle flash messages
  useEffect(() => {
    if (flash.success) {
      showAlert(flash.success, "success");
    }

    if (flash.error) {
      showAlert(flash.error, "error");
    }
  }, [flash]);

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };
  // Columns definition
  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'item_info', 
      headerName: 'Item Info', 
      width: 180,
      renderCell: (params) => (
        <Tooltip title={
          <Box>
            <div><strong>Item:</strong> {params?.row?.item_name??null}</div>
            <div><strong>Dept:</strong> {params?.row?.department_name??null}</div>
            <div><strong>Loc:</strong> {params?.row?.local_name??null}</div>
          </Box>
        }>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {params?.row?.item_name??null}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params?.row?.department_name??null} • {params?.row?.local_name??null}
            </Typography>
          </Box>
        </Tooltip>
      )
    },
    { 
      field: 'quantities', 
      headerName: 'Quantities', 
      width: 140,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Current:</Typography>
            <Typography variant="caption" fontWeight="bold">{params.row.current_quantity}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Available:</Typography>
            <Typography variant="caption" fontWeight="bold" color={params.row.available_quantity <= params.row.safety_stock ? 'error' : 'success.main'}>
              {params.row.available_quantity}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Committed:</Typography>
            <Typography variant="caption" fontWeight="bold">{params.row.committed_quantity}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">On Order:</Typography>
            <Typography variant="caption" fontWeight="bold">{params.row.on_order_quantity}</Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'values', 
      headerName: 'Values', 
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Avg Cost:</Typography>
            <Typography variant="caption" fontWeight="bold">${Number(params.row.average_cost).toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Total Value:</Typography>
            <Typography variant="caption" fontWeight="bold">${Number(params.row.total_value).toLocaleString()}</Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'inventory_settings', 
      headerName: 'Inventory Settings', 
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Reorder:</Typography>
            <Typography variant="caption" fontWeight="bold">{params.row.reorder_level}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Safety:</Typography>
            <Typography variant="caption" fontWeight="bold">{params.row.safety_stock}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Max Level:</Typography>
            <Typography variant="caption" fontWeight="bold">{params.row.max_level || '-'}</Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'supply_settings', 
      headerName: 'Supply Settings', 
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Lead Time:</Typography>
            <Typography variant="caption" fontWeight="bold">{params.row.lead_time_days}d</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Service Level:</Typography>
            <Typography variant="caption" fontWeight="bold">{params.row.service_level}%</Typography>
          </Box>
        </Box>
      )
    },
    { 
      field: 'stock_count', 
      headerName: 'Stock Count', 
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip 
              label={params.row.count_frequency || 'N/A'} 
              size="small" 
              color={getFrequencyColor(params.row.count_frequency)}
              variant="outlined"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption">Last: {moment(params.row.last_count_date).format("MMM Do YYYY") || 'N/A'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {(() => {
              if (!params.row.next_count_date) return <Typography variant="caption">Next: N/A</Typography>;
              
              const nextDate = moment(params.row.next_count_date)||'';
              if (!nextDate.isValid()) return <Typography variant="caption">Next: Invalid Date</Typography>;
              
              const isOverdue = moment().isAfter(nextDate);
              const isToday = moment().isSame(nextDate, 'day');
              
              if (isOverdue) {
                return (
                  <>
                    <OverdueIcon color="error" sx={{ fontSize: 14 }} />
                    <Typography variant="caption" color="error">
                      Overdue: {nextDate.format('MMM DD')}
                    </Typography>
                  </>
                );
              }
              
              if (isToday) {
                return (
                  <>
                    <DateIcon color="warning" sx={{ fontSize: 14 }} />
                    <Typography variant="caption" color="warning.main">
                      Due Today
                    </Typography>
                  </>
                );
              }
              
              return <Typography variant="caption">Next: {nextDate.format('MMM DD')}</Typography>;
            })()}
          </Box>
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130, 
      renderCell: (params) => {
        const status = stockStatuses.find(s => s.value === params.value);
        return (
          <Chip 
            icon={status?.icon} 
            label={status?.label || params.value} 
            size="small" 
            color={status?.color || 'default'}
            variant="filled"
          />
        );
      } 
    },
    { 
      field: 'last_updated', 
      headerName: 'Last Updated', 
      width: 200,
      renderCell: (params) => {
        return params.row.last_updated || 'Invalid Date';
      }
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
  ], [items, departments, locations, countFrequencies, stockStatuses, handleEdit, handleDeleteClick]);

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Stock Levels"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'Stock Levels' }
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

          {/* Header section */}
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
                  <StockIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      Inventory Stocks
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Manage and track all inventory movements and stocks
                    </Typography>
                  </Box>
                  {searchText && (
                    <Chip
                      label={`${filteredRows.length} of ${rows.length} transactions`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                </Box>
              </Grid>

              {/* Right Section - Buttons */}
              <Grid size={{ xs:12, md:'auto'}}>
                <Grid container spacing={1.5} justifyContent="flex-end">
                  <Grid>
                    <Button
                      variant="contained"
                      startIcon={<AddCircleOutline />}
                      onClick={handleCreate}
                      size="small"
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      New Stock
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
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <SummaryCard 
                title="Total Items" 
                value={totalItems} 
                icon={<StockIcon />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <SummaryCard 
                title="Total Value" 
                value={`$${totalValue.toLocaleString()}`} 
                icon={<AmountIcon />} 
                color={theme.palette.success.main} 
              />
            </Grid>
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <SummaryCard 
                title="Low Stock Items" 
                value={lowStockItems} 
                icon={<OverdueIcon />} 
                color={theme.palette.warning.main} 
              />
            </Grid>
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <SummaryCard 
                title="Critical Items" 
                value={criticalStockItems} 
                icon={<Warning />} 
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
              {/* Left side - Title + Chip */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Inventory color="primary" fontSize="medium" />
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Stock History
                </Typography>
                {searchText && (
                  <Chip
                    label={`${filteredRows.length} of ${rows.length} transactions`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>

              {/* Right side - Search + Refresh */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search transactions..."
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

          {/* Create/Edit Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)} 
            maxWidth="md" 
            fullWidth
          >
            <DialogTitle sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              py: 2
            }}>
              {selectedStock ? "Edit Stock Level" : "New Stock Level"}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Item */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <FormControl fullWidth error={!!errors.item_id}>
                    <InputLabel>Item</InputLabel>
                    <Select
                      name="item_id"
                      value={data.item_id}
                      onChange={handleInputChange}
                      label="Item"
                    >
                      {items?.map(item => (
                        <MenuItem key={item.item_id} value={item.item_id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.item_id && (
                      <FormHelperText>{errors.item_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Department */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <FormControl fullWidth error={!!errors.department_id}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department_id"
                      value={data.department_id}
                      onChange={handleInputChange}
                      label="Department"
                    >
                      {departments?.map(dept => (
                        <MenuItem key={dept.department_id} value={dept.department_id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.department_id && (
                      <FormHelperText>{errors.department_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Location */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <FormControl fullWidth error={!!errors.location_id}>
                    <InputLabel>Location</InputLabel>
                    <Select
                      name="location_id"
                      value={data.location_id}
                      onChange={handleInputChange}
                      label="Location"
                    >
                      {locations?.map(loc => (
                        <MenuItem key={loc.location_id} value={loc.location_id}>
                          {loc.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.location_id && (
                      <FormHelperText>{errors.location_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Current Quantity */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Current Quantity"
                    name="current_quantity"
                    value={data.current_quantity}
                    onChange={handleInputChange}
                    error={!!errors.current_quantity}
                    helperText={errors.current_quantity}
                  />
                </Grid>

                {/* Committed Quantity */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Committed Quantity"
                    name="committed_quantity"
                    value={data.committed_quantity}
                    onChange={handleInputChange}
                    error={!!errors.committed_quantity}
                    helperText={errors.committed_quantity}
                  />
                </Grid>

                {/* On Order Quantity */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="On Order Quantity"
                    name="on_order_quantity"
                    value={data.on_order_quantity}
                    onChange={handleInputChange}
                    error={!!errors.on_order_quantity}
                    helperText={errors.on_order_quantity}
                  />
                </Grid>

                {/* Average Cost */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Average Cost"
                    name="average_cost"
                    value={data.average_cost}
                    onChange={handleInputChange}
                    error={!!errors.average_cost}
                    helperText={errors.average_cost}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>

                {/* Reorder Level */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Reorder Level"
                    name="reorder_level"
                    value={data.reorder_level}
                    onChange={handleInputChange}
                    error={!!errors.reorder_level}
                    helperText={errors.reorder_level}
                  />
                </Grid>

                {/* Safety Stock */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Safety Stock"
                    name="safety_stock"
                    value={data.safety_stock}
                    onChange={handleInputChange}
                    error={!!errors.safety_stock}
                    helperText={errors.safety_stock}
                  />
                </Grid>

                {/* Max Level */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Level"
                    name="max_level"
                    value={data.max_level}
                    onChange={handleInputChange}
                    error={!!errors.max_level}
                    helperText={errors.max_level}
                  />
                </Grid>

                {/* Service Level */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Service Level (%)"
                    name="service_level"
                    value={data.service_level}
                    onChange={handleInputChange}
                    error={!!errors.service_level}
                    helperText={errors.service_level}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>

                {/* Lead Time Days */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Lead Time (Days)"
                    name="lead_time_days"
                    value={data.lead_time_days}
                    onChange={handleInputChange}
                    error={!!errors.lead_time_days}
                    helperText={errors.lead_time_days}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">days</InputAdornment>,
                    }}
                  />
                </Grid>

                {/* Count Frequency */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <FormControl fullWidth error={!!errors.count_frequency}>
                    <InputLabel>Count Frequency</InputLabel>
                    <Select
                      name="count_frequency"
                      value={data.count_frequency}
                      onChange={handleInputChange}
                      label="Count Frequency"
                    >
                      {countFrequencies.map(freq => (
                        <MenuItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.count_frequency && (
                      <FormHelperText>{errors.count_frequency}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Last Count Date */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Last Count Date"
                    name="last_count_date"
                    value={data.last_count_date}
                    onChange={handleInputChange}
                    error={!!errors.last_count_date}
                    helperText={errors.last_count_date}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Next Count Date */}
                <Grid size={{ xs:12, sm:6, md:4 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Next Count Date"
                    name="next_count_date"
                    value={data.next_count_date}
                    onChange={handleInputChange}
                    error={!!errors.next_count_date}
                    helperText={errors.next_count_date}
                    InputLabelProps={{ shrink: true }}
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
                disabled={processing}
              >
                {processing ? "Saving..." : "Save"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
          >
            <DialogTitle>Delete Stock Level</DialogTitle>
            <DialogContent dividers>
              <Typography>
                Are you sure you want to delete this stock level record?
                {selectedStock && (
                  <Box sx={{ mt: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>Item:</strong> {items?.find(i => i.item_id === selectedStock.item_id)?.name || selectedStock.item_id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Current Quantity:</strong> {selectedStock.current_quantity}
                    </Typography>
                  </Box>
                )}
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
                disabled={processing}
              >
                {processing ? "Deleting..." : "Delete"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
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
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Inventory as InventoryIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Receipt as OrderIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as ReceivedIcon,
  Cancel as CancelledIcon,
  Pending as PartiallyReceivedIcon,
  AttachMoney as PriceIcon,
  Discount as DiscountIcon,
  AccountBalance as TotalIcon,
  CalendarToday as DateIcon,
  TrendingUp as TrendIcon,
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

const CustomToolbar = ({ onCreate, onImport, onExport, onRefresh }) => (
  <GridToolbarContainer>
    <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1, flexWrap: 'wrap' }}>
      <Button size="small" startIcon={<AddIcon />} onClick={onCreate} variant="contained">
        New Order Item
      </Button>
      <Button size="small" startIcon={<UploadFileIcon />} component="label" variant="outlined">
        Import
        <input hidden accept=".xlsx,.xls,.csv" type="file" onChange={onImport} />
      </Button>
      <Button size="small" startIcon={<SaveIcon />} onClick={onExport} variant="outlined">
        Export
      </Button>
      <Button size="small" startIcon={<RefreshIcon />} onClick={onRefresh} variant="outlined">
        Refresh
      </Button>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </Stack>
  </GridToolbarContainer>
);

export default function PurchaseOrderItems({ orderItems, auth, purchaseOrders, inventoryItems }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // Status constants
  const itemStatuses = [
    { value: 'ordered', label: 'Ordered', color: 'default', icon: <OrderIcon /> },
    { value: 'partially_received', label: 'Partially Received', color: 'warning', icon: <PartiallyReceivedIcon /> },
    { value: 'received', label: 'Received', color: 'success', icon: <ReceivedIcon /> },
    { value: 'cancelled', label: 'Cancelled', color: 'error', icon: <CancelledIcon /> },
  ];

  // Form structure
  const emptyForm = {
    order_item_id: "",
    order_id: "",
    item_id: "",
    quantity_ordered: 1,
    quantity_received: 0,
    quantity_cancelled: 0,
    unit_price: 0,
    tax_rate: 0,
    discount_rate: 0,
    line_total: 0,
    expected_delivery_date: moment().add(14, 'days').format('YYYY-MM-DD'),
    actual_delivery_date: "",
    status: "ordered",
    notes: "",
  };

  const [formData, setFormData] = useState(emptyForm);

//   // Process data on component mount
//   useEffect(() => {
//     setGridLoading(true);
    
//     // Simulate data processing
//     const processData = setTimeout(() => {
//       const formatted = (orderItems || []).map((item, index) => ({
//         id: item?.order_item_id ?? index + 1,
        
//         ...item,
//         quantity_ordered: Number(item?.quantity_ordered ?? 0),
//         quantity_received: Number(item?.quantity_received ?? 0),
//         quantity_cancelled: Number(item?.quantity_cancelled ?? 0),
//         quantity_pending: Math.max(0, item?.quantity_ordered - item?.quantity_received - item?.quantity_cancelled),
//         completion_percentage: completion_percentage,
//         unit_price: Number(item?.unit_price ?? 0),
//         tax_rate: Number(item?.tax_rate ?? 0),
//         discount_rate: Number(item?.discount_rate ?? 0),
//         line_total: Number(item?.line_total ?? 0),
//         expected_delivery_date: item?.expected_delivery_date ? 
//           moment(item.expected_delivery_date).format("MMM Do YYYY") : "",
//         actual_delivery_date: item?.actual_delivery_date ? 
//           moment(item.actual_delivery_date).format("MMM Do YYYY") : "",
//         created_at: item?.created_at ? 
//           moment(item.created_at).format("MMM Do YYYY, h:mm a") : "",
//         updated_at: item?.updated_at ? 
//           moment(item.updated_at).format("MMM Do YYYY, h:mm a") : "",
//       }));
      
//       setRows(formatted);
//       setGridLoading(false);
//     }, 800);

//     return () => clearTimeout(processData);
//   }, [orderItems]);
// Process data on component mount
useEffect(() => {
  setGridLoading(true);
  
  // Simulate data processing
  const processData = setTimeout(() => {
    const formatted = (orderItems || []).map((item, index) => {
      // Calculate completion percentage
      const ordered = Number(item?.quantity_ordered ?? 0);
      const received = Number(item?.quantity_received ?? 0);
      const cancelled = Number(item?.quantity_cancelled ?? 0);
      let completion_percentage = 0;
      
      if (ordered > 0) {
        completion_percentage = ((received + cancelled) / ordered) * 100;
      }
      
      return {
        id: item?.order_item_id ?? index + 1,
        ...item,
        quantity_ordered: ordered,
        quantity_received: received,
        quantity_cancelled: cancelled,
        quantity_pending: Math.max(0, ordered - received - cancelled),
        completion_percentage: completion_percentage,
        unit_price: Number(item?.unit_price ?? 0),
        tax_rate: Number(item?.tax_rate ?? 0),
        discount_rate: Number(item?.discount_rate ?? 0),
        line_total: Number(item?.line_total ?? 0),
        expected_delivery_date: item?.expected_delivery_date ? 
          moment(item.expected_delivery_date).format("MMM Do YYYY") : "",
        actual_delivery_date: item?.actual_delivery_date ? 
          moment(item.actual_delivery_date).format("MMM Do YYYY") : "",
        created_at: item?.created_at ? 
          moment(item.created_at).format("MMM Do YYYY, h:mm a") : "",
        updated_at: item?.updated_at ? 
          moment(item.updated_at).format("MMM Do YYYY, h:mm a") : "",
      };
    });
    
    setRows(formatted);
    setGridLoading(false);
  }, 800);

  return () => clearTimeout(processData);
}, [orderItems]);

  // Calculate summary statistics
  const { totalItems, totalValue, pendingReceipt, overdueItems } = useMemo(() => {
    const total = rows.length;
    const value = rows.reduce((sum, row) => sum + (row.line_total || 0), 0);
    const pending = rows.filter(row => 
      row.quantity_ordered > (row.quantity_received + row.quantity_cancelled)
    ).length;
    const overdue = rows.filter(row => 
      row.expected_delivery_date && 
      moment().isAfter(moment(row.expected_delivery_date)) && 
      row.status !== 'received' && 
      row.status !== 'cancelled'
    ).length;
    
    return {
      totalItems: total,
      totalValue: value,
      pendingReceipt: pending,
      overdueItems: overdue,
    };
  }, [rows]);

  // Column definitions
  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'order_id', 
      headerName: 'PO Number', 
      width: 130,
      renderCell: (params) => {
        const order = purchaseOrders?.find(o => o.order_id === params.value);
        return order ? order.po_number : params.value;
      }
    },
    { 
      field: 'item_id', 
      headerName: 'Item', 
      width: 180,
      renderCell: (params) => {
        const item = inventoryItems.find(i => i.item_id === params.value);
        return item ? `${item.name} (${item.item_code})` : params.value;
      }
    },
    { 
      field: 'quantity_ordered', 
      headerName: 'Ordered', 
      width: 90,
      type: 'number',
    },
    { 
      field: 'quantity_received', 
      headerName: 'Received', 
      width: 90,
      type: 'number',
    },
    { 
      field: 'quantity_cancelled', 
      headerName: 'Cancelled', 
      width: 90,
      type: 'number',
    },
    { 
        field: 'quantity_pending', 
        headerName: 'Pending', 
        width: 90,
        type: 'number',
        renderCell: (params) => {
            const pending = params.value || 0;
            let color = 'default';
            
            if (pending > 0) color = 'warning';
            if (pending < 0) color = 'error';
            
            return (
            <Chip 
                label={pending} 
                size="small" 
                color={color}
                variant="outlined"
            />
            );
        }
    },
    { 
      field: 'unit_price', 
      headerName: 'Unit Price', 
      width: 110, 
      type: 'number',
      renderCell: (params) => `$${Number(params.value).toFixed(2)}` 
    },
    { 
        field: 'tax_rate', 
        headerName: 'Tax Rate', 
        width: 100,
        type: 'number',
        renderCell: (params) => `${Number(params.value || 0).toFixed(2)}%` 
    },
    { 
        field: 'discount_rate', 
        headerName: 'Discount Rate', 
        width: 120,
        type: 'number',
        renderCell: (params) => `${Number(params.value || 0).toFixed(2)}%` 
    },
    { 
      field: 'line_total', 
      headerName: 'Line Total', 
      width: 120, 
      type: 'number',
      renderCell: (params) => `$${Number(params.value).toLocaleString()}` 
    },
    { 
      field: 'expected_delivery_date', 
      headerName: 'Expected Delivery', 
      width: 140,
      renderCell: (params) => {
        if (!params.value) return '—';
        
        const isOverdue = moment().isAfter(moment(params.value));
        const isToday = moment().isSame(moment(params.value), 'day');
        
        if (isOverdue) {
          return (
            <Box display="flex" alignItems="center">
              <DateIcon color="error" sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2" color="error">
                {params.value}
              </Typography>
            </Box>
          );
        }
        
        if (isToday) {
          return (
            <Box display="flex" alignItems="center">
              <DateIcon color="warning" sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2" color="warning.main">
                Today
              </Typography>
            </Box>
          );
        }
        
        return params.value;
      }
    },
    { 
      field: 'actual_delivery_date', 
      headerName: 'Actual Delivery', 
      width: 140,
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 160, 
      renderCell: (params) => {
        const status = itemStatuses.find(s => s.value === params.value);
        return (
          <Chip 
            icon={status?.icon} 
            label={status?.label || params.value} 
            size="small" 
            color={status?.color || 'default'}
            variant={params.value === 'received' ? 'filled' : 'outlined'}
          />
        );
      } 
    },
    { 
        field: 'completion_percentage', 
        headerName: 'Completion', 
        width: 120,
        renderCell: (params) => {
            const percentage = params.value || 0;
            let color = 'success';
            
            if (percentage < 50) color = 'error';
            else if (percentage < 100) color = 'warning';
            
            return (
            <Chip 
                label={`${percentage.toFixed(1)}%`} 
                size="small" 
                color={color}
            />
            );
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
  ], [purchaseOrders, inventoryItems, itemStatuses]);

  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    const query = searchText.toLowerCase();
    return rows.filter(row => 
      (purchaseOrders?.find(o => o.order_id === row.order_id)?.po_number || "").toLowerCase().includes(query) ||
      (inventoryItems.find(i => i.item_id === row.item_id)?.name || "").toLowerCase().includes(query) ||
      (inventoryItems.find(i => i.item_id === row.item_id)?.item_code || "").toLowerCase().includes(query) ||
      itemStatuses.find(s => s.value === row.status)?.label.toLowerCase().includes(query)
    );
  }, [rows, searchText, purchaseOrders, inventoryItems, itemStatuses]);

  // Event handlers
  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows?.map(row => ({
        'PO Number': purchaseOrders?.find(o => o.order_id === row.order_id)?.po_number || row.order_id,
        'Item': inventoryItems.find(i => i.item_id === row.item_id)?.name || row.item_id,
        'Item Code': inventoryItems.find(i => i.item_id === row.item_id)?.item_code || '',
        'Quantity Ordered': row.quantity_ordered,
        'Quantity Received': row.quantity_received,
        'Quantity Cancelled': row.quantity_cancelled,
        'Pending': row.quantity_ordered - row.quantity_received - row.quantity_cancelled,
        'Unit Price': row.unit_price,
        'Tax Rate': `${row.tax_rate || 0}%`,
        'Discount Rate': `${row.discount_rate || 0}%`,
        'Line Total': row.line_total,
        'Expected Delivery': row.expected_delivery_date,
        'Actual Delivery': row.actual_delivery_date || '',
        'Status': itemStatuses.find(s => s.value === row.status)?.label || row.status,
        'Completion %': `${((row.quantity_received + row.quantity_cancelled) / row.quantity_ordered * 100).toFixed(1)}%`,
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Order Items');
    XLSX.writeFile(workbook, `purchase_order_items_export_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
    setAlert({ open: true, message: 'Order items data exported successfully', severity: 'success' });
  }, [filteredRows, purchaseOrders, inventoryItems, itemStatuses]);

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
        
        // Basic validation and mapping
        const mappedData = uploadedData.map((item, index) => ({
          id: `uploaded_${Date.now()}_${index}`,
          order_item_id: `uploaded_${Date.now()}_${index}`,
          ...item,
          quantity_ordered: Number(item.quantity_ordered) || 0,
          quantity_received: Number(item.quantity_received) || 0,
          quantity_cancelled: Number(item.quantity_cancelled) || 0,
          unit_price: Number(item.unit_price) || 0,
          tax_rate: Number(item.tax_rate) || 0,
          discount_rate: Number(item.discount_rate) || 0,
          tax_rate: Number(item.tax_rate) || 0,
          discount_rate: Number(item.discount_rate) || 0,
          line_total: Number(item.line_total) || 0,
        }));
        
        setRows(prev => [...mappedData, ...prev]);
        setAlert({ open: true, message: `${mappedData.length} order items imported successfully`, severity: 'success' });
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
    setSelectedItem(null);
    setFormData({ 
      ...emptyForm,
      expected_delivery_date: moment().add(14, 'days').format('YYYY-MM-DD'),
    });
    setFormErrors({});
    setOpenDialog(true);
  }, [emptyForm]);

  const handleEdit = useCallback((row) => {
    setSelectedItem(row);
    setFormData({ 
      ...emptyForm, 
      ...row,
      expected_delivery_date: row.expected_delivery_date ? 
        moment(row.expected_delivery_date, "MMM Do YYYY").format('YYYY-MM-DD') : 
        moment().add(14, 'days').format('YYYY-MM-DD'),
      actual_delivery_date: row.actual_delivery_date ? 
        moment(row.actual_delivery_date, "MMM Do YYYY").format('YYYY-MM-DD') : "",
    });
    setFormErrors({});
    setOpenDialog(true);
  }, [emptyForm]);

  const handleDeleteClick = useCallback((row) => {
    setSelectedItem(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setGridLoading(true);
    setTimeout(() => {
      setRows(prev => prev.filter(r => r.id !== selectedItem.id));
      setOpenDeleteDialog(false);
      setAlert({ open: true, message: 'Order item deleted successfully', severity: 'success' });
      setGridLoading(false);
    }, 300);
  }, [selectedItem]);

  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Auto-calculate line total if quantity or unit price changes
      if ((name === 'quantity_ordered' || name === 'unit_price' || name === 'discount_rate') && 
          updated.quantity_ordered && updated.unit_price) {
        const netUnitPrice = updated.unit_price * (1 - (updated.discount_rate / 100));
        updated.line_total = updated.quantity_ordered * netUnitPrice;
      }
      
      return updated;
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.order_id) errors.order_id = 'Purchase order is required';
    if (!formData.item_id) errors.item_id = 'Item is required';
    if (!formData.quantity_ordered || formData.quantity_ordered <= 0) errors.quantity_ordered = 'Valid quantity is required';
    if (formData.unit_price < 0) errors.unit_price = 'Unit price cannot be negative';
    if (formData.tax_rate < 0) errors.tax_rate = 'Tax rate cannot be negative';
    if (formData.discount_rate < 0) errors.discount_rate = 'Discount rate cannot be negative';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const payload = {
        ...formData,
        id: selectedItem ? selectedItem.id : `item_${Date.now()}`,
        order_item_id: selectedItem ? selectedItem.order_item_id : `item_${Date.now()}`,
        created_at: selectedItem ? selectedItem.created_at : moment().format('MMM Do YYYY, h:mm a'),
        updated_at: moment().format('MMM Do YYYY, h:mm a'),
        expected_delivery_date: formData.expected_delivery_date ? 
          moment(formData.expected_delivery_date).format('MMM Do YYYY') : "",
        actual_delivery_date: formData.actual_delivery_date ? 
          moment(formData.actual_delivery_date).format('MMM Do YYYY') : "",
      };

      if (selectedItem) {
        setRows(prev => prev.map(r => r.id === selectedItem.id ? { ...r, ...payload } : r));
        setAlert({ open: true, message: 'Order item updated successfully', severity: 'success' });
      } else {
        setRows(prev => [payload, ...prev]);
        setAlert({ open: true, message: 'Order item created successfully', severity: 'success' });
      }

      setLoading(false);
      setOpenDialog(false);
      setSelectedItem(null);
    }, 500);
  }, [formData, selectedItem, validateForm]);

  const handleRefresh = useCallback(() => {
    setGridLoading(true);
    setTimeout(() => {
      // In a real app, this would refetch data from the server
      setGridLoading(false);
      setAlert({ open: true, message: 'Data refreshed', severity: 'info' });
    }, 800);
  }, []);

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Purchase Order Items"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'Purchase Orders', href: '/purchase-orders' },
        { label: 'Order Items' }
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
                title="Total Items" 
                value={totalItems} 
                icon={<InventoryIcon />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard 
                title="Total Value" 
                value={`$${totalValue.toLocaleString()}`} 
                icon={<TotalIcon />} 
                color={theme.palette.success.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard 
                title="Pending Receipt" 
                value={pendingReceipt} 
                icon={<ShippingIcon />} 
                color={theme.palette.warning.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard 
                title="Overdue Items" 
                value={overdueItems} 
                icon={<DateIcon />} 
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
                <InventoryIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Purchase Order Items
                </Typography>
                {searchText && (
                  <Chip 
                    label={`${filteredRows.length} of ${rows.length} items`} 
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
                  placeholder="Search order items..."
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
                  New Item
                </Button>
              </Stack>
            </Box>

            {/* <Box sx={{ height: 600 }}> */}
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
            {/* </Box> */}
          </Paper>

          {/* Create/Edit Dialog */}
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
                {selectedItem ? (
                  <>
                    <EditIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Edit Order Item</Typography>
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Create Order Item</Typography>
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.order_id}>
                    <InputLabel>Purchase Order</InputLabel>
                    <Select 
                      name="order_id" 
                      value={formData.order_id} 
                      label="Purchase Order" 
                      onChange={handleInputChange}
                    >
                      {purchaseOrders?.map(order => (
                        <MenuItem key={order.order_id} value={order.order_id}>
                          {order.po_number} - {order.supplier?.legal_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.order_id && (
                      <FormHelperText>{formErrors.order_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.item_id}>
                    <InputLabel>Inventory Item</InputLabel>
                    <Select 
                      name="item_id" 
                      value={formData.item_id} 
                      label="Inventory Item" 
                      onChange={handleInputChange}
                    >
                      {inventoryItems?.map(item => (
                        <MenuItem key={item.item_id} value={item.item_id}>
                          {item.name} ({item.item_code})
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.item_id && (
                      <FormHelperText>{formErrors.item_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    label="Quantity Ordered" 
                    name="quantity_ordered" 
                    type="number" 
                    value={formData.quantity_ordered} 
                    onChange={handleInputChange} 
                    error={!!formErrors.quantity_ordered}
                    helperText={formErrors.quantity_ordered}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    label="Quantity Received" 
                    name="quantity_received" 
                    type="number" 
                    value={formData.quantity_received} 
                    onChange={handleInputChange} 
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    label="Quantity Cancelled" 
                    name="quantity_cancelled" 
                    type="number" 
                    value={formData.quantity_cancelled} 
                    onChange={handleInputChange} 
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    label="Unit Price" 
                    name="unit_price" 
                    type="number" 
                    value={formData.unit_price} 
                    onChange={handleInputChange} 
                    error={!!formErrors.unit_price}
                    helperText={formErrors.unit_price}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <PriceIcon color="action" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.01 } 
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    label="Tax Rate (%)" 
                    name="tax_rate" 
                    type="number" 
                    value={formData.tax_rate} 
                    onChange={handleInputChange} 
                    error={!!formErrors.tax_rate}
                    helperText={formErrors.tax_rate}
                    InputProps={{ 
                      inputProps: { min: 0, max: 100, step: 0.01 } 
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth 
                    label="Discount Rate (%)" 
                    name="discount_rate" 
                    type="number" 
                    value={formData.discount_rate} 
                    onChange={handleInputChange} 
                    error={!!formErrors.discount_rate}
                    helperText={formErrors.discount_rate}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <DiscountIcon color="action" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, max: 100, step: 0.01 } 
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Line Total" 
                    name="line_total" 
                    type="number" 
                    value={formData.line_total} 
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <TotalIcon color="action" />
                        </InputAdornment>
                      ),
                      readOnly: true
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      name="status" 
                      value={formData.status} 
                      label="Status" 
                      onChange={handleInputChange}
                    >
                      {itemStatuses?.map(status => (
                        <MenuItem key={status.value} value={status.value}>
                          <Box display="flex" alignItems="center">
                            {status.icon}
                            <Box ml={1}>{status.label}</Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Expected Delivery Date" 
                    name="expected_delivery_date" 
                    type="date" 
                    value={formData.expected_delivery_date} 
                    onChange={handleInputChange} 
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Actual Delivery Date" 
                    name="actual_delivery_date" 
                    type="date" 
                    value={formData.actual_delivery_date} 
                    onChange={handleInputChange} 
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Notes" 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
              </DialogContent>
              </Dialog>
              </Box>
              </Fade>
              </AuthenticatedLayout>
  );
}
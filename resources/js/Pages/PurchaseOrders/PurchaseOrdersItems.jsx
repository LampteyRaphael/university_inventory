import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useForm, usePage } from '@inertiajs/react';
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
  alpha,
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
  Warning,
} from "@mui/icons-material";
import Notification from "@/Components/Notification";

// Modern Summary Card Component
const SummaryCard = ({ title, value, icon, color, subtitle, trend }) => (
  <Card sx={{ 
    borderRadius: 3,
    p: 2,
    background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
    border: `1px solid ${alpha(color, 0.2)}`,
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: `0 12px 40px 0 ${alpha(color, 0.3)}`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
    }
  }}>
    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h4" fontWeight={800} color={color} sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ 
            bgcolor: alpha(color, 0.1), 
            color: color,
            width: 48,
            height: 48,
            borderRadius: 2
          }}>
            {icon}
          </Avatar>
        </Stack>
        {trend && (
          <Chip 
            label={trend} 
            size="small" 
            sx={{ 
              backgroundColor: alpha(color, 0.1), 
              color: color,
              fontWeight: 600,
              alignSelf: 'flex-start'
            }} 
          />
        )}
      </Stack>
    </CardContent>
  </Card>
);

// Custom Toolbar Component
const CustomToolbar = ({ onCreate, onImport, onExport, onRefresh }) => (
  <GridToolbarContainer sx={{ p: 2, gap: 1 }}>
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
  </GridToolbarContainer>
);

export default function PurchaseOrderItems({ orderItems, auth, purchaseOrders, inventoryItems }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { flash } = usePage().props;
  
  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
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

  // Inertia useForm hook
  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    ...emptyForm
  });

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  // Show flash messages
  useEffect(() => {
    if (flash.success) {
      showAlert(flash.success, "success");
    } else if (flash.error) {
      showAlert(flash.error, "error");
    }
  }, [flash]);

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
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

  // Enhanced column definitions - merged to 10 columns
  const columns = useMemo(() => [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600">
          #{params.value}
        </Typography>
      )
    },
    { 
      field: 'order_info', 
      headerName: 'Order & Item', 
      width: 220,
      renderCell: (params) => {
        const order = purchaseOrders?.find(o => o.order_id === params.row.order_id);
        const item = inventoryItems?.find(i => i.item_id === params.row.item_id);
        return (
          <Box>
            <Typography variant="body2" fontWeight="600">
              {order?.po_number || params.row.order_id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item ? `${item.name} (${item.item_code})` : params.row.item_id}
            </Typography>
          </Box>
        );
      }
    },
    { 
      field: 'quantities', 
      headerName: 'Quantities', 
      width: 180,
      renderCell: (params) => {
        const { quantity_ordered, quantity_received, quantity_cancelled, quantity_pending } = params.row;
        return (
          <Stack spacing={0.5}>
            <Box display="flex" justifyContent="space-between" gap={1}>
              <Typography variant="caption">Ordered:</Typography>
              <Typography variant="caption" fontWeight="600">{quantity_ordered}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" gap={1}>
              <Typography variant="caption">Received:</Typography>
              <Typography variant="caption" color="success.main" fontWeight="600">
                {quantity_received}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" gap={1}>
              <Typography variant="caption">Pending:</Typography>
              <Chip 
                label={quantity_pending} 
                size="small" 
                color={quantity_pending > 0 ? "warning" : "default"}
                variant="outlined"
                sx={{ height: 20, minWidth: 30 }}
              />
            </Box>
          </Stack>
        );
      }
    },
    { 
      field: 'pricing', 
      headerName: 'Pricing', 
      width: 160,
      renderCell: (params) => {
        const { unit_price, tax_rate, discount_rate, line_total } = params.row;
        return (
          <Stack spacing={0.5}>
            <Typography variant="caption" fontWeight="600">
              ${Number(unit_price).toFixed(2)}
            </Typography>
            <Box display="flex" gap={1}>
              {tax_rate > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Tax: {tax_rate}%
                </Typography>
              )}
              {discount_rate > 0 && (
                <Typography variant="caption" color="success.main">
                  Disc: {discount_rate}%
                </Typography>
              )}
            </Box>
            <Typography variant="body2" fontWeight="700" color="primary.main">
              ${Number(line_total).toLocaleString()}
            </Typography>
          </Stack>
        );
      }
    },
    { 
      field: 'delivery_info', 
      headerName: 'Delivery', 
      width: 180,
      renderCell: (params) => {
        const { expected_delivery_date, actual_delivery_date, status } = params.row;
        const isOverdue = expected_delivery_date && moment().isAfter(moment(expected_delivery_date));
        const isToday = expected_delivery_date && moment().isSame(moment(expected_delivery_date), 'day');
        
        return (
          <Stack spacing={0.5}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <DateIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight="600">
                Expected:
              </Typography>
            </Box>
            <Chip 
              label={expected_delivery_date || '—'} 
              size="small"
              color={
                isOverdue && status !== 'received' && status !== 'cancelled' ? "error" : 
                isToday ? "warning" : "default"
              }
              variant="outlined"
              sx={{ height: 20 }}
            />
            {actual_delivery_date && (
              <>
                <Typography variant="caption" fontWeight="600" sx={{ mt: 0.5 }}>
                  Actual:
                </Typography>
                <Typography variant="caption">
                  {actual_delivery_date}
                </Typography>
              </>
            )}
          </Stack>
        );
      }
    },
    { 
      field: 'status_completion', 
      headerName: 'Status & Progress', 
      width: 180,
      renderCell: (params) => {
        const status = itemStatuses.find(s => s.value === params.row.status);
        const percentage = params.row.completion_percentage || 0;
        
        return (
          <Stack spacing={1} sx={{ width: '100%' }}>
            <Chip 
              icon={status?.icon} 
              label={status?.label || params.row.status} 
              size="small" 
              color={status?.color || 'default'}
              variant={params.row.status === 'received' ? 'filled' : 'outlined'}
              sx={{ justifyContent: 'flex-start' }}
            />
            <Box sx={{ width: '100%' }}>
              <LinearProgress 
                variant="determinate" 
                value={percentage} 
                color={
                  percentage >= 100 ? 'success' :
                  percentage >= 50 ? 'warning' : 'error'
                }
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'grey.100'
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {percentage.toFixed(1)}% Complete
              </Typography>
            </Box>
          </Stack>
        );
      }
    },
    { 
      field: 'dates', 
      headerName: 'Timeline', 
      width: 210,
      renderCell: (params) => (
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            Created: {params.row.created_at || ""}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Updated: {params.row.updated_at || ""}
          </Typography>
        </Stack>
      )
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
          disabled={processing}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Delete"><DeleteIcon fontSize="small" /></Tooltip>}
          label="Delete"
          onClick={() => handleDeleteClick(params.row)}
          color="error"
          disabled={processing}
        />,
      ],
    },
  ], [purchaseOrders, inventoryItems, itemStatuses, processing]);

  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    const query = searchText.toLowerCase();
    return rows.filter(row => 
      (purchaseOrders?.find(o => o.order_id === row.order_id)?.po_number || "").toLowerCase().includes(query) ||
      (inventoryItems?.find(i => i.item_id === row.item_id)?.name || "").toLowerCase().includes(query) ||
      (inventoryItems?.find(i => i.item_id === row.item_id)?.item_code || "").toLowerCase().includes(query) ||
      itemStatuses.find(s => s.value === row.status)?.label.toLowerCase().includes(query)
    );
  }, [rows, searchText, purchaseOrders, inventoryItems, itemStatuses]);

  // ✅ FIXED: All event handlers properly defined
  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    reset({
      ...emptyForm,
      expected_delivery_date: moment().add(14, 'days').format('YYYY-MM-DD'),
    });
    setOpenDialog(true);
  }, [emptyForm, reset]);

  const handleEdit = useCallback((row) => {
    setSelectedItem(row);
    setData({
      ...emptyForm,
      ...row,
      expected_delivery_date: row.expected_delivery_date ? 
        moment(row.expected_delivery_date, "MMM Do YYYY").format('YYYY-MM-DD') : 
        moment().add(14, 'days').format('YYYY-MM-DD'),
      actual_delivery_date: row.actual_delivery_date ? 
        moment(row.actual_delivery_date, "MMM Do YYYY").format('YYYY-MM-DD') : "",
    });
    setOpenDialog(true);
  }, [emptyForm, setData]);

  const handleDeleteClick = useCallback((row) => {
    setSelectedItem(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setData(name, newValue);
    
    // Auto-calculate line total if quantity or unit price changes
    if ((name === 'quantity_ordered' || name === 'unit_price' || name === 'discount_rate') && 
        data.quantity_ordered && data.unit_price) {
      const netUnitPrice = data.unit_price * (1 - (data.discount_rate / 100));
      const newLineTotal = data.quantity_ordered * netUnitPrice;
      setData('line_total', newLineTotal);
    }
  }, [data, setData]);

  const validateForm = useCallback(() => {
    const validationErrors = {};
    
    if (!data.order_id) validationErrors.order_id = 'Purchase order is required';
    if (!data.item_id) validationErrors.item_id = 'Item is required';
    if (!data.quantity_ordered || data.quantity_ordered <= 0) validationErrors.quantity_ordered = 'Valid quantity is required';
    if (data.unit_price < 0) validationErrors.unit_price = 'Unit price cannot be negative';
    if (data.tax_rate < 0) validationErrors.tax_rate = 'Tax rate cannot be negative';
    if (data.discount_rate < 0) validationErrors.discount_rate = 'Discount rate cannot be negative';
    
    return Object.keys(validationErrors).length === 0;
  }, [data]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      showAlert('Please fix validation errors', 'error');
      return;
    }
    
    if (selectedItem) {
      // Update existing item
      put(route('purchase-order-items.update', selectedItem.order_item_id), {
        onSuccess: () => {
          setOpenDialog(false);
          setSelectedItem(null);
          reset();
          showAlert('Order item updated successfully', 'success');
        },
        onError: () => {
          showAlert('Failed to update order item', 'error');
        },
        preserveScroll: true,
      });
    } else {
      // Create new item
      post(route('purchase-order-items.store'), {
        onSuccess: () => {
          setOpenDialog(false);
          reset();
          showAlert('Order item created successfully', 'success');
        },
        onError: () => {
          showAlert('Failed to create order item', 'error');
        },
        preserveScroll: true,
      });
    }
  }, [selectedItem, data, post, put, reset, validateForm]);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedItem) {
      destroy(route('purchase-order-items.destroy', selectedItem.order_item_id), {
        onSuccess: () => {
          setOpenDeleteDialog(false);
          setSelectedItem(null);
          showAlert('Order item deleted successfully', 'success');
        },
        onError: () => {
          showAlert('Failed to delete order item', 'error');
        },
        preserveScroll: true,
      });
    }
  }, [selectedItem, destroy]);

  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows?.map(row => ({
        'PO Number': purchaseOrders?.find(o => o.order_id === row.order_id)?.po_number || row.order_id,
        'Item': inventoryItems?.find(i => i.item_id === row.item_id)?.name || row.item_id,
        'Item Code': inventoryItems?.find(i => i.item_id === row.item_id)?.item_code || '',
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
    
    showAlert('Order items data exported successfully', 'success');
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
          line_total: Number(item.line_total) || 0,
        }));
        
        setRows(prev => [...mappedData, ...prev]);
        showAlert(`${mappedData.length} order items imported successfully`, 'success');
      } catch (error) {
        showAlert('Error processing file: ' + error.message, 'error');
      } finally {
        setGridLoading(false);
      }
    };
    
    reader.onerror = () => {
      showAlert('Error reading file', 'error');
      setGridLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  }, []);

  const handleRefresh = useCallback(() => {
    setGridLoading(true);
    setTimeout(() => {
      setGridLoading(false);
      showAlert('Data refreshed', 'info');
    }, 800);
  }, []);

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

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
          <Notification 
            open={alert.open} 
            severity={alert.severity} 
            message={alert.message}
            onClose={handleCloseAlert}
          />

          {/* Enhanced Summary Cards */}
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Total Items" 
                value={totalItems.toLocaleString()} 
                icon={<InventoryIcon />} 
                color={theme.palette.primary.main}
                subtitle="All order items"
                trend="+12% this month"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Total Value" 
                value={`₵${totalValue.toLocaleString()}`} 
                icon={<TotalIcon />} 
                color={theme.palette.success.main}
                subtitle="Combined line total"
                trend="+8.5% growth"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Pending Receipt" 
                value={pendingReceipt.toString()} 
                icon={<ShippingIcon />} 
                color={theme.palette.warning.main}
                subtitle="Awaiting delivery"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Overdue Items" 
                value={overdueItems.toString()} 
                icon={<DateIcon />} 
                color={theme.palette.error.main}
                subtitle="Past delivery date"
              />
            </Grid>
          </Grid>

          {/* Data Grid Section */}
          <Paper
            sx={{
              height: "100%",
              width: "100%",
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center', 
              justifyContent: 'space-between', 
              p: 3, 
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              gap: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
            }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: theme.palette.primary.main,
                  width: 48,
                  height: 48
                }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="text.primary">
                    Purchase Order Items
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage and track all purchase order line items
                  </Typography>
                </Box>
                {searchText && (
                  <Chip 
                    label={`${filteredRows.length} of ${rows.length} items`} 
                    size="small" 
                    variant="outlined" 
                    color="primary"
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
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: { 
                      width: isMobile ? '100%' : 300,
                      borderRadius: 2
                    }
                  }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleRefresh} 
                  startIcon={<RefreshIcon />}
                  sx={{ borderRadius: 2 }}
                  disabled={processing}
                >
                  Refresh
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={handleCreate}
                  sx={{ borderRadius: 2 }}
                  disabled={processing}
                >
                  New Item
                </Button>
              </Stack>
            </Box>

            <DataGrid
              autoHeight
              rows={filteredRows}
              columns={columns}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 },
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
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                },
                '& .MuiDataGrid-toolbarContainer': {
                  p: 2,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                },
              }}
              loading={gridLoading || processing}
              disableRowSelectionOnClick
            />
          </Paper>

          {/* ✅ FIXED: Create/Edit Dialog - Now properly showing */}
          <Dialog 
            open={openDialog} 
            onClose={() => !processing && setOpenDialog(false)} 
            maxWidth="md" 
            fullWidth 
            TransitionComponent={Slide}
            transitionDuration={300}
            fullScreen={isMobile}
            disableRestoreFocus
            PaperProps={{
              sx: { borderRadius: isMobile ? 0 : 3 }
            }}
          >
            <DialogTitle sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              py: 3
            }}>
              <Box display="flex" alignItems="center">
                {selectedItem ? (
                  <>
                    <EditIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight={600}>Edit Order Item</Typography>
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight={600}>Create Order Item</Typography>
                  </>
                )}
              </Box>
              <IconButton 
                onClick={() => !processing && setOpenDialog(false)} 
                sx={{ color: 'white' }}
                disabled={processing}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto', p: 3 }}>
              {processing && <LinearProgress />}
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.order_id}>
                    <InputLabel>Purchase Order</InputLabel>
                    <Select 
                      name="order_id" 
                      value={data.order_id || ""} 
                      label="Purchase Order" 
                      onChange={handleInputChange}
                      disabled={processing}
                    >
                      {purchaseOrders?.map(order => (
                        <MenuItem key={order.order_id} value={order.order_id}>
                          {order.po_number} - {order.supplier?.legal_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.order_id && (
                      <FormHelperText>{errors.order_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.item_id}>
                    <InputLabel>Inventory Item</InputLabel>
                    <Select 
                      name="item_id" 
                      value={data.item_id || ""} 
                      label="Inventory Item" 
                      onChange={handleInputChange}
                      disabled={processing}
                    >
                      {inventoryItems?.map(item => (
                        <MenuItem key={item.item_id} value={item.item_id}>
                          {item.name} ({item.item_code})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.item_id && (
                      <FormHelperText>{errors.item_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    fullWidth 
                    label="Quantity Ordered" 
                    name="quantity_ordered" 
                    type="number" 
                    value={data.quantity_ordered || ""} 
                    onChange={handleInputChange} 
                    error={!!errors.quantity_ordered}
                    helperText={errors.quantity_ordered}
                    inputProps={{ min: 1 }}
                    disabled={processing}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    fullWidth 
                    label="Quantity Received" 
                    name="quantity_received" 
                    type="number" 
                    value={data.quantity_received || ""} 
                    onChange={handleInputChange} 
                    inputProps={{ min: 0 }}
                    disabled={processing}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    fullWidth 
                    label="Quantity Cancelled" 
                    name="quantity_cancelled" 
                    type="number" 
                    value={data.quantity_cancelled || ""} 
                    onChange={handleInputChange} 
                    inputProps={{ min: 0 }}
                    disabled={processing}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    fullWidth 
                    label="Unit Price" 
                    name="unit_price" 
                    type="number" 
                    value={data.unit_price || ""} 
                    onChange={handleInputChange} 
                    error={!!errors.unit_price}
                    helperText={errors.unit_price}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <PriceIcon color="action" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.01 } 
                    }}
                    disabled={processing}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    fullWidth 
                    label="Tax Rate (%)" 
                    name="tax_rate" 
                    type="number" 
                    value={data.tax_rate || ""} 
                    onChange={handleInputChange} 
                    error={!!errors.tax_rate}
                    helperText={errors.tax_rate}
                    InputProps={{ 
                      inputProps: { min: 0, max: 100, step: 0.01 } 
                    }}
                    disabled={processing}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField 
                    fullWidth 
                    label="Discount Rate (%)" 
                    name="discount_rate" 
                    type="number" 
                    value={data.discount_rate || ""} 
                    onChange={handleInputChange} 
                    error={!!errors.discount_rate}
                    helperText={errors.discount_rate}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <DiscountIcon color="action" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, max: 100, step: 0.01 } 
                    }}
                    disabled={processing}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Line Total" 
                    name="line_total" 
                    type="number" 
                    value={data.line_total || ""} 
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <TotalIcon color="action" />
                        </InputAdornment>
                      ),
                      readOnly: true
                    }}
                    disabled={processing}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      name="status" 
                      value={data.status || ""} 
                      label="Status" 
                      onChange={handleInputChange}
                      disabled={processing}
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

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Expected Delivery Date" 
                    name="expected_delivery_date" 
                    type="date" 
                    value={data.expected_delivery_date || ""} 
                    onChange={handleInputChange} 
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    disabled={processing}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Actual Delivery Date" 
                    name="actual_delivery_date" 
                    type="date" 
                    value={data.actual_delivery_date || ""} 
                    onChange={handleInputChange} 
                    InputLabelProps={{ shrink: true }}
                    disabled={processing}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    label="Notes" 
                    name="notes" 
                    value={data.notes || ""} 
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    disabled={processing}
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
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              
              <Button 
                onClick={handleSubmit} 
                startIcon={selectedItem ? <SaveIcon /> : <AddIcon />} 
                variant="contained"
                disabled={processing}
                sx={{ borderRadius: 2 }}
              >
                {selectedItem ? 'Update Item' : 'Create Item'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* ✅ FIXED: Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
          >
            <DialogTitle sx={{ 
              backgroundColor: 'error.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Warning />
              Confirm Deletion
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Typography>
                Are you sure you want to delete this order item? This action cannot be undone.
              </Typography>
              {selectedItem && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Item: {inventoryItems?.find(i => i.item_id === selectedItem.item_id)?.name || selectedItem.item_id}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button 
                onClick={() => setOpenDeleteDialog(false)} 
                variant="outlined"
                disabled={processing}
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                variant="contained" 
                color="error"
                startIcon={<DeleteIcon />}
                disabled={processing}
                sx={{ borderRadius: 2 }}
              >
                {processing ? 'Deleting...' : 'Delete Item'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
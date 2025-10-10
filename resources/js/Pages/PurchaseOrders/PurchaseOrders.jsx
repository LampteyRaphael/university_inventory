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
  alpha,
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
  Receipt as PurchaseOrderIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Business as UniversityIcon,
  Store as SupplierIcon,
  Apartment as DepartmentIcon,
  AttachMoney as AmountIcon,
  CalendarToday as DateIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  LocalShipping as OrderedIcon,
  Inventory as ReceivedIcon,
  Cancel as CancelledIcon,
  Lock as ClosedIcon,
  TrendingUp as TrendIcon,
  Warning as OverdueIcon,
  Person as PersonIcon,
  Description as NotesIcon,
  Gavel as TermsIcon,
  Speed as PerformanceIcon,
  Payment as PaymentIcon,
  Schedule as TimelineIcon,
  Warning,
  AddCircleOutline,
  CloudUpload,
  Download,
} from "@mui/icons-material";
import { useForm, usePage } from '@inertiajs/react';
import Notification from "@/Components/Notification";
import PageHeader from "@/Components/PageHeader";
import SummaryCard from "@/Components/SummaryCard";
import EnhancedDataGrid from "@/Components/EnhancedDataGrid";

// Custom Card Component with modern design
// const SummaryCard = ({ title, value, icon, color, subtitle, trend }) => (
//   <Card sx={{ 
//     borderRadius: 3,
//     p: 2,
//     background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
//     border: `1px solid ${alpha(color, 0.2)}`,
//     boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
//     transition: 'all 0.3s ease-in-out',
//     position: 'relative',
//     overflow: 'hidden',
//     '&:hover': {
//       transform: 'translateY(-8px)',
//       boxShadow: `0 12px 40px 0 ${alpha(color, 0.3)}`,
//     },
//     '&::before': {
//       content: '""',
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       height: 4,
//       background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
//     }
//   }}>
//     <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
//       <Stack spacing={1.5}>
//         <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
//           <Box>
//             <Typography variant="h4" fontWeight={800} color={color} sx={{ fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
//               {value}
//             </Typography>
//             <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mt: 0.5 }}>
//               {title}
//             </Typography>
//             {subtitle && (
//               <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
//                 {subtitle}
//               </Typography>
//             )}
//           </Box>
//           <Avatar sx={{ 
//             bgcolor: alpha(color, 0.1), 
//             color: color,
//             width: 48,
//             height: 48,
//             borderRadius: 2
//           }}>
//             {icon}
//           </Avatar>
//         </Stack>
//         {trend && (
//           <Chip 
//             label={trend} 
//             size="small" 
//             sx={{ 
//               backgroundColor: alpha(color, 0.1), 
//               color: color,
//               fontWeight: 600,
//               alignSelf: 'flex-start'
//             }} 
//           />
//         )}
//       </Stack>
//     </CardContent>
//   </Card>
// );

// Custom Toolbar Component
// const CustomToolbar = () => (
//   <GridToolbarContainer sx={{ p: 2, gap: 1 }}>
//     <GridToolbarColumnsButton />
//     <GridToolbarFilterButton />
//     <GridToolbarExport />
//   </GridToolbarContainer>
// );

export default function PurchaseOrders({ purchaseOrders, auth, universities, suppliers, departments, users }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { flash } = usePage().props;
  
  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const fileInputRef = useRef(null);

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  // Order types and statuses
  const orderTypes = [
    { value: 'regular', label: 'Regular', color: 'primary' },
    { value: 'emergency', label: 'Emergency', color: 'error' },
    { value: 'capital', label: 'Capital', color: 'info' },
    { value: 'consumable', label: 'Consumable', color: 'success' },
    { value: 'service', label: 'Service', color: 'warning' },
  ];

  const orderStatuses = [
    { value: 'draft', label: 'Draft', color: 'default', icon: <PendingIcon /> },
    { value: 'submitted', label: 'Submitted', color: 'info', icon: <PendingIcon /> },
    { value: 'approved', label: 'Approved', color: 'primary', icon: <ApprovedIcon /> },
    { value: 'ordered', label: 'Ordered', color: 'warning', icon: <OrderedIcon /> },
    { value: 'partially_received', label: 'Partially Received', color: 'warning', icon: <ReceivedIcon /> },
    { value: 'received', label: 'Received', color: 'success', icon: <ReceivedIcon /> },
    { value: 'cancelled', label: 'Cancelled', color: 'error', icon: <CancelledIcon /> },
    { value: 'closed', label: 'Closed', color: 'default', icon: <ClosedIcon /> },
  ];

  const paymentStatuses = [
    { value: 'pending', label: 'Pending', color: 'default' },
    { value: 'partial', label: 'Partial', color: 'warning' },
    { value: 'paid', label: 'Paid', color: 'success' },
    { value: 'overdue', label: 'Overdue', color: 'error' },
  ];

  const currencies = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'JPY', label: 'JPY' },
    { value: 'CAD', label: 'CAD' },
    { value: 'AUD', label: 'AUD' },
    { value: 'GHS', label: 'GHS (₵)' }, // 🇬🇭 Ghanaian Cedi
  ];

  // Form structure
  const emptyForm = {
    order_id: "",
    university_id: "",
    supplier_id: "",
    department_id: "",
    po_number: `PO-${moment().format('YYYYMMDD')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    order_type: "regular",
    order_date: moment().format('YYYY-MM-DD'),
    expected_delivery_date: moment().add(14, 'days').format('YYYY-MM-DD'),
    actual_delivery_date: "",
    subtotal_amount: 0,
    tax_amount: 0,
    shipping_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    currency: "USD",
    exchange_rate: 1,
    status: "draft",
    payment_status: "pending",
    notes: "",
    terms_and_conditions: "",
    requested_by: auth.user?.user_id || "",
    approved_by: "",
    approved_at: "",
    received_by: "",
  };

  // Inertia useForm hook :cite[2]
  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    ...emptyForm
  });

  // Show flash messages
  useEffect(() => {
    if (flash.success) {
      setAlert({ open: true, message: flash.success, severity: "success" });
    } else if (flash.error) {
      setAlert({ open: true, message: flash.error, severity: "error" });
    }
  }, [flash]);

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    const processData = setTimeout(() => {
      const formatted = purchaseOrders?.map((order, index) => ({
        id: order?.order_id ?? index + 1,
        ...order,
        subtotal_amount: Number(order?.subtotal_amount ?? 0),
        tax_amount: Number(order?.tax_amount ?? 0),
        shipping_amount: Number(order?.shipping_amount ?? 0),
        discount_amount: Number(order?.discount_amount ?? 0),
        total_amount: Number(order?.total_amount ?? 0),
        exchange_rate: Number(order?.exchange_rate ?? 1),
        supplier_name: order.supplier_name??"",
        supplier_id: order.supplier_id,
        department_id: order.department_id,
        order_date: order?.order_date ??"",
        university_id: order.university_id,
        order_date_display: order?.order_date ?
          moment(order.order_date).format("MMM Do YYYY") : "",

        expected_delivery_date: order?.expected_delivery_date??"",
        expected_delivery_date_display: order?.expected_delivery_date?
          moment(order.expected_delivery_date).format("MMM Do YYYY") : "",
        actual_delivery_date: order?.actual_delivery_date ?? "", 
          // moment(order.actual_delivery_date).format("MMM Do YYYY") : "",
        approved_at: order?.approved_at ? 
          moment(order.approved_at).format("MMM Do YYYY, h:mm a") : "",
        created_at: order?.created_at ? 
          moment(order.created_at).format("MMM Do YYYY, h:mm a") : "",
        updated_at: order?.updated_at ? 
          moment(order.updated_at).format("MMM Do YYYY, h:mm a") : "",
      }));
      
      setRows(formatted);
      setGridLoading(false);
    }, 800);

    return () => clearTimeout(processData);
  }, [purchaseOrders]);

  // Calculate comprehensive summary statistics
  const { 
    totalOrders, 
    totalValue, 
    overdueOrders, 
    pendingApproval, 
    averageOrderValue,
    completedOrders,
    cancelledOrders 
  } = useMemo(() => {
    const total = rows?.length || 0;
    const value = rows?.reduce((sum, row) => sum + (row.total_amount || 0), 0);
    const overdue = rows?.filter(row => 
      moment().isAfter(moment(row?.expected_delivery_date)) && 
      !['received', 'cancelled', 'closed'].includes(row.status)
    ).length;
    const pending = rows?.filter(row => 
      ['draft', 'submitted'].includes(row.status)
    ).length;
    const completed = rows?.filter(row => 
      ['received', 'closed'].includes(row.status)
    ).length;
    const cancelled = rows?.filter(row => row.status === 'cancelled').length;
    const average = total > 0 ? value / total : 0;
    
    return {
      totalOrders: total,
      totalValue: value,
      overdueOrders: overdue,
      pendingApproval: pending,
      averageOrderValue: average,
      completedOrders: completed,
      cancelledOrders: cancelled
    };
  }, [rows]);

  // Optimized column definitions - Limited to 10 key columns
  const columns = useMemo(() => [
    { 
      field: 'po_number', 
      headerName: 'PO NUMBER', 
      width: 180,
    },
    { 
      field: 'order_type', 
      headerName: 'TYPE', 
      width: 120,
      renderCell: (params) => {
        const type = orderTypes.find(t => t.value === params.value);
        return (
          <Chip 
            label={type?.label || params.value} 
            size="small" 
            color={type?.color || 'default'}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        );
      }
    },
    { 
      field: 'supplier_id', 
      headerName: 'SUPPLIER', 
      width: 200,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.supplier_name || ""}>
            <Typography variant="body2" noWrap>
              {params.row.supplier_name || ""}
            </Typography>
          </Tooltip>
        );
      }
    },
    { 
      field: 'department_id', 
      headerName: 'DEPARTMENT', 
      width: 200,
      renderCell: (params) => {
        return params.row.department_name || "N/A"
      }
    },
    { 
      field: 'order_date_display', 
      headerName: 'ORDER DATE', 
      width: 120,
    },
    { 
      field: 'expected_delivery_date', 
      headerName: 'EXPECTED DELIVERY', 
      width: 150,
      renderCell: (params) => {
        const dateString = params.value;

        // Try to reformat invalid formats like "Oct 19th 2025"
        const cleanedDate = moment(dateString, "MMM Do YYYY").format("YYYY-MM-DD");


        const isOverdue = moment().isAfter(moment(params.value));
        const isToday = moment().isSame(moment(params.value), 'day');
        
        if (isOverdue) {
          return (
            <Box display="flex" alignItems="center">
              <OverdueIcon color="error" sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2" color="error" fontWeight={600}>
                Overdue
              </Typography>
            </Box>
          );
        }
        
        if (isToday) {
          return (
            <Box display="flex" alignItems="center">
              <DateIcon color="warning" sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2" color="warning.main" fontWeight={600}>
                Today
              </Typography>
            </Box>
          );
        }
        
        return params.row.expected_delivery_date_display;
      }
    },
    { 
      field: 'total_amount', 
      headerName: 'TOTAL AMOUNT', 
      width: 140, 
      type: 'number',
      renderCell: (params) => {
        const row = params.row;
        return (
          <Typography variant="body2" fontWeight={600}>
            {row.currency} {Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        );
      }
    },
    { 
      field: 'status', 
      headerName: 'STATUS', 
      width: 160, 
      renderCell: (params) => {
        const status = orderStatuses.find(s => s.value === params.value);
        return (
          <Chip 
            icon={status?.icon} 
            label={status?.label || params.value} 
            size="small" 
            color={status?.color || 'default'}
            variant={['approved', 'received', 'closed'].includes(params.value) ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, minWidth: 120 }}
          />
        );
      } 
    },
    { 
      field: 'payment_status', 
      headerName: 'PAYMENT', 
      width: 120,
      renderCell: (params) => {
        const status = paymentStatuses?.find(s => s.value === params.value);
        return (
          <Chip 
            label={status?.label || params.value} 
            size="small" 
            color={status?.color || 'default'}
            variant={params.value === 'paid' ? 'filled' : 'outlined'}
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
  ], [suppliers, departments, orderTypes, orderStatuses, paymentStatuses]);

  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    const query = searchText.toLowerCase();
    return rows.filter(row => 
      row.po_number?.toLowerCase().includes(query) ||
      (suppliers?.find(s => s.supplier_id === row.supplier_id)?.legal_name || "").toLowerCase().includes(query) ||
      (departments?.find(d => d.department_id === row.department_id)?.name || "").toLowerCase().includes(query) ||
      orderStatuses.find(s => s.value === row.status)?.label.toLowerCase().includes(query) ||
      row.total_amount?.toString().includes(query)
    );
  }, [rows, searchText, suppliers, departments, orderStatuses]);

  // Event handlers
  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows?.map(row => ({
        'PO Number': row.po_number,
        'Type': orderTypes.find(t => t.value === row.order_type)?.label || row.order_type,
        'Supplier': suppliers?.find(s => s.supplier_id === row.supplier_id)?.legal_name || row.supplier_id,
        'Department': departments?.find(d => d.department_id === row.department_id)?.name || row.department_id,
        'Order Date': row.order_date,
        'Expected Delivery': row.expected_delivery_date,
        'Total Amount': `${row.currency} ${row.total_amount}`,
        'Status': orderStatuses.find(s => s.value === row.status)?.label || row.status,
        'Payment Status': paymentStatuses.find(s => s.value === row.payment_status)?.label || row.payment_status,
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Orders');
    XLSX.writeFile(workbook, `purchase_orders_export_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
    setAlert({ open: true, message: 'Purchase order data exported successfully', severity: 'success' });
  }, [filteredRows, suppliers, departments, orderTypes, orderStatuses, paymentStatuses]);

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
          order_id: `uploaded_${Date.now()}_${index}`,
          ...item,
          subtotal_amount: Number(item.subtotal_amount) || 0,
          tax_amount: Number(item.tax_amount) || 0,
          shipping_amount: Number(item.shipping_amount) || 0,
          discount_amount: Number(item.discount_amount) || 0,
          total_amount: Number(item.total_amount) || 0,
          exchange_rate: Number(item.exchange_rate) || 1,
          order_date: moment().format("MMM Do YYYY"),
        }));
        
        setRows(prev => [...mappedData, ...prev]);
        setAlert({ open: true, message: `${mappedData.length} purchase orders imported successfully`, severity: 'success' });
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
    setSelectedOrder(null);
    reset({
      ...emptyForm,
      university_id: auth.user?.university_id || "",
      requested_by: auth.user?.id || "",
    });
    setOpenDialog(true);
  }, [auth, emptyForm, reset]);

  const handleEdit = useCallback((row) => {
  // console.log('Editing row:', row);
  setData(row);
  setSelectedOrder(row)
  // Create form data by prioritizing row data over emptyForm defaults
  reset(data);
  setOpenDialog(true);
}, [auth, reset]);

  const handleDeleteClick = useCallback((row) => {
    setSelectedOrder(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setData(name, newValue);
  }, [setData]);

  const handleSubmit = useCallback(() => {    
    if (selectedOrder) {
      // Update existing order :cite[2]
      put(route('purchase-orders.update', selectedOrder.order_id), {
        onSuccess: () => {
          setOpenDialog(false);
          setSelectedOrder(null);
          reset();
        },
        preserveScroll: true,
      });
    } else {
      // Create new order :cite[2]
      post(route('purchase-orders.store'), {
        onSuccess: () => {
          setOpenDialog(false);
          reset();
        },
        preserveScroll: true,
      });
    }
  }, [selectedOrder, data, post, put, reset]);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedOrder) {
      destroy(route('purchase-orders.destroy', selectedOrder.order_id), {
        onSuccess: () => {
          setOpenDeleteDialog(false);
          setSelectedOrder(null);
        },
        preserveScroll: true,
      });
    }
  }, [selectedOrder, destroy]);

  const handleRefresh = useCallback(() => {
    setGridLoading(true);
    setTimeout(() => {
      setGridLoading(false);
      setAlert({ open: true, message: 'Data refreshed', severity: 'info' });
    }, 800);
  }, []);

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

  // Create action buttons for header
    const actionButtons = [
      <Button
        key="new-department"
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
        New Purchase Order
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
      title="Purchase Orders"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'Purchase Orders' }
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
        <PageHeader
          title="Purchase Order"
          subtitle="Manage Purchase Order"
          icon={<PurchaseOrderIcon sx={{ fontSize: 28 }} />}
          actionButtons={actionButtons}
          searchText={searchText}
          onSearchClear={() => setSearchText('')}
          filteredCount={filteredRows?.length||0}
          totalCount={rows?.length || 0}
        />
          {/* Enhanced Summary Cards with Modern Design */}
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <SummaryCard 
                title="Total Orders" 
                value={totalOrders} 
                icon={<PurchaseOrderIcon />} 
                color={theme.palette.primary.main}
                subtitle="All purchase orders"
                trend="+12% this month"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <SummaryCard 
                title="Total Value" 
                value={`₵${totalValue?.toLocaleString()??0}`} 
                icon={<AmountIcon />} 
                color={theme.palette.success.main}
                subtitle="Combined amount"
                trend="+8.5% growth"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryCard 
                title="Overdue" 
                value={overdueOrders || 0} 
                icon={<OverdueIcon />} 
                color={theme.palette.error.main}
                subtitle="Need attention"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryCard 
                title="Pending Approval" 
                value={pendingApproval || 0} 
                icon={<PendingIcon />} 
                color={theme.palette.warning.main}
                subtitle="Awaiting review"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryCard 
                title="Avg. Order" 
                value={`₵${averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
                icon={<PerformanceIcon />} 
                color={theme.palette.info.main}
                subtitle="Average value"
              />
            </Grid>
          </Grid>

          <EnhancedDataGrid
            rows={filteredRows}
            columns={columns}
            loading={gridLoading}
            searchText={searchText}
            onSearchChange={setSearchText}
            onSearchClear={() => setSearchText('')}
            onAdd={handleCreate}
            onExport={handleExport}
            onImport={handleUpload}
            onRefresh={handleRefresh}
            title="Purchase Order"
            subtitle="History"
            icon={<PurchaseOrderIcon />}
            addButtonText="New"
            pageSizeOptions={[5, 10, 20, 50, 100]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
              sorting: { sortModel: [{ field: 'lft', sort: 'asc' }] }
            }}
          />

          {/* Create/Edit Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)} 
            maxWidth="md" 
            fullWidth 
            TransitionComponent={Slide}
            transitionDuration={300}
            fullScreen={isMobile}
            PaperProps={{
              sx: { borderRadius: isMobile ? 0 : 3 }
            }}
            disableRestoreFocus
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
                {selectedOrder ? (
                  <>
                    <EditIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight={600}>Edit Purchase Order</Typography>
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" fontWeight={600}>Create Purchase Order</Typography>
                  </>
                )}
              </Box>
              <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto', p: 3 }}>
              {processing && <LinearProgress />}
              
              <Grid container spacing={3} sx={{ mt: 1 }}>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth error={!!errors.university_id}>
                    <InputLabel>University</InputLabel>
                    <Select 
                      value={data.university_id ||""} 
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
                    label="PO Number" 
                    name="po_number" 
                    value={data.po_number || ""} 
                    onChange={handleInputChange}
                    error={!!errors.po_number}
                    helperText={errors.po_number}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PurchaseOrderIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.order_type}>
                    <InputLabel>Order Type</InputLabel>
                    <Select 
                      name="order_type" 
                      value={data.order_type || ""} 
                      label="Order Type" 
                      onChange={handleInputChange}
                    >
                      {orderTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.order_type && (
                      <FormHelperText>{errors.order_type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.supplier_id}>
                    <InputLabel>Supplier</InputLabel>
                    <Select 
                      name="supplier_id" 
                      value={data.supplier_id || ""} 
                      label="Supplier" 
                      onChange={handleInputChange}
                    >
                      {suppliers?.map(supplier => (
                        <MenuItem key={supplier.supplier_id} value={supplier.supplier_id}>
                          {supplier.legal_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.supplier_id && (
                      <FormHelperText>{errors.supplier_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.department_id}>
                    <InputLabel>Department</InputLabel>
                    <Select 
                      name="department_id" 
                      value={data.department_id ||""} 
                      label="Department" 
                      onChange={handleInputChange}
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

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Order Date" 
                    name="order_date" 
                    type="date" 
                    value={ moment(data.order_date).format('YYYY-MM-DD') || ""} 
                    onChange={handleInputChange} 
                    error={!!errors.order_date}
                    helperText={errors.order_date}
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

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Expected Delivery Date" 
                    name="expected_delivery_date" 
                    type="date" 
                    value={ moment(data.expected_delivery_date).format('YYYY-MM-DD') || ""} 
                    onChange={handleInputChange} 
                    error={!!errors.expected_delivery_date}
                    helperText={errors.expected_delivery_date}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField 
                    fullWidth 
                    label="Total Amount" 
                    name="total_amount" 
                    type="number" 
                    value={data.total_amount || ""} 
                    onChange={handleInputChange} 
                    error={!!errors.total_amount}
                    helperText={errors.total_amount}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                            <span style={{ fontWeight: 'bold', color: '#000' }}>₵</span>
                          {/* <AmountIcon color="action" /> */}
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.01 } 
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.currency}>
                    <InputLabel>Currency</InputLabel>
                    <Select 
                      name="currency" 
                      value={data.currency || ""} 
                      label="Currency" 
                      onChange={handleInputChange}
                    >
                      {currencies.map(currency => (
                        <MenuItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.currency && (
                      <FormHelperText>{errors.currency}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      name="status" 
                      value={data.status || ""} 
                      label="Status" 
                      onChange={handleInputChange}
                    >
                      {orderStatuses?.map(status => (
                        <MenuItem key={status.value} value={status.value}>
                          <Box display="flex" alignItems="center">
                            {status.icon}
                            <Box ml={1}>{status.label}</Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && (
                      <FormHelperText>{errors.status}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.payment_status}>
                    <InputLabel>Payment Status</InputLabel>
                    <Select 
                      name="payment_status" 
                      value={data.payment_status || ""} 
                      label="Payment Status" 
                      onChange={handleInputChange}
                    >
                      {paymentStatuses.map(status => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.payment_status && (
                      <FormHelperText>{errors.payment_status}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField 
                    fullWidth 
                    label="Notes" 
                    name="notes" 
                    value={data.notes || ""} 
                    onChange={handleInputChange}
                    error={!!errors.notes}
                    helperText={errors.notes}
                    multiline
                    rows={3}
                    placeholder="Add any additional notes or comments..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider', gap: 1 }}>
              <Button 
                onClick={() => setOpenDialog(false)} 
                startIcon={<CloseIcon />}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Cancel
              </Button>
              
              <Button 
                onClick={handleSubmit} 
                startIcon={selectedOrder ? <SaveIcon /> : <AddIcon />} 
                variant="contained"
                disabled={processing}
                sx={{ borderRadius: 2 }}
              >
                {selectedOrder ? 'Update Order' : 'Create Order'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 3 }
            }}
            disableRestoreFocus
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
                Are you sure you want to delete purchase order <strong>{selectedOrder?.po_number}</strong>? 
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <Button 
                onClick={() => setOpenDeleteDialog(false)} 
                variant="outlined"
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
                Delete Order
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
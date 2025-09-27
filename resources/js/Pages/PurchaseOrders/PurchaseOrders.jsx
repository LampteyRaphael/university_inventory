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
  Switch,
  FormControlLabel,
  Paper,
  useTheme,
  useMediaQuery,
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



export default function PurchaseOrders({ purchaseOrders, auth, universities, suppliers, departments, users }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

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
  ];

  // Form structure
  const emptyForm = {
    order_id: "",
    university_id: auth.user?.university_id || "",
    supplier_id: "",
    department_id: "",
    po_number: "",
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
    requested_by: auth.user?.id || "",
    approved_by: "",
    approved_at: "",
    received_by: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    
    // Simulate data processing
    const processData = setTimeout(() => {
      const formatted = (purchaseOrders || []).map((order, index) => ({
        id: order?.order_id ?? index + 1,
        ...order,
        subtotal_amount: Number(order?.subtotal_amount ?? 0),
        tax_amount: Number(order?.tax_amount ?? 0),
        shipping_amount: Number(order?.shipping_amount ?? 0),
        discount_amount: Number(order?.discount_amount ?? 0),
        total_amount: Number(order?.total_amount ?? 0),
        exchange_rate: Number(order?.exchange_rate ?? 1),
        order_date: order?.order_date ? 
          moment(order.order_date).format("MMM Do YYYY") : "",
        expected_delivery_date: order?.expected_delivery_date ? 
          moment(order.expected_delivery_date).format("MMM Do YYYY") : "",
        actual_delivery_date: order?.actual_delivery_date ? 
          moment(order.actual_delivery_date).format("MMM Do YYYY") : "",
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

  // Calculate summary statistics
  const { totalOrders, totalValue, overdueOrders, pendingApproval } = useMemo(() => {
    const total = rows.length;
    const value = rows.reduce((sum, row) => sum + (row.total_amount || 0), 0);
    const overdue = rows.filter(row => 
      moment().isAfter(moment(row.expected_delivery_date)) && 
      !['received', 'cancelled', 'closed'].includes(row.status)
    ).length;
    const pending = rows.filter(row => 
      ['draft', 'submitted'].includes(row.status)
    ).length;
    
    return {
      totalOrders: total,
      totalValue: value,
      overdueOrders: overdue,
      pendingApproval: pending,
    };
  }, [rows]);

  // Column definitions - Updated with all migration fields
  // const columns = useMemo(() => [
  //   { field: 'id', headerName: 'ID', width: 70 },
  //   { 
  //     field: 'po_number', 
  //     headerName: 'PO Number', 
  //     width: 130,
  //   },
  //   { 
  //     field: 'order_type', 
  //     headerName: 'Type', 
  //     width: 110,
  //     renderCell: (params) => {
  //       const type = orderTypes.find(t => t.value === params.value);
  //       return (
  //         <Chip 
  //           label={type?.label || params.value} 
  //           size="small" 
  //           color={type?.color || 'default'}
  //           variant="outlined"
  //         />
  //       );
  //     }
  //   },
  //   { 
  //     field: 'university_id', 
  //     headerName: 'University', 
  //     width: 150,
  //     renderCell: (params) => {
  //       const university = universities?.find(u => u.university_id === params.value);
  //       return university ? university.name : params.value;
  //     }
  //   },
  //   { 
  //     field: 'supplier_id', 
  //     headerName: 'Supplier', 
  //     width: 180,
  //     renderCell: (params) => {
  //       const supplier = suppliers?.find(s => s.supplier_id === params.value);
  //       return supplier ? supplier.legal_name : params.value;
  //     }
  //   },
  //   { 
  //     field: 'department_id', 
  //     headerName: 'Department', 
  //     width: 150,
  //     renderCell: (params) => {
  //       const department = departments?.find(d => d.department_id === params.value);
  //       return department ? department.name : params.value;
  //     }
  //   },
  //   { 
  //     field: 'order_date', 
  //     headerName: 'Order Date', 
  //     width: 120,
  //   },
  //   { 
  //     field: 'expected_delivery_date', 
  //     headerName: 'Expected Delivery', 
  //     width: 140,
  //     renderCell: (params) => {
  //       const isOverdue = moment().isAfter(moment(params.value));
  //       const isToday = moment().isSame(moment(params.value), 'day');
        
  //       if (isOverdue) {
  //         return (
  //           <Box display="flex" alignItems="center">
  //             <OverdueIcon color="error" sx={{ fontSize: 16, mr: 0.5 }} />
  //             <Typography variant="body2" color="error">
  //               {params.value}
  //             </Typography>
  //           </Box>
  //         );
  //       }
        
  //       if (isToday) {
  //         return (
  //           <Box display="flex" alignItems="center">
  //             <DateIcon color="warning" sx={{ fontSize: 16, mr: 0.5 }} />
  //             <Typography variant="body2" color="warning.main">
  //               Today
  //             </Typography>
  //           </Box>
  //         );
  //       }
        
  //       return params.value;
  //     }
  //   },
  //   { 
  //     field: 'actual_delivery_date', 
  //     headerName: 'Actual Delivery', 
  //     width: 140,
  //   },
  //   { 
  //     field: 'subtotal_amount', 
  //     headerName: 'Subtotal', 
  //     width: 100, 
  //     type: 'number',
  //     renderCell: (params) => {
  //       const row = params.row;
  //       return `${row.currency} ${Number(params.value).toLocaleString()}`;
  //     }
  //   },
  //   { 
  //     field: 'total_amount', 
  //     headerName: 'Total Amount', 
  //     width: 130, 
  //     type: 'number',
  //     renderCell: (params) => {
  //       const row = params.row;
  //       return `${row.currency} ${Number(params.value).toLocaleString()}`;
  //     }
  //   },
  //   { 
  //     field: 'status', 
  //     headerName: 'Status', 
  //     width: 150, 
  //     renderCell: (params) => {
  //       const status = orderStatuses.find(s => s.value === params.value);
  //       return (
  //         <Chip 
  //           icon={status?.icon} 
  //           label={status?.label || params.value} 
  //           size="small" 
  //           color={status?.color || 'default'}
  //           variant={['approved', 'received', 'closed'].includes(params.value) ? 'filled' : 'outlined'}
  //         />
  //       );
  //     } 
  //   },
  //   { 
  //     field: 'payment_status', 
  //     headerName: 'Payment', 
  //     width: 110,
  //     renderCell: (params) => {
  //       const status = paymentStatuses.find(s => s.value === params.value);
  //       return (
  //         <Chip 
  //           label={status?.label || params.value} 
  //           size="small" 
  //           color={status?.color || 'default'}
  //           variant={params.value === 'paid' ? 'filled' : 'outlined'}
  //         />
  //       );
  //     }
  //   },
  //   { 
  //     field: 'requested_by', 
  //     headerName: 'Requested By', 
  //     width: 150,
  //     renderCell: (params) => {
  //       const user = users?.find(u => u.id === params.value);
  //       return user ? `${user.first_name} ${user.last_name}` : params.value;
  //     }
  //   },
  //   { 
  //     field: 'approved_by', 
  //     headerName: 'Approved By', 
  //     width: 150,
  //     renderCell: (params) => {
  //       if (!params.value) return '-';
  //       const user = users?.find(u => u.id === params.value);
  //       return user ? `${user.first_name} ${user.last_name}` : params.value;
  //     }
  //   },
  //   { 
  //     field: 'approved_at', 
  //     headerName: 'Approved At', 
  //     width: 150,
  //   },
  //   {
  //     field: 'actions',
  //     headerName: 'Actions',
  //     width: 120,
  //     sortable: false,
  //     filterable: false,
  //     type: 'actions',
  //     getActions: (params) => [
  //       <GridActionsCellItem
  //         icon={<Tooltip title="Edit"><EditIcon fontSize="small" /></Tooltip>}
  //         label="Edit"
  //         onClick={() => handleEdit(params.row)}
  //       />,
  //       <GridActionsCellItem
  //         icon={<Tooltip title="Delete"><DeleteIcon fontSize="small" /></Tooltip>}
  //         label="Delete"
  //         onClick={() => handleDeleteClick(params.row)}
  //         color="error"
  //       />,
  //     ],
  //   },
  // ], [suppliers, departments, universities, users, orderTypes, orderStatuses, paymentStatuses]);
// Column definitions - Updated with all migration fields
const columns = useMemo(() => [
  { field: 'id', headerName: 'ID', width: 70 },
  { 
    field: 'po_number', 
    headerName: 'PO Number', 
    width: 130,
  },
  { 
    field: 'order_type', 
    headerName: 'Type', 
    width: 110,
    renderCell: (params) => {
      const type = orderTypes.find(t => t.value === params.value);
      return (
        <Chip 
          label={type?.label || params.value} 
          size="small" 
          color={type?.color || 'default'}
          variant="outlined"
        />
      );
    }
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
    field: 'supplier_id', 
    headerName: 'Supplier', 
    width: 180,
    renderCell: (params) => {
      const supplier = suppliers?.find(s => s.supplier_id === params.value);
      return supplier ? supplier.legal_name : params.value;
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
    field: 'order_date', 
    headerName: 'Order Date', 
    width: 120,
  },
  { 
    field: 'expected_delivery_date', 
    headerName: 'Expected Delivery', 
    width: 140,
    renderCell: (params) => {
      const isOverdue = moment().isAfter(moment(params.value));
      const isToday = moment().isSame(moment(params.value), 'day');
      
      if (isOverdue) {
        return (
          <Box display="flex" alignItems="center">
            <OverdueIcon color="error" sx={{ fontSize: 16, mr: 0.5 }} />
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
    field: 'subtotal_amount', 
    headerName: 'Subtotal', 
    width: 100, 
    type: 'number',
    renderCell: (params) => {
      const row = params.row;
      return `${row.currency} ${Number(params.value).toLocaleString()}`;
    }
  },
  // Add the missing financial columns
  { 
    field: 'tax_amount', 
    headerName: 'Tax', 
    width: 90, 
    type: 'number',
    renderCell: (params) => {
      const row = params.row;
      return `${row.currency} ${Number(params.value).toLocaleString()}`;
    }
  },
  { 
    field: 'shipping_amount', 
    headerName: 'Shipping', 
    width: 90, 
    type: 'number',
    renderCell: (params) => {
      const row = params.row;
      return `${row.currency} ${Number(params.value).toLocaleString()}`;
    }
  },
  { 
    field: 'discount_amount', 
    headerName: 'Discount', 
    width: 90, 
    type: 'number',
    renderCell: (params) => {
      const row = params.row;
      return `${row.currency} ${Number(params.value).toLocaleString()}`;
    }
  },
  { 
    field: 'total_amount', 
    headerName: 'Total Amount', 
    width: 130, 
    type: 'number',
    renderCell: (params) => {
      const row = params.row;
      return `${row.currency} ${Number(params.value).toLocaleString()}`;
    }
  },
  { 
    field: 'currency', 
    headerName: 'Currency', 
    width: 80,
  },
  { 
    field: 'exchange_rate', 
    headerName: 'Exchange Rate', 
    width: 120, 
    type: 'number',
    renderCell: (params) => {
      return Number(params.value).toFixed(4);
    }
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 150, 
    renderCell: (params) => {
      const status = orderStatuses.find(s => s.value === params.value);
      return (
        <Chip 
          icon={status?.icon} 
          label={status?.label || params.value} 
          size="small" 
          color={status?.color || 'default'}
          variant={['approved', 'received', 'closed'].includes(params.value) ? 'filled' : 'outlined'}
        />
      );
    } 
  },
  { 
    field: 'payment_status', 
    headerName: 'Payment', 
    width: 110,
    renderCell: (params) => {
      const status = paymentStatuses.find(s => s.value === params.value);
      return (
        <Chip 
          label={status?.label || params.value} 
          size="small" 
          color={status?.color || 'default'}
          variant={params.value === 'paid' ? 'filled' : 'outlined'}
        />
      );
    }
  },
  // Add the notes column with a tooltip for longer text
  { 
    field: 'notes', 
    headerName: 'Notes', 
    width: 150,
    renderCell: (params) => {
      return (
        <Tooltip title={params.value || ''} placement="top">
          <Typography variant="body2" noWrap>
            {params.value || '-'}
          </Typography>
        </Tooltip>
      );
    }
  },
  // Add terms and conditions column with a tooltip
  { 
    field: 'terms_and_conditions', 
    headerName: 'Terms', 
    width: 120,
    renderCell: (params) => {
      return (
        <Tooltip title={params.value || ''} placement="top">
          <Box display="flex" alignItems="center">
            <TermsIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2" noWrap>
              {params.value ? 'View Terms' : '-'}
            </Typography>
          </Box>
        </Tooltip>
      );
    }
  },
  { 
    field: 'requested_by', 
    headerName: 'Requested By', 
    width: 150,
    renderCell: (params) => {
      const user = users?.find(u => u.id === params.value);
      return user ? `${user.first_name} ${user.last_name}` : params.value;
    }
  },
  { 
    field: 'approved_by', 
    headerName: 'Approved By', 
    width: 150,
    renderCell: (params) => {
      if (!params.value) return '-';
      const user = users?.find(u => u.id === params.value);
      return user ? `${user.first_name} ${user.last_name}` : params.value;
    }
  },
  { 
    field: 'approved_at', 
    headerName: 'Approved At', 
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
], [suppliers, departments, universities, users, orderTypes, orderStatuses, paymentStatuses]);
  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    const query = searchText.toLowerCase();
    return rows.filter(row => 
      row.po_number?.toLowerCase().includes(query) ||
      (suppliers.find(s => s.supplier_id === row.supplier_id)?.legal_name || "").toLowerCase().includes(query) ||
      (departments.find(d => d.department_id === row.department_id)?.name || "").toLowerCase().includes(query) ||
      (universities.find(u => u.university_id === row.university_id)?.name || "").toLowerCase().includes(query) ||
      orderStatuses.find(s => s.value === row.status)?.label.toLowerCase().includes(query)
    );
  }, [rows, searchText, suppliers, departments, universities, orderStatuses]);

  // Event handlers
  // const handleExport = useCallback(() => {
  //   const worksheet = XLSX.utils.json_to_sheet(
  //     filteredRows.map(row => ({
  //       'PO Number': row.po_number,
  //       'Type': orderTypes.find(t => t.value === row.order_type)?.label || row.order_type,
  //       'University': universities.find(u => u.university_id === row.university_id)?.name || row.university_id,
  //       'Supplier': suppliers.find(s => s.supplier_id === row.supplier_id)?.legal_name || row.supplier_id,
  //       'Department': departments.find(d => d.department_id === row.department_id)?.name || row.department_id,
  //       'Order Date': row.order_date,
  //       'Expected Delivery': row.expected_delivery_date,
  //       'Actual Delivery': row.actual_delivery_date || '-',
  //       'Subtotal': `${row.currency} ${row.subtotal_amount}`,
  //       'Total Amount': `${row.currency} ${row.total_amount}`,
  //       'Status': orderStatuses.find(s => s.value === row.status)?.label || row.status,
  //       'Payment Status': paymentStatuses.find(s => s.value === row.payment_status)?.label || row.payment_status,
  //       'Requested By': users.find(u => u.id === row.requested_by) ? 
  //         `${users.find(u => u.id === row.requested_by).first_name} ${users.find(u => u.id === row.requested_by).last_name}` : 
  //         row.requested_by,
  //       'Approved By': row.approved_by ? 
  //         (users.find(u => u.id === row.approved_by) ? 
  //           `${users.find(u => u.id === row.approved_by).first_name} ${users.find(u => u.id === row.approved_by).last_name}` : 
  //           row.approved_by) : 
  //         '-',
  //       'Approved At': row.approved_at || '-',
  //     }))
  //   );
    
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Orders');
  //   XLSX.writeFile(workbook, `purchase_orders_export_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
  //   setAlert({ open: true, message: 'Purchase order data exported successfully', severity: 'success' });
  // }, [filteredRows, suppliers, departments, universities, users, orderTypes, orderStatuses, paymentStatuses]);
const handleExport = useCallback(() => {
  const worksheet = XLSX.utils.json_to_sheet(
    filteredRows.map(row => ({
      'PO Number': row.po_number,
      'Type': orderTypes.find(t => t.value === row.order_type)?.label || row.order_type,
      'University': universities?.find(u => u.university_id === row.university_id)?.name || row.university_id,
      'Supplier': suppliers.find(s => s.supplier_id === row.supplier_id)?.legal_name || row.supplier_id,
      'Department': departments.find(d => d.department_id === row.department_id)?.name || row.department_id,
      'Order Date': row.order_date,
      'Expected Delivery': row.expected_delivery_date,
      'Actual Delivery': row.actual_delivery_date || '-',
      'Subtotal': `${row.currency} ${row.subtotal_amount}`,
      'Tax': `${row.currency} ${row.tax_amount}`,
      'Shipping': `${row.currency} ${row.shipping_amount}`,
      'Discount': `${row.currency} ${row.discount_amount}`,
      'Total Amount': `${row.currency} ${row.total_amount}`,
      'Currency': row.currency,
      'Exchange Rate': row.exchange_rate,
      'Status': orderStatuses.find(s => s.value === row.status)?.label || row.status,
      'Payment Status': paymentStatuses.find(s => s.value === row.payment_status)?.label || row.payment_status,
      'Notes': row.notes || '-',
      'Terms and Conditions': row.terms_and_conditions || '-',
      'Requested By': users.find(u => u.id === row.requested_by) ? 
        `${users.find(u => u.id === row.requested_by).first_name} ${users.find(u => u.id === row.requested_by).last_name}` : 
        row.requested_by,
      'Approved By': row.approved_by ? 
        (users.find(u => u.id === row.approved_by) ? 
          `${users.find(u => u.id === row.approved_by).first_name} ${users.find(u => u.id === row.approved_by).last_name}` : 
          row.approved_by) : 
        '-',
      'Approved At': row.approved_at || '-',
    }))
  );
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Orders');
  XLSX.writeFile(workbook, `purchase_orders_export_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
  
  setAlert({ open: true, message: 'Purchase order data exported successfully', severity: 'success' });
}, [filteredRows, suppliers, departments, universities, users, orderTypes, orderStatuses, paymentStatuses]);

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
    setFormData({ 
      ...emptyForm, 
      university_id: auth.user?.university_id || "",
      requested_by: auth.user?.id || "",
    });
    setFormErrors({});
    setOpenDialog(true);
  }, [auth, emptyForm]);

  const handleEdit = useCallback((row) => {
    setSelectedOrder(row);
    setFormData({ 
      ...emptyForm, 
      ...row,
      order_date: row.order_date ? moment(row.order_date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
      expected_delivery_date: row.expected_delivery_date ? moment(row.expected_delivery_date).format('YYYY-MM-DD') : moment().add(14, 'days').format('YYYY-MM-DD'),
      actual_delivery_date: row.actual_delivery_date ? moment(row.actual_delivery_date).format('YYYY-MM-DD') : "",
    });
    setFormErrors({});
    setOpenDialog(true);
  }, [emptyForm]);

  const handleDeleteClick = useCallback((row) => {
    setSelectedOrder(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setGridLoading(true);
    setTimeout(() => {
      setRows(prev => prev.filter(r => r.id !== selectedOrder.id));
      setOpenDeleteDialog(false);
      setAlert({ open: true, message: 'Purchase order deleted successfully', severity: 'success' });
      setGridLoading(false);
    }, 300);
  }, [selectedOrder]);

  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.supplier_id) errors.supplier_id = 'Supplier is required';
    if (!formData.department_id) errors.department_id = 'Department is required';
    if (!formData.order_date) errors.order_date = 'Order date is required';
    if (!formData.expected_delivery_date) errors.expected_delivery_date = 'Expected delivery date is required';
    if (formData.total_amount < 0) errors.total_amount = 'Total amount cannot be negative';
    
    if (formData.expected_delivery_date && formData.order_date) {
      if (moment(formData.expected_delivery_date).isBefore(moment(formData.order_date))) {
        errors.expected_delivery_date = 'Expected delivery date cannot be before order date';
      }
    }
    
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
        id: selectedOrder ? selectedOrder.id : `order_${Date.now()}`,
        order_id: selectedOrder ? selectedOrder.order_id : `order_${Date.now()}`,
        created_at: selectedOrder ? selectedOrder.created_at : moment().format('MMM Do YYYY, h:mm a'),
        updated_at: moment().format('MMM Do YYYY, h:mm a'),
      };

      if (selectedOrder) {
        setRows(prev => prev.map(r => r.id === selectedOrder.id ? { ...r, ...payload } : r));
        setAlert({ open: true, message: 'Purchase order updated successfully', severity: 'success' });
      } else {
        setRows(prev => [payload, ...prev]);
        setAlert({ open: true, message: 'Purchase order created successfully', severity: 'success' });
      }

      setLoading(false);
      setOpenDialog(false);
      setSelectedOrder(null);
    }, 500);
  }, [formData, selectedOrder, validateForm]);

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
      title="Purchase Orders"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'Purchase Orders' }
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
                title="Total Orders" 
                value={totalOrders} 
                icon={<PurchaseOrderIcon />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard 
                title="Total Value" 
                value={`$${totalValue.toLocaleString()}`} 
                icon={<AmountIcon />} 
                color={theme.palette.success.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard 
                title="Overdue Orders" 
                value={overdueOrders} 
                icon={<OverdueIcon />} 
                color={theme.palette.error.main} 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard 
                title="Pending Approval" 
                value={pendingApproval} 
                icon={<PendingIcon />} 
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
                <PurchaseOrderIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Purchase Orders
                </Typography>
                {searchText && (
                  <Chip 
                    label={`${filteredRows.length} of ${rows.length} orders`} 
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
                  placeholder="Search orders..."
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
                  New Order
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
                {selectedOrder ? (
                  <>
                    <EditIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Edit Purchase Order</Typography>
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Create Purchase Order</Typography>
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
                  <TextField 
                    fullWidth 
                    label="PO Number" 
                    name="po_number" 
                    value={formData.po_number} 
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PurchaseOrderIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Order Type</InputLabel>
                    <Select 
                      name="order_type" 
                      value={formData.order_type} 
                      label="Order Type" 
                      onChange={handleInputChange}
                    >
                      {orderTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.supplier_id}>
                    <InputLabel>Supplier</InputLabel>
                    <Select 
                      name="supplier_id" 
                      value={formData.supplier_id} 
                      label="Supplier" 
                      onChange={handleInputChange}
                    >
                      {suppliers?.map(supplier => (
                        <MenuItem key={supplier.supplier_id} value={supplier.supplier_id}>
                          {supplier.legal_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.supplier_id && (
                      <FormHelperText>{formErrors.supplier_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.department_id}>
                    <InputLabel>Department</InputLabel>
                    <Select 
                      name="department_id" 
                      value={formData.department_id} 
                      label="Department" 
                      onChange={handleInputChange}
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

                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Order Date" 
                    name="order_date" 
                    type="date" 
                    value={formData.order_date} 
                    onChange={handleInputChange} 
                    error={!!formErrors.order_date}
                    helperText={formErrors.order_date}
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
                    label="Expected Delivery Date" 
                    name="expected_delivery_date" 
                    type="date" 
                    value={formData.expected_delivery_date} 
                    onChange={handleInputChange} 
                    error={!!formErrors.expected_delivery_date}
                    helperText={formErrors.expected_delivery_date}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Total Amount" 
                    name="total_amount" 
                    type="number" 
                    value={formData.total_amount} 
                    onChange={handleInputChange} 
                    error={!!formErrors.total_amount}
                    helperText={formErrors.total_amount}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <AmountIcon color="action" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.01 } 
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select 
                      name="currency" 
                      value={formData.currency} 
                      label="Currency" 
                      onChange={handleInputChange}
                    >
                      {currencies.map(currency => (
                        <MenuItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                      {orderStatuses?.map(status => (
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
                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select 
                      name="payment_status" 
                      value={formData.payment_status} 
                      label="Payment Status" 
                      onChange={handleInputChange}
                    >
                      {paymentStatuses.map(status => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
            
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button 
                onClick={() => setOpenDialog(false)} 
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
              
              <Button 
                onClick={handleSubmit} 
                startIcon={selectedOrder ? <SaveIcon /> : <AddIcon />} 
                variant="contained"
                disabled={loading}
              >
                {selectedOrder ? 'Update Order' : 'Create Order'}
              </Button>
            </DialogActions>
          </Dialog>
          </Box>
          </Fade>
          </AuthenticatedLayout>
  );
}
          {/* Create/Edit Dialog */}
          {/* <Dialog 
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
                {selectedOrder ? (
                  <>
                    <EditIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Edit Purchase Order</Typography>
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Create Purchase Order</Typography>
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
                  <TextField 
                    fullWidth 
                    label="PO Number" 
                    name="po_number" 
                    value={formData.po_number} 
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PurchaseOrderIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Order Type</InputLabel>
                    <Select 
                      name="order_type" 
                      value={formData.order_type} 
                      label="Order Type" 
                      onChange={handleInputChange}
                    >
                      {orderTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>University</InputLabel>
                    <Select 
                      name="university_id" 
                      value={formData.university_id} 
                      label="University" 
                      onChange={handleInputChange}
                    >
                      {universities?.map(university => (
                        <MenuItem key={university.university_id} value={university.university_id}>
                          {university.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.supplier_id}>
                    <InputLabel>Supplier</InputLabel>
                    <Select 
                      name="supplier_id" 
                      value={formData.supplier_id} 
                      label="Supplier" 
                      onChange={handleInputChange}
                    >
                      {suppliers?.map(supplier => (
                        <MenuItem key={supplier.supplier_id} value={supplier.supplier_id}>
                          {supplier.legal_name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.supplier_id && (
                      <FormHelperText>{formErrors.supplier_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.department_id}>
                    <InputLabel>Department</InputLabel>
                    <Select 
                      name="department_id" 
                      value={formData.department_id} 
                      label="Department" 
                      onChange={handleInputChange}
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

                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Order Date" 
                    name="order_date" 
                    type="date" 
                    value={formData.order_date} 
                    onChange={handleInputChange} 
                    error={!!formErrors.order_date}
                    helperText={formErrors.order_date}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DateIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
               
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Expected Delivery Date" 
                    name="expected_delivery_date" 
                    type="date" 
                    value={formData.expected_delivery_date} 
                    onChange={handleInputChange} 
                    error={!!formErrors.expected_delivery_date}
                    helperText={formErrors.expected_delivery_date}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Total Amount" 
                    name="total_amount" 
                    type="number" 
                    value={formData.total_amount} 
                    onChange={handleInputChange} 
                    error={!!formErrors.total_amount}
                    helperText={formErrors.total_amount}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <AmountIcon color="action" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.01 } 
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select 
                      name="currency" 
                      value={formData.currency} 
                      label="Currency" 
                      onChange={handleInputChange}
                    >
                      {currencies.map(currency => (
                        <MenuItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                      {orderStatuses?.map(status => (
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
                  <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select 
                      name="payment_status" 
                      value={formData.payment_status} 
                      label="Payment Status" 
                      onChange={handleInputChange}
                    >
                      {paymentStatuses.map(status => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
              </Grid>
              {/* </ */}
            {/* </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button 
                onClick={() => setOpenDialog(false)} 
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
              
              <Button 
                onClick={handleSubmit} 
                startIcon={selectedOrder ? <SaveIcon /> : <AddIcon />} 
                variant="contained"
                disabled={loading}
              >
                {selectedOrder ? 'Update Order' : 'Create Order'}
              </Button>
            </DialogActions>
          </Dialog>
          </Box>
          </Fade>
          </AuthenticatedLayout> */}
  {/* );  */}

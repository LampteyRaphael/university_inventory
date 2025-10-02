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
  CircularProgress,
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
  Assignment as ReferenceIcon,
  LocalOffer as UnitCostIcon,
  AttachMoney as TotalValueIcon,
  SwapHoriz as TransactionTypeIcon,
  CalendarToday as DateIcon,
  BatchPrediction as BatchIcon,
  EventAvailable as ExpiryIcon,
  Notes as NotesIcon,
  Pending as PendingIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  Replay as ReversedIcon,
  AddCircleOutline,
  CloudUpload,
  Download,
} from "@mui/icons-material";
import { router, useForm, usePage } from "@inertiajs/react";
import Notification from "@/Components/Notification";


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


export default function InventoryTransactions({ transactions, auth, items, departments, locations }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { flash } = usePage().props;

    const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };
  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  // Transaction types and statuses
  const transactionTypes = [
    { value: 'purchase', label: 'Purchase', color: 'success' },
    { value: 'sale', label: 'Sale', color: 'primary' },
    { value: 'transfer', label: 'Transfer', color: 'info' },
    { value: 'adjustment', label: 'Adjustment', color: 'warning' },
    { value: 'return', label: 'Return', color: 'secondary' },
    { value: 'write_off', label: 'Write Off', color: 'error' },
    { value: 'consumption', label: 'Consumption', color: 'default' },
    { value: 'production', label: 'Production', color: 'info' },
    { value: 'donation', label: 'Donation', color: 'success' },
  ];

  const transactionStatuses = [
    { value: 'pending', label: 'Pending', color: 'warning', icon: <PendingIcon /> },
    { value: 'completed', label: 'Completed', color: 'success', icon: <CompletedIcon /> },
    { value: 'cancelled', label: 'Cancelled', color: 'error', icon: <CancelledIcon /> },
    { value: 'reversed', label: 'Reversed', color: 'info', icon: <ReversedIcon /> },
  ];

// Replace the emptyForm object and formData state with Inertia form
const emptyForm = {
  transaction_id: "",
  university_id: auth.user?.university_id || "",
  item_id: "",
  department_id: "",
  transaction_type: "purchase",
  quantity: 1,
  unit_cost: 0,
  total_value: 0,
  transaction_date:"",
  // moment().format('YYYY-MM-DDTHH:mm'),
  reference_number: "",
  reference_id: "",
  batch_number: "",
  expiry_date: "",
  notes: "",
  source_location_id: "",
  destination_location_id: "",
  status: "completed",
  performed_by:"",
  //  auth.user?.id || "",
  approved_by: "",
};

const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(emptyForm);
  const [formData, setFormData] = useState(emptyForm);
 
  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    // console.log(transactions)
    // Simulate data processing
    const processData = setTimeout(() => {
      const formatted = transactions?.map((transaction, index) => ({
        id: transaction?.transaction_id ?? index + 1,
        ...transaction,
        unit_cost: Number(transaction?.unit_cost ?? 0),
        total_value: Number(transaction?.total_value ?? 0),
        transaction_date: transaction?.transaction_date??"", 
          // moment(transaction.transaction_date).format("MMM Do YYYY, h:mm a") : "",
        // expiry_date: transaction?.expiry_date??"",
          // moment(transaction.expiry_date).format("MMM Do YYYY") : "",
        // created_at: transaction?.created_at??"",
          // moment(transaction.created_at).format("MMM Do YYYY, h:mm a") : "",
        // updated_at: transaction?.updated_at ? 
          // moment(transaction.updated_at).format("MMM Do YYYY, h:mm a") : "",
          // performed_by: transaction?.performed_by?.name??"",
          // approved_by: transaction?.approved_by?.name??"",
          location:transaction?.sourceLocation??"",
          // department:transaction?.department??"",
          // item: transaction?.item??"",
      }));
      
      setRows(formatted);
      setGridLoading(false);
    }, 800);

    return () => clearTimeout(processData);
  }, [transactions]);

  // Calculate total values for summary cards
  const { totalTransactions, totalValue, pendingTransactions, recentTransactions } = useMemo(() => {
    const total = rows.length || 0;
    const value = rows.reduce((sum, row) => sum + (row.total_value || 0), 0);
    const pending = rows.filter(row => row.status === 'pending').length;
    const recent = rows.filter(row => 
      moment().diff(moment(row.transaction_date), 'days') <= 7
    ).length;
    
    return {
      totalTransactions: total,
      totalValue: value,
      pendingTransactions: pending,
      recentTransactions: recent,
    };
  }, [rows]);

const columns = useMemo(() => [
  {
    field: 'transaction_id',
    headerName: 'ID',
    width: 120,
    renderCell: (params) => {
      const id = params.value;
      const shortId = id ? id.substring(0, 8) : '';

      return (
        <Tooltip title={id} arrow>
          <Typography variant="body2" noWrap>
            {shortId}
          </Typography>
        </Tooltip>
      );
    }
  },
  { 
    field: 'transaction_type', 
    headerName: 'Type', 
    width: 110,
    renderCell: (params) => {
      const type = transactionTypes.find(t => t.value === params.value);
      return (
        <Chip
          label={type?.label || params.value}
          size="small"
          color={type?.color || 'default'}
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      );
    }
  },
  { 
    field: 'item_dept_loc', 
    headerName: 'Item → Dept → Loc', 
    width: 220,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {params.row?.item??'No item'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.department??''} {params.row.sourceLocation? '•':''} {params.row.sourceLocation??''}
            </Typography>
          </Box>
    )
  },
  {
  field: 'quantity_cost',
  headerName: 'Qty & Cost',
  width: 140,
  renderCell: (params) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* First row: Quantity left, Unit cost right */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Typography variant="body2" fontWeight="bold">
          {params.row.quantity}
        </Typography>
        <Typography variant="body2" fontWeight="bold">
          ₵{Number(params.row.unit_cost).toFixed(2)}
        </Typography>
      </Box>

      {/* Second row: Total value aligned to the right */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
        <Typography variant="caption" color="text.secondary">
          ₵{Number(params.row.total_value).toFixed(2)}
        </Typography>
      </Box>
    </Box>
  ),
},

  { 
    field: 'date_time', 
    headerName: 'Date & Time', 
    width: 140,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2">
          {moment(params.row.transaction_date).format('MMM DD, YYYY')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {moment(params.row.transaction_date).format('h:mm A')}
        </Typography>
      </Box>
    )
  },
  {
  field: 'reference_batch_expiry',
  headerName: 'Ref / Batch / Expiry',
  width: 180,
  renderCell: (params) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* First row: Reference (left), Expiry (right) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Typography variant="body2" fontWeight="medium">
          {params.row.reference_number || 'No Ref'}
        </Typography>

          {params.row.batch_number && (
          <Chip
            label={params.row.batch_number}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.65rem' }}
          />
        )}

      </Box>

      {/* Second row: Batch aligned right */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                {params.row.expiry_date && (
          <Typography
            variant="caption"
            color={moment(params.row.expiry_date).isBefore(moment()) ? 'error' : 'warning.main'}
          >
            {moment(params.row.expiry_date).format('MMM DD')}
          </Typography>
        )}

      </Box>
    </Box>
  )
},
{
  field: 'location_flow',
  headerName: 'Location Flow',
  width: 350,
  renderCell: (params) => {
    const { sourceLocation, destinationLocation } = params.row;

    // Function to shorten text
    const truncate = (text, maxLength = 15) => {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Tooltip title={`${sourceLocation} → ${destinationLocation}`} arrow>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {truncate(sourceLocation)} → {truncate(destinationLocation)}
          </Typography>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          Source → Destination
        </Typography>
      </Box>
    );
  }
},
  { 
    field: 'status_notes', 
    headerName: 'Status & Notes', 
    width: 180,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Chip
          icon={transactionStatuses?.find(s => s.value === params.row.status)?.icon}
          label={transactionStatuses?.find(s => s.value === params.row.status)?.label || params.row.status}
          size="small"
          color={transactionStatuses?.find(s => s.value === params.row.status)?.color || 'default'}
          variant={params.row.status === 'completed' ? 'filled' : 'outlined'}
          sx={{ fontSize: '0.75rem', width: 'fit-content' }}
        />
        {params.row.notes && (
          <Tooltip title={params.row.notes}>
            <Typography variant="caption" color="text.secondary" noWrap>
              📝 {params.row.notes.substring(0, 30)}...
            </Typography>
          </Tooltip>
        )}
      </Box>
    )
  },
  { 
    field: 'users_approval', 
    headerName: 'Users & Approval', 
    width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Tooltip title={params.row.performed_by}>
        <Typography variant="caption">
          👤 Performed: {params.row.performedBy || 'System'}
        </Typography>
        </Tooltip>
        <Tooltip title={params.row.approved_by}>
        <Typography variant="caption" color={params.row.approvedBy ? "success.main" : "warning.main"}>
          ✅ Approved: {params.row.approvedBy ? 'Yes' : 'Pending'}
        </Typography>
        </Tooltip>
      </Box>
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
      />,
      <GridActionsCellItem
        icon={<Tooltip title="Delete"><DeleteIcon fontSize="small" /></Tooltip>}
        label="Delete"
        onClick={() => handleDeleteClick(params.row)}
        color="error"
      />,
    ],
  },
], [items, departments, transactionTypes, transactionStatuses, locations]);
  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    const query = searchText.toLowerCase();
    return rows.filter(row => 
      row.reference_number?.toLowerCase().includes(query) ||
      row.batch_number?.toLowerCase().includes(query) ||
      (items.find(i => i.item_id === row.item_id)?.name || "").toLowerCase().includes(query) ||
      (departments?.find(d => d.department_id === row.department_id)?.name || "").toLowerCase().includes(query)
    );
  }, [rows, searchText, items, departments]);

  // Event handlers
  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows?.map(row => ({
        'Transaction ID': row.transaction_id,
        'Type': transactionTypes.find(t => t.value === row.transaction_type)?.label || row.transaction_type,
        'Item': items.find(i => i.item_id === row.item_id)?.name || row.item_id,
        'Quantity': row.quantity,
        'Unit Cost': row.unit_cost,
        'Total Value': row.total_value,
        'Date': row.transaction_date,
        'Reference': row.reference_number,
        'Batch': row.batch_number,
        'Department': departments.find(d => d.department_id === row.department_id)?.name || row.department_id,
        'Status': transactionStatuses.find(s => s.value === row.status)?.label || row.status,
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Transactions');
    XLSX.writeFile(workbook, `inventory_transactions_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
    setAlert({ open: true, message: 'Transaction data exported successfully', severity: 'success' });
  }, [filteredRows, items, departments, transactionTypes, transactionStatuses]);

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
        const mappedData = uploadedData?.map((item, index) => ({
          id: `uploaded_${Date.now()}_${index}`,
          transaction_id: `uploaded_${Date.now()}_${index}`,
          ...item,
          unit_cost: Number(item.unit_cost) || 0,
          total_value: Number(item.total_value) || 0,
          quantity: Number(item.quantity) || 0,
          transaction_date: moment().format("MMM Do YYYY, h:mm a"),
        }));
        
        setRows(prev => [...mappedData, ...prev]);
        setAlert({ open: true, message: `${mappedData.length} transactions imported successfully`, severity: 'success' });
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
  setSelectedTransaction(null);
  reset({
    ...emptyForm,
    performed_by: auth.user?.id || "",
    university_id: auth.user?.university_id || "",
  });
  setOpenDialog(true);
}, [auth, reset]);

const handleEdit = useCallback((row) => {
  setSelectedTransaction(row);
  setData({
    ...emptyForm,
    ...row,
    transaction_date: row.transaction_date ? 
      moment(row.transaction_date).format('YYYY-MM-DDTHH:mm') : 
      moment().format('YYYY-MM-DDTHH:mm'),
    expiry_date: row.expiry_date ? 
      moment(row.expiry_date).format('YYYY-MM-DD') : ""
  });
  setOpenDialog(true);
}, [setData]);
const handleDeleteClick = useCallback((row) => {
  setSelectedTransaction(row);
  setOpenDeleteDialog(true);
}, []);

const handleDeleteConfirm = useCallback(() => {
  if (!selectedTransaction) return;
  
  router.delete(route('inventory-transactions.destroy', selectedTransaction.id), {
    onSuccess: (response) => {
      setOpenDeleteDialog(false);
      setSelectedTransaction(null);
      setAlert({ 
        open: true, 
        message: response.props.flash.success, 
        severity: 'error' 
      });
    },
    onError: (errors) => {
      // console.log(errors)
      setOpenDeleteDialog(false);
      setAlert({ 
        open: true, 
        message: response.props.flash.error, 
        severity: 'error' 
      });
    }
  });
}, [selectedTransaction]);


  const handleInputChange = useCallback((event) => {
  const { name, value, type, checked } = event.target;
  const newValue = type === 'checkbox' ? checked : value;
  
  setData(name, newValue);
  
  // Auto-calculate total value if quantity or unit cost changes
  if ((name === 'quantity' || name === 'unit_cost') && data.quantity && data.unit_cost) {
    const quantity = name === 'quantity' ? newValue : data.quantity;
    const unit_cost = name === 'unit_cost' ? newValue : data.unit_cost;
    setData('total_value', Number(quantity) * Number(unit_cost));
  }
}, [data.quantity, data.unit_cost, setData]);
  
  const validateForm = useCallback(() => {
  const validationErrors = {};
  
  if (!data.item_id) validationErrors.item_id = 'Item is required';
  if (!data.department_id) validationErrors.department_id = 'Department is required';
  if (!data.transaction_type) validationErrors.transaction_type = 'Transaction type is required';
  if (!data.quantity || data.quantity <= 0) validationErrors.quantity = 'Valid quantity is required';
  if (data.unit_cost < 0) validationErrors.unit_cost = 'Unit cost cannot be negative';
  if (!data.transaction_date) validationErrors.transaction_date = 'Transaction date is required';
  
  return validationErrors;
}, [data]);

const handleSubmit = useCallback(() => {
  const validationErrors = validateForm();
  
  if (Object.keys(validationErrors).length > 0) {
    // Set validation errors (you might want to handle this differently)
    console.log('Validation errors:', validationErrors);
    return;
  }

  // Prepare the data for submission
  const submitData = {
    ...data,
    transaction_date: moment(data.transaction_date).format('YYYY-MM-DD HH:mm:ss'),
    expiry_date: data.expiry_date ? moment(data.expiry_date).format('YYYY-MM-DD') : null,
    _method: selectedTransaction ? 'put' : 'post'
  };

  if (selectedTransaction) {
    // Update existing transaction
    put(route('inventory-transactions.update', selectedTransaction.id), {
      onSuccess: (response) => {
        setAlert({ open: true, message: response.props.flash.success, severity: 'success' });
        setOpenDialog(false);
        setSelectedTransaction(null);
        reset();
      },
      onError: (errors) => {
        setAlert({ open: true, message: response.props.flash.error, severity: 'error' });
      }
    });
  } else {
    // Create new transaction
    post(route('inventory-transactions.store'), {
      onSuccess: (response) => {
        setAlert({ open: true, message: response.props.flash.success, severity: 'success' });
        setOpenDialog(false);
        reset();
      },
      onError: (errors) => {
        setAlert({ open: true, message: response.props.flash.error, severity: 'error' });
      }
    });
  }
}, [data, selectedTransaction, validateForm, put, post, reset]);

  const handleRefresh = useCallback(() => {
    setGridLoading(true);
    setTimeout(() => {
      // In a real app, this would refetch data from the server
      setGridLoading(false);
      setAlert({ open: true, message: 'Data refreshed', severity: 'info' });
    }, 800);
  }, []);

  const handleClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  
    useEffect(() => {
    if (flash.success) {
      showAlert(flash.success, "success");
    }

    if (flash.error) {
      showAlert(flash.error, "error");
    }
  }, [flash]);

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Inventory Transactions"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'Inventory Transactions' }
      ]}
    >
    
      <Fade in timeout={500}>
        <Box>
        <Notification 
          open={alert.open} 
          severity={alert.severity} 
          message={alert.message}
          onClose={handleClose}
        />

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
            <Grid size = {{ xs:12, md:6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <InventoryIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h5" fontWeight={700} color="text.primary">
                    Inventory Transactions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Manage and track all inventory movements and transactions
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
                <Grid size = {{ xs:12, md:"auto" }} >
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
                        New Transaction
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
            <Grid size={{ xs:12, sm:6, md:6}}>
              <SummaryCard 
                title="Total Transactions" 
                value={totalTransactions} 
                icon={<InventoryIcon />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid size={{ xs:12, sm:6, md:6}}>
              <SummaryCard 
                title="Total Value" 
                value={`₵${totalValue?.toFixed(2)}`} 
                icon={<TotalValueIcon />} 
                color={theme.palette.success.main} 
              />
            </Grid>
            <Grid size={{ xs:12, sm:6, md:6}}>
              <SummaryCard 
                title="Pending Transactions" 
                value={pendingTransactions} 
                icon={<PendingIcon />} 
                color={theme.palette.warning.main} 
              />
            </Grid>
            <Grid size={{ xs:12, sm:6, md:6}}>
              <SummaryCard 
                title="Last 7 Days" 
                value={recentTransactions} 
                icon={<DateIcon />} 
                color={theme.palette.info.main} 
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
                  <InventoryIcon color="primary" fontSize="medium" />
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    Transaction History
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


            {/* {gridLoading && (
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
                    Loading items...
                    </Typography>
                </Box>
                </Box>
            )} */}
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
                {selectedTransaction ? (
                  <>
                    <EditIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Edit Transaction</Typography>
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Create Transaction</Typography>
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
                <Grid size={{ xs:12, sm:6, md:4}}>
                  <FormControl fullWidth error={!!formErrors.transaction_type}>
                    <InputLabel>Transaction Type</InputLabel>
                    <Select 
                      name="transaction_type" 
                      value={data.transaction_type} 
                      label="Transaction Type" 
                      onChange={handleInputChange}
                      startAdornment={
                        <InputAdornment position="start">
                          <TransactionTypeIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {transactionTypes?.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.transaction_type && (
                      <FormHelperText>{formErrors.transaction_type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid size={{ xs:12, sm:6, md:4}}>
                  <FormControl fullWidth error={!!formErrors.status}>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      name="status" 
                      value={data.status} 
                      label="Status" 
                      onChange={handleInputChange}
                    >
                      {transactionStatuses.map(status => (
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

                <Grid size={{ xs:12, sm:6, md:4}}>
                  <FormControl fullWidth error={!!formErrors.item_id}>
                    <InputLabel>Item</InputLabel>
                    <Select 
                      name="item_id" 
                      value={data.item_id} 
                      label="Item" 
                      onChange={handleInputChange}
                    >
                      {items?.map(item => (
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

                <Grid size={{ xs:12, sm:6, md:4}}>
                  <FormControl fullWidth error={!!formErrors.department_id}>
                    <InputLabel>Department</InputLabel>
                    <Select 
                      name="department_id" 
                      value={data.department_id} 
                      label="Department" 
                      onChange={handleInputChange}
                    >
                      {departments?.map(dept => (
                        <MenuItem key={dept.department_id} value={dept.department_id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.department_id && (
                      <FormHelperText>{formErrors.department_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs:12, sm:6, md:4}}>
                  <TextField 
                    fullWidth 
                    label="Quantity" 
                    name="quantity" 
                    type="number" 
                    value={data.quantity} 
                    onChange={handleInputChange} 
                    error={!!formErrors.quantity}
                    helperText={formErrors.quantity}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid size={{ xs:12, sm:6, md:4}}>
                  <TextField 
                    fullWidth 
                    label="Unit Cost" 
                    name="unit_cost" 
                    type="number" 
                    value={data.unit_cost} 
                    onChange={handleInputChange} 
                    error={!!formErrors.unit_cost}
                    helperText={formErrors.unit_cost}
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <UnitCostIcon color="action" />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.01 } 
                    }}
                  />
                </Grid>

                <Grid size={{ xs:12, sm:6, md:4}}>
                  <TextField 
                    fullWidth 
                    label="Total Value" 
                    name="total_value" 
                    type="number" 
                    value={data.total_value} 
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <TotalValueIcon color="action" />
                        </InputAdornment>
                      ),
                      readOnly: true
                    }}
                  />
                </Grid>

                <Grid size={{ xs:12, sm:6, md:4}}>
                  <TextField 
                    fullWidth 
                    label="Transaction Date & Time" 
                    name="transaction_date" 
                    type="datetime-local" 
                    value={data.transaction_date} 
                    onChange={handleInputChange} 
                    error={!!formErrors.transaction_date}
                    helperText={formErrors.transaction_date}
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

                <Grid size={{ xs:12, sm:6, md:4}}>
                  <TextField 
                    fullWidth 
                    label="Reference Number" 
                    name="reference_number" 
                    value={data.reference_number} 
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReferenceIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs:12, sm:6, md:4}}>
                  <TextField 
                    fullWidth 
                    label="Batch Number" 
                    name="batch_number" 
                    value={data.batch_number} 
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BatchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs:12, sm:6, md:4}}>
                  <TextField 
                    fullWidth 
                    label="Expiry Date" 
                    name="expiry_date" 
                    type="date" 
                    value={data.expiry_date} 
                    onChange={handleInputChange} 
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ExpiryIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs:12, sm:6, md:4}}>
                  <FormControl fullWidth>
                    <InputLabel>Source Location</InputLabel>
                    <Select 
                      name="source_location_id" 
                      value={data.source_location_id} 
                      label="Source Location" 
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">None</MenuItem>
                      {locations?.map(location => (
                        <MenuItem key={location.location_id} value={location.location_id}>
                          {location.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs:12, sm:12, md:6}}>
                  <FormControl fullWidth>
                    <InputLabel>Destination Location</InputLabel>
                    <Select 
                      name="destination_location_id" 
                      value={data.destination_location_id} 
                      label="Destination Location" 
                      onChange={handleInputChange}
                    >
                      <MenuItem value="">None</MenuItem>
                      {locations?.map(location => (
                        <MenuItem key={location.location_id} value={location.location_id}>
                          {location.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs:12, sm:12, md:6}}>
                  <TextField 
                    fullWidth 
                    label="Notes" 
                    name="notes" 
                    value={data.notes} 
                    onChange={handleInputChange}
                    multiline
                    rows={1}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NotesIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
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
                variant="contained" 
                disabled={processing}
                startIcon={processing ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {processing ? 'Saving...' : (selectedTransaction ? 'Update' : 'Create')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          {/* <Dialog 
            open={openDeleteDialog} 
            onClose={() => setOpenDeleteDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this transaction? 
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleDeleteConfirm}
                startIcon={<DeleteIcon />}
              >
                Delete Transaction
              </Button>
            </DialogActions>
          </Dialog> */}
          {/* Delete Confirmation Dialog */}
          <Dialog 
            open={openDeleteDialog} 
            onClose={() => setOpenDeleteDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete transaction #{selectedTransaction?.transaction_id}? 
                This action cannot be undone.
              </Typography>
              {selectedTransaction && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Item:</strong> {selectedTransaction.item?.name}<br />
                    <strong>Type:</strong> {transactionTypes.find(t => t.value === selectedTransaction.transaction_type)?.label}<br />
                    <strong>Quantity:</strong> {selectedTransaction.quantity}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleDeleteConfirm}
                startIcon={<DeleteIcon />}
                disabled={processing}
              >
                Delete Transaction
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
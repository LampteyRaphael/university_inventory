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
  Paper,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Rating,
  Link,
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
  Business as SupplierIcon,
  Home as HomeIcon,
  Person as ContactPersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  AccountBalance as TaxIcon,
  CreditCard as CreditLimitIcon,
  Star as RatingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as NotApprovedIcon,
  Visibility as ViewIcon,
  CheckCircle,
  Search,
} from "@mui/icons-material";

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

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`supplier-tabpanel-${index}`}
      aria-labelledby={`supplier-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Suppliers({ suppliers, auth, universities }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [formErrors, setFormErrors] = useState({});
  const [tabValue, setTabValue] = useState(0);

  // Supplier types
  const supplierTypes = [
    { value: 'manufacturer', label: 'Manufacturer', color: 'primary' },
    { value: 'distributor', label: 'Distributor', color: 'secondary' },
    { value: 'wholesaler', label: 'Wholesaler', color: 'info' },
    { value: 'retailer', label: 'Retailer', color: 'success' },
    { value: 'service', label: 'Service', color: 'warning' },
  ];

  // Countries list (abbreviated for example)
  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'JP', label: 'Japan' },
    { value: 'AU', label: 'Australia' },
  ];

  // Form structure
  const emptyForm = {
    university_id: auth.user?.university_id || "",
    supplier_code: "",
    legal_name: "",
    trade_name: "",
    supplier_type: "distributor",
    contact_person: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "US",
    postal_code: "",
    tax_id: "",
    vat_number: "",
    credit_limit: 0,
    payment_terms_days: 30,
    rating: 0,
    delivery_reliability: 0,
    quality_rating: 0,
    certifications: [],
    is_approved: false,
    approval_date: "",
    next_evaluation_date: "",
    is_active: true,
    notes: "",
    approved_by: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    
    // Simulate data processing
    const processData = setTimeout(() => {
      const formatted = (suppliers || []).map((supplier, index) => ({
        id: supplier?.supplier_id ?? index + 1,
        ...supplier,
        credit_limit: Number(supplier?.credit_limit ?? 0),
        rating: Number(supplier?.rating ?? 0),
        delivery_reliability: Number(supplier?.delivery_reliability ?? 0),
        quality_rating: Number(supplier?.quality_rating ?? 0),
        payment_terms_days: Number(supplier?.payment_terms_days ?? 30),
        approval_date: supplier?.approval_date ? 
          moment(supplier.approval_date).format("MMM Do YYYY") : "",
        next_evaluation_date: supplier?.next_evaluation_date ? 
          moment(supplier.next_evaluation_date).format("MMM Do YYYY") : "",
        created_at: supplier?.created_at ? 
          moment(supplier.created_at).format("MMM Do YYYY, h:mm a") : "",
        updated_at: supplier?.updated_at ? 
          moment(supplier.updated_at).format("MMM Do YYYY, h:mm a") : "",
      }));
      
      setRows(formatted);
      setGridLoading(false);
    }, 800);

    return () => clearTimeout(processData);
  }, [suppliers]);

  // Calculate summary statistics
  const { totalSuppliers, approvedSuppliers, activeSuppliers, highRatedSuppliers } = useMemo(() => {
    const total = rows.length;
    const approved = rows.filter(row => row.is_approved).length;
    const active = rows.filter(row => row.is_active).length;
    const highRated = rows.filter(row => row.rating >= 4).length;
    
    return {
      totalSuppliers: total,
      approvedSuppliers: approved,
      activeSuppliers: active,
      highRatedSuppliers: highRated,
    };
  }, [rows]);

  // Column definitions
  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'supplier_code', 
      headerName: 'Supplier Code', 
      width: 130,
    },
    { 
      field: 'legal_name', 
      headerName: 'Legal Name', 
      width: 180,
    },
    { 
      field: 'trade_name', 
      headerName: 'Trade Name', 
      width: 150,
      renderCell: (params) => params.value || '-'
    },
    { 
      field: 'supplier_type', 
      headerName: 'Type', 
      width: 120,
      renderCell: (params) => {
        const type = supplierTypes.find(t => t.value === params.value);
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
      field: 'contact_person', 
      headerName: 'Contact Person', 
      width: 150,
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 180,
      renderCell: (params) => (
        <Link href={`mailto:${params.value}`} underline="hover">
          {params.value}
        </Link>
      )
    },
    { 
      field: 'phone', 
      headerName: 'Phone', 
      width: 130,
    },
    { 
      field: 'city', 
      headerName: 'City', 
      width: 120,
    },
    { 
      field: 'country', 
      headerName: 'Country', 
      width: 100,
    },
    { 
      field: 'credit_limit', 
      headerName: 'Credit Limit', 
      width: 120, 
      type: 'number',
      renderCell: (params) => `$${Number(params.value).toLocaleString()}`
    },
    { 
      field: 'rating', 
      headerName: 'Rating', 
      width: 140,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Rating value={params.value} size="small" readOnly />
          <Typography variant="body2" sx={{ ml: 1 }}>
            ({params.value.toFixed(1)})
          </Typography>
        </Box>
      )
    },
    { 
      field: 'is_approved', 
      headerName: 'Approved', 
      width: 100,
      type: 'boolean',
      renderCell: (params) => (
        params.value ? 
          <ApprovedIcon color="success" /> : 
          <NotApprovedIcon color="disabled" />
      )
    },
    { 
      field: 'is_active', 
      headerName: 'Active', 
      width: 80,
      type: 'boolean',
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Yes' : 'No'} 
          size="small" 
          color={params.value ? 'success' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
        />
      )
    },
    { 
      field: 'next_evaluation_date', 
      headerName: 'Next Evaluation', 
      width: 140,
      renderCell: (params) => params.value || '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="View"><ViewIcon fontSize="small" /></Tooltip>}
          label="View"
          onClick={() => handleView(params.row)}
        />,
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
  ], [universities, supplierTypes]);

  // Filter rows based on search text
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    
    const query = searchText.toLowerCase();
    return rows.filter(row => 
      row.supplier_code?.toLowerCase().includes(query) ||
      row.legal_name?.toLowerCase().includes(query) ||
      (row.trade_name || '').toLowerCase().includes(query) ||
      row.contact_person?.toLowerCase().includes(query) ||
      row.email?.toLowerCase().includes(query) ||
      row.city?.toLowerCase().includes(query)
    );
  }, [rows, searchText]);

  // Event handlers
  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows.map(row => ({
        'Supplier Code': row.supplier_code,
        'Legal Name': row.legal_name,
        'Trade Name': row.trade_name || '',
        'Type': supplierTypes.find(t => t.value === row.supplier_type)?.label || row.supplier_type,
        'University': universities.find(u => u.university_id === row.university_id)?.name || row.university_id,
        'Contact Person': row.contact_person,
        'Email': row.email,
        'Phone': row.phone,
        'Address': row.address,
        'City': row.city,
        'State': row.state,
        'Country': countries.find(c => c.value === row.country)?.label || row.country,
        'Postal Code': row.postal_code,
        'Tax ID': row.tax_id || '',
        'VAT Number': row.vat_number || '',
        'Credit Limit': row.credit_limit,
        'Payment Terms (Days)': row.payment_terms_days,
        'Rating': row.rating,
        'Delivery Reliability': `${row.delivery_reliability}%`,
        'Quality Rating': `${row.quality_rating}%`,
        'Approved': row.is_approved ? 'Yes' : 'No',
        'Active': row.is_active ? 'Yes' : 'No',
        'Approval Date': row.approval_date || '',
        'Next Evaluation': row.next_evaluation_date || '',
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');
    XLSX.writeFile(workbook, `suppliers_export_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
    setAlert({ open: true, message: 'Supplier data exported successfully', severity: 'success' });
  }, [filteredRows, universities, supplierTypes, countries]);

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
          supplier_id: `uploaded_${Date.now()}_${index}`,
          ...item,
          credit_limit: Number(item.credit_limit) || 0,
          rating: Number(item.rating) || 0,
          delivery_reliability: Number(item.delivery_reliability) || 0,
          quality_rating: Number(item.quality_rating) || 0,
          payment_terms_days: Number(item.payment_terms_days) || 30,
          is_approved: item.is_approved === 'Yes',
          is_active: item.is_active === 'Yes',
          created_at: moment().format("MMM Do YYYY, h:mm a"),
        }));
        
        setRows(prev => [...mappedData, ...prev]);
        setAlert({ open: true, message: `${mappedData.length} suppliers imported successfully`, severity: 'success' });
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
    setSelectedSupplier(null);
    setFormData({ 
      ...emptyForm, 
      university_id: auth.user?.university_id || "",
    });
    setFormErrors({});
    setTabValue(0);
    setOpenDialog(true);
  }, [auth, emptyForm]);

  const handleView = useCallback((row) => {
    setSelectedSupplier(row);
    setOpenViewDialog(true);
  }, []);

  const handleEdit = useCallback((row) => {
    setSelectedSupplier(row);
    setFormData({ 
      ...emptyForm, 
      ...row,
      approval_date: row.approval_date ? moment(row.approval_date).format('YYYY-MM-DD') : "",
      next_evaluation_date: row.next_evaluation_date ? moment(row.next_evaluation_date).format('YYYY-MM-DD') : "",
    });
    setFormErrors({});
    setTabValue(0);
    setOpenDialog(true);
  }, [emptyForm]);

  const handleDeleteClick = useCallback((row) => {
    setSelectedSupplier(row);
    setOpenDeleteDialog(true);
  }, []);


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
    
    if (!formData.supplier_code) errors.supplier_code = 'Supplier code is required';
    if (!formData.legal_name) errors.legal_name = 'Legal name is required';
    if (!formData.contact_person) errors.contact_person = 'Contact person is required';
    if (!formData.phone) errors.phone = 'Phone is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.country) errors.country = 'Country is required';
    if (!formData.postal_code) errors.postal_code = 'Postal code is required';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.credit_limit < 0) errors.credit_limit = 'Credit limit cannot be negative';
    if (formData.rating < 0 || formData.rating > 5) errors.rating = 'Rating must be between 0 and 5';
    if (formData.delivery_reliability < 0 || formData.delivery_reliability > 100) errors.delivery_reliability = 'Delivery reliability must be between 0 and 100';
    if (formData.quality_rating < 0 || formData.quality_rating > 100) errors.quality_rating = 'Quality rating must be between 0 and 100';
    
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
        id: selectedSupplier ? selectedSupplier.id : `supplier_${Date.now()}`,
        supplier_id: selectedSupplier ? selectedSupplier.supplier_id : `supplier_${Date.now()}`,
        created_at: selectedSupplier ? selectedSupplier.created_at : moment().format('MMM Do YYYY, h:mm a'),
        updated_at: moment().format('MMM Do YYYY, h:mm a'),
      };

      if (selectedSupplier) {
        setRows(prev => prev.map(r => r.id === selectedSupplier.id ? { ...r, ...payload } : r));
        setAlert({ open: true, message: 'Supplier updated successfully', severity: 'success' });
      } else {
        setRows(prev => [payload, ...prev]);
        setAlert({ open: true, message: 'Supplier created successfully', severity: 'success' });
      }

      setLoading(false);
      setOpenDialog(false);
      setSelectedSupplier(null);
    }, 500);
  }, [formData, selectedSupplier, validateForm]);

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
      title="Suppliers"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'Suppliers' }
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
            <Grid size={{ xs: 12, sm: 6, md:6 }}>
              <SummaryCard 
                title="Total Suppliers" 
                value={totalSuppliers} 
                icon={<SupplierIcon />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md:6 }}>
              <SummaryCard 
                title="Approved Suppliers" 
                value={approvedSuppliers} 
                icon={<ApprovedIcon />} 
                color={theme.palette.success.main} 
                subtitle={`${totalSuppliers ? Math.round((approvedSuppliers/totalSuppliers)*100) : 0}% of total`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md:6 }}>
              <SummaryCard 
                title="Active Suppliers" 
                value={activeSuppliers} 
                icon={<CheckCircle />} 
                color={theme.palette.info.main} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md:6 }}>
              <SummaryCard 
                title="Highly Rated" 
                value={highRatedSuppliers} 
                icon={<RatingIcon />} 
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
            <Box 
            sx={{ 
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
                <SupplierIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Suppliers
                </Typography>
                {searchText && (
                  <Chip 
                    label={`${filteredRows.length} of ${rows.length} suppliers`} 
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
                  placeholder="Search suppliers..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{ 
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
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
                  New Supplier
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
                {selectedSupplier ? (
                  <>
                    <EditIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Edit Supplier</Typography>
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Create Supplier</Typography>
                  </>
                )}
              </Box>
              <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {loading && <LinearProgress />}
              
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
                <Tab label="Basic Info" />
                <Tab label="Financial Details" />
                <Tab label="Performance" />
                <Tab label="Additional Info" />
              </Tabs>
              
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  <Grid size={{ xs:12, sm:6 }}>
                    <TextField 
                      fullWidth 
                      label="Supplier Code *" 
                      name="supplier_code" 
                      value={formData.supplier_code} 
                      onChange={handleInputChange}
                      error={!!formErrors.supplier_code}
                      helperText={formErrors.supplier_code}
                    />
                  </Grid>
                  
                  <Grid size={{ xs:12, sm:6 }}>
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

                  <Grid size={{ xs:12, sm:6 }}>
                    <TextField 
                      fullWidth 
                      label="Legal Name *" 
                      name="legal_name" 
                      value={formData.legal_name} 
                      onChange={handleInputChange}
                      error={!!formErrors.legal_name}
                      helperText={formErrors.legal_name}
                    />
                  </Grid>

                  <Grid size={{ xs:12, sm:6 }}>
                    <TextField 
                      fullWidth 
                      label="Trade Name" 
                      name="trade_name" 
                      value={formData.trade_name} 
                      onChange={handleInputChange}
                    />
                  </Grid>

                  <Grid size={{ xs:12, sm:6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Supplier Type</InputLabel>
                      <Select 
                        name="supplier_type" 
                        value={formData.supplier_type} 
                        label="Supplier Type" 
                        onChange={handleInputChange}
                      >
                        {supplierTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs:12, sm:6 }}>
                    <TextField 
                      fullWidth 
                      label="Contact Person *" 
                      name="contact_person" 
                      value={formData.contact_person} 
                      onChange={handleInputChange}
                      error={!!formErrors.contact_person}
                      helperText={formErrors.contact_person}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ContactPersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs:12, sm:6 }}>
                    <TextField 
                      fullWidth 
                      label="Phone *" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs:12, sm:6 }}>
                    <TextField 
                      fullWidth 
                      label="Email *" 
                      name="email" 
                      type="email"
                      value={formData.email} 
                      onChange={handleInputChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs:12, sm:6 }}>
                    <TextField 
                      fullWidth 
                      label="Website" 
                      name="website" 
                      value={formData.website} 
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WebsiteIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  <Grid size={{ xs:12, sm:6 }}>
                    <TextField 
                      fullWidth 
                      label="Credit Limit" 
                      name="credit_limit" 
                      type="number"
                      value={formData.credit_limit} 
                      onChange={handleInputChange}
                      error={!!formErrors.credit_limit}
                      helperText={formErrors.credit_limit}
                      InputProps={{ 
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditLimitIcon color="action" />
                          </InputAdornment>
                        ),
                        inputProps: { min: 0, step: 0.01 } 
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs:12, sm:6}}>
                    <TextField 
                      fullWidth 
                      label="Payment Terms (Days)" 
                      name="payment_terms_days" 
                      type="number"
                      value={formData.payment_terms_days} 
                      onChange={handleInputChange}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>

                  <Grid size={{ xs:12, sm:6}}>
                    <TextField 
                      fullWidth 
                      label="Tax ID" 
                      name="tax_id" 
                      value={formData.tax_id} 
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TaxIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs:12, sm:6}}>
                    <TextField 
                      fullWidth 
                      label="VAT Number" 
                      name="vat_number" 
                      value={formData.vat_number} 
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Tab 3: Additional Info */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={2}>
                {/* Rating */}
                <Grid size={{ xs:12, sm:6}}>
                  <FormControl fullWidth>
                    <InputLabel>Rating</InputLabel>
                    <Select
                      name="rating"
                      value={formData.rating}
                      label="Rating"
                      onChange={handleInputChange}
                      error={!!formErrors.rating}
                    >
                      {[0, 1, 2, 3, 4, 5].map((rating) => (
                        <MenuItem key={rating} value={rating}>
                          <Box display="flex" alignItems="center">
                            <Rating value={rating} readOnly size="small" />
                            <Typography
                              variant="body2"
                              sx={{ ml: 1 }}
                            >
                              {rating}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.rating && (
                      <Typography variant="caption" color="error">
                        {formErrors.rating}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Payment Terms */}
                <Grid size={{ xs:12, sm:6}}>
                  <TextField
                    fullWidth
                    label="Payment Terms"
                    name="payment_terms"
                    value={formData.payment_terms}
                    onChange={handleInputChange}
                    error={!!formErrors.payment_terms}
                    helperText={formErrors.payment_terms}
                  />
                </Grid>

                {/* Notes */}
                <Grid size={{ xs:12, sm:12 }}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    error={!!formErrors.notes}
                    helperText={formErrors.notes}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Actions */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <Button onClick={() => setOpenDialog(false)} variant="outlined" color="secondary">
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Save
              </Button>
            </Box>
            </DialogContent>
            </Dialog>
            </Box>
            </Fade>
    </AuthenticatedLayout>
  );
};

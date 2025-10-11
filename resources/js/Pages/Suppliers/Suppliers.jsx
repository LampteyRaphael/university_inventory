import React, { useEffect, useState, useMemo } from "react";
import { useForm, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  Box,
  Chip,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Slide,
  Fade,
  Tooltip,
  LinearProgress,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  Rating,
  Link,
  CircularProgress,
} from "@mui/material";
import {
  GridActionsCellItem,
} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import moment from "moment";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
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
  AccountBalanceWallet,
} from "@mui/icons-material";
import Notification from "@/Components/Notification";
import EnhancedDataGrid from "@/Components/EnhancedDataGrid";
import SummaryCard from "@/Components/SummaryCard";
import formatNumber from "../Service/FormatNumber";



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
  const { props } = usePage();
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  
  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [gridLoading, setGridLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const { flash } = usePage().props;
  // Inertia Form Hook for Create/Edit
  const { data, setData, post, put, delete: destroy, processing, errors, reset, wasSuccessful } = useForm({
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
  });

  // Alert state from flash messages
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

  // Supplier types
  const supplierTypes = [
    { value: 'manufacturer', label: 'Manufacturer', color: 'primary' },
    { value: 'distributor', label: 'Distributor', color: 'secondary' },
    { value: 'wholesaler', label: 'Wholesaler', color: 'info' },
    { value: 'retailer', label: 'Retailer', color: 'success' },
    { value: 'service', label: 'Service', color: 'warning' },
  ];

  // Countries list
  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'JP', label: 'Japan' },
    { value: 'AU', label: 'Australia' },
  ];

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    
    const processData = setTimeout(() => {
      const formatted = suppliers?.map((supplier, index) => ({
        id: supplier?.id ?? supplier?.supplier_id ?? index + 1,
        ...supplier,
        credit_limit: Number(supplier?.credit_limit ?? 0),
        rating: Number(supplier?.rating ?? 0),
        delivery_reliability: Number(supplier?.delivery_reliability ?? 0),
        quality_rating: Number(supplier?.quality_rating ?? 0),
        payment_terms_days: Number(supplier?.payment_terms_days ?? 30),
        approval_date: supplier?.approval_date ??"",
          // moment(supplier.approval_date).format("MMM Do YYYY") : "",
        next_evaluation_date: supplier?.next_evaluation_date ??"", 
          // moment(supplier.next_evaluation_date).format("MMM Do YYYY") : "",
        created_at: supplier?.created_at ? 
          moment(supplier.created_at).format("MMM Do YYYY, h:mm a") : "",
        updated_at: supplier?.updated_at ? 
          moment(supplier.updated_at).format("MMM Do YYYY, h:mm a") : "",
      }));
      
      setRows(formatted);
      setGridLoading(false);
    }, 500);

    return () => clearTimeout(processData);
  }, [suppliers]);

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      setAlert({ open: true, message: flash.success, severity: "success" });
    } else if (flash?.error) {
      setAlert({ open: true, message: flash.error, severity: "error" });
    }
  }, [flash]);

  // Calculate advanced summary statistics
  const summaryData = useMemo(() => {
    const total = rows?.length;
    const approved = rows?.filter(row => row.is_approved).length;
    const active = rows?.filter(row => row.is_active).length;
    const highRated = rows?.filter(row => row.rating >= 4).length;
    
    // Advanced metrics
    const totalCreditLimit = rows?.reduce((sum, row) => sum + (row.credit_limit || 0), 0);
    const averageRating = total > 0 
      ? rows.reduce((sum, row) => sum + (row.rating || 0), 0) / total 
      : 0;
    
    const approvalRate = total > 0 ? (approved / total * 100) : 0;
    const activeRate = total > 0 ? (active / total * 100) : 0;

    return {
      totalSuppliers: total,
      approvedSuppliers: approved,
      activeSuppliers: active,
      highRatedSuppliers: highRated,
      totalCreditLimit,
      averageRating: averageRating.toFixed(1),
      approvalRate: approvalRate.toFixed(1),
      activeRate: activeRate.toFixed(1),
      creditUtilization: Math.min((totalCreditLimit / 1000000) * 100, 100) // Assuming 1M max
    };
  }, [rows]);


const columns = useMemo(() => [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 70,
    renderCell: (params) => (
      <Tooltip title={params.value} placement="top">
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value.slice(0, 4)}...
        </Typography>
      </Tooltip>
    )
  },
  { 
    field: 'supplier_info', 
    headerName: 'Supplier Info', 
    width: 200,
    renderCell: (params) => (
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {params.row.supplier_code}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.row.legal_name}
        </Typography>
        {params.row.trade_name && (
          <Typography variant="caption" color="text.secondary">
            Trade: {params.row.trade_name}
          </Typography>
        )}
      </Box>
    )
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
          variant="filled"
          sx={{ fontWeight: 500 }}
        />
      );
    }
  },
  { 
    field: 'university_contact', 
    headerName: 'University & Contact', 
    width: 220,
    renderCell: (params) => {
      const university = universities?.find(u => u.university_id === params.row.university_id);
      return (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
            {university?.name || params.row.university_id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {params.row.contact_person}
          </Typography>
        </Box>
      );
    }
  },
  { 
    field: 'contact_info', 
    headerName: 'Contact Info', 
    width: 180,
    renderCell: (params) => (
      <Box>
        <Link href={`mailto:${params.row.email}`} underline="hover" variant="body2">
          {params.row.email}
        </Link>
        <Typography variant="body2" color="text.secondary">
          {params.row.phone}
        </Typography>
      </Box>
    )
  },
  { 
    field: 'location', 
    headerName: 'Location', 
    width: 140,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2">
          {params.row.city}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {params.row.country}
        </Typography>
      </Box>
    )
  },
  { 
    field: 'financial_status', 
    headerName: 'Financial Status', 
    width: 170,
    renderCell: (params) => (
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          ${Number(params.row.credit_limit).toLocaleString()}
        </Typography>
        <Box display="flex">
          <Rating value={params.row.rating} size="small" readOnly />
          <Typography variant="caption">
            {params.row.rating.toFixed(1)}
          </Typography>
        </Box>
      </Box>
    )
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 120,
    renderCell: (params) => (
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ mb: 1 }}>
          {params.row.is_approved ? 
            <Tooltip title="Approved">
              <ApprovedIcon color="success" />
            </Tooltip> : 
            <Tooltip title="Not Approved">
              <NotApprovedIcon color="disabled" />
            </Tooltip>
          }
        </Box>
        <Chip 
          label={params.row.is_active ? 'Active' : 'Inactive'} 
          size="small" 
          color={params.row.is_active ? 'success' : 'default'}
          variant="filled"
          sx={{ fontWeight: 500, fontSize: '0.7rem' }}
        />
      </Box>
    )
  },
  { 
    field: 'dates', 
    headerName: 'Dates', 
    width: 150,
    renderCell: (params) => (
      <Box>
        {params.row.next_evaluation_date ? (
          <Tooltip title={`Next evaluation: ${params.row.next_evaluation_date}`}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Eval: {params.row.next_evaluation_date||""}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No eval scheduled
          </Typography>
        )}
        {/* You can add created_at/updated_at here if available */}
        <Typography variant="caption" color="text.secondary">
          Updated: {params.row.updated_at || ""}
        </Typography>
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
        icon={<Tooltip title="View"><ViewIcon fontSize="small" /></Tooltip>}
        label="View"
        onClick={() => handleView(params.row)}
        sx={{ color: 'primary.main' }}
      />,
      <GridActionsCellItem
        icon={<Tooltip title="Edit"><EditIcon fontSize="small" /></Tooltip>}
        label="Edit"
        onClick={() => handleEdit(params.row)}
        sx={{ color: 'warning.main' }}
      />,
      <GridActionsCellItem
        icon={<Tooltip title="Delete"><DeleteIcon fontSize="small" /></Tooltip>}
        label="Delete"
        onClick={() => handleDeleteClick(params.row)}
        sx={{ color: 'error.main' }}
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

  // Event handlers with Inertia integration
  const handleCreate = () => {
    setSelectedSupplier(null);
    reset();
    setData('university_id', auth.user?.university_id || "");
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleEdit = (row) => {
    setSelectedSupplier(row);
    // Populate form with existing data
    Object.keys(data).forEach(key => {
      if (row[key] !== undefined) {
        setData(key, row[key]);
      }
    });
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleView = (row) => {
    setSelectedSupplier(row);
    setOpenViewDialog(true);
  };

  const handleDeleteClick = (row) => {
    setSelectedSupplier(row);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedSupplier) {
      destroy(route('suppliers.destroy', selectedSupplier.id), {
        preserveScroll: true,
        onSuccess: () => {
          setOpenDeleteDialog(false);
          setSelectedSupplier(null);
        }
      });
    }
  };

  const handleSubmit = () => {
    if (selectedSupplier) {
      // Update existing supplier
      put(route('suppliers.update', selectedSupplier.id), {
        preserveScroll: true,
        onSuccess: () => {
          setOpenDialog(false);
          setSelectedSupplier(null);
          reset();
        }
      });
    } else {
      // Create new supplier
      post(route('suppliers.store'), {
        preserveScroll: true,
        onSuccess: () => {
          setOpenDialog(false);
          reset();
        }
      });
    }
  };

  const handleRefresh = () => {
    setGridLoading(true);
    // Inertia will automatically refetch the data
    window.location.reload();
  };

  const handleExport = () => {
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
  };

  const handleUpload = (event) => {
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
        
        // Here you would typically send this to your backend for processing
        // console.log('Uploaded data:', uploadedData);
        setAlert({ open: true, message: `${uploadedData.length} suppliers ready for import`, severity: 'success' });
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
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

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
          <Notification 
            open={alert.open} 
            severity={alert.severity} 
            message={alert.message}
            onClose={handleCloseAlert}
          />

          {/* Advanced Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Total Suppliers"
                value={summaryData?.totalSuppliers || 0}
                change={"+" + formatNumber(summaryData?.totalSuppliers??0)}
                icon={<SupplierIcon />}
                color={theme.palette.primary.main}
                subtitle="All registered suppliers"
              />
            </Grid>
            
             <Grid size={{ xs: 12, sm: 6, md:3 }}>
              <SummaryCard 
                title="Approval Rate"
                value={`${summaryData.approvalRate}%`}
                icon={<ApprovedIcon />}
                color={theme.palette.success.main}
                subtitle={`${summaryData.approvedSuppliers} approved`}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Avg Rating"
                value={summaryData.averageRating}
                // change={"+"+formatNumber(summaryData?.averageRating??0)}
                icon={<RatingIcon />}
                color={theme.palette.warning.main}
                subtitle="Out of 5.0"
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Credit Limit"
                value={`₵${(formatNumber(summaryData?.totalCreditLimit??0))}`}
                change={"+" + formatNumber(summaryData?.totalCreditLimit??0)}
                icon={<AccountBalanceWallet />}
                color={theme.palette.info.main}
                subtitle="Total allocated"
                progress={summaryData.creditUtilization}
              />
            </Grid>
          </Grid>

          {/* Data Grid Section */}

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
            title="Supplier Management"
            subtitle="Manage your supplier database efficiently"
            icon={<SupplierIcon />}
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
            onClose={() => !processing && setOpenDialog(false)} 
            maxWidth="md" 
            fullWidth 
            TransitionComponent={Slide}
            transitionDuration={300}
            fullScreen={isMobile}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              py: 3
            }}>
              <Box display="flex" alignItems="center">
                {selectedSupplier ? (
                  <>
                    <EditIcon sx={{ mr: 2 }} />
                    <Typography variant="h5">Edit Supplier</Typography>
                  </>
                ) : (
                  <>
                    <AddIcon sx={{ mr: 2 }} />
                    <Typography variant="h5">Create New Supplier</Typography>
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
            
            <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {processing && <LinearProgress />}
              
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                <Tab label="Basic Info" />
                <Tab label="Financial Details" />
                <Tab label="Performance" />
                <Tab label="Additional Info" />
              </Tabs>
              
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Supplier Code *" 
                      name="supplier_code" 
                      value={data.supplier_code} 
                      onChange={e => setData('supplier_code', e.target.value)}
                      error={!!errors.supplier_code}
                      helperText={errors.supplier_code}
                      disabled={processing}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!errors.university_id} disabled={processing}>
                      <InputLabel>University</InputLabel>
                      <Select 
                        name="university_id" 
                        value={data.university_id} 
                        label="University" 
                        onChange={e => setData('university_id', e.target.value)}
                      >
                        {universities?.map(university => (
                          <MenuItem key={university.university_id} value={university.university_id}>
                            {university.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Legal Name *" 
                      name="legal_name" 
                      value={data.legal_name} 
                      onChange={e => setData('legal_name', e.target.value)}
                      error={!!errors.legal_name}
                      helperText={errors.legal_name}
                      disabled={processing}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Trade Name" 
                      name="trade_name" 
                      value={data.trade_name} 
                      onChange={e => setData('trade_name', e.target.value)}
                      error={!!errors.trade_name}
                      helperText={errors.trade_name}
                      disabled={processing}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!errors.supplier_type} disabled={processing}>
                      <InputLabel>Supplier Type</InputLabel>
                      <Select 
                        name="supplier_type" 
                        value={data.supplier_type} 
                        label="Supplier Type" 
                        onChange={e => setData('supplier_type', e.target.value)}
                      >
                        {supplierTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Contact Person *" 
                      name="contact_person" 
                      value={data.contact_person} 
                      onChange={e => setData('contact_person', e.target.value)}
                      error={!!errors.contact_person}
                      helperText={errors.contact_person}
                      disabled={processing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ContactPersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Phone *" 
                      name="phone" 
                      value={data.phone} 
                      onChange={e => setData('phone', e.target.value)}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      disabled={processing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Email *" 
                      name="email" 
                      type="email"
                      value={data.email} 
                      onChange={e => setData('email', e.target.value)}
                      error={!!errors.email}
                      helperText={errors.email}
                      disabled={processing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Website" 
                      name="website" 
                      value={data.website} 
                      onChange={e => setData('website', e.target.value)}
                      error={!!errors.website}
                      helperText={errors.website}
                      disabled={processing}
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
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Credit Limit" 
                      name="credit_limit" 
                      type="number"
                      value={data.credit_limit} 
                      onChange={e => setData('credit_limit', parseFloat(e.target.value))}
                      error={!!errors.credit_limit}
                      helperText={errors.credit_limit}
                      disabled={processing}
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

                  <Grid size={{ xs: 12, sm: 6}}>
                    <TextField 
                      fullWidth 
                      label="Payment Terms (Days)" 
                      name="payment_terms_days" 
                      type="number"
                      value={data.payment_terms_days} 
                      onChange={e => setData('payment_terms_days', parseInt(e.target.value))}
                      error={!!errors.payment_terms_days}
                      helperText={errors.payment_terms_days}
                      disabled={processing}
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6}}>
                    <TextField 
                      fullWidth 
                      label="Tax ID" 
                      name="tax_id" 
                      value={data.tax_id} 
                      onChange={e => setData('tax_id', e.target.value)}
                      error={!!errors.tax_id}
                      helperText={errors.tax_id}
                      disabled={processing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TaxIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6}}>
                    <TextField 
                      fullWidth 
                      label="VAT Number" 
                      name="vat_number" 
                      value={data.vat_number} 
                      onChange={e => setData('vat_number', e.target.value)}
                      error={!!errors.vat_number}
                      helperText={errors.vat_number}
                      disabled={processing}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6}}>
                    <FormControl fullWidth error={!!errors.rating} disabled={processing}>
                      <InputLabel>Rating</InputLabel>
                      <Select
                        name="rating"
                        value={data.rating || 0}
                        label="Rating"
                        onChange={e => setData('rating', parseFloat(e.target.value))}
                      >
                        {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((rating) => (
                          <MenuItem key={rating} value={rating}>
                            <Box display="flex" alignItems="center">
                              <Rating value={rating} readOnly size="small" />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {rating}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Delivery Reliability %"
                      name="delivery_reliability"
                      type="number"
                      value={data.delivery_reliability}
                      onChange={e => setData('delivery_reliability', parseFloat(e.target.value))}
                      error={!!errors.delivery_reliability}
                      helperText={errors.delivery_reliability}
                      disabled={processing}
                      InputProps={{ inputProps: { min: 0, max: 100 } }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6}}>
                    <TextField
                      fullWidth
                      label="Quality Rating %"
                      name="quality_rating"
                      type="number"
                      value={data.quality_rating}
                      onChange={e => setData('quality_rating', parseFloat(e.target.value))}
                      error={!!errors.quality_rating}
                      helperText={errors.quality_rating}
                      disabled={processing}
                      InputProps={{ inputProps: { min: 0, max: 100 } }}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!errors.is_approved} disabled={processing}>
                      <InputLabel>Approval Status</InputLabel>
                      <Select
                        name="is_approved"
                        value={data.is_approved}
                        label="Approval Status"
                        onChange={e => setData('is_approved', e.target.value === 'true')}
                      >
                        <MenuItem value={true}>Approved</MenuItem>
                        <MenuItem value={false}>Not Approved</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!errors.is_active} disabled={processing}>
                      <InputLabel>Active Status</InputLabel>
                      <Select
                        name="is_active"
                        value={data.is_active}
                        label="Active Status"
                        onChange={e => setData('is_active', e.target.value === 'true')}
                      >
                        <MenuItem value={true}>Active</MenuItem>
                        <MenuItem value={false}>Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Approval Date"
                      name="approval_date"
                      type="date"
                      value={moment(data.approval_date).format("YYYY-MM-DD")}
                      onChange={e => setData('approval_date', e.target.value)}
                      error={!!errors.approval_date}
                      helperText={errors.approval_date}
                      disabled={processing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Next Evaluation Date"
                      name="next_evaluation_date"
                      type="date"
                      value={ moment(data.next_evaluation_date).format("YYYY-MM-DD")}
                      onChange={e => setData('next_evaluation_date', e.target.value)}
                      error={!!errors.next_evaluation_date}
                      helperText={errors.next_evaluation_date}
                      disabled={processing}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Notes"
                      name="notes"
                      value={data.notes}
                      onChange={e => setData('notes', e.target.value)}
                      error={!!errors.notes}
                      helperText={errors.notes}
                      disabled={processing}
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Actions */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                <Button 
                  onClick={() => setOpenDialog(false)} 
                  variant="outlined" 
                  color="secondary"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={processing}
                  startIcon={processing ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    minWidth: 120
                  }}
                >
                  {processing ? 'Saving...' : (selectedSupplier ? 'Update' : 'Create')}
                </Button>
              </Box>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Typography variant="h6" fontWeight={600}>
                Confirm Deletion
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete supplier "{selectedSupplier?.legal_name}"? 
                This action cannot be undone.
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                <Button 
                  onClick={() => setOpenDeleteDialog(false)} 
                  variant="outlined"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteConfirm}
                  disabled={processing}
                  startIcon={processing ? <CircularProgress size={20} /> : <DeleteIcon />}
                >
                  {processing ? 'Deleting...' : 'Delete'}
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
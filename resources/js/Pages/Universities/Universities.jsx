// import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import {
//   Box,
//   Chip,
//   Typography,
//   TextField,
//   Button,
//   Stack,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   Card,
//   CardContent,
//   Grid,
//   IconButton,
//   Slide,
//   Fade,
//   Tooltip,
//   Avatar,
//   LinearProgress,
//   InputAdornment,
//   FormHelperText,
//   Switch,
//   FormControlLabel,
//   Paper,
//   useTheme,
//   useMediaQuery,
//   alpha,
// } from "@mui/material";
// import {
//   DataGrid,
//   GridToolbarContainer,
//   GridToolbarExport,
//   GridToolbarColumnsButton,
//   GridToolbarFilterButton,
//   GridActionsCellItem,
// } from "@mui/x-data-grid";
// import * as XLSX from "xlsx";
// import moment from "moment";
// import {
//   UploadFile as UploadFileIcon,
//   Add as AddIcon,
//   Save as SaveIcon,
//   Close as CloseIcon,
//   Delete as DeleteIcon,
//   Edit as EditIcon,
//   Refresh as RefreshIcon,
//   AccountBalance as UniversityIcon,
//   Search as SearchIcon,
//   Home as HomeIcon,
//   Email as EmailIcon,
//   Phone as PhoneIcon,
//   Language as WebsiteIcon,
//   CalendarToday as CalendarIcon,
//   Image as ImageIcon,
//   Settings as SettingsIcon,
//   CheckCircle as ActiveIcon,
//   Cancel as InactiveIcon,
//   LocationOn as LocationIcon,
//   Public as CountryIcon,
//   Map as CityIcon,
//   CorporateFare as BuildingIcon,
//   CloudUpload as ImportIcon,
//   CloudDownload as ExportIcon,
//   FilterList as FilterIcon,
// } from "@mui/icons-material";

// // Custom components
// // const SummaryCard = ({ title, value, icon, color, subtitle }) => (
// //   <Card sx={{ 
// //     borderRadius: 2, 
// //     p: 2, 
// //     boxShadow: 3, 
// //     transition: 'transform 0.2s, box-shadow 0.2s',
// //     '&:hover': {
// //       transform: 'translateY(-4px)',
// //       boxShadow: 6,
// //     }
// //   }}>
// //     <CardContent>
// //       <Stack direction="row" justifyContent="space-between" alignItems="center">
// //         <Box>
// //           <Typography variant="h4" fontWeight={700} color={color}>
// //             {value}
// //           </Typography>
// //           <Typography variant="body2" color="text.secondary">
// //             {title}
// //           </Typography>
// //           {subtitle && (
// //             <Typography variant="caption" color="text.secondary">
// //               {subtitle}
// //             </Typography>
// //           )}
// //         </Box>
// //         <Avatar sx={{ bgcolor: `${color}08`, color }}>
// //           {icon}
// //         </Avatar>
// //       </Stack>
// //     </CardContent>
// //   </Card>
// // );

// // Custom Modern Components
// const ModernCard = ({ children, sx = {} }) => (
//   <Card sx={{
//     borderRadius: 3,
//     p: 2,
//     background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
//     boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//     border: '1px solid rgba(0,0,0,0.04)',
//     transition: 'all 0.3s ease',
//     '&:hover': {
//       transform: 'translateY(-2px)',
//       boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
//     },
//     ...sx
//   }}>
//     {children}
//   </Card>
// ); 

// const SummaryCard = ({ title, value, icon, color, subtitle }) => (
//   <ModernCard>
//     <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
//       <Stack direction="row" justifyContent="space-between" alignItems="center">
//         <Box>
//           <Typography variant="h4" fontWeight={800} color={color} sx={{ mb: 0.5 }}>
//             {value}
//           </Typography>
//           <Typography variant="body2" color="text.secondary" fontWeight={600}>
//             {title}
//           </Typography>
//           {subtitle && (
//             <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
//               {subtitle}
//             </Typography>
//           )}
//         </Box>
//         <Avatar sx={{ 
//           bgcolor: alpha(color, 0.1), 
//           color: color,
//           width: 48,
//           height: 48
//         }}>
//           {icon}
//         </Avatar>
//       </Stack>
//     </CardContent>
//   </ModernCard>
// );

// // Custom Toolbar Component
// const CustomToolbar = ({ onCreate, onImport, onExport, onRefresh }) => (
//   <GridToolbarContainer sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
//     <Button 
//       variant="contained" 
//       startIcon={<AddIcon />} 
//       onClick={onCreate}
//       size="small"
//     >
//       Add University
//     </Button>
//     <Button 
//       variant="outlined" 
//       startIcon={<ImportIcon />} 
//       onClick={onImport}
//       size="small"
//     >
//       Import
//     </Button>
//     <GridToolbarExport 
//       printOptions={{ disableToolbarButton: true }}
//       slotProps={{ tooltip: { title: 'Export to Excel' } }}
//     />
//     <GridToolbarColumnsButton />
//     <GridToolbarFilterButton />
//     <Box sx={{ flexGrow: 1 }} />
//     <Button 
//       variant="outlined" 
//       startIcon={<RefreshIcon />} 
//       onClick={onRefresh}
//       size="small"
//     >
//       Refresh
//     </Button>
//   </GridToolbarContainer>
// );

// export default function Universities({ universities = [], auth, departments = [] }) {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
//   // State management
//   const [rows, setRows] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [openDialog, setOpenDialog] = useState(false);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [selectedUniversity, setSelectedUniversity] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [gridLoading, setGridLoading] = useState(true);
//   const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
//   const [formErrors, setFormErrors] = useState({});
//   const fileInputRef = useRef(null);

//   // Form structure
//   const emptyForm = {
//     university_id: "",
//     name: "",
//     code: "",
//     address: "",
//     city: "",
//     state: "",
//     country: "",
//     postal_code: "",
//     contact_number: "",
//     email: "",
//     website: "",
//     established_date: "",
//     logo_url: "",
//     settings: null,
//     is_active: true,
//   };

//   const [formData, setFormData] = useState(emptyForm);

//   // Process data on component mount
//   useEffect(() => {
//     setGridLoading(true);
    
//     const processData = setTimeout(() => {
//       const formatted = (universities || []).map((uni, index) => ({
//         id: uni?.university_id ?? index + 1,
//         ...uni,
//         established_date: uni?.established_date ? 
//           moment(uni.established_date).format("YYYY-MM-DD") : "",
//         created_at: uni?.created_at ? 
//           moment(uni.created_at).format("MMM Do YYYY, h:mm a") : "",
//         updated_at: uni?.updated_at ? 
//           moment(uni.updated_at).format("MMM Do YYYY, h:mm a") : "",
//         deleted_at: uni?.deleted_at ? 
//           moment(uni.deleted_at).format("MMM Do YYYY, h:mm a") : null,
//         departments_count: departments.filter(dept => dept.university_id === uni.university_id).length,
//         age_years: uni?.established_date ? 
//           moment().diff(moment(uni.established_date), 'years') : 0,
//       }));
      
//       setRows(formatted);
//       setGridLoading(false);
//     }, 800);
//      setGridLoading(false);
//     return () => clearTimeout(processData);
//   }, [universities, departments]);

//   // Calculate summary statistics
//   const { totalUniversities, activeUniversities, totalDepartments, averageAge } = useMemo(() => {
//     const total = rows.length;
//     const active = rows.filter(row => row.is_active).length;
//     const totalDepts = rows.reduce((sum, row) => sum + (row.departments_count || 0), 0);
//     const avgAge = rows.length > 0 ? 
//       rows.reduce((sum, row) => sum + (row.age_years || 0), 0) / rows.length : 0;
    
//     return {
//       totalUniversities: total,
//       activeUniversities: active,
//       totalDepartments: totalDepts,
//       averageAge: avgAge,
//     };
//   }, [rows]);

//   // Column definitions
//   const columns = useMemo(() => [
//     { 
//       field: 'logo', 
//       headerName: 'Logo', 
//       width: 80,
//       renderCell: (params) => (
//         <Avatar
//           src={params.row.logo_url}
//           sx={{ width: 40, height: 40 }}
//           alt={params.row.name}
//         >
//           <UniversityIcon />
//         </Avatar>
//       ),
//       sortable: false,
//       filterable: false,
//     },
//     { 
//       field: 'name', 
//       headerName: 'University Name', 
//       flex: 2,
//       minWidth: 200,
//     },
//     { 
//       field: 'code', 
//       headerName: 'Code', 
//       width: 100,
//       renderCell: (params) => (
//         <Chip 
//           label={params.value} 
//           size="small" 
//           variant="outlined"
//           color="primary"
//         />
//       )
//     },
//     { 
//       field: 'city', 
//       headerName: 'City', 
//       width: 120,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <CityIcon fontSize="small" color="action" />
//           {params.value}
//         </Box>
//       )
//     },
//     { 
//       field: 'state', 
//       headerName: 'State', 
//       width: 80,
//     },
//     { 
//       field: 'country', 
//       headerName: 'Country', 
//       width: 100,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <CountryIcon fontSize="small" color="action" />
//           {params.value}
//         </Box>
//       )
//     },
//     { 
//       field: 'contact_number', 
//       headerName: 'Contact', 
//       width: 140,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <PhoneIcon fontSize="small" color="action" />
//           {params.value}
//         </Box>
//       )
//     },
//     { 
//       field: 'email', 
//       headerName: 'Email', 
//       width: 200,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <EmailIcon fontSize="small" color="action" />
//           <Typography variant="body2" noWrap>
//             {params.value}
//           </Typography>
//         </Box>
//       )
//     },
//     { 
//       field: 'established_date', 
//       headerName: 'Established', 
//       width: 120,
//       valueFormatter: (params) => moment(params.value).format("YYYY"),
//     },
//     { 
//       field: 'age_years', 
//       headerName: 'Age', 
//       width: 80,
//       renderCell: (params) => (
//         <Chip 
//           label={`${params.value}y`} 
//           size="small" 
//           variant="outlined"
//         />
//       )
//     },
//     { 
//       field: 'departments_count', 
//       headerName: 'Depts', 
//       width: 80,
//       renderCell: (params) => (
//         <Chip 
//           label={params.value} 
//           size="small" 
//           color="secondary"
//           variant="outlined"
//         />
//       )
//     },
//     { 
//       field: 'is_active', 
//       headerName: 'Status', 
//       width: 110, 
//       renderCell: (params) => (
//         params.value ? 
//           <Chip icon={<ActiveIcon />} label="ACTIVE" color="success" size="small" /> : 
//           <Chip icon={<InactiveIcon />} label="INACTIVE" color="default" size="small" />
//       ) 
//     },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       width: 120,
//       sortable: false,
//       filterable: false,
//       type: 'actions',
//       getActions: (params) => [
//         <GridActionsCellItem
//           icon={<Tooltip title="Edit"><EditIcon fontSize="small" /></Tooltip>}
//           label="Edit"
//           onClick={() => handleEdit(params.row)}
//         />,
//         <GridActionsCellItem
//           icon={<Tooltip title="Delete"><DeleteIcon fontSize="small" /></Tooltip>}
//           label="Delete"
//           onClick={() => handleDeleteClick(params.row)}
//           color="error"
//         />,
//       ],
//     },
//   ], [isMobile]);

//   // Filter rows based on search text and status
//   const filteredRows = useMemo(() => {
//     let filtered = rows;
    
//     if (searchText) {
//       const query = searchText.toLowerCase();
//       filtered = filtered.filter(row => 
//         row.name?.toLowerCase().includes(query) ||
//         row.code?.toLowerCase().includes(query) ||
//         row.city?.toLowerCase().includes(query) ||
//         row.state?.toLowerCase().includes(query) ||
//         row.country?.toLowerCase().includes(query) ||
//         row.email?.toLowerCase().includes(query)
//       );
//     }
    
//     if (statusFilter !== "all") {
//       filtered = filtered.filter(row => 
//         statusFilter === "active" ? row.is_active : !row.is_active
//       );
//     }
    
//     return filtered;
//   }, [rows, searchText, statusFilter]);

//   // Event handlers
//   const handleExport = useCallback(() => {
//     const worksheet = XLSX.utils.json_to_sheet(
//       filteredRows.map(row => ({
//         'University Code': row.code,
//         'Name': row.name,
//         'Address': row.address,
//         'City': row.city,
//         'State': row.state,
//         'Country': row.country,
//         'Postal Code': row.postal_code,
//         'Contact Number': row.contact_number,
//         'Email': row.email,
//         'Website': row.website,
//         'Established Date': moment(row.established_date).format('YYYY-MM-DD'),
//         'Age (Years)': row.age_years,
//         'Departments Count': row.departments_count,
//         'Status': row.is_active ? 'Active' : 'Inactive',
//         'Logo URL': row.logo_url,
//       }))
//     );
    
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Universities');
//     XLSX.writeFile(workbook, `universities_export_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
//     setAlert({ open: true, message: 'University data exported successfully', severity: 'success' });
//   }, [filteredRows]);

//   const handleUpload = useCallback((event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
    
//     setGridLoading(true);
//     const reader = new FileReader();
    
//     reader.onload = (e) => {
//       try {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: 'array' });
//         const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//         const uploadedData = XLSX.utils.sheet_to_json(worksheet);
        
//         const mappedData = uploadedData.map((item, index) => ({
//           id: `uploaded_${Date.now()}_${index}`,
//           university_id: `uploaded_${Date.now()}_${index}`,
//           ...item,
//           established_date: item.established_date || moment().format('YYYY-MM-DD'),
//           is_active: item.status === 'Active',
//           departments_count: 0,
//           age_years: item.established_date ? 
//             moment().diff(moment(item.established_date), 'years') : 0,
//           created_at: moment().format("MMM Do YYYY, h:mm a"),
//         }));
        
//         setRows(prev => [...mappedData, ...prev]);
//         setAlert({ open: true, message: `${mappedData.length} universities imported successfully`, severity: 'success' });
//       } catch (error) {
//         setAlert({ open: true, message: 'Error processing file: ' + error.message, severity: 'error' });
//       } finally {
//         setGridLoading(false);
//       }
//     };
    
//     reader.onerror = () => {
//       setAlert({ open: true, message: 'Error reading file', severity: 'error' });
//       setGridLoading(false);
//     };
    
//     reader.readAsArrayBuffer(file);
//   }, []);

//   const handleCreate = useCallback(() => {
//     setSelectedUniversity(null);
//     setFormData(emptyForm);
//     setFormErrors({});
//     setOpenDialog(true);
//   }, [emptyForm]);

//   const handleEdit = useCallback((row) => {
//     setSelectedUniversity(row);
//     setFormData({ 
//       ...emptyForm,
//       ...row,
//       established_date: row.established_date ? moment(row.established_date).format('YYYY-MM-DD') : '',
//     });
//     setFormErrors({});
//     setOpenDialog(true);
//   }, [emptyForm]);

//   const handleDeleteClick = useCallback((row) => {
//     setSelectedUniversity(row);
//     setOpenDeleteDialog(true);
//   }, []);

//   const handleDeleteConfirm = useCallback(() => {
//     setGridLoading(true);
//     setTimeout(() => {
//       setRows(prev => prev.filter(r => r.id !== selectedUniversity.id));
//       setOpenDeleteDialog(false);
//       setAlert({ open: true, message: 'University deleted successfully', severity: 'success' });
//       setGridLoading(false);
//     }, 300);
//   }, [selectedUniversity]);

//   const handleInputChange = useCallback((event) => {
//     const { name, value, type, checked } = event.target;
//     const newValue = type === 'checkbox' ? checked : value;
    
//     setFormData(prev => ({ ...prev, [name]: newValue }));
    
//     if (formErrors[name]) {
//       setFormErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   }, [formErrors]);

//   const validateForm = useCallback(() => {
//     const errors = {};
    
//     if (!formData.name?.trim()) errors.name = 'University name is required';
//     if (!formData.code?.trim()) errors.code = 'University code is required';
//     if (!formData.address?.trim()) errors.address = 'Address is required';
//     if (!formData.city?.trim()) errors.city = 'City is required';
//     if (!formData.state?.trim()) errors.state = 'State is required';
//     if (!formData.country?.trim()) errors.country = 'Country is required';
//     if (!formData.postal_code?.trim()) errors.postal_code = 'Postal code is required';
//     if (!formData.contact_number?.trim()) errors.contact_number = 'Contact number is required';
//     if (!formData.email?.trim()) errors.email = 'Email is required';
    
//     if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
//       errors.email = 'Invalid email format';
//     }
    
//     if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
//       errors.website = 'Invalid website URL';
//     }
    
//     if (!formData.established_date) {
//       errors.established_date = 'Established date is required';
//     } else if (moment(formData.established_date).isAfter(moment())) {
//       errors.established_date = 'Established date cannot be in the future';
//     }
    
//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   }, [formData]);

//   const handleSubmit = useCallback(() => {
//     if (!validateForm()) return;
    
//     setLoading(true);
    
//     setTimeout(() => {
//       const payload = {
//         ...formData,
//         id: selectedUniversity ? selectedUniversity.id : `uni_${Date.now()}`,
//         university_id: selectedUniversity ? selectedUniversity.university_id : `uni_${Date.now()}`,
//         age_years: moment().diff(moment(formData.established_date), 'years'),
//         departments_count: selectedUniversity ? selectedUniversity.departments_count : 0,
//         created_at: selectedUniversity ? selectedUniversity.created_at : moment().format('MMM Do YYYY, h:mm a'),
//         updated_at: moment().format('MMM Do YYYY, h:mm a'),
//       };

//       if (selectedUniversity) {
//         setRows(prev => prev.map(r => r.id === selectedUniversity.id ? { ...r, ...payload } : r));
//         setAlert({ open: true, message: 'University updated successfully', severity: 'success' });
//       } else {
//         setRows(prev => [payload, ...prev]);
//         setAlert({ open: true, message: 'University created successfully', severity: 'success' });
//       }

//       setLoading(false);
//       setOpenDialog(false);
//     }, 500);
//   }, [formData, selectedUniversity, validateForm]);

//   const handleRefresh = useCallback(() => {
//     setGridLoading(true);
//     setTimeout(() => {
//       setGridLoading(false);
//       setAlert({ open: true, message: 'Data refreshed', severity: 'info' });
//     }, 800);
//   }, []);

//   const triggerFileInput = useCallback(() => {
//     fileInputRef.current?.click();
//   }, []);

//   return (
//     <AuthenticatedLayout
//       auth={auth}
//       title="University Management"
//       breadcrumbs={[
//         { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
//         { label: 'Universities' }
//       ]}
//     >
//       <Fade in timeout={500}>
//         <Box>
//           {alert.open && (
//             <Alert 
//               severity={alert.severity} 
//               onClose={() => setAlert(prev => ({...prev, open: false}))} 
//               sx={{ mb: 2 }}
//             >
//               {alert.message}
//             </Alert>
//           )}

//           {/* Summary Cards */}
//           <Grid container spacing={2} sx={{ mb: 3 }}>
//             <Grid size={{ xs:12, sm: 6}}>
//               <SummaryCard 
//                 title="Total Universities" 
//                 value={totalUniversities} 
//                 icon={<UniversityIcon />} 
//                 color={theme.palette.primary.main} 
//               />
//             </Grid>
//             <Grid size={{ xs:12, sm: 6}}>
//               <SummaryCard 
//                 title="Active Universities" 
//                 value={activeUniversities} 
//                 icon={<ActiveIcon />} 
//                 color={theme.palette.success.main} 
//                 subtitle={`${((activeUniversities / totalUniversities) * 100).toFixed(0)}% active`}
//               />
//             </Grid>
//             <Grid size={{ xs:12, sm: 6}}>
//               <SummaryCard 
//                 title="Total Departments" 
//                 value={totalDepartments} 
//                 icon={<BuildingIcon />} 
//                 color={theme.palette.info.main} 
//                 subtitle={`Avg: ${(totalDepartments / totalUniversities).toFixed(1)} per university`}
//               />
//             </Grid>
//             <Grid size={{ xs:12, sm: 6}}>
//               <SummaryCard 
//                 title="Average Age" 
//                 value={`${averageAge.toFixed(1)} years`} 
//                 icon={<CalendarIcon />} 
//                 color={theme.palette.warning.main} 
//               />
//             </Grid>
//           </Grid>

//           {/* Data Grid Section */}
//           <Paper
//             sx={{
//               height: "100%",
//               width: "100%",
//               borderRadius: 2,
//               overflow: 'hidden',
//               boxShadow: 3,
//             }}
//           >
//             <Box sx={{ 
//               display: 'flex', 
//               flexDirection: isMobile ? 'column' : 'row',
//               alignItems: 'center', 
//               justifyContent: 'space-between', 
//               p: 2, 
//               borderBottom: '1px solid', 
//               borderColor: 'divider',
//               gap: 2
//             }}>
//               <Stack direction="row" alignItems="center" spacing={1}>
//                 <UniversityIcon color="primary" />
//                 <Typography variant="h6" fontWeight={700}>
//                   Universities
//                 </Typography>
//                 {searchText && (
//                   <Chip 
//                     label={`${filteredRows.length} of ${rows.length} universities`} 
//                     size="small" 
//                     variant="outlined" 
//                   />
//                 )}
//               </Stack>

//               <Stack 
//                 direction={isMobile ? 'column' : 'row'} 
//                 spacing={1} 
//                 alignItems="center"
//                 width={isMobile ? '100%' : 'auto'}
//               >
//                 <TextField
//                   size="small"
//                   placeholder="Search universities..."
//                   value={searchText}
//                   onChange={(e) => setSearchText(e.target.value)}
//                   InputProps={{ 
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <SearchIcon />
//                       </InputAdornment>
//                     ),
//                     sx: { width: isMobile ? '100%' : 250 }
//                   }}
//                 />
//                 <FormControl size="small" sx={{ minWidth: 120 }}>
//                   <InputLabel>Status</InputLabel>
//                   <Select
//                     value={statusFilter}
//                     label="Status"
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                   >
//                     <MenuItem value="all">All</MenuItem>
//                     <MenuItem value="active">Active</MenuItem>
//                     <MenuItem value="inactive">Inactive</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Stack>
//             </Box>

//             <DataGrid
//               autoHeight
//               rows={filteredRows}
//               columns={columns}
//               pageSizeOptions={[5, 10, 20, 50, 100]}
//               initialState={{
//                 pagination: {
//                   paginationModel: { page: 0, pageSize: 10 },
//                 },
//               }}
//               slots={{
//                 toolbar: () => (
//                   <CustomToolbar
//                     onCreate={handleCreate}
//                     onImport={triggerFileInput}
//                     onExport={handleExport}
//                     onRefresh={handleRefresh}
//                   />
//                 ),
//               }}
//               sx={{
//                 border: 'none',
//                 '& .MuiDataGrid-cell': {
//                   borderBottom: '1px solid',
//                   borderColor: 'divider',
//                 },
//                 '& .MuiDataGrid-columnHeaders': {
//                   backgroundColor: 'grey.50',
//                   borderBottom: '2px solid',
//                   borderColor: 'divider',
//                 },
//                 '& .MuiDataGrid-toolbarContainer': {
//                   p: 1,
//                   borderBottom: '1px solid',
//                   borderColor: 'divider',
//                 },
//               }}
//               loading={gridLoading}
//               disableRowSelectionOnClick
//             />

//             {/* Hidden file input for import */}
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleUpload}
//               accept=".xlsx, .xls"
//               style={{ display: 'none' }}
//             />
//           </Paper>

//           {/* Create/Edit Dialog */}
//           <Dialog 
//             open={openDialog} 
//             onClose={() => setOpenDialog(false)} 
//             maxWidth="md" 
//             fullWidth 
//             TransitionComponent={Slide}
//             transitionDuration={300}
//             fullScreen={isMobile}
//           >
//             <DialogTitle sx={{ 
//               backgroundColor: 'primary.main', 
//               color: 'white', 
//               display: 'flex', 
//               alignItems: 'center', 
//               justifyContent: 'space-between',
//               py: 2
//             }}>
//               <Box display="flex" alignItems="center">
//                 {selectedUniversity ? (
//                   <>
//                     <EditIcon sx={{ mr: 1 }} />
//                     <Typography variant="h6">Edit University</Typography>
//                   </>
//                 ) : (
//                   <>
//                     <AddIcon sx={{ mr: 1 }} />
//                     <Typography variant="h6">Create University</Typography>
//                   </>
//                 )}
//               </Box>
//               <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
//                 <CloseIcon />
//               </IconButton>
//             </DialogTitle>
            
//             <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
//               {loading && <LinearProgress />}
              
//               <Grid container spacing={2} sx={{ mt: 1 }}>
//                 <Grid size={{ xs:12, sm:12}}>
//                   <TextField 
//                     fullWidth 
//                     label="University Name" 
//                     name="name" 
//                     value={formData.name} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.name}
//                     helperText={formErrors.name}
//                     required
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <UniversityIcon color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>
                
//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="University Code" 
//                     name="code" 
//                     value={formData.code} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.code}
//                     helperText={formErrors.code}
//                     required
//                     inputProps={{ maxLength: 10 }}
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="Address" 
//                     name="address" 
//                     value={formData.address} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.address}
//                     helperText={formErrors.address}
//                     required
//                     multiline
//                     rows={2}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <LocationIcon color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="City" 
//                     name="city" 
//                     value={formData.city} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.city}
//                     helperText={formErrors.city}
//                     required
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <CityIcon color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="State/Province" 
//                     name="state" 
//                     value={formData.state} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.state}
//                     helperText={formErrors.state}
//                     required
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="Country" 
//                     name="country" 
//                     value={formData.country} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.country}
//                     helperText={formErrors.country}
//                     required
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <CountryIcon color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="Postal Code" 
//                     name="postal_code" 
//                     value={formData.postal_code} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.postal_code}
//                     helperText={formErrors.postal_code}
//                     required
//                     inputProps={{ maxLength: 20 }}
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="Contact Number" 
//                     name="contact_number" 
//                     value={formData.contact_number} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.contact_number}
//                     helperText={formErrors.contact_number}
//                     required
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <PhoneIcon color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="Email" 
//                     name="email" 
//                     type="email"
//                     value={formData.email} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.email}
//                     helperText={formErrors.email}
//                     required
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <EmailIcon color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="Website" 
//                     name="website" 
//                     value={formData.website} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.website}
//                     helperText={formErrors.website}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <WebsiteIcon color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="Established Date" 
//                     name="established_date" 
//                     type="date"
//                     value={formData.established_date} 
//                     onChange={handleInputChange} 
//                     error={!!formErrors.established_date}
//                     helperText={formErrors.established_date}
//                     required
//                     InputLabelProps={{ shrink: true }}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <CalendarIcon color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <TextField 
//                     fullWidth 
//                     label="Logo URL" 
//                     name="logo_url" 
//                     value={formData.logo_url} 
//                     onChange={handleInputChange} 
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <ImageIcon color="action" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 </Grid>

//                 <Grid size={{ xs:6, sm:4}}>
//                   <FormControlLabel 
//                     control={
//                       <Switch 
//                         name="is_active" 
//                         checked={!!formData.is_active} 
//                         onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))} 
//                       />
//                     } 
//                     label={formData.is_active ? "University is Active" : "University is Inactive"} 
//                   />
//                 </Grid>
//               </Grid>
//             </DialogContent>
            
//             <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
//               <Button 
//                 onClick={() => setOpenDialog(false)} 
//                 startIcon={<CloseIcon />}
//               >
//                 Cancel
//               </Button>
              
//               <Button 
//                 onClick={handleSubmit} 
//                 startIcon={selectedUniversity ? <SaveIcon /> : <AddIcon />} 
//                 variant="contained"
//                 disabled={loading}
//               >
//                 {selectedUniversity ? 'Update University' : 'Create University'}
//               </Button>
//             </DialogActions>
//           </Dialog>

//           {/* Delete Confirmation Dialog */}
//           <Dialog 
//             open={openDeleteDialog} 
//             onClose={() => setOpenDeleteDialog(false)}
//             maxWidth="sm"
//             fullWidth
//           >
//             <DialogTitle>Confirm Deletion</DialogTitle>
//             <DialogContent>
//               <Typography>
//                 Are you sure you want to delete the university <strong>{selectedUniversity?.name}</strong>? 
//                 This action cannot be undone.
//               </Typography>
//               {selectedUniversity?.departments_count > 0 && (
//                 <Alert severity="warning" sx={{ mt: 2 }}>
//                   This university has {selectedUniversity.departments_count} departments. 
//                   Deleting it will affect all associated departments.
//                 </Alert>
//               )}
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
//               <Button 
//                 variant="contained" 
//                 color="error" 
//                 onClick={handleDeleteConfirm}
//                 startIcon={<DeleteIcon />}
//               >
//                 Delete University
//               </Button>
//             </DialogActions>
//           </Dialog>
//         </Box>
//       </Fade>
//     </AuthenticatedLayout>
//   );
// }
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  DialogActions,
  Alert,
  Card,
  Grid,
  IconButton,
  Slide,
  Fade,
  Tooltip,
  Avatar,
  LinearProgress,
  InputAdornment,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import {
  GridActionsCellItem,
} from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import moment from "moment";
import { useForm, router } from "@inertiajs/react";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AccountBalance as UniversityIcon,
  Home as HomeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  CalendarToday as CalendarIcon,
  Image as ImageIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  LocationOn as LocationIcon,
  Public as CountryIcon,
  Map as CityIcon,
  CorporateFare as BuildingIcon,
  Warning as WarningIcon,
  AddCircleOutline,
  CloudUpload,
  Download,
  Person} from "@mui/icons-material";
import SummaryCard from "@/Components/SummaryCard";
import EnhancedDataGrid from "@/Components/EnhancedDataGrid";
import PageHeader from "@/Components/PageHeader";
import Notification from "@/Components/Notification";



// Delete Confirmation Dialog Component
const DeleteConfirmationDialog = ({ open, onClose, university, onConfirm, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ 
      backgroundColor: 'error.main', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: 1
    }}>
      <WarningIcon />
      Confirm Deletion
    </DialogTitle>
    <DialogContent sx={{ pt: 3 }}>
      <Typography variant="body1" gutterBottom>
        Are you sure you want to delete the following university?
      </Typography>
      <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {university?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Code: {university?.code} | {university?.city}, {university?.country}
        </Typography>
        {university?.departments_count > 0 && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            This university has {university.departments_count} departments. 
            Deleting it will remove all associated departments.
          </Alert>
        )}
        <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
          This action cannot be undone.
        </Typography>
      </Card>
    </DialogContent>
    <DialogActions sx={{ p: 3 }}>
      <Button 
        onClick={onClose} 
        variant="outlined"
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={onConfirm}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
      >
        {loading ? 'Deleting...' : 'Delete Permanently'}
      </Button>
    </DialogActions>
  </Dialog>
);

// University Form Dialog Component
const UniversityFormDialog = ({ 
  open, 
  onClose, 
  university = null, 
  loading = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: university?.name || '',
    code: university?.code || '',
    address: university?.address || '',
    city: university?.city || '',
    state: university?.state || '',
    country: university?.country || '',
    postal_code: university?.postal_code || '',
    contact_number: university?.contact_number || '',
    email: university?.email || '',
    website: university?.website || '',
    established_date: university?.established_date ? 
      moment(university.established_date).format('YYYY-MM-DD') : '',
    logo_url: university?.logo_url || '',
    is_active: university?.is_active ?? true,
  });

  useEffect(() => {
    if (open) {
      reset();
      setData({
        name: university?.name || '',
        code: university?.code || '',
        address: university?.address || '',
        city: university?.city || '',
        state: university?.state || '',
        country: university?.country || '',
        postal_code: university?.postal_code || '',
        contact_number: university?.contact_number || '',
        email: university?.email || '',
        website: university?.website || '',
        established_date: university?.established_date ? 
          moment(university.established_date).format('YYYY-MM-DD') : '',
        logo_url: university?.logo_url || '',
        is_active: university?.is_active ?? true,
      });
    }
  }, [open, university, reset, setData]);

  const handleSubmit = () => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    if (university?.university_id) {
      put(route('university.update', university.university_id), {
        data: formData,
        preserveScroll: true,
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    } else {
      post(route('university.store'), {
        data: formData,
        preserveScroll: true,
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(name, type === 'checkbox' ? checked : value);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
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
          {university ? (
            <>
              <EditIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Edit University</Typography>
            </>
          ) : (
            <>
              <AddIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Create University</Typography>
            </>
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {processing && <LinearProgress />}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <TextField 
              fullWidth 
              label="University Name" 
              name="name" 
              value={data.name} 
              onChange={handleInputChange} 
              error={!!errors.name}
              helperText={errors.name}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UniversityIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 6 }}>
            <TextField 
              fullWidth 
              label="University Code" 
              name="code" 
              value={data.code} 
              onChange={handleInputChange} 
              error={!!errors.code}
              helperText={errors.code}
              required
              inputProps={{ maxLength: 10 }}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField 
              fullWidth 
              label="Established Date" 
              name="established_date" 
              type="date"
              value={data.established_date} 
              onChange={handleInputChange} 
              error={!!errors.established_date}
              helperText={errors.established_date}
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField 
              fullWidth 
              label="Address" 
              name="address" 
              value={data.address} 
              onChange={handleInputChange} 
              error={!!errors.address}
              helperText={errors.address}
              required
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField 
              fullWidth 
              label="City" 
              name="city" 
              value={data.city} 
              onChange={handleInputChange} 
              error={!!errors.city}
              helperText={errors.city}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CityIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField 
              fullWidth 
              label="State/Province" 
              name="state" 
              value={data.state} 
              onChange={handleInputChange} 
              error={!!errors.state}
              helperText={errors.state}
              required
            />
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField 
              fullWidth 
              label="Country" 
              name="country" 
              value={data.country} 
              onChange={handleInputChange} 
              error={!!errors.country}
              helperText={errors.country}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CountryIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField 
              fullWidth 
              label="Postal Code" 
              name="postal_code" 
              value={data.postal_code} 
              onChange={handleInputChange} 
              error={!!errors.postal_code}
              helperText={errors.postal_code}
              required
              inputProps={{ maxLength: 20 }}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField 
              fullWidth 
              label="Contact Number" 
              name="contact_number" 
              value={data.contact_number} 
              onChange={handleInputChange} 
              error={!!errors.contact_number}
              helperText={errors.contact_number}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField 
              fullWidth 
              label="Email" 
              name="email" 
              type="email"
              value={data.email} 
              onChange={handleInputChange} 
              error={!!errors.email}
              helperText={errors.email}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField 
              fullWidth 
              label="Website" 
              name="website" 
              value={data.website} 
              onChange={handleInputChange} 
              error={!!errors.website}
              helperText={errors.website}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WebsiteIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField 
              fullWidth 
              label="Logo URL" 
              name="logo_url" 
              value={data.logo_url} 
              onChange={handleInputChange} 
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ImageIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel 
              control={
                <Switch 
                  name="is_active" 
                  checked={!!data.is_active} 
                  onChange={(e) => setData('is_active', e.target.checked)} 
                />
              } 
              label={data.is_active ? "University is Active" : "University is Inactive"} 
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button 
          onClick={onClose} 
          startIcon={<CloseIcon />}
          disabled={processing}
        >
          Cancel
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          startIcon={processing ? <CircularProgress size={16} /> : (university ? <SaveIcon /> : <AddIcon />)} 
          variant="contained"
          disabled={processing}
        >
          {processing ? 'Processing...' : (university ? 'Update University' : 'Create University')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
export default function Universities({ universities = [], auth, departments = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Process data on component mount
  useEffect(() => {
    setGridLoading(true);
    
    const processData = setTimeout(() => {
      const formatted = (universities || []).map((uni, index) => ({
        id: uni?.university_id ?? index + 1,
        ...uni,
        established_date: uni?.established_date ? 
          moment(uni.established_date).format("YYYY-MM-DD") : "",
        created_at: uni?.created_at ? 
          moment(uni.created_at).format("MMM Do YYYY, h:mm a") : "",
        updated_at: uni?.updated_at ? 
          moment(uni.updated_at).format("MMM Do YYYY, h:mm a") : "",
        departments_count: departments.filter(dept => dept.university_id === uni.university_id).length,
        age_years: uni?.established_date ? 
          moment().diff(moment(uni.established_date), 'years') : 0,
      }));
      
      setRows(formatted);
      setGridLoading(false);
    }, 500);
    setGridLoading(false)
    return () => clearTimeout(processData);
  }, [universities, departments]);

  // Calculate summary statistics
  const { totalUniversities, activeUniversities, totalDepartments, averageAge } = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(row => row.is_active).length;
    const totalDepts = rows.reduce((sum, row) => sum + (row.departments_count || 0), 0);
    const avgAge = rows.length > 0 ? 
      rows.reduce((sum, row) => sum + (row.age_years || 0), 0) / rows.length : 0;
    
    return {
      totalUniversities: total,
      activeUniversities: active,
      totalDepartments: totalDepts,
      averageAge: avgAge.toFixed(1),
    };
  }, [rows]);

  // Column definitions
  const columns = useMemo(() => [
    { 
      field: 'logo', 
      headerName: 'Logo', 
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={params.row.logo_url}
          sx={{ width: 40, height: 40 }}
          alt={params.row.name}
        >
          <UniversityIcon />
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    { 
      field: 'name', 
      headerName: 'University Name', 
      flex: 2,
      minWidth: 200,
    },
    { 
      field: 'code', 
      headerName: 'Code', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          variant="outlined"
          color="primary"
        />
      )
    },
    { 
      field: 'city', 
      headerName: 'City', 
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CityIcon fontSize="small" color="action" />
          {params.value}
        </Box>
      )
    },
    { 
      field: 'state', 
      headerName: 'State', 
      width: 80,
    },
    { 
      field: 'country', 
      headerName: 'Country', 
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CountryIcon fontSize="small" color="action" />
          {params.value}
        </Box>
      )
    },
    { 
      field: 'contact_number', 
      headerName: 'Contact', 
      width: 140,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon fontSize="small" color="action" />
          {params.value}
        </Box>
      )
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2" noWrap>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'established_date', 
      headerName: 'Established', 
      width: 120,
      valueFormatter: (params) => moment(params.value).format("YYYY"),
    },
    { 
      field: 'age_years', 
      headerName: 'Age', 
      width: 80,
      renderCell: (params) => (
        <Chip 
          label={`${params.value}y`} 
          size="small" 
          variant="outlined"
        />
      )
    },
    { 
      field: 'departments_count', 
      headerName: 'Depts', 
      width: 80,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          color="secondary"
          variant="outlined"
        />
      )
    },
    { 
      field: 'is_active', 
      headerName: 'Status', 
      width: 110, 
      renderCell: (params) => (
        params.value ? 
          <Chip icon={<ActiveIcon />} label="ACTIVE" color="success" size="small" /> : 
          <Chip icon={<InactiveIcon />} label="INACTIVE" color="default" size="small" />
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
  ], []);

  // Filter rows based on search text and status
  const filteredRows = useMemo(() => {
    let filtered = rows;
    
    if (searchText) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(row => 
        row.name?.toLowerCase().includes(query) ||
        row.code?.toLowerCase().includes(query) ||
        row.city?.toLowerCase().includes(query) ||
        row.state?.toLowerCase().includes(query) ||
        row.country?.toLowerCase().includes(query) ||
        row.email?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(row => 
        statusFilter === "active" ? row.is_active : !row.is_active
      );
    }
    
    return filtered;
  }, [rows, searchText, statusFilter]);

  // Event handlers
  const handleExport = useCallback(() => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows.map(row => ({
        'University Code': row.code,
        'Name': row.name,
        'Address': row.address,
        'City': row.city,
        'State': row.state,
        'Country': row.country,
        'Postal Code': row.postal_code,
        'Contact Number': row.contact_number,
        'Email': row.email,
        'Website': row.website,
        'Established Date': moment(row.established_date).format('YYYY-MM-DD'),
        'Age (Years)': row.age_years,
        'Departments Count': row.departments_count,
        'Status': row.is_active ? 'Active' : 'Inactive',
        'Logo URL': row.logo_url,
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Universities');
    XLSX.writeFile(workbook, `universities_export_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    
    setAlert({ open: true, message: 'University data exported successfully', severity: 'success' });
  }, [filteredRows]);

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
        
        setAlert({ open: true, message: `${uploadedData.length} universities imported successfully`, severity: 'success' });
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
    setSelectedUniversity(null);
    setOpenDialog(true);
  }, []);

  const handleEdit = useCallback((row) => {
    setSelectedUniversity(row);
    setOpenDialog(true);
  }, []);

  const handleDeleteClick = useCallback((row) => {
    setSelectedUniversity(row);
    setOpenDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedUniversity) return;
    
    setDeleteLoading(true);
    try {
      await router.delete(route('university.destroy', selectedUniversity.university_id), {
        preserveScroll: true,
        onSuccess: () => {
          setAlert({ open: true, message: 'University deleted successfully', severity: 'success' });
          setOpenDeleteDialog(false);
        },
        onError: () => {
          setAlert({ open: true, message: 'Error deleting university', severity: 'error' });
        }
      });
    } catch (error) {
      setAlert({ open: true, message: 'Error deleting university', severity: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedUniversity]);

  const handleRefresh = useCallback(() => {
    setGridLoading(true);
    router.reload({
      preserveScroll: true,
      onFinish: () => setGridLoading(false),
    });
  }, []);

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
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
        New University
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
      title="University Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> }, 
        { label: 'Universities' }
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
        <PageHeader
          title="Universities"
          subtitle="Manage universities"
          icon={<Person sx={{ fontSize: 28 }} />}
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
                title="Total Universities" 
                
                value={totalUniversities} 
                icon={<UniversityIcon />} 
                color={theme.palette.primary.main} 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Active Universities" 
                value={activeUniversities} 
                icon={<ActiveIcon />} 
                color={theme.palette.success.main} 
                subtitle={`${((activeUniversities / totalUniversities) * 100).toFixed(0)}% active`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Total Departments" 
                value={totalDepartments} 
                icon={<BuildingIcon />} 
                color={theme.palette.info.main} 
                subtitle={`Avg: ${(totalDepartments / totalUniversities).toFixed(1)} per university`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Average Age" 
                value={`${averageAge} years`} 
                icon={<CalendarIcon />} 
                color={theme.palette.warning.main} 
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
            title="Universities"
            subtitle="History"
            icon={<UniversityIcon />}
            addButtonText="New"
            pageSizeOptions={[5, 10, 20, 50, 100]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
              sorting: { sortModel: [{ field: 'lft', sort: 'asc' }] }
            }}
          />

          {/* University Form Dialog */}
          <UniversityFormDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            university={selectedUniversity}
          />

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            university={selectedUniversity}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
          />
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
// import React, { useState, useEffect, useMemo } from 'react';
// import { useForm, usePage } from '@inertiajs/react';
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import {
//   Box,
//   Card,
//   CardContent,
//   Grid,
//   Typography,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Checkbox,
//   ListItemText,
//   OutlinedInput,
//   Chip,
//   Paper,
//   Stepper,
//   Step,
//   StepLabel,
//   StepContent,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Alert,
//   CircularProgress,
//   Avatar,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText as MuiListItemText,
//   Divider,
//   Switch,
//   FormControlLabel,
//   TextField,
//   RadioGroup,
//   Radio,
//   FormLabel,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Tabs,
//   Tab,
//   IconButton,
//   Tooltip,
//   Breadcrumbs,
//   Link,
// } from '@mui/material';
// import {
//   ExpandMore,
//   BarChart,
//   TableChart,
//   PictureAsPdf,
//   GridView,
//   Analytics,
//   TrendingUp,
//   Inventory2,
//   Warning,
//   Download,
//   AutoAwesome,
//   Dashboard,
//   DateRange,
//   FilterList,
//   Print,
//   Visibility,
//   TrendingDown,
//   AttachMoney,
//   Numbers,
//   Home,
//   Folder,
//   Build,
//   ShoppingCart,
//   History,
// } from '@mui/icons-material';
// import { LocalizationProvider } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// // Recharts for diagrams
// import {
//   BarChart as RechartsBarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
// } from 'recharts';
// import Notification from '@/Components/Notification';

// const ModernReportGenerator = ({ auth, categories: initialCategories, locations: initialLocations, departments: initialDepartments }) => {
//   const [activeStep, setActiveStep] = useState(0);
//   const [customDateRange, setCustomDateRange] = useState({
//     start: null,
//     end: null
//   });
//   // console.log(initialCategories)
//   const [activeTab, setActiveTab] = useState(0);
//   const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
//   const { flash, reportData: initialReportData } = usePage().props;
  
//   const showAlert = (message, severity = "success") => {
//     setAlert({ open: true, message, severity });
//     setTimeout(() => setAlert({ ...alert, open: false }), 5000);
//   };
  
//   const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
//     report_type: 'comprehensive',
//     categories: [],
//     locations: [],
//     departments: [],
//     date_range: 'last30days',
//     custom_start_date: '',
//     custom_end_date: '',
//     include_charts: true,
//     include_tables: true,
//     include_summary: true,
//     include_export: true,
//     export_format: 'pdf',
//     chart_types: ['bar', 'pie'],
//     data_depth: 'summary',
//     compare_period: false,
//     suppliers: [],
//     maintenance_types: [],
//     priority_levels: [],
//     order_types: [],
//   });

//   // Enhanced report types with new additions
//   const reportTypes = [
//     { 
//       value: 'comprehensive', 
//       label: 'Comprehensive Inventory Report',
//       icon: <Dashboard />,
//       description: 'Complete overview with analytics and trends',
//       color: 'primary'
//     },
//     { 
//       value: 'stock-level', 
//       label: 'Stock Level Analysis',
//       icon: <Inventory2 />,
//       description: 'Current stock status and alerts',
//       color: 'info'
//     },
//     { 
//       value: 'acquisition', 
//       label: 'Acquisition Report',
//       icon: <TrendingUp />,
//       description: 'Purchase and acquisition trends',
//       color: 'success'
//     },
//     { 
//       value: 'depreciation', 
//       label: 'Depreciation Report',
//       icon: <Analytics />,
//       description: 'Asset depreciation and valuation',
//       color: 'warning'
//     },
//     { 
//       value: 'audit', 
//       label: 'Audit Trail Report',
//       icon: <History />,
//       description: 'Complete activity and change history',
//       color: 'secondary'
//     },
//     { 
//       value: 'procurement', 
//       label: 'Procurement Performance',
//       icon: <ShoppingCart />,
//       description: 'Supplier performance and purchase analysis',
//       color: 'info'
//     },
//     { 
//       value: 'maintenance', 
//       label: 'Maintenance Report',
//       icon: <Build />,
//       description: 'Equipment maintenance and reliability',
//       color: 'error'
//     },
//   ];

//   const dateRanges = [
//     { value: 'last7days', label: 'Last 7 Days' },
//     { value: 'last30days', label: 'Last 30 Days' },
//     { value: 'last90days', label: 'Last 90 Days' },
//     { value: 'currentMonth', label: 'Current Month' },
//     { value: 'currentQuarter', label: 'Current Quarter' },
//     { value: 'currentYear', label: 'Current Year' },
//     { value: 'previousMonth', label: 'Previous Month' },
//     { value: 'previousQuarter', label: 'Previous Quarter' },
//     { value: 'previousYear', label: 'Previous Year' },
//     { value: 'custom', label: 'Custom Range' },
//   ];

//   const chartTypes = [
//     { value: 'bar', label: 'Bar Charts' },
//     { value: 'pie', label: 'Pie Charts' },
//     { value: 'line', label: 'Line Charts' },
//     { value: 'area', label: 'Area Charts' },
//   ];

//   const dataDepthOptions = [
//     { value: 'summary', label: 'Summary Only' },
//     { value: 'detailed', label: 'Detailed Data' },
//     { value: 'granular', label: 'Granular Level' },
//   ];

//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

//   // Enhanced sample data with new report types
//   const sampleChartData = {
//     monthly_trends: [
//       // { month: 'Jan', value: 4000, transactions: 45, quantity: 120 },
//       // { month: 'Feb', value: 3000, transactions: 38, quantity: 95 },
//       // { month: 'Mar', value: 5000, transactions: 52, quantity: 150 },
//       // { month: 'Apr', value: 2780, transactions: 29, quantity: 80 },
//       // { month: 'May', value: 1890, transactions: 21, quantity: 65 },
//       // { month: 'Jun', value: 2390, transactions: 26, quantity: 75 },
//     ],
//     category_distribution: [
//       { name: 'Electronics', value: 400, count: 45 },
//       { name: 'Furniture', value: 300, count: 32 },
//       { name: 'Office Supplies', value: 200, count: 28 },
//       { name: 'Tools', value: 150, count: 18 },
//       { name: 'Vehicles', value: 100, count: 8 },
//     ],
//     transaction_type_distribution: [
//       { label: 'Purchase', value: 5000, count: 65 },
//       { label: 'Sale', value: 3000, count: 42 },
//       { label: 'Transfer', value: 1500, count: 23 },
//       { label: 'Adjustment', value: 500, count: 8 },
//     ]
//   };

//   const sampleSummaryData = {
//     total_transactions: 150,
//     total_value: 50000,
//     incoming_stock: 75,
//     outgoing_stock: 60,
//     low_stock_items: 12,
//     out_of_stock_items: 3,
//     total_inventory_value: 125000,
//     total_items_tracked: 245,
//   };

//   // Memoized report data handling
//   const reportData = useMemo(() => {
//     return initialReportData || null;
//   }, [initialReportData]);

//   const handleNext = () => {
//     setActiveStep((prevStep) => prevStep + 1);
//   };

//   const handleBack = () => {
//     setActiveStep((prevStep) => prevStep - 1);
//   };

//   const handleGenerateReport = () => {
//     post(route('inventory-report.generate'), {
//       preserveScroll: true,
//       onSuccess: () => {
//         showAlert('Report generated successfully!', 'success');
//         setActiveTab(0); // Reset to summary tab
//       },
//       onError: (errors) => {
//         showAlert('Failed to generate report. Please check your inputs.', 'error');
//       }
//     });
//   };

//   const handleQuickReport = (type) => {
//     setData({
//       ...data,
//       report_type: type,
//       date_range: 'last30days',
//       include_charts: true,
//       include_tables: true,
//       include_summary: true,
//     });
    
//     post(route('inventory-report.generate'), {
//       preserveScroll: true,
//       onSuccess: () => {
//         showAlert(`${reportTypes.find(t => t.value === type)?.label} generated successfully!`, 'success');
//       }
//     });
//   };

//   const handleExportReport = () => {
//     if (reportData) {
//       post(route('reports.export'), {
//         data: {
//           report_data: reportData,
//           config: data,
//           format: data.export_format,
//         }
//       });
//     }
//   };

//   const steps = [
//     {
//       label: 'Report Type',
//       description: 'Choose the type of analysis you need',
//       icon: <Analytics />,
//     },
//     {
//       label: 'Data Filters',
//       description: 'Refine your dataset with specific criteria',
//       icon: <FilterList />,
//     },
//     {
//       label: 'Content & Design',
//       description: 'Customize the look and content of your report',
//       icon: <AutoAwesome />,
//     },
//     {
//       label: 'Export Settings',
//       description: 'Choose how to receive your report',
//       icon: <Download />,
//     },
//   ];

//   const getReportPreview = () => {
//     const type = reportTypes.find(t => t.value === data.report_type);
    
//     const categoryNames = data.categories.length > 0 
//       ? data.categories.map(categoryId => {
//           const category = initialCategories?.find(cat => cat.id === categoryId);
//           return category?.name || categoryId;
//         }).join(', ')
//       : 'All Categories';

//     const departmentNames = data.departments.length > 0
//       ? data.departments.map(deptId => {
//           const dept = initialDepartments?.find(d => d.id === deptId);
//           return dept?.name || deptId;
//         }).join(', ')
//       : 'All Departments';

//       // console.log(categories)
//     return {
//       type: type?.label || 'Unknown Report',
//       categories: categoryNames,
//       departments: departmentNames,
//       dateRange: data.date_range === 'custom' 
//         ? `Custom: ${customDateRange.start?.toLocaleDateString()} - ${customDateRange.end?.toLocaleDateString()}`
//         : dateRanges.find(d => d.value === data.date_range)?.label,
//       content: [
//         ...(data.include_summary ? ['Executive Summary'] : []),
//         ...(data.include_charts ? ['Visual Analytics'] : []),
//         ...(data.include_tables ? ['Data Tables'] : []),
//       ].join(' • '),
//       export: data.export_format.toUpperCase(),
//     };
//   };

//   // Enhanced Chart rendering with better error handling
//   const renderBarChart = (chartData, dataKey, name, xDataKey = 'name', color = '#8884d8') => {
//     const displayData = chartData && Array.isArray(chartData) && chartData.length > 0 
//       ? chartData 
//       : sampleChartData.monthly_trends;

//     if (!displayData || !Array.isArray(displayData) || displayData.length === 0) {
//       return (
//         <Box display="flex" justifyContent="center" alignItems="center" height={300}>
//           <Typography color="textSecondary">No data available for bar chart</Typography>
//         </Box>
//       );
//     }

//     const validData = displayData.map(item => ({
//       ...item,
//       [xDataKey]: item[xDataKey] || 'Unknown',
//       [dataKey]: item[dataKey] || item.value || 0
//     }));

//     return (
//       <ResponsiveContainer width="100%" height={300}>
//         <RechartsBarChart data={validData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey={xDataKey} />
//           <YAxis />
//           <RechartsTooltip formatter={(value) => [value.toLocaleString(), name]} />
//           <Legend />
//           <Bar dataKey={dataKey} fill={color} name={name} />
//         </RechartsBarChart>
//       </ResponsiveContainer>
//     );
//   };

//   const renderPieChart = (chartData, dataKey, nameKey = 'name') => {
//     const displayData = chartData && Array.isArray(chartData) && chartData.length > 0 
//       ? chartData 
//       : sampleChartData.category_distribution;

//     if (!displayData || !Array.isArray(displayData) || displayData.length === 0) {
//       return (
//         <Box display="flex" justifyContent="center" alignItems="center" height={300}>
//           <Typography color="textSecondary">No data available for pie chart</Typography>
//         </Box>
//       );
//     }

//     const validData = displayData.map((item, index) => ({
//       name: item[nameKey] || item.name || `Item ${index + 1}`,
//       value: item[dataKey] || item.value || 0,
//       count: item.count || 0
//     }));

//     return (
//       <ResponsiveContainer width="100%" height={300}>
//         <PieChart>
//           <Pie
//             data={validData}
//             cx="50%"
//             cy="50%"
//             labelLine={false}
//             label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
//             outerRadius={80}
//             fill="#8884d8"
//             dataKey="value"
//             nameKey="name"
//           >
//             {validData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//           <RechartsTooltip formatter={(value, name, props) => [value.toLocaleString(), props.payload.name]} />
//         </PieChart>
//       </ResponsiveContainer>
//     );
//   };

//   const renderLineChart = (chartData, dataKey, name, xDataKey = 'name', color = '#8884d8') => {
//     const displayData = chartData && Array.isArray(chartData) && chartData.length > 0 
//       ? chartData 
//       : sampleChartData.monthly_trends;

//     if (!displayData || !Array.isArray(displayData) || displayData.length === 0) {
//       return (
//         <Box display="flex" justifyContent="center" alignItems="center" height={300}>
//           <Typography color="textSecondary">No data available for line chart</Typography>
//         </Box>
//       );
//     }

//     const validData = displayData.map(item => ({
//       ...item,
//       [xDataKey]: item[xDataKey] || 'Unknown',
//       [dataKey]: item[dataKey] || item.value || 0
//     }));

//     return (
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={validData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey={xDataKey} />
//           <YAxis />
//           <RechartsTooltip formatter={(value) => [value.toLocaleString(), name]} />
//           <Legend />
//           <Line 
//             type="monotone" 
//             dataKey={dataKey} 
//             stroke={color} 
//             name={name}
//             strokeWidth={2}
//             dot={{ fill: color, strokeWidth: 2, r: 4 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     );
//   };

//   // Enhanced Summary Cards with conditional rendering
//   const SummaryCards = ({ summary }) => {
//     const displaySummary = summary && typeof summary === 'object' ? summary : sampleSummaryData;

//     const summaryMetrics = [
//       {
//         label: 'Total Transactions',
//         value: displaySummary.total_transactions?.toLocaleString() || 
//                displaySummary.total_acquisitions?.toLocaleString() || 
//                displaySummary.total_orders?.toLocaleString() || 
//                '0',
//         icon: <Numbers color="primary" />,
//         color: 'primary'
//       },
//       {
//         label: 'Total Value',
//         value: `₵${(displaySummary.total_value || 
//                     displaySummary.total_inventory_value || 
//                     displaySummary.total_amount || 
//                     0).toLocaleString()}`,
//         icon: <AttachMoney color="success" />,
//         color: 'success'
//       },
//       {
//         label: 'Incoming Stock',
//         value: (displaySummary.incoming_stock?.toLocaleString() || 
//                 displaySummary.total_incoming?.toLocaleString() || 
//                 '0'),
//         icon: <TrendingUp color="info" />,
//         color: 'info'
//       },
//       {
//         label: 'Outgoing Stock',
//         value: (displaySummary.outgoing_stock?.toLocaleString() || 
//                 displaySummary.total_outgoing?.toLocaleString() || 
//                 '0'),
//         icon: <TrendingDown color="warning" />,
//         color: 'warning'
//       },
//       {
//         label: 'Low Stock Items',
//         value: (displaySummary.low_stock_items?.toLocaleString() || 
//                 displaySummary.items_need_reorder?.toLocaleString() || 
//                 '0'),
//         icon: <Warning color="error" />,
//         color: 'error'
//       },
//       {
//         label: 'Out of Stock',
//         value: (displaySummary.out_of_stock_items?.toLocaleString() || 
//                 displaySummary.out_of_stock_items?.toLocaleString() || 
//                 '0'),
//         icon: <Inventory2 color="secondary" />,
//         color: 'secondary'
//       }
//     ];

//     return (
//       <Grid container spacing={2} sx={{ mb: 3 }}>
//         {summaryMetrics.map((metric, index) => (
//           <Grid key={index} size={{ xs: 6, md: 4 }}>
//             <Card sx={{ height: '100%', borderLeft: `4px solid` }}>
//               <CardContent>
//                 <Box display="flex" alignItems="center" gap={2}>
//                   <Avatar sx={{ bgcolor: `${metric.color}.light`, width: 48, height: 48 }}>
//                     {metric.icon}
//                   </Avatar>
//                   <Box>
//                     <Typography color="textSecondary" gutterBottom variant="overline">
//                       {metric.label}
//                     </Typography>
//                     <Typography variant="h6" fontWeight="bold">
//                       {metric.value}
//                     </Typography>
//                   </Box>
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     );
//   };

//   // Enhanced Data Table Component
//   const DataTable = ({ title, data, columns, sx = {} }) => {
//     if (!data || !Array.isArray(data) || data.length === 0) {
//       return (
//         <Card sx={{ mb: 2, ...sx }}>
//           <CardContent>
//             <Typography variant="h6" gutterBottom>{title}</Typography>
//             <Alert severity="info">No data available for this section</Alert>
//           </CardContent>
//         </Card>
//       );
//     }

//     return (
//       <Card sx={{ mb: 2, ...sx }}>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>{title}</Typography>
//           <TableContainer>
//             <Table size="small" stickyHeader>
//               <TableHead>
//                 <TableRow>
//                   {columns.map((column) => (
//                     <TableCell key={column.key} sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>
//                       {column.label}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {data.map((row, index) => (
//                   <TableRow key={index} hover>
//                     {columns.map((column) => (
//                       <TableCell key={column.key}>
//                         {column.render ? column.render(row[column.key], row) : row[column.key]}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </CardContent>
//       </Card>
//     );
//   };

//   // Report Display Component
//   const ReportDisplay = () => {
//     if (!reportData) {
//       return (
//         <Alert severity="info" sx={{ mt: 3 }}>
//           Configure your report settings and generate a report to see the results.
//         </Alert>
//       );
//     }

//     const chartData = reportData.trends || sampleChartData;
//     const summaryData = reportData.summary || sampleSummaryData;

//     return (
//       <Box sx={{ mt: 4 }}>
//         <Card>
//           <CardContent>
//             <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
//               <Box>
//                 <Typography variant="h4" fontWeight="bold">
//                   {reportTypes.find(t => t.value === data.report_type)?.label || 'Generated Report'}
//                 </Typography>
//                 <Typography color="textSecondary">
//                   Generated on {new Date().toLocaleDateString()} • {data.data_depth} level
//                 </Typography>
//               </Box>
//               <Box display="flex" gap={1}>
//                 <Tooltip title="Print Report">
//                   <IconButton onClick={() => window.print()}>
//                     <Print />
//                   </IconButton>
//                 </Tooltip>
//                 <Tooltip title="Preview Report">
//                   <IconButton>
//                     <Visibility />
//                   </IconButton>
//                 </Tooltip>
//                 <Button 
//                   variant="contained" 
//                   startIcon={<Download />}
//                   onClick={handleExportReport}
//                   disabled={!reportData}
//                 >
//                   Export as {data.export_format.toUpperCase()}
//                 </Button>
//               </Box>
//             </Box>

//             <Tabs 
//               value={activeTab} 
//               onChange={(e, newValue) => setActiveTab(newValue)} 
//               sx={{ mb: 3 }}
//               variant="scrollable"
//               scrollButtons="auto"
//             >
//               <Tab label="Summary" icon={<Dashboard />} iconPosition="start" />
//               <Tab label="Analytics" icon={<BarChart />} iconPosition="start" />
//               <Tab label="Data Tables" icon={<TableChart />} iconPosition="start" />
//               <Tab label="Details" icon={<GridView />} iconPosition="start" />
//             </Tabs>

//             {activeTab === 0 && (
//               <Box>
//                 {data.include_summary && <SummaryCards summary={summaryData} />}
                
//                 {/* Additional summary sections based on report type */}
//                 {reportData.stock_level_summary && (
//                   <Card sx={{ mb: 2 }}>
//                     <CardContent>
//                       <Typography variant="h6" gutterBottom>Stock Level Overview</Typography>
//                       <Grid container spacing={2}>
//                         <Grid size={{ xs: 6, md: 3 }}>
//                           <Typography variant="body2" color="textSecondary">Total Inventory Value</Typography>
//                           <Typography variant="h6">₵{reportData.stock_level_summary.total_inventory_value?.toLocaleString()}</Typography>
//                         </Grid>
//                         <Grid size={{ xs: 6, md: 3 }}>
//                           <Typography variant="body2" color="textSecondary">Items Tracked</Typography>
//                           <Typography variant="h6">{reportData.stock_level_summary.total_items_tracked}</Typography>
//                         </Grid>
//                       </Grid>
//                     </CardContent>
//                   </Card>
//                 )}
//               </Box>
//             )}

//             {activeTab === 1 && data.include_charts && (
//               <Box>
//                 <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Visual Analytics</Typography>
                
//                 {!reportData?.trends && (
//                   <Alert severity="info" sx={{ mb: 2 }}>
//                     Showing sample chart data. Generate a report to see your actual data.
//                   </Alert>
//                 )}
                
//                 <Grid container spacing={3}>
//                   {data.chart_types?.includes('bar') && (
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <Card>
//                         <CardContent>
//                           <Typography variant="h6" gutterBottom>Monthly Value Trend</Typography>
//                           {renderBarChart(chartData.monthly_trends, 'value', 'Total Value (₵)', 'month', '#0088FE')}
//                         </CardContent>
//                       </Card>
//                     </Grid>
//                   )}

//                   {data.chart_types?.includes('pie') && (
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <Card>
//                         <CardContent>
//                           <Typography variant="h6" gutterBottom>Category Distribution</Typography>
//                           {renderPieChart(chartData.category_distribution, 'value')}
//                         </CardContent>
//                       </Card>
//                     </Grid>
//                   )}

//                   {data.chart_types?.includes('line') && (
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <Card>
//                         <CardContent>
//                           <Typography variant="h6" gutterBottom>Transaction Trends</Typography>
//                           {renderLineChart(chartData.monthly_trends, 'transactions', 'Transaction Count', 'month', '#00C49F')}
//                         </CardContent>
//                       </Card>
//                     </Grid>
//                   )}

//                   {data.chart_types?.includes('bar') && chartData.transaction_type_distribution && (
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <Card>
//                         <CardContent>
//                           <Typography variant="h6" gutterBottom>Transaction Types</Typography>
//                           {renderBarChart(chartData.transaction_type_distribution, 'value', 'Total Value (₵)', 'label', '#FF8042')}
//                         </CardContent>
//                       </Card>
//                     </Grid>
//                   )}
//                 </Grid>
//               </Box>
//             )}

//             {activeTab === 2 && data.include_tables && (
//               <Box>
//                 <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Detailed Data Tables</Typography>
                
//                 <Grid container spacing={3}>
//                   {reportData.category_breakdown && (
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <DataTable
//                         title="Category Breakdown"
//                         data={reportData.category_breakdown}
//                         columns={[
//                           { key: 'category', label: 'Category' },
//                           { key: 'transactions', label: 'Transactions' },
//                           { key: 'total_quantity', label: 'Quantity' },
//                           { 
//                             key: 'total_value', 
//                             label: 'Total Value', 
//                             render: (value) => `₵${Number(value || 0).toLocaleString()}`
//                           },
//                         ]}
//                       />
//                     </Grid>
//                   )}

//                   {reportData.department_analysis && (
//                     <Grid size={{ xs: 12, md: 6 }}>
//                       <DataTable
//                         title="Department Analysis"
//                         data={reportData.department_analysis}
//                         columns={[
//                           { key: 'department', label: 'Department' },
//                           { key: 'transactions', label: 'Transactions' },
//                           { key: 'total_value', label: 'Total Value', render: (value) => `₵${value}` },
//                         ]}
//                       />
//                     </Grid>
//                   )}

//                   {reportData.critical_items && (
//                     <Grid size={{ xs: 12 }}>
//                       <DataTable
//                         title="Critical Stock Items"
//                         data={reportData.critical_items}
//                         columns={[
//                           { key: 'name', label: 'Item Name' },
//                           { key: 'category', label: 'Category' },
//                           { key: 'current_quantity', label: 'Current Qty' },
//                           { key: 'available_quantity', label: 'Available Qty' },
//                           { key: 'status', label: 'Status', render: (value) => (
//                             <Chip 
//                               label={value?.replace(/_/g, ' ') || 'Unknown'} 
//                               color={
//                                 value === 'out_of_stock' ? 'error' : 
//                                 value === 'low_stock' ? 'warning' : 'success'
//                               } 
//                               size="small" 
//                             />
//                           )}
//                         ]}
//                       />
//                     </Grid>
//                   )}
//                 </Grid>
//               </Box>
//             )}

//             {activeTab === 3 && (
//               <Box>
//                 <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Report Details</Typography>
                
//                 {/* Additional report-specific details */}
//                 {reportData.recent_activities && (
//                   <DataTable
//                     title="Recent Activities"
//                     data={reportData.recent_activities}
//                     columns={[
//                       { key: 'date', label: 'Date' },
//                       { key: 'action', label: 'Action' },
//                       { key: 'item', label: 'Item' },
//                       { key: 'user', label: 'User' },
//                       { key: 'quantity', label: 'Quantity' },
//                       { key: 'value', label: 'Value', render: (value) => `₵${value}` },
//                     ]}
//                   />
//                 )}

//                 {reportData.transaction_analysis && (
//                   <DataTable
//                     title="Transaction Analysis"
//                     data={reportData.transaction_analysis}
//                     columns={[
//                       { key: 'label', label: 'Type' },
//                       { key: 'count', label: 'Count' },
//                       { key: 'total_quantity', label: 'Total Qty' },
//                       { key: 'total_value', label: 'Total Value', render: (value) => `₵${value}` },
//                     ]}
//                   />
//                 )}
//               </Box>
//             )}
//           </CardContent>
//         </Card>
//       </Box>
//     );
//   };

//   const preview = getReportPreview();

//   useEffect(() => {
//     if (flash?.success) {
//       showAlert(flash.success, "success");
//     }

//     if (flash?.error) {
//       showAlert(flash.error, "error");
//     }
//   }, [flash]);

//   const handleCloseAlert = () => {
//     setAlert((prev) => ({ ...prev, open: false }));
//   };

//   return (
//     <AuthenticatedLayout
//       auth={auth}
//       title="Advanced Report Generator"
//       header={
//         <Box>
//           <Typography variant="h4" fontWeight="bold">
//             Report Generator
//           </Typography>
//           <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 1 }}>
//             <Link underline="hover" color="inherit" href="/dashboard" display="flex" alignItems="center">
//               <Home sx={{ mr: 0.5 }} fontSize="inherit" />
//               Dashboard
//             </Link>
//             <Link underline="hover" color="inherit" href="/reports" display="flex" alignItems="center">
//               <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
//               Reports
//             </Link>
//             <Typography color="text.primary" display="flex" alignItems="center">
//               <Analytics sx={{ mr: 0.5 }} fontSize="inherit" />
//               Report Generator
//             </Typography>
//           </Breadcrumbs>
//         </Box>
//       }
//     >
//       <LocalizationProvider dateAdapter={AdapterDateFns}>
//         <Box p={3}>
//           <Notification 
//             open={alert.open} 
//             severity={alert.severity} 
//             message={alert.message}
//             onClose={handleCloseAlert}
//           />

//           {errors.report_type && (
//             <Alert severity="error" sx={{ mb: 3 }}>
//               {errors.report_type}
//             </Alert>
//           )}

//           <Grid container spacing={3}>
//             <Grid size={{ xs: 12, md: 8 }}>
//               <Card elevation={2}>
//                 <CardContent sx={{ p: 3 }}>
//                   <Stepper activeStep={activeStep} orientation="vertical">
//                     {steps.map((step, index) => (
//                       <Step key={step.label}>
//                         <StepLabel StepIconComponent={() => (
//                           <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
//                             {step.icon}
//                           </Avatar>
//                         )}>
//                           <Typography variant="h6">{step.label}</Typography>
//                           <Typography variant="body2" color="text.secondary">
//                             {step.description}
//                           </Typography>
//                         </StepLabel>
//                         <StepContent>
//                           {index === 0 && (
//                             <Box sx={{ mt: 2 }}>
//                               <FormControl component="fieldset" fullWidth>
//                                 <RadioGroup
//                                   value={data.report_type}
//                                   onChange={(e) => setData('report_type', e.target.value)}
//                                 >
//                                   <Grid container spacing={2}>
//                                     {reportTypes.map((type) => (
//                                       <Grid key={type.value} size={{ xs: 12, md: 6 }}>
//                                         <Card 
//                                           variant="outlined"
//                                           sx={{ 
//                                             cursor: 'pointer',
//                                             border: data.report_type === type.value ? '2px solid' : '1px solid',
//                                             borderColor: data.report_type === type.value ? `${type.color}.main` : 'divider',
//                                             bgcolor: data.report_type === type.value ? `${type.color}.light` : 'background.paper',
//                                             transition: 'all 0.2s',
//                                             '&:hover': {
//                                               borderColor: `${type.color}.main`,
//                                               bgcolor: `${type.color}.light`
//                                             }
//                                           }}
//                                           onClick={() => setData('report_type', type.value)}
//                                         >
//                                           <CardContent sx={{ p: 2 }}>
//                                             <Box display="flex" alignItems="center" gap={2}>
//                                               <Avatar sx={{ bgcolor: `${type.color}.main` }}>
//                                                 {type.icon}
//                                               </Avatar>
//                                               <Box flex={1}>
//                                                 <Typography variant="subtitle1" fontWeight="bold">
//                                                   {type.label}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="text.secondary">
//                                                   {type.description}
//                                                 </Typography>
//                                               </Box>
//                                               <Radio 
//                                                 value={type.value} 
//                                                 checked={data.report_type === type.value}
//                                                 sx={{ color: `${type.color}.main` }}
//                                               />
//                                             </Box>
//                                           </CardContent>
//                                         </Card>
//                                       </Grid>
//                                     ))}
//                                   </Grid>
//                                 </RadioGroup>
//                               </FormControl>
//                             </Box>
//                           )}

//                           {index === 1 && (
//                             <Box sx={{ mt: 2 }}>
//                               <Grid container spacing={2}>
//                                 <Grid size={{ xs: 12, md: 6 }}>
//                                   <FormControl fullWidth>
//                                     <InputLabel>Categories</InputLabel>
//                                     <Select
//                                       multiple
//                                       value={data.categories}
//                                       onChange={(e) => setData('categories', e.target.value)}
//                                       input={<OutlinedInput label="Categories" />}
//                                       renderValue={(selected) => (
//                                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                           {selected.map((categoryId) => {
//                                             const category = initialCategories?.find(cat => cat.id === categoryId);
//                                             return (
//                                               <Chip 
//                                                 key={categoryId} 
//                                                 label={category?.name || categoryId} 
//                                                 size="small" 
//                                               />
//                                             );
//                                           })}
//                                         </Box>
//                                       )}
//                                     >
//                                       {initialCategories?.map((category) => (
//                                         <MenuItem key={category.id} value={category.id}>
//                                           <Checkbox checked={data.categories.indexOf(category.id) > -1} />
//                                           <ListItemText primary={category.name} />
//                                         </MenuItem>
//                                       ))}
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>

//                                 <Grid size={{ xs: 12, md: 6 }}>
//                                   <FormControl fullWidth>
//                                     <InputLabel>Departments</InputLabel>
//                                     <Select
//                                       multiple
//                                       value={data.departments}
//                                       onChange={(e) => setData('departments', e.target.value)}
//                                       input={<OutlinedInput label="Departments" />}
//                                       renderValue={(selected) => (
//                                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                           {selected.map((deptId) => {
//                                             const dept = initialDepartments?.find(d => d.id === deptId);
//                                             return (
//                                               <Chip 
//                                                 key={deptId} 
//                                                 label={dept?.name || deptId} 
//                                                 size="small" 
//                                               />
//                                             );
//                                           })}
//                                         </Box>
//                                       )}
//                                     >
//                                       {initialDepartments?.map((dept) => (
//                                         <MenuItem key={dept.id} value={dept.id}>
//                                           <Checkbox checked={data.departments.indexOf(dept.id) > -1} />
//                                           <ListItemText primary={dept.name} />
//                                         </MenuItem>
//                                       ))}
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>

//                                 <Grid size={{ xs: 12 }}>
//                                   <FormControl fullWidth>
//                                     <InputLabel>Date Range</InputLabel>
//                                     <Select
//                                       value={data.date_range}
//                                       label="Date Range"
//                                       onChange={(e) => setData('date_range', e.target.value)}
//                                     >
//                                       {dateRanges.map((range) => (
//                                         <MenuItem key={range.value} value={range.value}>
//                                           {range.label}
//                                         </MenuItem>
//                                       ))}
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>

//                                 {data.date_range === 'custom' && (
//                                   <Grid size={{ xs: 12 }}>
//                                     <Grid container spacing={2}>
//                                       <Grid size={{ xs: 12, md: 6 }}>
//                                         <DatePicker
//                                           label="Start Date"
//                                           value={customDateRange.start}
//                                           onChange={(date) => {
//                                             setCustomDateRange(prev => ({ ...prev, start: date }));
//                                             setData('custom_start_date', date?.toISOString().split('T')[0]);
//                                           }}
//                                           slotProps={{ textField: { fullWidth: true } }}
//                                         />
//                                       </Grid>
//                                       <Grid size={{ xs: 12, md: 6 }}>
//                                         <DatePicker
//                                           label="End Date"
//                                           value={customDateRange.end}
//                                           onChange={(date) => {
//                                             setCustomDateRange(prev => ({ ...prev, end: date }));
//                                             setData('custom_end_date', date?.toISOString().split('T')[0]);
//                                           }}
//                                           slotProps={{ textField: { fullWidth: true } }}
//                                         />
//                                       </Grid>
//                                     </Grid>
//                                   </Grid>
//                                 )}
//                               </Grid>
//                             </Box>
//                           )}

//                           {index === 2 && (
//                             <Box sx={{ mt: 2 }}>
//                               <Grid container spacing={3}>
//                                 <Grid size={{ xs: 12 }}>
//                                   <Typography variant="h6" gutterBottom>
//                                     Content Sections
//                                   </Typography>
//                                   <FormControlLabel
//                                     control={
//                                       <Switch
//                                         checked={data.include_summary}
//                                         onChange={(e) => setData('include_summary', e.target.checked)}
//                                       />
//                                     }
//                                     label="Executive Summary"
//                                   />
//                                   <FormControlLabel
//                                     control={
//                                       <Switch
//                                         checked={data.include_charts}
//                                         onChange={(e) => setData('include_charts', e.target.checked)}
//                                       />
//                                     }
//                                     label="Charts & Visualizations"
//                                   />
//                                   <FormControlLabel
//                                     control={
//                                       <Switch
//                                         checked={data.include_tables}
//                                         onChange={(e) => setData('include_tables', e.target.checked)}
//                                       />
//                                     }
//                                     label="Data Tables"
//                                   />
//                                 </Grid>

//                                 {data.include_charts && (
//                                   <Grid size={{ xs: 12 }}>
//                                     <FormControl fullWidth>
//                                       <InputLabel>Chart Types</InputLabel>
//                                       <Select
//                                         multiple
//                                         value={data.chart_types}
//                                         onChange={(e) => setData('chart_types', e.target.value)}
//                                         input={<OutlinedInput label="Chart Types" />}
//                                         renderValue={(selected) => (
//                                           <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//                                             {selected.map((value) => (
//                                               <Chip 
//                                                 key={value} 
//                                                 label={chartTypes.find(c => c.value === value)?.label} 
//                                                 size="small" 
//                                               />
//                                             ))}
//                                           </Box>
//                                         )}
//                                       >
//                                         {chartTypes.map((chart) => (
//                                           <MenuItem key={chart.value} value={chart.value}>
//                                             <Checkbox checked={data.chart_types.indexOf(chart.value) > -1} />
//                                             <ListItemText primary={chart.label} />
//                                           </MenuItem>
//                                         ))}
//                                       </Select>
//                                     </FormControl>
//                                   </Grid>
//                                 )}

//                                 <Grid size={{ xs: 12 }}>
//                                   <FormControl fullWidth>
//                                     <InputLabel>Data Depth</InputLabel>
//                                     <Select
//                                       value={data.data_depth}
//                                       label="Data Depth"
//                                       onChange={(e) => setData('data_depth', e.target.value)}
//                                     >
//                                       {dataDepthOptions.map((option) => (
//                                         <MenuItem key={option.value} value={option.value}>
//                                           {option.label}
//                                         </MenuItem>
//                                       ))}
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>

//                                 <Grid size={{ xs: 12 }}>
//                                   <FormControlLabel
//                                     control={
//                                       <Switch
//                                         checked={data.compare_period}
//                                         onChange={(e) => setData('compare_period', e.target.checked)}
//                                       />
//                                     }
//                                     label="Compare with previous period"
//                                   />
//                                 </Grid>
//                               </Grid>
//                             </Box>
//                           )}

//                           {index === 3 && (
//                             <Box sx={{ mt: 2 }}>
//                               <Grid container spacing={2}>
//                                 <Grid size={{ xs: 12 }}>
//                                   <FormControl fullWidth>
//                                     <InputLabel>Export Format</InputLabel>
//                                     <Select
//                                       value={data.export_format}
//                                       label="Export Format"
//                                       onChange={(e) => setData('export_format', e.target.value)}
//                                     >
//                                       <MenuItem value="pdf">
//                                         <Box display="flex" alignItems="center" gap={1}>
//                                           <PictureAsPdf fontSize="small" />
//                                           PDF Document
//                                         </Box>
//                                       </MenuItem>
//                                       <MenuItem value="excel">Excel Spreadsheet</MenuItem>
//                                       <MenuItem value="csv">CSV File</MenuItem>
//                                       <MenuItem value="html">HTML Report</MenuItem>
//                                     </Select>
//                                   </FormControl>
//                                 </Grid>

//                                 <Grid size={{ xs: 12 }}>
//                                   <FormControlLabel
//                                     control={
//                                       <Switch
//                                         checked={data.include_export}
//                                         onChange={(e) => setData('include_export', e.target.checked)}
//                                       />
//                                     }
//                                     label="Include export-ready files"
//                                   />
//                                 </Grid>
//                               </Grid>
//                             </Box>
//                           )}

//                           <Box sx={{ mb: 2, mt: 3 }}>
//                             <Button
//                               variant="contained"
//                               onClick={index === steps.length - 1 ? handleGenerateReport : handleNext}
//                               disabled={processing}
//                               startIcon={processing ? <CircularProgress size={20} /> : null}
//                               sx={{ mt: 1, mr: 1 }}
//                             >
//                               {processing ? 'Generating...' : index === steps.length - 1 ? 'Generate Report' : 'Continue'}
//                             </Button>
//                             <Button
//                               disabled={index === 0 || processing}
//                               onClick={handleBack}
//                               sx={{ mt: 1, mr: 1 }}
//                             >
//                               Back
//                             </Button>
//                           </Box>
//                         </StepContent>
//                       </Step>
//                     ))}
//                   </Stepper>
//                 </CardContent>
//               </Card>
//             </Grid>

//             <Grid size={{ xs: 12, md: 4 }}>
//               <Card elevation={2} sx={{ position: 'sticky', top: 24 }}>
//                 <CardContent>
//                   <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
//                     <AutoAwesome fontSize="small" />
//                     Report Preview
//                   </Typography>
                  
//                   <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
//                     <List dense>
//                       <ListItem>
//                         <ListItemIcon>
//                           <Analytics fontSize="small" />
//                         </ListItemIcon>
//                         <MuiListItemText primary="Report Type" secondary={preview.type} />
//                       </ListItem>
//                       <Divider />
//                       <ListItem>
//                         <ListItemIcon>
//                           <FilterList fontSize="small" />
//                         </ListItemIcon>
//                         <MuiListItemText primary="Categories" secondary={preview.categories} />
//                       </ListItem>
//                       <ListItem>
//                         <ListItemIcon>
//                           <FilterList fontSize="small" />
//                         </ListItemIcon>
//                         <MuiListItemText primary="Departments" secondary={preview.departments} />
//                       </ListItem>
//                       <ListItem>
//                         <ListItemIcon>
//                           <DateRange fontSize="small" />
//                         </ListItemIcon>
//                         <MuiListItemText primary="Date Range" secondary={preview.dateRange} />
//                       </ListItem>
//                       <ListItem>
//                         <ListItemIcon>
//                           <GridView fontSize="small" />
//                         </ListItemIcon>
//                         <MuiListItemText primary="Content" secondary={preview.content} />
//                       </ListItem>
//                       <ListItem>
//                         <ListItemIcon>
//                           <Download fontSize="small" />
//                         </ListItemIcon>
//                         <MuiListItemText primary="Export Format" secondary={preview.export} />
//                       </ListItem>
//                     </List>
//                   </Paper>

//                   <Accordion>
//                     <AccordionSummary expandIcon={<ExpandMore />}>
//                       <Typography>Quick Reports</Typography>
//                     </AccordionSummary>
//                     <AccordionDetails>
//                       <Box display="flex" flexDirection="column" gap={1}>
//                         {reportTypes.slice(0, 4).map((type) => (
//                           <Button 
//                             key={type.value}
//                             variant="outlined" 
//                             startIcon={type.icon}
//                             onClick={() => handleQuickReport(type.value)}
//                             sx={{ justifyContent: 'flex-start' }}
//                           >
//                             {type.label}
//                           </Button>
//                         ))}
//                       </Box>
//                     </AccordionDetails>
//                   </Accordion>
//                 </CardContent>
//               </Card>
//             </Grid>
//           </Grid>

//           {/* Report Display Section */}
//           <ReportDisplay />
//         </Box>
//       </LocalizationProvider>
//     </AuthenticatedLayout>
//   );
// };

// export default ModernReportGenerator;
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  RadioGroup,
  Radio,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ExpandMore,
  BarChart,
  TableChart,
  PictureAsPdf,
  GridView,
  Analytics,
  TrendingUp,
  Inventory2,
  Warning,
  Download,
  AutoAwesome,
  Dashboard,
  DateRange,
  FilterList,
  Print,
  Visibility,
  TrendingDown,
  AttachMoney,
  Numbers,
  Home,
  Folder,
  Build,
  ShoppingCart,
  History,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Recharts for diagrams
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import Notification from '@/Components/Notification';

const ModernReportGenerator = ({ auth, categories: initialCategories, locations: initialLocations, departments: initialDepartments }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null
  });
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const { flash, reportData: initialReportData } = usePage().props;
  
  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert({ ...alert, open: false }), 5000);
  };
  
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    report_type: 'comprehensive',
    categories: [],
    locations: [],
    departments: [],
    date_range: 'last30days',
    custom_start_date: '',
    custom_end_date: '',
    include_charts: true,
    include_tables: true,
    include_summary: true,
    include_export: true,
    export_format: 'pdf',
    chart_types: ['bar', 'pie'],
    data_depth: 'summary',
    compare_period: false,
    suppliers: [],
    maintenance_types: [],
    priority_levels: [],
    order_types: [],
  });

  // Enhanced report types with new additions
  const reportTypes = [
    { 
      value: 'comprehensive', 
      label: 'Comprehensive Inventory Report',
      icon: <Dashboard />,
      description: 'Complete overview with analytics and trends',
      color: 'primary'
    },
    { 
      value: 'stock-level', 
      label: 'Stock Level Analysis',
      icon: <Inventory2 />,
      description: 'Current stock status and alerts',
      color: 'info'
    },
    { 
      value: 'acquisition', 
      label: 'Acquisition Report',
      icon: <TrendingUp />,
      description: 'Purchase and acquisition trends',
      color: 'success'
    },
    { 
      value: 'depreciation', 
      label: 'Depreciation Report',
      icon: <Analytics />,
      description: 'Asset depreciation and valuation',
      color: 'warning'
    },
    { 
      value: 'audit', 
      label: 'Audit Trail Report',
      icon: <History />,
      description: 'Complete activity and change history',
      color: 'secondary'
    },
    { 
      value: 'procurement', 
      label: 'Procurement Performance',
      icon: <ShoppingCart />,
      description: 'Supplier performance and purchase analysis',
      color: 'info'
    },
    { 
      value: 'maintenance', 
      label: 'Maintenance Report',
      icon: <Build />,
      description: 'Equipment maintenance and reliability',
      color: 'error'
    },
  ];

  const dateRanges = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'currentQuarter', label: 'Current Quarter' },
    { value: 'currentYear', label: 'Current Year' },
    { value: 'previousMonth', label: 'Previous Month' },
    { value: 'previousQuarter', label: 'Previous Quarter' },
    { value: 'previousYear', label: 'Previous Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Charts' },
    { value: 'pie', label: 'Pie Charts' },
    { value: 'line', label: 'Line Charts' },
    { value: 'area', label: 'Area Charts' },
  ];

  const dataDepthOptions = [
    { value: 'summary', label: 'Summary Only' },
    { value: 'detailed', label: 'Detailed Data' },
    { value: 'granular', label: 'Granular Level' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // Memoized report data handling
  const reportData = useMemo(() => {
    return initialReportData || null;
  }, [initialReportData]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleGenerateReport = () => {
    post(route('inventory-report.generate'), {
      preserveScroll: true,
      onSuccess: () => {
        showAlert('Report generated successfully!', 'success');
        setActiveTab(0); // Reset to summary tab
      },
      onError: (errors) => {
        showAlert('Failed to generate report. Please check your inputs.', 'error');
      }
    });
  };

  const handleQuickReport = (type) => {
    setData({
      ...data,
      report_type: type,
      date_range: 'last30days',
      include_charts: true,
      include_tables: true,
      include_summary: true,
    });
    
    post(route('inventory-report.generate'), {
      preserveScroll: true,
      onSuccess: () => {
        showAlert(`${reportTypes.find(t => t.value === type)?.label} generated successfully!`, 'success');
      }
    });
  };

  const handleExportReport = () => {
    if (reportData) {
      post(route('reports.export'), {
        data: {
          report_data: reportData,
          config: data,
          format: data.export_format,
        }
      });
    }
  };

  const steps = [
    {
      label: 'Report Type',
      description: 'Choose the type of analysis you need',
      icon: <Analytics />,
    },
    {
      label: 'Data Filters',
      description: 'Refine your dataset with specific criteria',
      icon: <FilterList />,
    },
    {
      label: 'Content & Design',
      description: 'Customize the look and content of your report',
      icon: <AutoAwesome />,
    },
    {
      label: 'Export Settings',
      description: 'Choose how to receive your report',
      icon: <Download />,
    },
  ];

  const getReportPreview = () => {
    const type = reportTypes.find(t => t.value === data.report_type);
    
    const categoryNames = data.categories.length > 0 
      ? data.categories.map(categoryId => {
          const category = initialCategories?.find(cat => cat.id === categoryId);
          return category?.name || categoryId;
        }).join(', ')
      : 'All Categories';

    const departmentNames = data.departments.length > 0
      ? data.departments.map(deptId => {
          const dept = initialDepartments?.find(d => d.id === deptId);
          return dept?.name || deptId;
        }).join(', ')
      : 'All Departments';

    return {
      type: type?.label || 'Unknown Report',
      categories: categoryNames,
      departments: departmentNames,
      dateRange: data.date_range === 'custom' 
        ? `Custom: ${customDateRange.start?.toLocaleDateString()} - ${customDateRange.end?.toLocaleDateString()}`
        : dateRanges.find(d => d.value === data.date_range)?.label,
      content: [
        ...(data.include_summary ? ['Executive Summary'] : []),
        ...(data.include_charts ? ['Visual Analytics'] : []),
        ...(data.include_tables ? ['Data Tables'] : []),
      ].join(' • '),
      export: data.export_format.toUpperCase(),
    };
  };

  // Enhanced Chart rendering with better error handling
  const renderBarChart = (chartData, dataKey, name, xDataKey = 'name', color = '#8884d8') => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography color="textSecondary">No data available for bar chart</Typography>
        </Box>
      );
    }

    const validData = chartData.map(item => ({
      ...item,
      [xDataKey]: item[xDataKey] || 'Unknown',
      [dataKey]: item[dataKey] || item.value || 0
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={validData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xDataKey} />
          <YAxis />
          <RechartsTooltip formatter={(value) => [value.toLocaleString(), name]} />
          <Legend />
          <Bar dataKey={dataKey} fill={color} name={name} />
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = (chartData, dataKey, nameKey = 'name') => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography color="textSecondary">No data available for pie chart</Typography>
        </Box>
      );
    }

    const validData = chartData.map((item, index) => ({
      name: item[nameKey] || item.name || `Item ${index + 1}`,
      value: item[dataKey] || item.value || 0,
      count: item.count || 0
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {validData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(value, name, props) => [value.toLocaleString(), props.payload.name]} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = (chartData, dataKey, name, xDataKey = 'name', color = '#8884d8') => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography color="textSecondary">No data available for line chart</Typography>
        </Box>
      );
    }

    const validData = chartData.map(item => ({
      ...item,
      [xDataKey]: item[xDataKey] || 'Unknown',
      [dataKey]: item[dataKey] || item.value || 0
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={validData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xDataKey} />
          <YAxis />
          <RechartsTooltip formatter={(value) => [value.toLocaleString(), name]} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            name={name}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Enhanced Summary Cards with conditional rendering
  const SummaryCards = ({ summary }) => {
    if (!summary || typeof summary !== 'object') {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          No summary data available for this report.
        </Alert>
      );
    }

    const summaryMetrics = [
      {
        label: 'Total Transactions',
        value: summary.total_transactions?.toLocaleString() || 
               summary.total_acquisitions?.toLocaleString() || 
               summary.total_orders?.toLocaleString() || 
               '0',
        icon: <Numbers color="primary" />,
        color: 'primary'
      },
      {
        label: 'Total Value',
        value: `₵${(summary.total_value || 
                    summary.total_inventory_value || 
                    summary.total_amount || 
                    0).toLocaleString()}`,
        icon: <AttachMoney color="success" />,
        color: 'success'
      },
      {
        label: 'Incoming Stock',
        value: (summary.incoming_stock?.toLocaleString() || 
                summary.total_incoming?.toLocaleString() || 
                '0'),
        icon: <TrendingUp color="info" />,
        color: 'info'
      },
      {
        label: 'Outgoing Stock',
        value: (summary.outgoing_stock?.toLocaleString() || 
                summary.total_outgoing?.toLocaleString() || 
                '0'),
        icon: <TrendingDown color="warning" />,
        color: 'warning'
      },
      {
        label: 'Low Stock Items',
        value: (summary.low_stock_items?.toLocaleString() || 
                summary.items_need_reorder?.toLocaleString() || 
                '0'),
        icon: <Warning color="error" />,
        color: 'error'
      },
      {
        label: 'Out of Stock',
        value: (summary.out_of_stock_items?.toLocaleString() || 
                summary.out_of_stock_items?.toLocaleString() || 
                '0'),
        icon: <Inventory2 color="secondary" />,
        color: 'secondary'
      }
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryMetrics.map((metric, index) => (
          <Grid key={index} size={{ xs: 6, md: 4 }}>
            <Card sx={{ height: '100%', borderLeft: `4px solid` }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: `${metric.color}.light`, width: 48, height: 48 }}>
                    {metric.icon}
                  </Avatar>
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline">
                      {metric.label}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {metric.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Enhanced Data Table Component
  const DataTable = ({ title, data, columns, sx = {} }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <Card sx={{ mb: 2, ...sx }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            <Alert severity="info">No data available for this section</Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ mb: 2, ...sx }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key} sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} hover>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  // Report Display Component
  const ReportDisplay = () => {
    if (!reportData) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          Configure your report settings and generate a report to see the results.
        </Alert>
      );
    }

    const chartData = reportData.trends || {};
    const summaryData = reportData.summary || {};

    return (
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {reportTypes.find(t => t.value === data.report_type)?.label || 'Generated Report'}
                </Typography>
                <Typography color="textSecondary">
                  Generated on {new Date().toLocaleDateString()} • {data.data_depth} level
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Tooltip title="Print Report">
                  <IconButton onClick={() => window.print()}>
                    <Print />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Preview Report">
                  <IconButton>
                    <Visibility />
                  </IconButton>
                </Tooltip>
                <Button 
                  variant="contained" 
                  startIcon={<Download />}
                  onClick={handleExportReport}
                  disabled={!reportData}
                >
                  Export as {data.export_format.toUpperCase()}
                </Button>
              </Box>
            </Box>

            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)} 
              sx={{ mb: 3 }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Summary" icon={<Dashboard />} iconPosition="start" />
              <Tab label="Analytics" icon={<BarChart />} iconPosition="start" />
              <Tab label="Data Tables" icon={<TableChart />} iconPosition="start" />
              <Tab label="Details" icon={<GridView />} iconPosition="start" />
            </Tabs>

            {activeTab === 0 && (
              <Box>
                {data.include_summary && <SummaryCards summary={summaryData} />}
                
                {/* Additional summary sections based on report type */}
                {reportData.stock_level_summary && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Stock Level Overview</Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <Typography variant="body2" color="textSecondary">Total Inventory Value</Typography>
                          <Typography variant="h6">₵{reportData.stock_level_summary.total_inventory_value?.toLocaleString()}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                          <Typography variant="body2" color="textSecondary">Items Tracked</Typography>
                          <Typography variant="h6">{reportData.stock_level_summary.total_items_tracked}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            {activeTab === 1 && data.include_charts && (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Visual Analytics</Typography>
                
                {(!chartData || Object.keys(chartData).length === 0) && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No chart data available for this report.
                  </Alert>
                )}
                
                <Grid container spacing={3}>
                  {data.chart_types?.includes('bar') && chartData.monthly_trends && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Monthly Value Trend</Typography>
                          {renderBarChart(chartData.monthly_trends, 'value', 'Total Value (₵)', 'month', '#0088FE')}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {data.chart_types?.includes('pie') && chartData.category_distribution && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Category Distribution</Typography>
                          {renderPieChart(chartData.category_distribution, 'value')}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {data.chart_types?.includes('line') && chartData.monthly_trends && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Transaction Trends</Typography>
                          {renderLineChart(chartData.monthly_trends, 'transactions', 'Transaction Count', 'month', '#00C49F')}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  {data.chart_types?.includes('bar') && chartData.transaction_type_distribution && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>Transaction Types</Typography>
                          {renderBarChart(chartData.transaction_type_distribution, 'value', 'Total Value (₵)', 'label', '#FF8042')}
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {activeTab === 2 && data.include_tables && (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Detailed Data Tables</Typography>
                
                <Grid container spacing={3}>
                  {reportData.category_breakdown && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DataTable
                        title="Category Breakdown"
                        data={reportData.category_breakdown}
                        columns={[
                          { key: 'category', label: 'Category' },
                          { key: 'transactions', label: 'Transactions' },
                          { key: 'total_quantity', label: 'Quantity' },
                          { 
                            key: 'total_value', 
                            label: 'Total Value', 
                            render: (value) => `₵${Number(value || 0).toLocaleString()}`
                          },
                        ]}
                      />
                    </Grid>
                  )}

                  {reportData.department_analysis && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <DataTable
                        title="Department Analysis"
                        data={reportData.department_analysis}
                        columns={[
                          { key: 'department', label: 'Department' },
                          { key: 'transactions', label: 'Transactions' },
                          { key: 'total_value', label: 'Total Value', render: (value) => `₵${value}` },
                        ]}
                      />
                    </Grid>
                  )}

                  {reportData.critical_items && (
                    <Grid size={{ xs: 12 }}>
                      <DataTable
                        title="Critical Stock Items"
                        data={reportData.critical_items}
                        columns={[
                          { key: 'name', label: 'Item Name' },
                          { key: 'category', label: 'Category' },
                          { key: 'current_quantity', label: 'Current Qty' },
                          { key: 'available_quantity', label: 'Available Qty' },
                          { key: 'status', label: 'Status', render: (value) => (
                            <Chip 
                              label={value?.replace(/_/g, ' ') || 'Unknown'} 
                              color={
                                value === 'out_of_stock' ? 'error' : 
                                value === 'low_stock' ? 'warning' : 'success'
                              } 
                              size="small" 
                            />
                          )}
                        ]}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Report Details</Typography>
                
                {/* Additional report-specific details */}
                {reportData.recent_activities && (
                  <DataTable
                    title="Recent Activities"
                    data={reportData.recent_activities}
                    columns={[
                      { key: 'date', label: 'Date' },
                      { key: 'action', label: 'Action' },
                      { key: 'item', label: 'Item' },
                      { key: 'user', label: 'User' },
                      { key: 'quantity', label: 'Quantity' },
                      { key: 'value', label: 'Value', render: (value) => `₵${value}` },
                    ]}
                  />
                )}

                {reportData.transaction_analysis && (
                  <DataTable
                    title="Transaction Analysis"
                    data={reportData.transaction_analysis}
                    columns={[
                      { key: 'label', label: 'Type' },
                      { key: 'count', label: 'Count' },
                      { key: 'total_quantity', label: 'Total Qty' },
                      { key: 'total_value', label: 'Total Value', render: (value) => `₵${value}` },
                    ]}
                  />
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  };

  const preview = getReportPreview();

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

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Advanced Report Generator"
      header={
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Report Generator
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 1 }}>
            <Link underline="hover" color="inherit" href="/dashboard" display="flex" alignItems="center">
              <Home sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Link underline="hover" color="inherit" href="/reports" display="flex" alignItems="center">
              <Folder sx={{ mr: 0.5 }} fontSize="inherit" />
              Reports
            </Link>
            <Typography color="text.primary" display="flex" alignItems="center">
              <Analytics sx={{ mr: 0.5 }} fontSize="inherit" />
              Report Generator
            </Typography>
          </Breadcrumbs>
        </Box>
      }
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box p={3}>
          <Notification 
            open={alert.open} 
            severity={alert.severity} 
            message={alert.message}
            onClose={handleCloseAlert}
          />

          {errors.report_type && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.report_type}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card elevation={2}>
                <CardContent sx={{ p: 3 }}>
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {steps.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel StepIconComponent={() => (
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            {step.icon}
                          </Avatar>
                        )}>
                          <Typography variant="h6">{step.label}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {step.description}
                          </Typography>
                        </StepLabel>
                        <StepContent>
                          {index === 0 && (
                            <Box sx={{ mt: 2 }}>
                              <FormControl component="fieldset" fullWidth>
                                <RadioGroup
                                  value={data.report_type}
                                  onChange={(e) => setData('report_type', e.target.value)}
                                >
                                  <Grid container spacing={2}>
                                    {reportTypes.map((type) => (
                                      <Grid key={type.value} size={{ xs: 12, md: 6 }}>
                                        <Card 
                                          variant="outlined"
                                          sx={{ 
                                            cursor: 'pointer',
                                            border: data.report_type === type.value ? '2px solid' : '1px solid',
                                            borderColor: data.report_type === type.value ? `${type.color}.main` : 'divider',
                                            bgcolor: data.report_type === type.value ? `${type.color}.light` : 'background.paper',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                              borderColor: `${type.color}.main`,
                                              bgcolor: `${type.color}.light`
                                            }
                                          }}
                                          onClick={() => setData('report_type', type.value)}
                                        >
                                          <CardContent sx={{ p: 2 }}>
                                            <Box display="flex" alignItems="center" gap={2}>
                                              <Avatar sx={{ bgcolor: `${type.color}.main` }}>
                                                {type.icon}
                                              </Avatar>
                                              <Box flex={1}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                  {type.label}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                  {type.description}
                                                </Typography>
                                              </Box>
                                              <Radio 
                                                value={type.value} 
                                                checked={data.report_type === type.value}
                                                sx={{ color: `${type.color}.main` }}
                                              />
                                            </Box>
                                          </CardContent>
                                        </Card>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </RadioGroup>
                              </FormControl>
                            </Box>
                          )}

                          {index === 1 && (
                            <Box sx={{ mt: 2 }}>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <FormControl fullWidth>
                                    <InputLabel>Categories</InputLabel>
                                    <Select
                                      multiple
                                      value={data.categories}
                                      onChange={(e) => setData('categories', e.target.value)}
                                      input={<OutlinedInput label="Categories" />}
                                      renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                          {selected.map((categoryId) => {
                                            const category = initialCategories?.find(cat => cat.id === categoryId);
                                            return (
                                              <Chip 
                                                key={categoryId} 
                                                label={category?.name || categoryId} 
                                                size="small" 
                                              />
                                            );
                                          })}
                                        </Box>
                                      )}
                                    >
                                      {initialCategories?.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                          <Checkbox checked={data.categories.indexOf(category.id) > -1} />
                                          <ListItemText primary={category.name} />
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                  <FormControl fullWidth>
                                    <InputLabel>Departments</InputLabel>
                                    <Select
                                      multiple
                                      value={data.departments}
                                      onChange={(e) => setData('departments', e.target.value)}
                                      input={<OutlinedInput label="Departments" />}
                                      renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                          {selected.map((deptId) => {
                                            const dept = initialDepartments?.find(d => d.id === deptId);
                                            return (
                                              <Chip 
                                                key={deptId} 
                                                label={dept?.name || deptId} 
                                                size="small" 
                                              />
                                            );
                                          })}
                                        </Box>
                                      )}
                                    >
                                      {initialDepartments?.map((dept) => (
                                        <MenuItem key={dept.id} value={dept.id}>
                                          <Checkbox checked={data.departments.indexOf(dept.id) > -1} />
                                          <ListItemText primary={dept.name} />
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                  <FormControl fullWidth>
                                    <InputLabel>Date Range</InputLabel>
                                    <Select
                                      value={data.date_range}
                                      label="Date Range"
                                      onChange={(e) => setData('date_range', e.target.value)}
                                    >
                                      {dateRanges.map((range) => (
                                        <MenuItem key={range.value} value={range.value}>
                                          {range.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>

                                {data.date_range === 'custom' && (
                                  <Grid size={{ xs: 12 }}>
                                    <Grid container spacing={2}>
                                      <Grid size={{ xs: 12, md: 6 }}>
                                        <DatePicker
                                          label="Start Date"
                                          value={customDateRange.start}
                                          onChange={(date) => {
                                            setCustomDateRange(prev => ({ ...prev, start: date }));
                                            setData('custom_start_date', date?.toISOString().split('T')[0]);
                                          }}
                                          slotProps={{ textField: { fullWidth: true } }}
                                        />
                                      </Grid>
                                      <Grid size={{ xs: 12, md: 6 }}>
                                        <DatePicker
                                          label="End Date"
                                          value={customDateRange.end}
                                          onChange={(date) => {
                                            setCustomDateRange(prev => ({ ...prev, end: date }));
                                            setData('custom_end_date', date?.toISOString().split('T')[0]);
                                          }}
                                          slotProps={{ textField: { fullWidth: true } }}
                                        />
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          )}

                          {index === 2 && (
                            <Box sx={{ mt: 2 }}>
                              <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                  <Typography variant="h6" gutterBottom>
                                    Content Sections
                                  </Typography>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={data.include_summary}
                                        onChange={(e) => setData('include_summary', e.target.checked)}
                                      />
                                    }
                                    label="Executive Summary"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={data.include_charts}
                                        onChange={(e) => setData('include_charts', e.target.checked)}
                                      />
                                    }
                                    label="Charts & Visualizations"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={data.include_tables}
                                        onChange={(e) => setData('include_tables', e.target.checked)}
                                      />
                                    }
                                    label="Data Tables"
                                  />
                                </Grid>

                                {data.include_charts && (
                                  <Grid size={{ xs: 12 }}>
                                    <FormControl fullWidth>
                                      <InputLabel>Chart Types</InputLabel>
                                      <Select
                                        multiple
                                        value={data.chart_types}
                                        onChange={(e) => setData('chart_types', e.target.value)}
                                        input={<OutlinedInput label="Chart Types" />}
                                        renderValue={(selected) => (
                                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                              <Chip 
                                                key={value} 
                                                label={chartTypes.find(c => c.value === value)?.label} 
                                                size="small" 
                                              />
                                            ))}
                                          </Box>
                                        )}
                                      >
                                        {chartTypes.map((chart) => (
                                          <MenuItem key={chart.value} value={chart.value}>
                                            <Checkbox checked={data.chart_types.indexOf(chart.value) > -1} />
                                            <ListItemText primary={chart.label} />
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Grid>
                                )}

                                <Grid size={{ xs: 12 }}>
                                  <FormControl fullWidth>
                                    <InputLabel>Data Depth</InputLabel>
                                    <Select
                                      value={data.data_depth}
                                      label="Data Depth"
                                      onChange={(e) => setData('data_depth', e.target.value)}
                                    >
                                      {dataDepthOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                          {option.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={data.compare_period}
                                        onChange={(e) => setData('compare_period', e.target.checked)}
                                      />
                                    }
                                    label="Compare with previous period"
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          )}

                          {index === 3 && (
                            <Box sx={{ mt: 2 }}>
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                  <FormControl fullWidth>
                                    <InputLabel>Export Format</InputLabel>
                                    <Select
                                      value={data.export_format}
                                      label="Export Format"
                                      onChange={(e) => setData('export_format', e.target.value)}
                                    >
                                      <MenuItem value="pdf">
                                        <Box display="flex" alignItems="center" gap={1}>
                                          <PictureAsPdf fontSize="small" />
                                          PDF Document
                                        </Box>
                                      </MenuItem>
                                      <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                                      <MenuItem value="csv">CSV File</MenuItem>
                                      <MenuItem value="html">HTML Report</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        checked={data.include_export}
                                        onChange={(e) => setData('include_export', e.target.checked)}
                                      />
                                    }
                                    label="Include export-ready files"
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          )}

                          <Box sx={{ mb: 2, mt: 3 }}>
                            <Button
                              variant="contained"
                              onClick={index === steps.length - 1 ? handleGenerateReport : handleNext}
                              disabled={processing}
                              startIcon={processing ? <CircularProgress size={20} /> : null}
                              sx={{ mt: 1, mr: 1 }}
                            >
                              {processing ? 'Generating...' : index === steps.length - 1 ? 'Generate Report' : 'Continue'}
                            </Button>
                            <Button
                              disabled={index === 0 || processing}
                              onClick={handleBack}
                              sx={{ mt: 1, mr: 1 }}
                            >
                              Back
                            </Button>
                          </Box>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={2} sx={{ position: 'sticky', top: 24 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <AutoAwesome fontSize="small" />
                    Report Preview
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Analytics fontSize="small" />
                        </ListItemIcon>
                        <MuiListItemText primary="Report Type" secondary={preview.type} />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <FilterList fontSize="small" />
                        </ListItemIcon>
                        <MuiListItemText primary="Categories" secondary={preview.categories} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <FilterList fontSize="small" />
                        </ListItemIcon>
                        <MuiListItemText primary="Departments" secondary={preview.departments} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <DateRange fontSize="small" />
                        </ListItemIcon>
                        <MuiListItemText primary="Date Range" secondary={preview.dateRange} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <GridView fontSize="small" />
                        </ListItemIcon>
                        <MuiListItemText primary="Content" secondary={preview.content} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Download fontSize="small" />
                        </ListItemIcon>
                        <MuiListItemText primary="Export Format" secondary={preview.export} />
                      </ListItem>
                    </List>
                  </Paper>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>Quick Reports</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {reportTypes.slice(0, 4).map((type) => (
                          <Button 
                            key={type.value}
                            variant="outlined" 
                            startIcon={type.icon}
                            onClick={() => handleQuickReport(type.value)}
                            sx={{ justifyContent: 'flex-start' }}
                          >
                            {type.label}
                          </Button>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Report Display Section */}
          <ReportDisplay />
        </Box>
      </LocalizationProvider>
    </AuthenticatedLayout>
  );
};

export default ModernReportGenerator;
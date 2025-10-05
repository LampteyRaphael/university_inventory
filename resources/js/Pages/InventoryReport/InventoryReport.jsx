import React, { useState, useEffect } from 'react';
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
} from 'recharts';
import Notification from '@/Components/Notification';

const ModernReportGenerator = ({ auth, categories: initialCategories, locations: initialLocations }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null
  });
  const [activeTab, setActiveTab] = useState(0);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
    const { flash } = usePage().props;
    
    const showAlert = (message, severity = "success") => {
      setAlert({ open: true, message, severity });
      setTimeout(() => setAlert({ ...alert, open: false }), 5000);
    };
    
  // Get report data from Inertia page props
  const { props } = usePage();
  const reportData = props.reportData;


  const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    report_type: 'comprehensive',
    categories: [],
    locations: [],
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
  });

  const reportTypes = [
    { 
      value: 'comprehensive', 
      label: 'Comprehensive Inventory Report',
      icon: <Dashboard />,
      description: 'Complete overview with analytics and trends'
    },
    { 
      value: 'stock-level', 
      label: 'Stock Level Analysis',
      icon: <Inventory2 />,
      description: 'Current stock status and alerts'
    },
    { 
      value: 'acquisition', 
      label: 'Acquisition Report',
      icon: <TrendingUp />,
      description: 'Purchase and acquisition trends'
    },
    { 
      value: 'depreciation', 
      label: 'Depreciation Report',
      icon: <Analytics />,
      description: 'Asset depreciation and valuation'
    },
    { 
      value: 'audit', 
      label: 'Audit Trail Report',
      icon: <Warning />,
      description: 'Complete activity and change history'
    },
  ];

  const dateRanges = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'currentYear', label: 'Current Year' },
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

  // Sample data for demonstration when no real data is available
  const sampleChartData = {
    monthly_trends: [
      { month: 'Jan', value: 4000, transactions: 45 },
      { month: 'Feb', value: 3000, transactions: 38 },
      { month: 'Mar', value: 5000, transactions: 52 },
      { month: 'Apr', value: 2780, transactions: 29 },
      { month: 'May', value: 1890, transactions: 21 },
      { month: 'Jun', value: 2390, transactions: 26 },
    ],
    category_distribution: [
      { name: 'Electronics', value: 400 },
      { name: 'Furniture', value: 300 },
      { name: 'Office Supplies', value: 200 },
      { name: 'Tools', value: 150 },
      { name: 'Vehicles', value: 100 },
    ],
    transaction_type_distribution: [
      { label: 'Purchase', value: 5000 },
      { label: 'Sale', value: 3000 },
      { label: 'Transfer', value: 1500 },
      { label: 'Adjustment', value: 500 },
    ]
  };

  const sampleSummaryData = {
    total_transactions: 150,
    total_value: 50000,
    incoming_stock: 75,
    outgoing_stock: 60,
    low_stock_items: 12,
    out_of_stock_items: 3
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleGenerateReport = () => {
    post(route('reports.generate'), {
      preserveScroll: true,
      onSuccess: () => {
        // Handle success - maybe download or show preview
        // console.log('Report generated successfully');
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
    
    post(route('reports.generate'));
  };

  const handleExportReport = () => {
    if (reportData) {
      post(route('reports.export'), {
        report_data: reportData,
        config: data,
        format: data.export_format,
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
    
    // Map category IDs to names
    const categoryNames = data.categories.length > 0 
      ? data.categories.map(categoryId => {
          const category = initialCategories?.find(cat => cat.id === categoryId);
          return category?.name || categoryId;
        }).join(', ')
      : 'All Categories';

    return {
      type: type?.label || 'Unknown Report',
      categories: categoryNames,
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

  // Enhanced Chart rendering functions with data validation
  const renderBarChart = (chartData, dataKey, name, xDataKey = 'name') => {
    // Use sample data if no real data available
    const displayData = chartData && Array.isArray(chartData) && chartData.length > 0 
      ? chartData 
      : sampleChartData.monthly_trends;

    if (!displayData || !Array.isArray(displayData) || displayData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography color="textSecondary">No data available for bar chart</Typography>
        </Box>
      );
    }

    // Ensure data has the required structure
    const validData = displayData.map(item => ({
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
          <RechartsTooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#8884d8" name={name} />
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = (chartData, dataKey, nameKey = 'name') => {
    // Use sample data if no real data available
    const displayData = chartData && Array.isArray(chartData) && chartData.length > 0 
      ? chartData 
      : sampleChartData.category_distribution;

    if (!displayData || !Array.isArray(displayData) || displayData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography color="textSecondary">No data available for pie chart</Typography>
        </Box>
      );
    }

    const validData = displayData.map((item, index) => ({
      name: item[nameKey] || item.name || `Item ${index + 1}`,
      value: item[dataKey] || item.value || 0
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
          <RechartsTooltip formatter={(value) => [value, 'Value']} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = (chartData, dataKey, name, xDataKey = 'name') => {
    // Use sample data if no real data available
    const displayData = chartData && Array.isArray(chartData) && chartData.length > 0 
      ? chartData 
      : sampleChartData.monthly_trends;

    if (!displayData || !Array.isArray(displayData) || displayData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={300}>
          <Typography color="textSecondary">No data available for line chart</Typography>
        </Box>
      );
    }

    const validData = displayData.map(item => ({
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
          <RechartsTooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke="#8884d8" name={name} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Enhanced Summary Cards Component with fallback data
  const SummaryCards = ({ summary }) => {
    // Use provided summary or create fallback
    const displaySummary = summary && typeof summary === 'object' ? summary : sampleSummaryData;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs:6, md:6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Numbers color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Total Transactions
                  </Typography>
                  <Typography variant="h6">
                    {
                      displaySummary.total_transactions?.toLocaleString() ||
                      displaySummary.total_items?.toLocaleString() || 
                      displaySummary.total_acquisitions?.toLocaleString() || 
                      0}
                    </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs:6, md:6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AttachMoney color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Total Value
                  </Typography>
                  <Typography variant="h6">
                    ${displaySummary.total_value?.toLocaleString() ||
                      displaySummary.total_incoming_value?.toLocaleString() || 
                    0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs:6, md:6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Incoming Stock
                  </Typography>
                  <Typography variant="h6">
                    {
                    displaySummary.incoming_stock?.toLocaleString() || 
                    displaySummary.total_incoming?.toLocaleString() || 
                    
                    0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs:6, md:6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingDown color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Outgoing Stock
                  </Typography>
                  <Typography variant="h6">
                    {
                    displaySummary.outgoing_stock?.toLocaleString() ||
                    displaySummary.total_outgoing?.toLocaleString() ||
                    
                    0}
                    </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Data Table Component
  const DataTable = ({ title, data, columns }) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            <Typography color="textSecondary">No data available</Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key}><strong>{column.label}</strong></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
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

    // console.log(reportData)
    if (!reportData) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          Configure your report settings and generate a report to see the results.
        </Alert>
      );
    }

    // Get chart data with fallbacks
    // {console.log( reportData.summary)}
    const chartData = reportData.trends || sampleChartData;
    const summaryData = reportData.summary || sampleSummaryData;

    return (
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5">
                {reportTypes.find(t => t.value === data.report_type)?.label || 'Generated Report'}
              </Typography>
              <Box>
                <Tooltip title="Print Report">
                  <IconButton onClick={() => window.print()} sx={{ mr: 1 }}>
                    <Print />
                  </IconButton>
                </Tooltip>
                <Button 
                  variant="outlined" 
                  startIcon={<Download />}
                  onClick={handleExportReport}
                >
                  Export as {data.export_format.toUpperCase()}
                </Button>
              </Box>
            </Box>

            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Summary" icon={<Dashboard />} iconPosition="start" />
              <Tab label="Charts" icon={<BarChart />} iconPosition="start" />
              <Tab label="Data Tables" icon={<TableChart />} iconPosition="start" />
            </Tabs>

            {activeTab === 0 && (
              <Box>
                {/* Summary Section */}
                {data.include_summary && <SummaryCards summary={summaryData} />}

                {/* Critical Items */}
                {reportData.critical_items && data.include_tables && (
                  <DataTable
                    title="Critical Stock Items"
                    data={reportData.critical_items}
                    columns={[
                      { key: 'name', label: 'Item Name' },
                      { key: 'category', label: 'Category' },
                      { key: 'quantity', label: 'Quantity' },
                      { key: 'unit_cost', label: 'Unit Cost', render: (value) => `$${value}` },
                      { key: 'total_value', label: 'Total Value', render: (value) => `$${value}` },
                      { key: 'status', label: 'Status', render: (value) => (
                        <Chip 
                          label={value} 
                          color={
                            value === 'Out of Stock' ? 'error' : 
                            value === 'Low Stock' ? 'warning' : 'success'
                          } 
                          size="small" 
                        />
                      )}
                    ]}
                  />
                )}

                {/* Recent Activities */}
                {reportData.recent_activities && data.include_tables && (
                  <DataTable
                    title="Recent Activities"
                    data={reportData.recent_activities}
                    columns={[
                      { key: 'date', label: 'Date' },
                      { key: 'action', label: 'Action' },
                      { key: 'item', label: 'Item' },
                      { key: 'user', label: 'User' },
                      { key: 'quantity', label: 'Quantity' },
                      { key: 'value', label: 'Value', render: (value) => `$${value}` },
                    ]}
                  />
                )}

                {/* Show message if no data available */}
                {!reportData.critical_items && !reportData.recent_activities && data.include_tables && (
                  <Alert severity="info">
                    No detailed data available for the selected report type and filters.
                  </Alert>
                )}
              </Box>
            )}

            {activeTab === 1 && data.include_charts && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Visual Analytics</Typography>
                
                {/* Debug info - shows when using sample data */}
                {!reportData?.trends && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Showing sample chart data. Generate a report to see your actual data.
                  </Alert>
                )}
                
                {/* Monthly Trends Chart */}
                {data.chart_types?.includes('bar') && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Monthly Transactions Trend</Typography>
                      {renderBarChart(chartData.monthly_trends, 'value', 'Total Value', 'month')}
                    </CardContent>
                  </Card>
                )}

                {/* Category Distribution */}
                {data.chart_types?.includes('pie') && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Category Distribution</Typography>
                      {renderPieChart(chartData.category_distribution, 'value')}
                    </CardContent>
                  </Card>
                )}

                {/* Transaction Type Distribution */}
                {data.chart_types?.includes('bar') && chartData.transaction_type_distribution && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Transaction Type Distribution</Typography>
                      {renderBarChart(chartData.transaction_type_distribution, 'value', 'Total Value', 'label')}
                    </CardContent>
                  </Card>
                )}

                {/* Line Chart for Trends */}
                {data.chart_types?.includes('line') && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Monthly Trends (Line Chart)</Typography>
                      {renderLineChart(chartData.monthly_trends, 'value', 'Total Value', 'month')}
                    </CardContent>
                  </Card>
                )}

                {/* Additional Transactions Bar Chart */}
                {data.chart_types?.includes('bar') && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Monthly Transactions Count</Typography>
                      {renderBarChart(chartData.monthly_trends, 'transactions', 'Transaction Count', 'month')}
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            {activeTab === 2 && data.include_tables && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Detailed Data Tables</Typography>
                
                {/* Category Breakdown */}
                {/* {console.log('Category breakdown data:', reportData.category_breakdown)} */}
                {reportData.category_breakdown && (
            <DataTable
              title="Category Breakdown"
              data={reportData.category_breakdown}
              columns={[
                { key: 'category', label: 'Category' },
                { key: 'acquisition_count', label: 'Transactions' },
                { key: 'total_quantity', label: 'Quantity' },
                { 
                  key: 'total_value', 
                  label: 'Total Value', 
                  render: (value) => `₵${Number(value).toLocaleString()}`
                },
                { 
                  key: 'avg_unit_cost', 
                  label: 'Avg Unit Cost', 
                  render: (value, row) => {
                    const avg = row.total_value / (row.total_quantity || 1);
                    return `₵${avg.toFixed(2)}`;
                  }
                },
                { 
                  key: 'percentage_of_total', 
                  label: 'Percentage of Total', 
                  render: (value) => `${value}%`
                }
              ]}
            />
          )}

              
                {/* Department Analysis */}
                {reportData.department_analysis && (
                  <DataTable
                    title="Department Analysis"
                    data={reportData.department_analysis}
                    columns={[
                      { key: 'department', label: 'Department' },
                      { key: 'transactions', label: 'Transactions' },
                      { key: 'total_value', label: 'Total Value', render: (value) => `$${value}` },
                      { key: 'total_quantity', label: 'Total Quantity' },
                      { key: 'avg_transaction_value', label: 'Avg Transaction Value', render: (value) => `$${value}` },
                    ]}
                  />
                )}

                {/* Transaction Analysis */}
                {reportData.transaction_analysis && (
                  <DataTable
                    title="Transaction Analysis"
                    data={reportData.transaction_analysis}
                    columns={[
                      { key: 'label', label: 'Transaction Type' },
                      { key: 'count', label: 'Count' },
                      { key: 'total_quantity', label: 'Total Quantity' },
                      { key: 'total_value', label: 'Total Value', render: (value) => `$${value}` },
                      { key: 'avg_unit_cost', label: 'Avg Unit Cost', render: (value) => `$${value}` },
                    ]}
                  />
                )}

                {/* Stock Movements */}
                {reportData.stock_movements && (
                  <DataTable
                    title="Stock Movements"
                    data={reportData.stock_movements}
                    columns={[
                      { key: 'item_name', label: 'Item Name' },
                      { key: 'category', label: 'Category' },
                      { key: 'incoming', label: 'Incoming' },
                      { key: 'outgoing', label: 'Outgoing' },
                      { key: 'net_movement', label: 'Net Movement' },
                      { key: 'status', label: 'Status', render: (value) => (
                        <Chip 
                          label={value.replace('_', ' ')} 
                          color={
                            value === 'out_of_stock' ? 'error' : 
                            value === 'low_stock' ? 'warning' : 'success'
                          } 
                          size="small" 
                        />
                      )}
                    ]}
                  />
                )}

                {/* Show message if no tables available */}
                {!reportData.category_breakdown && !reportData.department_analysis && 
                 !reportData.transaction_analysis && !reportData.stock_movements && (
                  <Alert severity="info">
                    No detailed tables available for the selected report type and filters.
                  </Alert>
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
      title="Inventory Report Generator"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Reports', href: '/reports' },
        { label: 'Report Generator' }
      ]}
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

          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Inventory Report Generator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create comprehensive inventory reports with advanced analytics and customizable filters
            </Typography>
          </Box>

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
                                  {reportTypes.map((type) => (
                                    <Card 
                                      key={type.value}
                                      variant="outlined"
                                      sx={{ 
                                        mb: 2,
                                        border: data.report_type === type.value ? '2px solid' : '1px solid',
                                        borderColor: data.report_type === type.value ? 'primary.main' : 'divider',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => setData('report_type', type.value)}
                                    >
                                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Box display="flex" alignItems="flex-start" gap={2}>
                                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            {type.icon}
                                          </Avatar>
                                          <Box>
                                            <Typography variant="h6">
                                              {type.label}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              {type.description}
                                            </Typography>
                                          </Box>
                                          <Radio 
                                            value={type.value} 
                                            checked={data.report_type === type.value}
                                            sx={{ ml: 'auto' }}
                                          />
                                        </Box>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </Box>
                          )}

                          {index === 1 && (
                            <Box sx={{ mt: 2 }}>
                              <Grid container spacing={2}>
                                <Grid size={{ xs:12, md:6}}>
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

                                <Grid size={{ xs:12, md:6}}>
                                  <FormControl fullWidth>
                                    <InputLabel>Locations</InputLabel>
                                    <Select
                                      multiple
                                      value={data.locations}
                                      onChange={(e) => setData('locations', e.target.value)}
                                      input={<OutlinedInput label="Locations" />}
                                      renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                          {selected.map((locationId) => {
                                            const location = initialLocations?.find(loc => loc.id === locationId);
                                            return (
                                              <Chip 
                                                key={locationId} 
                                                label={location?.name || locationId} 
                                                size="small" 
                                              />
                                            );
                                          })}
                                        </Box>
                                      )}
                                    >
                                      {initialLocations?.map((location) => (
                                        <MenuItem key={location.id} value={location.id}>
                                          <Checkbox checked={data.locations.indexOf(location.id) > -1} />
                                          <ListItemText primary={location.name} />
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>

                                <Grid size={{ xs:12 }}>
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
                                  <Grid size={{ xs:12 }}>
                                    <Grid container spacing={2}>
                                      <Grid size={{ xs:12, md:6}}>
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
                                      <Grid size={{ xs:12, md:6}}>
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
                                <Grid size={{ xs:12 }}>
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
                                  <Grid size={{ xs:12 }}>
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

                                <Grid size={{ xs:12 }}>
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

                                <Grid size={{ xs:12 }}>
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
                                <Grid size={{ xs:12 }}>
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

                                <Grid size={{ xs:12 }}>
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

            <Grid size={{ xs:12, md:4 }}>
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
                        <Button 
                          variant="outlined" 
                          startIcon={<BarChart />}
                          onClick={() => handleQuickReport('stock-level')}
                        >
                          Stock Level Report
                        </Button>
                        <Button 
                          variant="outlined" 
                          startIcon={<TableChart />}
                          onClick={() => handleQuickReport('acquisition')}
                        >
                          Acquisition Report
                        </Button>
                        <Button 
                          variant="outlined" 
                          startIcon={<GridView />}
                          onClick={() => handleQuickReport('comprehensive')}
                        >
                          Full Inventory Report
                        </Button>
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
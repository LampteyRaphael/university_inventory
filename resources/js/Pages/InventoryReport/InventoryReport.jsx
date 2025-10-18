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
  LinearProgress,
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
  People,
  AddCircle,
  Edit,
  Delete,
  Person,
  Schedule,
  LocalShipping,
  CheckCircle,
  TaskAlt,
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
  
  // const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
  //   report_type: 'comprehensive',
  //   categories: [],
  //   locations: [],
  //   departments: [],
  //   date_range: 'last30days',
  //   custom_start_date: '',
  //   custom_end_date: '',
  //   include_charts: true,
  //   include_tables: true,
  //   include_summary: true,
  //   include_export: true,
  //   export_format: 'pdf',
  //   chart_types: ['bar', 'pie'],
  //   data_depth: 'summary',
  //   compare_period: false,
  //   suppliers: [],
  //   maintenance_types: [],
  //   priority_levels: [],
  //   order_types: [],
  // });

  // Enhanced report types with new additions
 
 const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
    report_type: 'comprehensive',
    categories: [],
    locations: [],
    departments: [],
    date_range: 'last30days', // Change this here too
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

  // const handleQuickReport = (type) => {
  //   setData({
  //     ...data,
  //     report_type: type,
  //     date_range: 'last_30_days',
  //   });
    
  //   post(route('inventory-report.generate'), {
  //     preserveScroll: true,
  //     onSuccess: () => {
  //       showAlert(`${reportTypes.find(t => t.value === type)?.label} generated successfully!`, 'success');
  //     }
  //   });
  // };

  const handleQuickReport = (type) => {
  setData({
    ...data,
    report_type: type,
    date_range: 'last30days', // Change this to match backend validation
  });

  post(route('inventory-report.generate'), {
    preserveScroll: true,
    onSuccess: (response) => {
      showAlert(`${reportTypes.find(t => t.value === type)?.label} generated successfully!`, 'success');
    },
    onError: (errors) => {
      console.error('Backend errors:', errors);
      showAlert('Failed to generate report. Check console for details.', 'error');
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

// Enhanced Summary Cards with comprehensive data
const SummaryCards = ({ summary, reportType }) => {
  if (!summary || typeof summary !== 'object') {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No summary data available for this report.
      </Alert>
    );
  }


  const getSummaryMetrics = () => {
    if (reportType === 'stock-level') {
      return [
        {
          label: 'Total Items',
          value: summary.total_items?.toLocaleString() || '0',
          icon: <Inventory2 color="primary" />,
          color: 'primary'
        },
        {
          label: 'Total Inventory Value',
          value: `₵${(summary.total_inventory_value || 0).toLocaleString()}`,
          icon: <AttachMoney color="success" />,
          color: 'success'
        },
        {
          label: 'Total Current Quantity',
          value: (summary.total_current_quantity?.toLocaleString() || '0'),
          icon: <Numbers color="info" />,
          color: 'info'
        },
        {
          label: 'Total Available Quantity',
          value: (summary.total_available_quantity?.toLocaleString() || '0'),
          icon: <TrendingUp color="warning" />,
          color: 'warning'
        },
        {
          label: 'Items Need Reorder',
          value: (summary.items_need_reorder?.toLocaleString() || '0'),
          icon: <Warning color="error" />,
          color: 'error'
        },
        {
          label: 'Out of Stock Items',
          value: (summary.out_of_stock_items?.toLocaleString() || '0'),
          icon: <Inventory2 color="secondary" />,
          color: 'secondary'
        }
      ];
    }else if(reportType === 'acquisition'){
       return  [
                {
                  label: 'Total Acquisitions',
                  value: summary.total_acquisitions?.toLocaleString() || '0',
                  icon: <Numbers color="primary" />,
                  color: 'primary'
                },
                {
                  label: 'Total Quantity',
                  value: summary.total_quantity?.toLocaleString() || '0',
                  icon: <Inventory2 color="info" />,
                  color: 'info'
                },
                {
                  label: 'Total Value',
                  value: `₵${(summary.total_value || 0).toLocaleString()}`,
                  icon: <AttachMoney color="success" />,
                  color: 'success'
                },
                {
                  label: 'Average Acquisition Value',
                  value: `₵${(summary.average_acquisition_value || 0).toLocaleString()}`,
                  icon: <Analytics color="warning" />,
                  color: 'warning'
                },
                {
                  label: 'Average Unit Cost',
                  value: `₵${(summary.average_unit_cost || 0).toLocaleString()}`,
                  icon: <AttachMoney color="secondary" />,
                  color: 'secondary'
                },
                {
                  label: 'Highest Value Acquisition',
                  value: `₵${(summary.highest_value_acquisition || 0).toLocaleString()}`,
                  icon: <TrendingUp color="success" />,
                  color: 'success'
                }
        ];
    } else if (reportType === 'depreciation') {
        return [
          {
            label: 'Total Assets',
            value: summary.total_assets?.toLocaleString() || '0',
            icon: <Inventory2 color="primary" />,
            color: 'primary'
          },
          {
            label: 'Total Original Value',
            value: `₵${(summary.total_original_value || 0).toLocaleString()}`,
            icon: <AttachMoney color="success" />,
            color: 'success'
          },
          {
            label: 'Total Current Value',
            value: `₵${(summary.total_current_value || 0).toLocaleString()}`,
            icon: <Analytics color="info" />,
            color: 'info'
          },
          {
            label: 'Total Depreciation',
            value: `₵${(summary.total_depreciation || 0).toLocaleString()}`,
            icon: <TrendingDown color="warning" />,
            color: 'warning'
          },
          {
            label: 'Avg Depreciation Rate',
            value: `${((summary.average_depreciation_rate || 0) * 100).toFixed(1)}%`,
            icon: <Numbers color="secondary" />,
            color: 'secondary'
          },
          {
            label: 'Avg Asset Age',
            value: `${(summary.average_asset_age_months || 0).toFixed(1)}m`,
            icon: <History color="info" />,
            color: 'info'
          }
        ];
  }else if (reportType === 'audit') {
    return [
      {
        label: 'Total Audit Entries',
        value: summary.total_audit_entries?.toLocaleString() || '0',
        icon: <History color="primary" />,
        color: 'primary'
      },
      {
        label: 'Unique Users',
        value: summary.unique_users?.toLocaleString() || '0',
        icon: <People color="info" />,
        color: 'info'
      },
      {
        label: 'Create Actions',
        value: summary.create_actions?.toLocaleString() || '0',
        icon: <AddCircle color="success" />,
        color: 'success'
      },
      {
        label: 'Update Actions',
        value: summary.update_actions?.toLocaleString() || '0',
        icon: <Edit color="warning" />,
        color: 'warning'
      },
      {
        label: 'Delete Actions',
        value: summary.delete_actions?.toLocaleString() || '0',
        icon: <Delete color="error" />,
        color: 'error'
      },
      {
        label: 'Most Active User',
        value: summary.most_active_user || 'Unknown',
        icon: <Person color="secondary" />,
        color: 'secondary'
      }
    ];
  }else if (reportType === 'procurement') {
    return [];

  }else if (reportType === 'maintenance') {
    return [];
  }else{
    return [];
      // Comprehensive report metrics
      // return [
      //   {
      //     label: 'Total Transactions',
      //     value: summary.total_transactions?.toLocaleString() || '0',
      //     icon: <Numbers color="primary" />,
      //     color: 'primary'
      //   },
      //   {
      //     label: 'Total Value',
      //     value: `₵${(summary.total_value || 0).toLocaleString()}`,
      //     icon: <AttachMoney color="success" />,
      //     color: 'success'
      //   },
      //   {
      //     label: 'Incoming Stock',
      //     value: (summary.incoming_stock?.toLocaleString() || '0'),
      //     icon: <TrendingUp color="info" />,
      //     color: 'info'
      //   },
      //   {
      //     label: 'Outgoing Stock',
      //     value: (summary.outgoing_stock?.toLocaleString() || '0'),
      //     icon: <TrendingDown color="warning" />,
      //     color: 'warning'
      //   },
      //   {
      //     label: 'Net Stock Movement',
      //     value: (summary.net_stock_movement?.toLocaleString() || '0'),
      //     icon: <Analytics color="info" />,
      //     color: 'info'
      //   },
      //   {
      //     label: 'Avg Transaction Value',
      //     value: `₵${(summary.average_transaction_value || 0).toLocaleString()}`,
      //     icon: <AttachMoney color="secondary" />,
      //     color: 'secondary'
      //   }
      // ];
    }
  };

  const summaryMetrics = getSummaryMetrics();

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
  const currentReportType = data.report_type;

  // Stock level specific data tables
  const StockLevelTables = () => {
    if (!reportData.stock_levels || !Array.isArray(reportData.stock_levels)) {
      return (
        <Alert severity="info">
          No stock level data available.
        </Alert>
      );
    }

    return (
      <Box>
        {/* Stock Levels Table */}
        <DataTable
          title="Stock Levels Overview"
          data={reportData.stock_levels}
          columns={[
            { key: 'item_name', label: 'Item Name' },
            { key: 'category', label: 'Category' },
            { key: 'current_quantity', label: 'Current Qty' },
            { key: 'available_quantity', label: 'Available Qty' },
            { key: 'committed_quantity', label: 'Committed Qty' },
            { key: 'on_order_quantity', label: 'On Order Qty' },
            { 
              key: 'average_cost', 
              label: 'Avg Cost', 
              render: (value) => `₵${Number(value || 0).toFixed(2)}`
            },
            { 
              key: 'total_value', 
              label: 'Total Value', 
              render: (value) => `₵${Number(value || 0).toLocaleString()}`
            },
            { key: 'status', label: 'Status', render: (value) => (
              <Chip 
                label={value?.replace(/_/g, ' ') || 'Unknown'} 
                color={
                  value === 'out_of_stock' ? 'error' : 
                  value === 'low_stock' || value === 'critical_stock' ? 'warning' : 
                  value === 'over_stock' ? 'info' : 'success'
                } 
                size="small" 
              />
            )},
            { key: 'needs_reorder', label: 'Needs Reorder', render: (value) => (
              <Chip 
                label={value ? 'Yes' : 'No'} 
                color={value ? 'error' : 'default'} 
                size="small" 
              />
            )}
          ]}
        />

        {/* Critical Items Table */}
        {reportData.critical_items && (
          <DataTable
            title="Critical Stock Items"
            data={reportData.critical_items}
            columns={[
              { key: 'name', label: 'Item Name' },
              { key: 'category', label: 'Category' },
              { key: 'current_quantity', label: 'Current Qty' },
              { key: 'available_quantity', label: 'Available Qty' },
              { key: 'reorder_level', label: 'Reorder Level', render: (value) => Number(value || 0).toFixed(2) },
              { key: 'safety_stock', label: 'Safety Stock', render: (value) => Number(value || 0).toFixed(2) },
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
        )}
      </Box>
    );
  };

  // Stock level specific analytics
  const StockLevelAnalytics = () => {
    if (!reportData.stock_levels || !Array.isArray(reportData.stock_levels)) {
      return (
        <Alert severity="info">
          No analytics data available for stock level report.
        </Alert>
      );
    }

    // Generate chart data from stock levels
    const categoryDistribution = reportData.stock_levels.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0 };
      }
      acc[category].value += Number(item.total_value || 0);
      acc[category].count += 1;
      return acc;
    }, {});

    const statusDistribution = reportData.stock_levels.reduce((acc, item) => {
      const status = item.status || 'unknown';
      if (!acc[status]) {
        acc[status] = { name: status, value: 0 };
      }
      acc[status].value += 1;
      return acc;
    }, {});

    return (
      <Grid container spacing={3}>
        {data.chart_types?.includes('pie') && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Inventory Value by Category</Typography>
                {renderPieChart(Object.values(categoryDistribution), 'value')}
              </CardContent>
            </Card>
          </Grid>
        )}

        {data.chart_types?.includes('bar') && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Stock Status Distribution</Typography>
                {renderBarChart(Object.values(statusDistribution), 'value', 'Item Count', 'name', '#FF8042')}
              </CardContent>
            </Card>
          </Grid>
        )}

        {data.chart_types?.includes('bar') && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Items by Category</Typography>
                {renderBarChart(Object.values(categoryDistribution), 'count', 'Item Count', 'name', '#0088FE')}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };
  
  const StockLevelDetails = () => {
  
    const getStockLevelData = () => {
    if (reportData.stock_level_summary) {
      // Comprehensive report structure
      return {
        totalItems: reportData.stock_level_summary.total_items_tracked || reportData.stock_levels?.length || 0,
        totalValue: reportData.stock_level_summary.total_inventory_value || 0,
        averageValue: reportData.stock_level_summary.average_item_value || 0,
        currentQuantity: reportData.stock_level_summary.total_current_quantity,
        availableQuantity: reportData.stock_level_summary.total_available_quantity,
        committedQuantity: reportData.stock_level_summary.total_committed_quantity,
        onOrderQuantity: reportData.stock_level_summary.total_on_order_quantity,
        statusBreakdown: reportData.stock_level_summary.status_breakdown
      };
    } else {
      // Stock-level report structure - calculate from the main data
      const totalValue = reportData.total_inventory_value || 
                        (reportData.stock_levels ? reportData.stock_levels.reduce((sum, item) => sum + (item.total_value || 0), 0) : 0);
      
      const totalItems = reportData.total_items_tracked || reportData.stock_levels?.length || 0;
      
      return {
        totalItems: totalItems,
        totalValue: totalValue,
        averageValue: totalItems > 0 ? totalValue / totalItems : 0,
        currentQuantity: reportData.total_current_quantity,
        availableQuantity: reportData.total_available_quantity,
        committedQuantity: reportData.total_committed_quantity,
        onOrderQuantity: reportData.total_on_order_quantity,
        statusBreakdown: reportData.status_breakdown
      };
    }
  };

  const stockData = getStockLevelData();
  const totalItems = stockData.totalItems;

  // Calculate stock alerts from the actual data structure
  const calculateStockAlerts = () => {
    if (!reportData.stock_levels || !Array.isArray(reportData.stock_levels)) {
      return {
        itemsNeedReorder: 0,
        lowStockItems: 0,
        outOfStockItems: 0
      };
    }

    const itemsNeedReorder = reportData.stock_levels.filter(item => 
      item.needs_reorder === true || item.status === 'low_stock' || item.status === 'critical_stock'
    ).length;

    const lowStockItems = reportData.stock_levels.filter(item => 
      item.status === 'low_stock'
    ).length;

    const outOfStockItems = reportData.stock_levels.filter(item => 
      item.status === 'out_of_stock'
    ).length;

    return {
      itemsNeedReorder,
      lowStockItems,
      outOfStockItems
    };
  };

  const stockAlerts = calculateStockAlerts();

  // Get status breakdown from available data
  const getStatusBreakdown = () => {
    if (stockData.statusBreakdown) {
      return stockData.statusBreakdown;
    }
    
    // Calculate from stock_levels if not available in summary
    if (reportData.stock_levels) {
      return reportData.stock_levels.reduce((acc, item) => {
        const status = item.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
    }
    
    return {};
  };

  const statusBreakdown = getStatusBreakdown();

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Stock Level Statistics */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Inventory Statistics</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Total Items in Inventory" 
                    secondary={stockData.totalItems.toLocaleString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Total Inventory Value" 
                    secondary={`₵${stockData.totalValue.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Average Item Value" 
                    secondary={`₵${stockData.averageValue.toLocaleString()}`}
                  />
                </ListItem>
                {stockData.currentQuantity !== undefined && (
                  <ListItem>
                    <ListItemText 
                      primary="Total Current Quantity" 
                      secondary={stockData.currentQuantity.toLocaleString()}
                    />
                  </ListItem>
                )}
                {stockData.availableQuantity !== undefined && (
                  <ListItem>
                    <ListItemText 
                      primary="Total Available Quantity" 
                      secondary={stockData.availableQuantity.toLocaleString()}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock Alert Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Stock Alerts Summary</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Items Need Reorder" 
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={stockAlerts.itemsNeedReorder} 
                          color="error" 
                          size="small" 
                        />
                        <Typography variant="body2" color="textSecondary">
                          ({totalItems > 0 ? Math.round((stockAlerts.itemsNeedReorder / totalItems) * 100) : 0}% of inventory)
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Low Stock Items" 
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={stockAlerts.lowStockItems} 
                          color="warning" 
                          size="small" 
                        />
                        <Typography variant="body2" color="textSecondary">
                          ({totalItems > 0 ? Math.round((stockAlerts.lowStockItems / totalItems) * 100) : 0}% of inventory)
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Out of Stock Items" 
                    secondary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={stockAlerts.outOfStockItems} 
                          color="error" 
                          size="small" 
                          variant="outlined"
                        />
                        <Typography variant="body2" color="textSecondary">
                          ({totalItems > 0 ? Math.round((stockAlerts.outOfStockItems / totalItems) * 100) : 0}% of inventory)
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {stockData.committedQuantity !== undefined && (
                  <ListItem>
                    <ListItemText 
                      primary="Total Committed Quantity" 
                      secondary={stockData.committedQuantity.toLocaleString()}
                    />
                  </ListItem>
                )}
                {stockData.onOrderQuantity !== undefined && (
                  <ListItem>
                    <ListItemText 
                      primary="Total On Order Quantity" 
                      secondary={stockData.onOrderQuantity.toLocaleString()}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution */}
        {Object.keys(statusBreakdown).length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Stock Status Distribution</Typography>
                <List dense>
                  {Object.entries(statusBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([status, count]) => (
                      <ListItem key={status}>
                        <ListItemText 
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip 
                                label={status.replace(/_/g, ' ')} 
                                color={
                                  status === 'out_of_stock' ? 'error' : 
                                  status === 'low_stock' || status === 'critical_stock' ? 'warning' : 
                                  status === 'over_stock' ? 'info' : 'success'
                                } 
                                size="small" 
                              />
                            </Box>
                          } 
                          secondary={`${count} items (${totalItems > 0 ? Math.round((count / totalItems) * 100) : 0}%)`}
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Category Distribution */}
        {reportData.stock_levels && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Category Distribution</Typography>
                <List dense>
                  {Object.entries(
                    reportData.stock_levels.reduce((acc, item) => {
                      const category = item.category || 'Uncategorized';
                      acc[category] = (acc[category] || 0) + 1;
                      return acc;
                    }, {})
                  )
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => (
                    <ListItem key={category}>
                      <ListItemText 
                        primary={category} 
                        secondary={`${count} items (${Math.round((count / totalItems) * 100)}%)`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Critical Items Requiring Attention */}
        {reportData.critical_items && reportData.critical_items.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Critical Items Requiring Immediate Attention
                </Typography>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {reportData.critical_items.length} items require immediate attention due to stock levels.
                </Alert>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Item Name</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Current Quantity</strong></TableCell>
                        <TableCell><strong>Available Quantity</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.critical_items.map((item, index) => (
                        <TableRow key={index} hover sx={{ bgcolor: 'error.light' }}>
                          <TableCell>
                            <Typography fontWeight="bold">{item.name}</Typography>
                          </TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            <Typography color="error" fontWeight="bold">
                              {item.current_quantity?.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography color="error" fontWeight="bold">
                              {item.available_quantity?.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={item.status?.replace(/_/g, ' ') || 'Critical'} 
                              color="error" 
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// Comprehensive Summary Cards
const ComprehensiveSummaryCards = ({ summary, stockLevelSummary, maintenanceSummary, purchaseSummary }) => {
  const summaryMetrics = [
    {
      label: 'Total Inventory Value',
      value: `₵${(stockLevelSummary?.total_inventory_value || 0).toLocaleString()}`,
      icon: <AttachMoney color="success" />,
      color: 'success'
    },
    {
      label: 'Items Tracked',
      value: stockLevelSummary?.total_items_tracked?.toLocaleString() || '0',
      icon: <Inventory2 color="primary" />,
      color: 'primary'
    },
    {
      label: 'Critical Items',
      value: (stockLevelSummary?.status_breakdown?.critical_stock || 0) + (stockLevelSummary?.status_breakdown?.out_of_stock || 0),
      icon: <Warning color="error" />,
      color: 'error'
    },
    {
      label: 'Maintenance Activities',
      value: maintenanceSummary?.total_maintenance?.toLocaleString() || '0',
      icon: <Build color="warning" />,
      color: 'warning'
    },
    {
      label: 'Purchase Orders',
      value: purchaseSummary?.total_orders?.toLocaleString() || '0',
      icon: <ShoppingCart color="info" />,
      color: 'info'
    },
    {
      label: 'Total Transactions',
      value: summary?.total_transactions?.toLocaleString() || '0',
      icon: <Analytics color="secondary" />,
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

// Comprehensive Analytics
const ComprehensiveAnalytics = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No comprehensive analytics data available.
      </Alert>
    );
  }

  const { stock_level_summary, maintenance_analysis, purchase_analysis } = reportData;

  // Stock Status Distribution
  const stockStatusData = stock_level_summary?.status_breakdown ? 
    Object.entries(stock_level_summary.status_breakdown).map(([status, count]) => ({
      name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      percentage: (count / stock_level_summary.total_items_tracked) * 100
    })) : [];

  // Maintenance Cost by Category
  const maintenanceCostData = maintenance_analysis?.maintenance_by_category?.map(item => ({
    name: item.category,
    cost: item.total_cost,
    count: item.count,
    average_cost: item.average_cost
  })) || [];

  // Purchase Order Status
  const purchaseStatusData = purchase_analysis?.summary?.status_breakdown ?
    Object.entries(purchase_analysis.summary.status_breakdown).map(([status, count]) => ({
      name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count
    })) : [];

  // Maintenance Priority Breakdown
  const maintenancePriorityData = maintenance_analysis?.summary?.priority_breakdown ?
    Object.entries(maintenance_analysis.summary.priority_breakdown).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count
    })) : [];

  return (
    <Grid container spacing={3}>
      {/* Stock Status Distribution */}
      {data.chart_types?.includes('pie') && stockStatusData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Inventory Stock Status</Typography>
              {renderPieChart(stockStatusData, 'value')}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Maintenance Cost by Category */}
      {data.chart_types?.includes('bar') && maintenanceCostData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Maintenance Cost by Category</Typography>
              {renderBarChart(
                maintenanceCostData,
                'cost',
                'Total Cost (₵)',
                'name',
                '#FF8042'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Purchase Order Status */}
      {data.chart_types?.includes('pie') && purchaseStatusData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Purchase Order Status</Typography>
              {renderPieChart(purchaseStatusData, 'value')}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Maintenance Priority Breakdown */}
      {data.chart_types?.includes('bar') && maintenancePriorityData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Maintenance Priority Levels</Typography>
              {renderBarChart(
                maintenancePriorityData,
                'value',
                'Count',
                'name',
                '#0088FE'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Equipment Reliability */}
      {data.chart_types?.includes('bar') && maintenance_analysis?.equipment_reliability && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Equipment Maintenance Frequency</Typography>
              {renderBarChart(
                maintenance_analysis.equipment_reliability
                  .sort((a, b) => (b.maintenance_count || 0) - (a.maintenance_count || 0))
                  .map(equipment => ({
                    name: equipment.item_name,
                    value: equipment.maintenance_count || 0,
                    completed: equipment.completed_count || 0
                  })),
                'value',
                'Maintenance Count',
                'name',
                '#8884d8'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// Comprehensive Tables
const ComprehensiveTables = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No comprehensive table data available.
      </Alert>
    );
  }

  const { critical_items, maintenance_analysis, purchase_analysis, stock_level_summary } = reportData;

  return (
    <Grid container spacing={3}>
      {/* Critical Items */}
      {critical_items && critical_items.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <DataTable
            title="Critical Items Requiring Attention"
            data={critical_items}
            columns={[
              { key: 'item_code', label: 'Item Code' },
              { key: 'name', label: 'Item Name' },
              { key: 'category', label: 'Category' },
              { key: 'department', label: 'Department' },
              { key: 'current_quantity', label: 'Current Qty' },
              { key: 'available_quantity', label: 'Available Qty' },
              { key: 'reorder_level', label: 'Reorder Level' },
              { key: 'safety_stock', label: 'Safety Stock' },
              { 
                key: 'average_cost', 
                label: 'Avg Cost', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'total_value', 
                label: 'Total Value', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'status', 
                label: 'Status',
                render: (value) => (
                  <Chip 
                    label={value?.replace(/_/g, ' ') || 'Unknown'} 
                    color={
                      value === 'out_of_stock' ? 'error' : 
                      value === 'critical_stock' ? 'error' :
                      value === 'low_stock' ? 'warning' : 'default'
                    } 
                    size="small" 
                  />
                )
              },
              { 
                key: 'needs_attention', 
                label: 'Needs Attention',
                render: (value) => (
                  <Chip 
                    label={value ? 'Yes' : 'No'} 
                    color={value ? 'error' : 'default'} 
                    size="small" 
                  />
                )
              }
            ]}
          />
        </Grid>
      )}

      {/* Equipment Reliability */}
      {maintenance_analysis?.equipment_reliability && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Equipment Reliability"
            data={maintenance_analysis.equipment_reliability}
            columns={[
              { key: 'item_name', label: 'Equipment Name' },
              { key: 'maintenance_count', label: 'Maintenance Count' },
              { key: 'completed_count', label: 'Completed' },
              { 
                key: 'completion_rate', 
                label: 'Completion Rate', 
                render: (value, row) => {
                  const rate = row.maintenance_count > 0 ? 
                    (row.completed_count / row.maintenance_count) * 100 : 0;
                  return `${rate.toFixed(1)}%`;
                }
              },
              { 
                key: 'total_maintenance_cost', 
                label: 'Total Cost', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { key: 'total_downtime', label: 'Downtime (hrs)' },
              { 
                key: 'emergency_maintenance_rate', 
                label: 'Emergency Rate', 
                render: (value) => value ? `${(value * 100).toFixed(1)}%` : '0%'
              }
            ]}
          />
        </Grid>
      )}

      {/* Maintenance by Category */}
      {maintenance_analysis?.maintenance_by_category && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Maintenance by Category"
            data={maintenance_analysis.maintenance_by_category}
            columns={[
              { key: 'category', label: 'Category' },
              { key: 'count', label: 'Maintenance Count' },
              { 
                key: 'total_cost', 
                label: 'Total Cost', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'average_cost', 
                label: 'Avg Cost', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { key: 'total_downtime', label: 'Downtime (hrs)' }
            ]}
          />
        </Grid>
      )}

      {/* Recent Purchase Orders */}
      {purchase_analysis?.recent_orders && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Recent Purchase Orders"
            data={purchase_analysis.recent_orders}
            columns={[
              { key: 'po_number', label: 'PO Number' },
              { 
                key: 'order_date', 
                label: 'Order Date',
                render: (value) => new Date(value).toLocaleDateString()
              },
              { 
                key: 'total_amount', 
                label: 'Amount', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { key: 'items_count', label: 'Items Count' },
              { 
                key: 'status', 
                label: 'Status',
                render: (value) => (
                  <Chip 
                    label={value?.replace(/_/g, ' ') || 'Unknown'} 
                    size="small"
                    color={
                      value === 'received' || value === 'closed' ? 'success' :
                      value === 'cancelled' ? 'error' :
                      value === 'ordered' ? 'info' : 'default'
                    }
                  />
                )
              }
            ]}
          />
        </Grid>
      )}

      {/* Supplier Performance */}
      {purchase_analysis?.supplier_performance && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Supplier Performance"
            data={purchase_analysis.supplier_performance}
            columns={[
              { key: 'supplier_name', label: 'Supplier' },
              { key: 'order_count', label: 'Orders' },
              { 
                key: 'total_spent', 
                label: 'Total Spent', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'average_order_value', 
                label: 'Avg Order Value', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'on_time_delivery_rate', 
                label: 'On-Time Rate', 
                render: (value) => `${(value * 100).toFixed(1)}%`
              }
            ]}
          />
        </Grid>
      )}
    </Grid>
  );
};

// Comprehensive Details
const ComprehensiveDetails = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No comprehensive details available.
      </Alert>
    );
  }

  const { stock_level_summary, maintenance_analysis, purchase_analysis, summary } = reportData;

  return (
    <Grid container spacing={3}>
      {/* Inventory Health Overview */}
      {stock_level_summary && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Inventory Health Overview</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Items Tracked</Typography>
                  <Typography variant="h6">{stock_level_summary.total_items_tracked}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Inventory Value</Typography>
                  <Typography variant="h6">₵{stock_level_summary.total_inventory_value?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Average Item Value</Typography>
                  <Typography variant="h6">₵{stock_level_summary.average_item_value?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Items Need Attention</Typography>
                  <Typography variant="h6" color="error">
                    {(stock_level_summary.status_breakdown?.critical_stock || 0) + 
                     (stock_level_summary.status_breakdown?.low_stock || 0) +
                     (stock_level_summary.status_breakdown?.out_of_stock || 0)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Healthy Stock</Typography>
                  <Typography variant="h6" color="success">
                    {(stock_level_summary.status_breakdown?.adequate_stock || 0) + 
                     (stock_level_summary.status_breakdown?.over_stock || 0)}
                  </Typography>
                </Grid>
              </Grid>

              {/* Status Breakdown */}
              {stock_level_summary.status_breakdown && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>Stock Status Distribution</Typography>
                  <Grid container spacing={1}>
                    {Object.entries(stock_level_summary.status_breakdown).map(([status, count]) => (
                      <Grid size={{ xs: 6, md: 2.4 }} key={status}>
                        <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                          <Typography 
                            variant="h6" 
                            color={
                              status === 'out_of_stock' ? 'error' : 
                              status === 'critical_stock' ? 'error' :
                              status === 'low_stock' ? 'warning' : 
                              status === 'over_stock' ? 'info' : 'success'
                            }
                          >
                            {count}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {Math.round((count / stock_level_summary.total_items_tracked) * 100)}%
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Maintenance Overview */}
      {maintenance_analysis?.summary && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Maintenance Overview</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Total Maintenance</Typography>
                  <Typography variant="h6">{maintenance_analysis.summary.total_maintenance || 0}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Total Cost</Typography>
                  <Typography variant="h6">₵{(maintenance_analysis.summary.total_cost || 0).toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Avg Cost/Maintenance</Typography>
                  <Typography variant="h6">₵{(maintenance_analysis.summary.average_cost_per_maintenance || 0).toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Total Downtime</Typography>
                  <Typography variant="h6">{maintenance_analysis.summary.total_downtime_hours || 0} hrs</Typography>
                </Grid>
              </Grid>

              {/* Priority Breakdown */}
              {maintenance_analysis.summary.priority_breakdown && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Priority Distribution</Typography>
                  <Grid container spacing={1}>
                    {Object.entries(maintenance_analysis.summary.priority_breakdown).map(([priority, count]) => (
                      <Grid size={{ xs: 6 }} key={priority}>
                        <Chip 
                          label={`${priority}: ${count}`}
                          size="small"
                          variant="outlined"
                          color={
                            priority === 'critical' ? 'error' :
                            priority === 'high' ? 'warning' :
                            priority === 'medium' ? 'info' : 'default'
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Type Breakdown */}
              {maintenance_analysis.summary.type_breakdown && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Maintenance Type Distribution</Typography>
                  <Grid container spacing={1}>
                    {Object.entries(maintenance_analysis.summary.type_breakdown).map(([type, count]) => (
                      <Grid size={{ xs: 6 }} key={type}>
                        <Chip 
                          label={`${type}: ${count}`}
                          size="small"
                          variant="outlined"
                          color={
                            type === 'emergency' ? 'error' :
                            type === 'corrective' ? 'warning' : 'default'
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Purchase Analysis Summary */}
      {purchase_analysis?.summary && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Procurement Overview</Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Total Orders</Typography>
                  <Typography variant="h6">{purchase_analysis.summary.total_orders || 0}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Total Amount</Typography>
                  <Typography variant="h6">₵{(purchase_analysis.summary.total_amount || 0).toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Avg Order Value</Typography>
                  <Typography variant="h6">₵{(purchase_analysis.summary.average_order_value || 0).toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Largest Order</Typography>
                  <Typography variant="h6">
                    ₵{Math.max(...(purchase_analysis.recent_orders?.map(order => order.total_amount) || [0])).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              {/* Order Type Breakdown */}
              {purchase_analysis.summary.order_type_breakdown && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Order Types</Typography>
                  <Grid container spacing={1}>
                    {Object.entries(purchase_analysis.summary.order_type_breakdown).map(([type, count]) => (
                      <Grid size={{ xs: 6 }} key={type}>
                        <Chip 
                          label={`${type}: ${count}`}
                          size="small"
                          variant="outlined"
                          color={
                            type === 'capital' ? 'primary' :
                            type === 'emergency' ? 'error' : 'default'
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Status Breakdown */}
              {purchase_analysis.summary.status_breakdown && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Order Status</Typography>
                  <Grid container spacing={1}>
                    {Object.entries(purchase_analysis.summary.status_breakdown).map(([status, count]) => (
                      <Grid size={{ xs: 6 }} key={status}>
                        <Chip 
                          label={`${status}: ${count}`}
                          size="small"
                          variant="outlined"
                          color={
                            status === 'received' || status === 'closed' ? 'success' :
                            status === 'cancelled' ? 'error' :
                            status === 'ordered' ? 'info' : 'default'
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Transaction Summary */}
      {summary && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Transaction Overview</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Transactions</Typography>
                  <Typography variant="h6">{summary.total_transactions}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Value</Typography>
                  <Typography variant="h6">₵{summary.total_value?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Incoming Stock</Typography>
                  <Typography variant="h6" color="success">{summary.incoming_stock}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Outgoing Stock</Typography>
                  <Typography variant="h6" color="warning">{summary.outgoing_stock}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Net Movement</Typography>
                  <Typography variant="h6" color="info">{summary.net_stock_movement}</Typography>
                </Grid>
              </Grid>

              {/* Transaction Type Breakdown */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Transaction Type Breakdown</Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6, md: 2.4 }}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" color="textSecondary">Purchases</Typography>
                      <Typography variant="h6" color="primary">{summary.purchase_count || 0}</Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2.4 }}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" color="textSecondary">Sales</Typography>
                      <Typography variant="h6" color="secondary">{summary.sale_count || 0}</Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2.4 }}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" color="textSecondary">Transfers</Typography>
                      <Typography variant="h6" color="info">{summary.transfer_count || 0}</Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2.4 }}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" color="textSecondary">Adjustments</Typography>
                      <Typography variant="h6" color="warning">{summary.adjustment_count || 0}</Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, md: 2.4 }}>
                    <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                      <Typography variant="body2" color="textSecondary">Returns</Typography>
                      <Typography variant="h6" color="error">{summary.return_count || 0}</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Key Performance Indicators */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Key Performance Indicators</Typography>
            <Grid container spacing={2}>
              {/* Inventory Health KPI */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Inventory Health Score</Typography>
                  <Typography variant="h4" color="success.main">
                    {stock_level_summary ? 
                      Math.round(((stock_level_summary.status_breakdown?.adequate_stock || 0) + 
                      (stock_level_summary.status_breakdown?.over_stock || 0)) / 
                      stock_level_summary.total_items_tracked * 100) : 0}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Items in good condition
                  </Typography>
                </Card>
              </Grid>

              {/* Maintenance Efficiency KPI */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Maintenance Completion Rate</Typography>
                  <Typography variant="h4" color="info.main">
                    {maintenance_analysis?.summary ? 
                      Math.round((maintenance_analysis.summary.status_breakdown?.completed || 0) / 
                      maintenance_analysis.summary.total_maintenance * 100) : 0}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Tasks completed on time
                  </Typography>
                </Card>
              </Grid>

              {/* Procurement Efficiency KPI */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Procurement Success Rate</Typography>
                  <Typography variant="h4" color="success.main">
                    {purchase_analysis?.summary ? 
                      Math.round(((purchase_analysis.summary.status_breakdown?.received || 0) + 
                      (purchase_analysis.summary.status_breakdown?.closed || 0)) / 
                      purchase_analysis.summary.total_orders * 100) : 0}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Orders successfully fulfilled
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Critical Items Alert */}
      {reportData.critical_items && reportData.critical_items.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                Critical Items Requiring Immediate Attention
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                {reportData.critical_items.length} items require immediate attention due to stock levels.
              </Alert>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Item Name</strong></TableCell>
                      <TableCell><strong>Category</strong></TableCell>
                      <TableCell><strong>Current Quantity</strong></TableCell>
                      <TableCell><strong>Available Quantity</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.critical_items.slice(0, 5).map((item, index) => (
                      <TableRow key={index} hover sx={{ bgcolor: 'error.light' }}>
                        <TableCell>
                          <Typography fontWeight="bold">{item.name}</Typography>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <Typography color="error" fontWeight="bold">
                            {item.current_quantity?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="error" fontWeight="bold">
                            {item.available_quantity?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.status?.replace(/_/g, ' ') || 'Critical'} 
                            color="error" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {reportData.critical_items.length > 5 && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  ... and {reportData.critical_items.length - 5} more critical items
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};



// const ComprehensiveAnalytics = () => {
//   return (
//     <Grid container spacing={3}>
//       {/* Monthly Trends */}
//       {data.chart_types?.includes('bar') && chartData.monthly_trends && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Monthly Transaction Trends</Typography>
//               {renderBarChart(chartData.monthly_trends, 'value', 'Total Value (₵)', 'month', '#0088FE')}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {data.chart_types?.includes('line') && chartData.monthly_trends && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Monthly Quantity Trends</Typography>
//               {renderLineChart(chartData.monthly_trends, 'quantity', 'Total Quantity', 'month', '#00C49F')}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Category Distribution */}
//       {data.chart_types?.includes('pie') && chartData.category_distribution && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Category Value Distribution</Typography>
//               {renderPieChart(chartData.category_distribution, 'value')}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Transaction Type Analysis */}
//       {data.chart_types?.includes('bar') && reportData.transaction_analysis && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Transaction Type Analysis</Typography>
//               {renderBarChart(reportData.transaction_analysis, 'total_value', 'Total Value (₵)', 'label', '#FF8042')}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Maintenance Analysis - Cost by Category */}
//       {data.chart_types?.includes('bar') && reportData.maintenance_analysis?.maintenance_by_category && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Maintenance Cost by Category</Typography>
//               {renderBarChart(
//                 reportData.maintenance_analysis.maintenance_by_category, 
//                 'total_cost', 
//                 'Total Cost (₵)', 
//                 'category', 
//                 '#8884d8'
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Maintenance Analysis - Status Distribution */}
//       {data.chart_types?.includes('pie') && reportData.maintenance_analysis?.summary?.status_breakdown && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Maintenance Status Distribution</Typography>
//               {renderPieChart(
//                 Object.entries(reportData.maintenance_analysis.summary.status_breakdown).map(([status, count]) => ({
//                   name: status.replace(/_/g, ' '),
//                   value: count
//                 })),
//                 'value'
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Supplier Performance - Spending Distribution */}
//       {data.chart_types?.includes('bar') && reportData.purchase_analysis?.supplier_performance && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Supplier Spending Distribution</Typography>
//               {renderBarChart(
//                 reportData.purchase_analysis.supplier_performance
//                   .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
//                   .map((supplier, index) => ({
//                     name: `Supplier ${index + 1}`,
//                     value: supplier.total_spent || 0,
//                     orders: supplier.order_count || 0
//                   })),
//                 'value',
//                 'Total Spent (₵)',
//                 'name',
//                 '#00C49F'
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Supplier Performance - Order Count */}
//       {data.chart_types?.includes('bar') && reportData.purchase_analysis?.supplier_performance && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Supplier Order Volume</Typography>
//               {renderBarChart(
//                 reportData.purchase_analysis.supplier_performance
//                   .sort((a, b) => (b.order_count || 0) - (a.order_count || 0))
//                   .map((supplier, index) => ({
//                     name: `Supplier ${index + 1}`,
//                     value: supplier.order_count || 0,
//                     spent: supplier.total_spent || 0
//                   })),
//                 'value',
//                 'Order Count',
//                 'name',
//                 '#FF8042'
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Maintenance Priority Breakdown */}
//       {data.chart_types?.includes('pie') && reportData.maintenance_analysis?.summary?.priority_breakdown && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Maintenance Priority Levels</Typography>
//               {renderPieChart(
//                 Object.entries(reportData.maintenance_analysis.summary.priority_breakdown).map(([priority, count]) => ({
//                   name: priority.charAt(0).toUpperCase() + priority.slice(1),
//                   value: count
//                 })),
//                 'value'
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Purchase Order Status */}
//       {data.chart_types?.includes('pie') && reportData.purchase_analysis?.summary?.status_breakdown && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Purchase Order Status</Typography>
//               {renderPieChart(
//                 Object.entries(reportData.purchase_analysis.summary.status_breakdown).map(([status, count]) => ({
//                   name: status.replace(/_/g, ' '),
//                   value: count
//                 })),
//                 'value'
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Equipment Reliability - Maintenance Frequency */}
//       {data.chart_types?.includes('bar') && reportData.maintenance_analysis?.equipment_reliability && (
//         <Grid size={{ xs: 12 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Equipment Maintenance Frequency</Typography>
//               {renderBarChart(
//                 reportData.maintenance_analysis.equipment_reliability
//                   .sort((a, b) => (b.maintenance_count || 0) - (a.maintenance_count || 0))
//                   .slice(0, 8)
//                   .map(equipment => ({
//                     name: equipment.item_name,
//                     value: equipment.maintenance_count || 0,
//                     completed: equipment.completed_count || 0
//                   })),
//                 'value',
//                 'Maintenance Count',
//                 'name',
//                 '#8884d8'
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Stock Status Distribution */}
//       {data.chart_types?.includes('pie') && reportData.stock_level_summary?.status_breakdown && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Inventory Stock Status</Typography>
//               {renderPieChart(
//                 Object.entries(reportData.stock_level_summary.status_breakdown).map(([status, count]) => ({
//                   name: status.replace(/_/g, ' '),
//                   value: count
//                 })),
//                 'value'
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Order Type Distribution */}
//       {data.chart_types?.includes('pie') && reportData.purchase_analysis?.summary?.order_type_breakdown && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Purchase Order Types</Typography>
//               {renderPieChart(
//                 Object.entries(reportData.purchase_analysis.summary.order_type_breakdown).map(([type, count]) => ({
//                   name: type.charAt(0).toUpperCase() + type.slice(1),
//                   value: count
//                 })),
//                 'value'
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}
//     </Grid>
//   );
// };

//   const ComprehensiveTables = () => {
//   return (
//     <Grid container spacing={3}>
//       {/* Category Breakdown */}
//       {reportData.category_breakdown && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <DataTable
//             title="Category Breakdown"
//             data={reportData.category_breakdown}
//             columns={[
//               { key: 'category', label: 'Category' },
//               { key: 'transactions', label: 'Transactions' },
//               { key: 'quantity', label: 'Quantity' },
//               { 
//                 key: 'total_value', 
//                 label: 'Total Value', 
//                 render: (value) => `₵${Number(value || 0).toLocaleString()}`
//               },
//             ]}
//           />
//         </Grid>
//       )}

//       {/* Department Analysis */}
//       {reportData.department_analysis && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <DataTable
//             title="Department Analysis"
//             data={reportData.department_analysis}
//             columns={[
//               { key: 'department', label: 'Department' },
//               { key: 'transactions', label: 'Transactions' },
//               { key: 'total_quantity', label: 'Total Quantity' },
//               { 
//                 key: 'total_value', 
//                 label: 'Total Value', 
//                 render: (value) => `₵${Number(value || 0).toLocaleString()}`
//               },
//             ]}
//           />
//         </Grid>
//       )}

//       {/* Transaction Analysis */}
//       {reportData.transaction_analysis && (
//         <Grid size={{ xs: 12 }}>
//           <DataTable
//             title="Transaction Type Analysis"
//             data={reportData.transaction_analysis}
//             columns={[
//               { key: 'label', label: 'Transaction Type' },
//               { key: 'count', label: 'Count' },
//               { key: 'total_quantity', label: 'Total Quantity' },
//               { 
//                 key: 'total_value', 
//                 label: 'Total Value', 
//                 render: (value) => `₵${Number(value || 0).toLocaleString()}`
//               },
//               { 
//                 key: 'avg_transaction_value', 
//                 label: 'Avg Transaction Value', 
//                 render: (value) => `₵${Number(value || 0).toLocaleString()}`
//               },
//               { 
//                 key: 'avg_unit_cost', 
//                 label: 'Avg Unit Cost', 
//                 render: (value) => `₵${Number(value || 0).toFixed(2)}`
//               },
//             ]}
//           />
//         </Grid>
//       )}

//       {/* Maintenance Analysis - Equipment Reliability */}
//       {reportData.maintenance_analysis?.equipment_reliability && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <DataTable
//             title="Equipment Reliability"
//             data={reportData.maintenance_analysis.equipment_reliability}
//             columns={[
//               { key: 'item_name', label: 'Equipment Name' },
//               { key: 'maintenance_count', label: 'Maintenance Count' },
//               { key: 'completed_count', label: 'Completed' },
//               { 
//                 key: 'completion_rate', 
//                 label: 'Completion Rate', 
//                 render: (value, row) => {
//                   const rate = row.maintenance_count > 0 ? 
//                     (row.completed_count / row.maintenance_count) * 100 : 0;
//                   return `${rate.toFixed(1)}%`;
//                 }
//               },
//               { key: 'total_downtime', label: 'Total Downtime (hrs)' },
//             ]}
//           />
//         </Grid>
//       )}

//       {/* Maintenance Analysis - By Category */}
//       {reportData.maintenance_analysis?.maintenance_by_category && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <DataTable
//             title="Maintenance by Category"
//             data={reportData.maintenance_analysis.maintenance_by_category}
//             columns={[
//               { key: 'category', label: 'Category' },
//               { key: 'count', label: 'Maintenance Count' },
//               { 
//                 key: 'total_cost', 
//                 label: 'Total Cost', 
//                 render: (value) => `₵${Number(value || 0).toLocaleString()}`
//               },
//               { 
//                 key: 'average_cost', 
//                 label: 'Avg Cost', 
//                 render: (value) => `₵${Number(value || 0).toLocaleString()}`
//               },
//               { key: 'total_downtime', label: 'Downtime (hrs)' },
//             ]}
//           />
//         </Grid>
//       )}

//       {/* Critical Items */}
//       {reportData.critical_items && (
//         <Grid size={{ xs: 12 }}>
//           <DataTable
//             title="Critical Stock Items"
//             data={reportData.critical_items}
//             columns={[
//               { key: 'name', label: 'Item Name' },
//               { key: 'item_code', label: 'Item Code' },
//               { key: 'category', label: 'Category' },
//               { key: 'current_quantity', label: 'Current Qty' },
//               { key: 'available_quantity', label: 'Available Qty' },
//               { key: 'status', label: 'Status', render: (value) => (
//                 <Chip 
//                   label={value?.replace(/_/g, ' ') || 'Unknown'} 
//                   color={
//                     value === 'out_of_stock' ? 'error' : 
//                     value === 'low_stock' ? 'warning' : 'success'
//                   } 
//                   size="small" 
//                 />
//               )}
//             ]}
//           />
//         </Grid>
//       )}

//       {/* Recent Activities */}
//       {reportData.recent_activities && (
//         <Grid size={{ xs: 12 }}>
//           <DataTable
//             title="Recent Activities (Last 20)"
//             data={reportData.recent_activities.slice(0, 20)}
//             columns={[
//               { key: 'date', label: 'Date' },
//               { key: 'action', label: 'Action' },
//               { key: 'item', label: 'Item' },
//               { key: 'user', label: 'User' },
//               { key: 'quantity', label: 'Quantity' },
//               { 
//                 key: 'value', 
//                 label: 'Value', 
//                 render: (value) => value ? `₵${Number(value).toLocaleString()}` : '-'
//               },
//             ]}
//           />
//         </Grid>
//       )}

//       {/* Supplier Performance */}
// {reportData.purchase_analysis?.supplier_performance && reportData.suppliers && (
//   <Grid size={{ xs: 12 }}>
//     <DataTable
//       title="Supplier Performance Analysis"
//       data={reportData.purchase_analysis.supplier_performance.map((performance, index) => {
//         // Try to match by order amount pattern or use index-based matching
//         // Since we can't match by name, we'll assign suppliers sequentially
//         const matchedSupplier = reportData.suppliers[index % reportData.suppliers.length];
        
//         return {
//           ...performance,
//           legal_name: matchedSupplier?.legal_name || `Supplier ${index + 1}`,
//           supplier_id: matchedSupplier?.id,
//           display_rank: index + 1
//         };
//       })}
//       columns={[
//         { 
//           key: 'display_rank', 
//           label: 'Rank',
//           render: (value) => `#${value}`
//         },
//         { 
//           key: 'legal_name', 
//           label: 'Supplier Name',
//           render: (value, row) => (
//             <Box>
//               <Typography variant="body2" fontWeight="bold">
//                 {value}
//               </Typography>
//               <Typography variant="caption" color="textSecondary">
//                 {row.order_count} order{row.order_count !== 1 ? 's' : ''}
//               </Typography>
//             </Box>
//           )
//         },
//         { 
//           key: 'order_count', 
//           label: 'Orders',
//           render: (value) => (
//             <Chip 
//               label={value || 0} 
//               size="small" 
//               color={
//                 value >= 2 ? "success" : 
//                 value === 1 ? "info" : "default"
//               }
//             />
//           )
//         },
//         { 
//           key: 'total_spent', 
//           label: 'Total Spent', 
//           render: (value) => (
//             <Typography fontWeight="bold" color="success.main">
//               ₵{Number(value || 0).toLocaleString()}
//             </Typography>
//           )
//         },
//         { 
//           key: 'average_order_value', 
//           label: 'Avg Order Value', 
//           render: (value) => `₵${Number(value || 0).toLocaleString()}`
//         },
//         { 
//           key: 'performance_rating', 
//           label: 'Rating', 
//           render: (value, row) => {
//             const avgValue = row.average_order_value || 0;
//             let rating = "Standard";
//             let color = "default";
            
//             if (avgValue > 40000) {
//               rating = "Premium";
//               color = "success";
//             } else if (avgValue > 25000) {
//               rating = "High Value";
//               color = "info";
//             } else if (avgValue < 15000) {
//               rating = "Budget";
//               color = "warning";
//             }
            
//             return <Chip label={rating} size="small" color={color} />;
//           }
//         },
//       ]}
//     />
//   </Grid>
// )}

// {/* // Recent Orders Table */}
// {reportData.purchase_analysis?.recent_orders && (
//   <Grid size={{ xs: 12, md: 12 }}>
//     <DataTable
//       title="Recent Purchase Orders"
//       data={reportData.purchase_analysis.recent_orders}
//       columns={[
//         { key: 'po_number', label: 'PO Number' },
//         { 
//           key: 'order_date', 
//           label: 'Order Date',
//           render: (value) => new Date(value).toLocaleDateString()
//         },
//         { 
//           key: 'total_amount', 
//           label: 'Amount', 
//           render: (value) => `₵${Number(value || 0).toLocaleString()}`
//         },
//         { 
//           key: 'status', 
//           label: 'Status',
//           render: (value) => (
//             <Chip 
//               label={value?.replace(/_/g, ' ') || 'Unknown'} 
//               size="small"
//               color={
//                 value === 'received' || value === 'closed' ? 'success' :
//                 value === 'cancelled' ? 'error' :
//                 value === 'ordered' ? 'info' : 'default'
//               }
//             />
//           )
//         },
//       ]}
//     />
//   </Grid>
// )}

// {/* // Supplier Directory - Now with actual supplier data */}
// {reportData.suppliers && reportData.suppliers.length > 0 && (
//   <Grid size={{ xs: 12, md: 6 }}>
//     <Card>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>Supplier Directory</Typography>
//         <List dense>
//           <ListItem>
//             <ListItemText 
//               primary="Total Registered Suppliers" 
//               secondary={reportData.suppliers.length}
//             />
//           </ListItem>
//           <ListItem>
//             <ListItemText 
//               primary="Active in Reporting Period" 
//               secondary={reportData.purchase_analysis?.supplier_performance?.length || 0}
//             />
//           </ListItem>
//           <ListItem>
//             <ListItemText 
//               primary="Total Purchase Orders" 
//               secondary={reportData.purchase_analysis?.summary?.total_orders || 0}
//             />
//           </ListItem>
//         </List>
        
//         {/* Supplier List */}
//         <Box sx={{ mt: 2 }}>
//           <Typography variant="subtitle2" gutterBottom>Registered Suppliers</Typography>
//           <Grid container spacing={1}>
//             {reportData.suppliers.map((supplier, index) => (
//               <Grid size={{ xs: 6 }} key={supplier.id}>
//                 <Chip 
//                   label={supplier.legal_name}
//                   size="small"
//                   variant="outlined"
//                   sx={{ mb: 1 }}
//                 />
//               </Grid>
//             ))}
//           </Grid>
//         </Box>
//       </CardContent>
//     </Card>
//   </Grid>
// )}
//     </Grid>
//   );
// };

// const ComprehensiveDetails = () => {
//   return (
//     <Grid container spacing={3}>
//       {/* Stock Level Summary */}
//       {reportData.stock_level_summary && (
//         <Grid size={{ xs: 12 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Inventory Health Overview</Typography>
//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 6, md: 2.4 }}>
//                   <Typography variant="body2" color="textSecondary">Total Items Tracked</Typography>
//                   <Typography variant="h6">{reportData.stock_level_summary.total_items_tracked}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6, md: 2.4 }}>
//                   <Typography variant="body2" color="textSecondary">Total Inventory Value</Typography>
//                   <Typography variant="h6">₵{reportData.stock_level_summary.total_inventory_value?.toLocaleString()}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6, md: 2.4 }}>
//                   <Typography variant="body2" color="textSecondary">Average Item Value</Typography>
//                   <Typography variant="h6">₵{reportData.stock_level_summary.average_item_value?.toLocaleString()}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6, md: 2.4 }}>
//                   <Typography variant="body2" color="textSecondary">Items Need Attention</Typography>
//                   <Typography variant="h6" color="error">
//                     {(reportData.stock_level_summary.status_breakdown?.critical_stock || 0) + 
//                      (reportData.stock_level_summary.status_breakdown?.low_stock || 0) +
//                      (reportData.stock_level_summary.status_breakdown?.out_of_stock || 0)}
//                   </Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6, md: 2.4 }}>
//                   <Typography variant="body2" color="textSecondary">Healthy Stock</Typography>
//                   <Typography variant="h6" color="success">
//                     {(reportData.stock_level_summary.status_breakdown?.adequate_stock || 0) + 
//                      (reportData.stock_level_summary.status_breakdown?.over_stock || 0)}
//                   </Typography>
//                 </Grid>
//               </Grid>

//               {/* Status Breakdown */}
//               {reportData.stock_level_summary.status_breakdown && (
//                 <Box sx={{ mt: 3 }}>
//                   <Typography variant="subtitle1" gutterBottom>Stock Status Distribution</Typography>
//                   <Grid container spacing={1}>
//                     {Object.entries(reportData.stock_level_summary.status_breakdown).map(([status, count]) => (
//                       <Grid size={{ xs: 6, md: 2.4 }} key={status}>
//                         <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
//                           <Typography variant="body2" color="textSecondary">
//                             {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                           </Typography>
//                           <Typography 
//                             variant="h6" 
//                             color={
//                               status === 'out_of_stock' ? 'error' : 
//                               status === 'critical_stock' ? 'error' :
//                               status === 'low_stock' ? 'warning' : 
//                               status === 'over_stock' ? 'info' : 'success'
//                             }
//                           >
//                             {count}
//                           </Typography>
//                           <Typography variant="caption" color="textSecondary">
//                             {Math.round((count / reportData.stock_level_summary.total_items_tracked) * 100)}%
//                           </Typography>
//                         </Card>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </Box>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Purchase Analysis Summary */}
//     {/* // In ComprehensiveDetails component - Update purchase analysis */}
// {reportData.purchase_analysis && (
//   <Grid size={{ xs: 12, md: 6 }}>
//     <Card>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>Procurement Overview</Typography>
        
//         {/* Key Metrics */}
//         <Grid container spacing={2} sx={{ mb: 2 }}>
//           <Grid size={{ xs: 6 }}>
//             <Typography variant="body2" color="textSecondary">Total Orders</Typography>
//             <Typography variant="h6">{reportData.purchase_analysis.summary?.total_orders || 0}</Typography>
//           </Grid>
//           <Grid size={{ xs: 6 }}>
//             <Typography variant="body2" color="textSecondary">Total Amount</Typography>
//             <Typography variant="h6">₵{(reportData.purchase_analysis.summary?.total_amount || 0).toLocaleString()}</Typography>
//           </Grid>
//           <Grid size={{ xs: 6 }}>
//             <Typography variant="body2" color="textSecondary">Avg Order Value</Typography>
//             <Typography variant="h6">₵{(reportData.purchase_analysis.summary?.average_order_value || 0).toLocaleString()}</Typography>
//           </Grid>
//           <Grid size={{ xs: 6 }}>
//             <Typography variant="body2" color="textSecondary">Largest Order</Typography>
//             <Typography variant="h6">
//               ₵{Math.max(...(reportData.purchase_analysis.recent_orders?.map(order => order.total_amount) || [0])).toLocaleString()}
//             </Typography>
//           </Grid>
//         </Grid>

//         {/* Order Type Breakdown */}
//         {reportData.purchase_analysis.summary?.order_type_breakdown && (
//           <Box sx={{ mt: 2 }}>
//             <Typography variant="subtitle2" gutterBottom>Order Types</Typography>
//             <Grid container spacing={1}>
//               {Object.entries(reportData.purchase_analysis.summary.order_type_breakdown).map(([type, count]) => (
//                 <Grid size={{ xs: 6 }} key={type}>
//                   <Chip 
//                     label={`${type}: ${count}`}
//                     size="small"
//                     variant="outlined"
//                     color={
//                       type === 'capital' ? 'primary' :
//                       type === 'emergency' ? 'error' : 'default'
//                     }
//                   />
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         )}

//         {/* Status Breakdown */}
//         {reportData.purchase_analysis.summary?.status_breakdown && (
//           <Box sx={{ mt: 2 }}>
//             <Typography variant="subtitle2" gutterBottom>Order Status</Typography>
//             <Grid container spacing={1}>
//               {Object.entries(reportData.purchase_analysis.summary.status_breakdown).map(([status, count]) => (
//                 <Grid size={{ xs: 6 }} key={status}>
//                   <Chip 
//                     label={`${status}: ${count}`}
//                     size="small"
//                     variant="outlined"
//                     color={
//                       status === 'received' || status === 'closed' ? 'success' :
//                       status === 'cancelled' ? 'error' :
//                       status === 'ordered' ? 'info' : 'default'
//                     }
//                   />
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         )}
//       </CardContent>
//     </Card>
//   </Grid>
// )}

//       {/* Maintenance Analysis Summary */}
//       {reportData.maintenance_analysis && (
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Maintenance Overview</Typography>
//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography variant="body2" color="textSecondary">Total Maintenance</Typography>
//                   <Typography variant="h6">{reportData.maintenance_analysis.summary?.total_maintenance || 0}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography variant="body2" color="textSecondary">Total Cost</Typography>
//                   <Typography variant="h6">₵{(reportData.maintenance_analysis.summary?.total_cost || 0).toLocaleString()}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography variant="body2" color="textSecondary">Avg Cost/Maintenance</Typography>
//                   <Typography variant="h6">₵{(reportData.maintenance_analysis.summary?.average_cost_per_maintenance || 0).toLocaleString()}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6 }}>
//                   <Typography variant="body2" color="textSecondary">Total Downtime</Typography>
//                   <Typography variant="h6">{reportData.maintenance_analysis.summary?.total_downtime_hours || 0} hrs</Typography>
//                 </Grid>
//               </Grid>

//               {/* Priority Breakdown */}
//               {reportData.maintenance_analysis.summary?.priority_breakdown && (
//                 <Box sx={{ mt: 2 }}>
//                   <Typography variant="subtitle2" gutterBottom>Priority Distribution</Typography>
//                   <Grid container spacing={1}>
//                     {Object.entries(reportData.maintenance_analysis.summary.priority_breakdown).map(([priority, count]) => (
//                       <Grid size={{ xs: 6 }} key={priority}>
//                         <Chip 
//                           label={`${priority}: ${count}`}
//                           size="small"
//                           variant="outlined"
//                           color={
//                             priority === 'critical' ? 'error' :
//                             priority === 'high' ? 'warning' :
//                             priority === 'medium' ? 'info' : 'default'
//                           }
//                         />
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </Box>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Transaction Summary */}
//       {reportData.summary && (
//         <Grid size={{ xs: 12 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>Transaction Overview</Typography>
//               <Grid container spacing={2}>
//                 <Grid size={{ xs: 6, md: 2.4 }}>
//                   <Typography variant="body2" color="textSecondary">Total Transactions</Typography>
//                   <Typography variant="h6">{reportData.summary.total_transactions}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6, md: 2.4 }}>
//                   <Typography variant="body2" color="textSecondary">Total Value</Typography>
//                   <Typography variant="h6">₵{reportData.summary.total_value?.toLocaleString()}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6, md: 2.4 }}>
//                   <Typography variant="body2" color="textSecondary">Incoming Stock</Typography>
//                   <Typography variant="h6" color="success">{reportData.summary.incoming_stock}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6, md: 2.4 }}>
//                   <Typography variant="body2" color="textSecondary">Outgoing Stock</Typography>
//                   <Typography variant="h6" color="warning">{reportData.summary.outgoing_stock}</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 6, md: 2.4 }}>
//                   <Typography variant="body2" color="textSecondary">Net Movement</Typography>
//                   <Typography variant="h6" color="info">{reportData.summary.net_stock_movement}</Typography>
//                 </Grid>
//               </Grid>
//             </CardContent>
//           </Card>
//         </Grid>
//       )}

//       {/* Key Performance Indicators */}
//       <Grid size={{ xs: 12 }}>
//         <Card>
//           <CardContent>
//             <Typography variant="h6" gutterBottom>Key Performance Indicators</Typography>
//             <Grid container spacing={2}>
//               {/* Inventory Health KPI */}
//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
//                   <Typography variant="body2" color="textSecondary">Inventory Health Score</Typography>
//                   <Typography variant="h4" color="success.main">
//                     {reportData.stock_level_summary ? 
//                       Math.round(((reportData.stock_level_summary.status_breakdown?.adequate_stock || 0) + 
//                       (reportData.stock_level_summary.status_breakdown?.over_stock || 0)) / 
//                       reportData.stock_level_summary.total_items_tracked * 100) : 0}%
//                   </Typography>
//                   <Typography variant="caption" color="textSecondary">
//                     Items in good condition
//                   </Typography>
//                 </Card>
//               </Grid>

//               {/* Maintenance Efficiency KPI */}
//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
//                   <Typography variant="body2" color="textSecondary">Maintenance Completion Rate</Typography>
//                   <Typography variant="h4" color="info.main">
//                     {reportData.maintenance_analysis?.summary ? 
//                       Math.round((reportData.maintenance_analysis.summary.status_breakdown?.completed || 0) / 
//                       reportData.maintenance_analysis.summary.total_maintenance * 100) : 0}%
//                   </Typography>
//                   <Typography variant="caption" color="textSecondary">
//                     Tasks completed on time
//                   </Typography>
//                 </Card>
//               </Grid>

//               {/* Procurement Efficiency KPI */}
//               <Grid size={{ xs: 12, md: 4 }}>
//                 <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
//                   <Typography variant="body2" color="textSecondary">Procurement Success Rate</Typography>
//                   <Typography variant="h4" color="success.main">
//                     {reportData.purchase_analysis?.summary ? 
//                       Math.round(((reportData.purchase_analysis.summary.status_breakdown?.received || 0) + 
//                       (reportData.purchase_analysis.summary.status_breakdown?.closed || 0)) / 
//                       reportData.purchase_analysis.summary.total_orders * 100) : 0}%
//                   </Typography>
//                   <Typography variant="caption" color="textSecondary">
//                     Orders successfully fulfilled
//                   </Typography>
//                 </Card>
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>
//       </Grid>


// {reportData.purchase_analysis?.supplier_performance && (
//   <Grid size={{ xs: 12, md: 6 }}>
//     <Card>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>Supplier Performance Insights</Typography>
        
//         {/* Key Metrics */}
//         <Grid container spacing={2} sx={{ mb: 2 }}>
//           <Grid size={{ xs: 6 }}>
//             <Typography variant="body2" color="textSecondary">Total Suppliers</Typography>
//             <Typography variant="h6">{reportData.purchase_analysis.supplier_performance.length}</Typography>
//           </Grid>
//           <Grid size={{ xs: 6 }}>
//             <Typography variant="body2" color="textSecondary">Total Orders</Typography>
//             <Typography variant="h6">
//               {reportData.purchase_analysis.supplier_performance.reduce((sum, s) => sum + (s.order_count || 0), 0)}
//             </Typography>
//           </Grid>
//           <Grid size={{ xs: 6 }}>
//             <Typography variant="body2" color="textSecondary">Total Spent</Typography>
//             <Typography variant="h6">
//               ₵{reportData.purchase_analysis.supplier_performance.reduce((sum, s) => sum + (s.total_spent || 0), 0).toLocaleString()}
//             </Typography>
//           </Grid>
//           <Grid size={{ xs: 6 }}>
//             <Typography variant="body2" color="textSecondary">Avg Order Value</Typography>
//             <Typography variant="h6">
//               ₵{(
//                 reportData.purchase_analysis.supplier_performance.reduce((sum, s) => sum + (s.total_spent || 0), 0) / 
//                 reportData.purchase_analysis.supplier_performance.reduce((sum, s) => sum + (s.order_count || 0), 1)
//               ).toLocaleString()}
//             </Typography>
//           </Grid>
//         </Grid>

//         {/* Top Performers */}
//         <Box sx={{ mt: 2 }}>
//           <Typography variant="subtitle2" gutterBottom>Top Performers</Typography>
//           <List dense>
//             {/* Top by Total Spent */}
//             <ListItem>
//               <ListItemIcon>
//                 <AttachMoney color="success" />
//               </ListItemIcon>
//               <ListItemText 
//                 primary="Highest Spending" 
//                 secondary={
//                   reportData.purchase_analysis.supplier_performance
//                     .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))[0]?.supplier_name || 'N/A'
//                 }
//               />
//               <Typography variant="body2" color="success.main">
//                 ₵{reportData.purchase_analysis.supplier_performance
//                   .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))[0]?.total_spent?.toLocaleString() || '0'}
//               </Typography>
//             </ListItem>

//             {/* Top by Order Count */}
//             <ListItem>
//               <ListItemIcon>
//                 <ShoppingCart color="info" />
//               </ListItemIcon>
//               <ListItemText 
//                 primary="Most Orders" 
//                 secondary={
//                   reportData.purchase_analysis.supplier_performance
//                     .sort((a, b) => (b.order_count || 0) - (a.order_count || 0))[0]?.supplier_name || 'N/A'
//                 }
//               />
//               <Typography variant="body2" color="info.main">
//                 {reportData.purchase_analysis.supplier_performance
//                   .sort((a, b) => (b.order_count || 0) - (a.order_count || 0))[0]?.order_count || 0} orders
//               </Typography>
//             </ListItem>
//           </List>
//         </Box>

//         {/* Performance Distribution */}
//         {reportData.purchase_analysis.supplier_performance.length > 0 && (
//           <Box sx={{ mt: 2 }}>
//             <Typography variant="subtitle2" gutterBottom>Performance Range</Typography>
//             <Grid container spacing={1}>
//               <Grid size={{ xs: 6 }}>
//                 <Chip 
//                   label={`Min: ₵${Math.min(...reportData.purchase_analysis.supplier_performance.map(s => s.total_spent || 0)).toLocaleString()}`}
//                   size="small"
//                   variant="outlined"
//                 />
//               </Grid>
//               <Grid size={{ xs: 6 }}>
//                 <Chip 
//                   label={`Max: ₵${Math.max(...reportData.purchase_analysis.supplier_performance.map(s => s.total_spent || 0)).toLocaleString()}`}
//                   size="small"
//                   variant="outlined"
//                 />
//               </Grid>
//             </Grid>
//           </Box>
//         )}
//       </CardContent>
//     </Card>
//   </Grid>
// )}

// {reportData.suppliers && Array.isArray(reportData.suppliers) && reportData.suppliers.length > 0 ? (
//   <Grid size={{ xs: 12, md: 6 }}>
//     <Card>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>Supplier Directory</Typography>
//         <List dense>
//           <ListItem>
//             <ListItemText 
//               primary="Total Registered Suppliers" 
//               secondary={reportData.suppliers.length}
//             />
//           </ListItem>
//           <ListItem>
//             <ListItemText 
//               primary="Active in Reporting Period" 
//               secondary={reportData.purchase_analysis?.supplier_performance?.length || 0}
//             />
//           </ListItem>
//         </List>
        
//         {/* Sample of suppliers */}
//         <Box sx={{ mt: 2 }}>
//           <Typography variant="subtitle2" gutterBottom>Supplier Examples</Typography>
//           <Grid container spacing={1}>
//             {reportData.suppliers.slice(0, 4).map((supplier, index) => (
//               <Grid size={{ xs: 6 }} key={supplier.id || index}>
//                 <Chip 
//                   label={supplier.legal_name || `Supplier ${index + 1}`}
//                   size="small"
//                   variant="outlined"
//                 />
//               </Grid>
//             ))}
//           </Grid>
//           {reportData.suppliers.length > 4 && (
//             <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
//               + {reportData.suppliers.length - 4} more suppliers
//             </Typography>
//           )}
//         </Box>
//       </CardContent>
//     </Card>
//   </Grid>
// ) : (
//   // Enhanced supplier activity display
//   <Grid size={{ xs: 12, md: 6 }}>
//     <Card>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>Supplier Activity Summary</Typography>
//         <List dense>
//           <ListItem>
//             <ListItemText 
//               primary="Active Suppliers" 
//               secondary={reportData.purchase_analysis?.supplier_performance?.length || 0}
//             />
//           </ListItem>
//           <ListItem>
//             <ListItemText 
//               primary="Total Purchase Orders" 
//               secondary={reportData.purchase_analysis?.summary?.total_orders || 0}
//             />
//           </ListItem>
//           <ListItem>
//             <ListItemText 
//               primary="Total Amount Spent" 
//               secondary={`₵${reportData.purchase_analysis?.summary?.total_amount?.toLocaleString() || '0'}`}
//             />
//           </ListItem>
//           <ListItem>
//             <ListItemText 
//               primary="Average Order Value" 
//               secondary={`₵${reportData.purchase_analysis?.summary?.average_order_value?.toLocaleString() || '0'}`}
//             />
//           </ListItem>
//         </List>
        
//         {/* Enhanced supplier performance display */}
//         {reportData.purchase_analysis?.supplier_performance && (
//           <Box sx={{ mt: 2 }}>
//             <Typography variant="subtitle2" gutterBottom>Supplier Performance Ranking</Typography>
//             <Grid container spacing={1}>
//               {reportData.purchase_analysis.supplier_performance
//                 .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
//                 .slice(0, 6)
//                 .map((supplier, index) => (
//                 <Grid size={{ xs: 6 }} key={index}>
//                   <Chip 
//                     label={`#${index + 1} - ₵${supplier.total_spent?.toLocaleString()}`}
//                     size="small"
//                     variant="outlined"
//                     color={
//                       index === 0 ? "success" :
//                       index === 1 ? "primary" :
//                       index === 2 ? "secondary" : "default"
//                     }
//                     title={`${supplier.order_count} orders, Avg: ₵${supplier.average_order_value?.toLocaleString()}`}
//                   />
//                 </Grid>
//               ))}
//             </Grid>
//             <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
//               Ranked by total spending • {reportData.purchase_analysis.supplier_performance.length} active suppliers
//             </Typography>
            
//             {/* Quick stats */}
//             <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
//               <Typography variant="caption" display="block" gutterBottom>
//                 <strong>Top Spender:</strong> ₵{Math.max(...reportData.purchase_analysis.supplier_performance.map(s => s.total_spent || 0)).toLocaleString()}
//               </Typography>
//               <Typography variant="caption" display="block">
//                 <strong>Most Orders:</strong> {Math.max(...reportData.purchase_analysis.supplier_performance.map(s => s.order_count || 0))} orders
//               </Typography>
//             </Box>
//           </Box>
//         )}
//       </CardContent>
//     </Card>
//   </Grid>
// )}

//     </Grid>
//   );
// };

// Acquisition Analytics
const AcquisitionAnalytics = () => {
  return (
    <Grid container spacing={3}>
      {/* Monthly Acquisition Trends */}
      {data.chart_types?.includes('bar') && reportData.trends?.monthly_trends && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Monthly Acquisition Value</Typography>
              {renderBarChart(
                reportData.trends.monthly_trends, 
                'total_value', 
                'Total Value (₵)', 
                'month', 
                '#0088FE'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Category Distribution */}
      {data.chart_types?.includes('pie') && reportData.category_breakdown && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Acquisitions by Category</Typography>
              {renderPieChart(
                reportData.category_breakdown.map(cat => ({
                  name: cat.category,
                  value: cat.total_value
                })),
                'value'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Quarterly Analysis */}
      {data.chart_types?.includes('bar') && reportData.trends?.quarterly_analysis && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quarterly Acquisition Trends</Typography>
              {renderBarChart(
                reportData.trends.quarterly_analysis.map(q => ({
                  name: `Q${q.quarter} ${q.year}`,
                  value: q.total_value,
                  count: q.acquisition_count
                })),
                'value',
                'Total Value (₵)',
                'name',
                '#00C49F'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Supplier Analysis */}
      {data.chart_types?.includes('bar') && reportData.supplier_analysis && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Acquisitions by Supplier</Typography>
              {renderBarChart(
                reportData.supplier_analysis.map(supplier => ({
                  name: supplier.supplier,
                  value: supplier.total_value,
                  quantity: supplier.total_quantity
                })),
                'value',
                'Total Value (₵)',
                'name',
                '#FF8042'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// Acquisition Tables
const AcquisitionTables = () => {
  return (
    <Grid container spacing={3}>
      {/* Category Breakdown */}
      {reportData.category_breakdown && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Acquisitions by Category"
            data={reportData.category_breakdown}
            columns={[
              { key: 'category', label: 'Category' },
              { key: 'acquisition_count', label: 'Acquisitions' },
              { key: 'total_quantity', label: 'Total Quantity' },
              { 
                key: 'total_value', 
                label: 'Total Value', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'percentage_of_total', 
                label: '% of Total', 
                render: (value) => `${Number(value || 0).toFixed(1)}%`
              },
            ]}
          />
        </Grid>
      )}

      {/* Supplier Analysis */}
      {reportData.supplier_analysis && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Supplier Performance"
            data={reportData.supplier_analysis}
            columns={[
              { key: 'supplier', label: 'Supplier/PO Number' },
              { key: 'transactions', label: 'Transactions' },
              { key: 'total_quantity', label: 'Total Quantity' },
              { 
                key: 'total_value', 
                label: 'Total Value', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'avg_unit_cost', 
                label: 'Avg Unit Cost', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
            ]}
          />
        </Grid>
      )}

      {/* Recent Acquisitions */}
      {reportData.acquisitions && (
        <Grid size={{ xs: 12 }}>
          <DataTable
            title="Recent Acquisitions"
            data={reportData.acquisitions}
            columns={[
              { key: 'item_name', label: 'Item Name' },
              { key: 'category', label: 'Category' },
              { key: 'department', label: 'Department' },
              { key: 'quantity', label: 'Quantity' },
              { 
                key: 'unit_cost', 
                label: 'Unit Cost', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'total_value', 
                label: 'Total Value', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'transaction_date', 
                label: 'Date', 
                render: (value) => new Date(value).toLocaleDateString()
              },
              { key: 'status', label: 'Status' },
            ]}
          />
        </Grid>
      )}
    </Grid>
  );
};

// Acquisition Details
const AcquisitionDetails = () => {
  return (
    <Grid container spacing={3}>
      {/* Acquisition Summary */}
      {reportData.summary && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Acquisition Performance</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Acquisitions</Typography>
                  <Typography variant="h6">{reportData.summary.total_acquisitions}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Quantity</Typography>
                  <Typography variant="h6">{reportData.summary.total_quantity}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Value</Typography>
                  <Typography variant="h6">₵{reportData.summary.total_value?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Avg Acquisition Value</Typography>
                  <Typography variant="h6">₵{reportData.summary.average_acquisition_value?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Avg Unit Cost</Typography>
                  <Typography variant="h6">₵{reportData.summary.average_unit_cost?.toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Year-over-Year Analysis */}
      {reportData.trends?.year_over_year && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Year-over-Year Comparison</Typography>
              <List dense>
                {reportData.trends.year_over_year.map((yearData, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={`${yearData.year}`}
                      secondary={`${yearData.acquisition_count} acquisitions, ₵${yearData.total_value?.toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Category Performance */}
      {reportData.category_breakdown && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Category Performance</Typography>
              <List dense>
                {reportData.category_breakdown
                  .sort((a, b) => (b.total_value || 0) - (a.total_value || 0))
                  .map((category, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={category.category}
                      secondary={`₵${category.total_value?.toLocaleString()} (${category.percentage_of_total}% of total)`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// Depreciation Summary Cards
const DepreciationSummaryCards = ({ summary }) => {
  if (!summary || typeof summary !== 'object') {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No depreciation summary data available.
      </Alert>
    );
  }

  const summaryMetrics = [
    {
      label: 'Total Assets',
      value: summary.total_assets?.toLocaleString() || '0',
      icon: <Inventory2 color="primary" />,
      color: 'primary'
    },
    {
      label: 'Total Original Value',
      value: `₵${(summary.total_original_value || 0).toLocaleString()}`,
      icon: <AttachMoney color="success" />,
      color: 'success'
    },
    {
      label: 'Total Current Value',
      value: `₵${(summary.total_current_value || 0).toLocaleString()}`,
      icon: <Analytics color="info" />,
      color: 'info'
    },
    {
      label: 'Total Depreciation',
      value: `₵${(summary.total_depreciation || 0).toLocaleString()}`,
      icon: <TrendingDown color="warning" />,
      color: 'warning'
    },
    {
      label: 'Average Depreciation Rate',
      value: `${((summary.average_depreciation_rate || 0) * 100).toFixed(1)}%`,
      icon: <Numbers color="secondary" />,
      color: 'secondary'
    },
    {
      label: 'Average Asset Age',
      value: `${(summary.average_asset_age_months || 0).toFixed(1)} months`,
      icon: <History color="info" />,
      color: 'info'
    }
  ];

  // return (
  //   <Grid container spacing={2} sx={{ mb: 3 }}>
  //     {summaryMetrics.map((metric, index) => (
  //       <Grid key={index} size={{ xs: 6, md: 4 }}>
  //         <Card sx={{ height: '100%', borderLeft: `4px solid` }}>
  //           <CardContent>
  //             <Box display="flex" alignItems="center" gap={2}>
  //               <Avatar sx={{ bgcolor: `${metric.color}.light`, width: 48, height: 48 }}>
  //                 {metric.icon}
  //               </Avatar>
  //               <Box>
  //                 <Typography color="textSecondary" gutterBottom variant="overline">
  //                   {metric.label}
  //                 </Typography>
  //                 <Typography variant="h6" fontWeight="bold">
  //                   {metric.value}
  //                 </Typography>
  //               </Box>
  //             </Box>
  //           </CardContent>
  //         </Card>
  //       </Grid>
  //     ))}
  //   </Grid>
  // );
};

// Depreciation Tables
const DepreciationTables = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No depreciation table data available.
      </Alert>
    );
  }

  const { category_depreciation, depreciating_assets } = reportData;

  return (
    <Grid container spacing={3}>
      {/* Category Depreciation Summary */}
      {category_depreciation && (
        <Grid size={{ xs: 12 }}>
          <DataTable
            title="Category Depreciation Summary"
            data={category_depreciation}
            columns={[
              { key: 'category', label: 'Category' },
              { key: 'asset_count', label: 'Asset Count' },
              { 
                key: 'total_original_value', 
                label: 'Original Value', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'total_current_value', 
                label: 'Current Value', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'total_depreciation', 
                label: 'Total Depreciation', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'depreciation_percentage', 
                label: 'Depreciation Rate', 
                render: (value) => `${(value * 100).toFixed(1)}%`
              },
              { 
                key: 'average_age_months', 
                label: 'Avg Age (Months)', 
                render: (value) => value?.toFixed(1) || '0.0'
              }
            ]}
          />
        </Grid>
      )}

      {/* Depreciating Assets */}
      {depreciating_assets && (
        <Grid size={{ xs: 12 }}>
          <DataTable
            title="Depreciating Assets (First 50)"
            data={depreciating_assets.slice(0, 50)}
            columns={[
              { key: 'item_name', label: 'Asset Name' },
              { key: 'category', label: 'Category' },
              { key: 'department', label: 'Department' },
              { 
                key: 'acquisition_date', 
                label: 'Acquisition Date',
                render: (value) => new Date(value).toLocaleDateString()
              },
              { 
                key: 'original_value', 
                label: 'Original Value', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'current_value', 
                label: 'Current Value', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'accumulated_depreciation', 
                label: 'Accumulated Depreciation', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'depreciation_rate', 
                label: 'Depreciation Rate', 
                render: (value) => `${value}%`
              },
              { 
                key: 'age_months', 
                label: 'Age (Months)', 
                render: (value) => value?.toFixed(1) || '0.0'
              },
              { 
                key: 'remaining_life_months', 
                label: 'Remaining Life (Months)', 
                render: (value) => value?.toFixed(1) || '0.0'
              }
            ]}
          />
        </Grid>
      )}
    </Grid>
  );
};

// Depreciation Details
const DepreciationDetails = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No depreciation details available.
      </Alert>
    );
  }

  const { summary, age_analysis, category_depreciation } = reportData;

  return (
    <Grid container spacing={3}>
      {/* Overall Depreciation Summary */}
      {summary && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Overall Depreciation Summary</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Assets</Typography>
                  <Typography variant="h6">{summary.total_assets}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Original Value</Typography>
                  <Typography variant="h6">₵{summary.total_original_value?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Current Value</Typography>
                  <Typography variant="h6">₵{summary.total_current_value?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Depreciation</Typography>
                  <Typography variant="h6" color="warning.main">
                    ₵{summary.total_depreciation?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Avg Depreciation Rate</Typography>
                  <Typography variant="h6">{(summary.average_depreciation_rate * 100)?.toFixed(1)}%</Typography>
                </Grid>
              </Grid>

              {/* Depreciation Percentage */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Overall Depreciation Percentage
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {((summary.total_depreciation / summary.total_original_value) * 100).toFixed(3)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  of total asset value has been depreciated
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Age Analysis */}
      {age_analysis && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Asset Age Analysis</Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Newest Asset Age" 
                    secondary={`${(age_analysis.newest_asset_months || 0).toFixed(1)} months`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Oldest Asset Age" 
                    secondary={`${(age_analysis.oldest_asset_months || 0).toFixed(1)} months`}
                  />
                </ListItem>
              </List>

              {/* Age Group Distribution */}
              {age_analysis.age_groups && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Assets by Age Group</Typography>
                  <List dense>
                    {Object.entries(age_analysis.age_groups)
                      .sort(([a], [b]) => {
                        const order = ['0-6 months', '6-12 months', '1-2 years', '2-5 years', '5+ years'];
                        return order.indexOf(a) - order.indexOf(b);
                      })
                      .map(([ageGroup, data]) => (
                      <ListItem key={ageGroup}>
                        <ListItemText 
                          primary={ageGroup} 
                          secondary={`${data.count} assets • ₵${data.value?.toLocaleString()}`}
                        />
                        <Typography variant="body2" color="textSecondary">
                          {data.count > 0 ? Math.round((data.count / summary.total_assets) * 100) : 0}%
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Category Performance */}
      {category_depreciation && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Category Performance</Typography>
              
              {/* Top Categories by Depreciation */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Highest Depreciation</Typography>
                {category_depreciation
                  .sort((a, b) => (b.total_depreciation || 0) - (a.total_depreciation || 0))
                  .slice(0, 3)
                  .map((category, index) => (
                  <Box key={category.category} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight="bold">
                        {index + 1}. {category.category}
                      </Typography>
                      <Chip 
                        label={`₵${category.total_depreciation?.toLocaleString()}`}
                        size="small"
                        color="warning"
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {category.asset_count} assets • {(category.depreciation_percentage * 100).toFixed(1)}% rate
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Depreciation Rates */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Depreciation Rates by Category</Typography>
                <Grid container spacing={1}>
                  {category_depreciation.map((category) => (
                    <Grid size={{ xs: 6 }} key={category.category}>
                      <Chip 
                        label={`${category.category}: ${(category.depreciation_percentage * 100).toFixed(1)}%`}
                        size="small"
                        variant="outlined"
                        color={
                          category.depreciation_percentage > 0.08 ? "error" :
                          category.depreciation_percentage > 0.05 ? "warning" : "default"
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Key Metrics */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Depreciation Key Metrics</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Asset Value Retention</Typography>
                  <Typography variant="h4" color="success.main">
                    {summary ? Math.round((summary.total_current_value / summary.total_original_value) * 100) : 0}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    of original value retained
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Average Asset Age</Typography>
                  <Typography variant="h4" color="info.main">
                    {summary?.average_asset_age_months?.toFixed(1) || '0.0'}m
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    months average age
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">New Assets (0-6 months)</Typography>
                  <Typography variant="h4" color="primary.main">
                    {age_analysis?.age_groups?.['0-6 months']?.count || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    recently acquired assets
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Depreciation Analytics
const DepreciationAnalytics = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No depreciation analytics data available.
      </Alert>
    );
  }

  const { category_depreciation, age_analysis } = reportData;

  // Prepare category data for charts
  const categoryChartData = category_depreciation?.map(cat => ({
    name: cat.category,
    original_value: cat.total_original_value,
    current_value: cat.total_current_value,
    depreciation: cat.total_depreciation,
    asset_count: cat.asset_count,
    depreciation_percentage: (cat.depreciation_percentage * 100)
  })) || [];

  // Prepare age analysis data
  const ageChartData = age_analysis?.age_groups ? Object.entries(age_analysis.age_groups).map(([ageGroup, data]) => ({
    name: ageGroup,
    value: data.value,
    count: data.count
  })) : [];

  return (
    <Grid container spacing={3}>
      {/* Category Depreciation Value */}
      {data.chart_types?.includes('bar') && categoryChartData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Depreciation by Category</Typography>
              {renderBarChart(
                categoryChartData,
                'depreciation',
                'Total Depreciation (₵)',
                'name',
                '#FF8042'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Asset Age Distribution */}
      {data.chart_types?.includes('pie') && ageChartData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Asset Age Distribution</Typography>
              {renderPieChart(ageChartData, 'value')}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Category Value Comparison */}
      {data.chart_types?.includes('bar') && categoryChartData.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Category Value Comparison</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip formatter={(value, name) => [name === 'Original Value' || name === 'Current Value' ? `₵${Number(value).toLocaleString()}` : value, name]} />
                  <Legend />
                  <Bar dataKey="original_value" fill="#0088FE" name="Original Value" />
                  <Bar dataKey="current_value" fill="#00C49F" name="Current Value" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Depreciation Rate by Category */}
      {data.chart_types?.includes('bar') && categoryChartData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Depreciation Rate by Category</Typography>
              {renderBarChart(
                categoryChartData,
                'depreciation_percentage',
                'Depreciation Rate (%)',
                'name',
                '#8884d8'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Asset Count by Category */}
      {data.chart_types?.includes('bar') && categoryChartData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Asset Count by Category</Typography>
              {renderBarChart(
                categoryChartData,
                'asset_count',
                'Number of Assets',
                'name',
                '#00C49F'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// Audit Summary Cards
const AuditSummaryCards = ({ summary }) => {
  if (!summary || typeof summary !== 'object') {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No audit summary data available.
      </Alert>
    );
  }

  const summaryMetrics = [
    {
      label: 'Total Audit Entries',
      value: summary.total_audit_entries?.toLocaleString() || '0',
      icon: <History color="primary" />,
      color: 'primary'
    },
    {
      label: 'Unique Users',
      value: summary.unique_users?.toLocaleString() || '0',
      icon: <People color="info" />,
      color: 'info'
    },
    {
      label: 'Create Actions',
      value: summary.create_actions?.toLocaleString() || '0',
      icon: <AddCircle color="success" />,
      color: 'success'
    },
    {
      label: 'Update Actions',
      value: summary.update_actions?.toLocaleString() || '0',
      icon: <Edit color="warning" />,
      color: 'warning'
    },
    {
      label: 'Delete Actions',
      value: summary.delete_actions?.toLocaleString() || '0',
      icon: <Delete color="error" />,
      color: 'error'
    },
    {
      label: 'Most Active User',
      value: summary.most_active_user || 'Unknown',
      icon: <Person color="secondary" />,
      color: 'secondary'
    }
  ];

  // return (
  //   <Grid container spacing={2} sx={{ mb: 3 }}>
  //     {summaryMetrics.map((metric, index) => (
  //       <Grid key={index} size={{ xs: 6, md: 4 }}>
  //         <Card sx={{ height: '100%', borderLeft: `4px solid` }}>
  //           <CardContent>
  //             <Box display="flex" alignItems="center" gap={2}>
  //               <Avatar sx={{ bgcolor: `${metric.color}.light`, width: 48, height: 48 }}>
  //                 {metric.icon}
  //               </Avatar>
  //               <Box>
  //                 <Typography color="textSecondary" gutterBottom variant="overline">
  //                   {metric.label}
  //                 </Typography>
  //                 <Typography variant="h6" fontWeight="bold">
  //                   {metric.value}
  //                 </Typography>
  //               </Box>
  //             </Box>
  //           </CardContent>
  //         </Card>
  //       </Grid>
  //     ))}
  //   </Grid>
  // );
};

// Audit Analytics
const AuditAnalytics = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No audit analytics data available.
      </Alert>
    );
  }

  const { action_analysis, user_activity } = reportData;

  // Prepare action analysis data for charts
  const actionChartData = action_analysis?.map(action => ({
    name: action.action,
    count: action.count,
    percentage: action.percentage,
    users_involved: action.users_involved
  })) || [];

  // Prepare user activity data
  const userActivityData = user_activity?.map(user => ({
    name: user.user_name || 'Unknown User',
    activity_count: user.activity_count,
    last_activity: user.last_activity
  })) || [];

  return (
    <Grid container spacing={3}>
      {/* Action Type Distribution */}
      {data.chart_types?.includes('pie') && actionChartData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Action Type Distribution</Typography>
              {renderPieChart(actionChartData, 'count')}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* User Activity */}
      {data.chart_types?.includes('bar') && userActivityData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>User Activity</Typography>
              {renderBarChart(
                userActivityData,
                'activity_count',
                'Activity Count',
                'name',
                '#0088FE'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Action Percentage Breakdown */}
      {data.chart_types?.includes('bar') && actionChartData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Action Percentage Breakdown</Typography>
              {renderBarChart(
                actionChartData,
                'percentage',
                'Percentage (%)',
                'name',
                '#00C49F'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Users Involved per Action */}
      {data.chart_types?.includes('bar') && actionChartData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Users Involved per Action Type</Typography>
              {renderBarChart(
                actionChartData,
                'users_involved',
                'Users Involved',
                'name',
                '#FF8042'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Activity Timeline (if we had date distribution) */}
      {data.chart_types?.includes('line') && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Activity Timeline</Typography>
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography color="textSecondary">
                  Timeline data not available in current dataset
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// Audit Tables
const AuditTables = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No audit table data available.
      </Alert>
    );
  }

  const { audit_trail, action_analysis, user_activity } = reportData;

  return (
    <Grid container spacing={3}>
      {/* Audit Trail */}
      {audit_trail && (
        <Grid size={{ xs: 12 }}>
          <DataTable
            title="Audit Trail Log"
            data={audit_trail}
            columns={[
              { 
                key: 'timestamp', 
                label: 'Timestamp',
                render: (value) => new Date(value).toLocaleString()
              },
              { key: 'action', label: 'Action' },
              { key: 'table', label: 'Table' },
              { key: 'user', label: 'User' },
              { key: 'changes_count', label: 'Changes Count' },
              { key: 'ip_address', label: 'IP Address' },
              { 
                key: 'user_agent', 
                label: 'User Agent',
                render: (value) => (
                  <Tooltip title={value} arrow>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {value}
                    </Typography>
                  </Tooltip>
                )
              },
              { 
                key: 'record_id', 
                label: 'Record ID',
                render: (value) => (
                  <Tooltip title={value} arrow>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 150, fontFamily: 'monospace' }}>
                      {value.substring(0, 8)}...
                    </Typography>
                  </Tooltip>
                )
              }
            ]}
          />
        </Grid>
      )}

      {/* Action Analysis */}
      {action_analysis && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Action Analysis"
            data={action_analysis}
            columns={[
              { key: 'action', label: 'Action Type' },
              { key: 'count', label: 'Count' },
              { 
                key: 'percentage', 
                label: 'Percentage', 
                render: (value) => `${value}%`
              },
              { key: 'users_involved', label: 'Users Involved' }
            ]}
          />
        </Grid>
      )}

      {/* User Activity */}
      {user_activity && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="User Activity Summary"
            data={user_activity}
            columns={[
              { key: 'user_name', label: 'User Name' },
              { key: 'activity_count', label: 'Activity Count' },
              { 
                key: 'last_activity', 
                label: 'Last Activity',
                render: (value) => new Date(value).toLocaleString()
              }
            ]}
          />
        </Grid>
      )}
    </Grid>
  );
};

// Audit Details
const AuditDetails = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No audit details available.
      </Alert>
    );
  }

  const { summary, action_analysis, user_activity, audit_trail } = reportData;

  return (
    <Grid container spacing={3}>
      {/* Overall Audit Summary */}
      {summary && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Audit Trail Overview</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Entries</Typography>
                  <Typography variant="h6">{summary.total_audit_entries}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Unique Users</Typography>
                  <Typography variant="h6">{summary.unique_users}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Create Actions</Typography>
                  <Typography variant="h6" color="success.main">{summary.create_actions}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Update Actions</Typography>
                  <Typography variant="h6" color="warning.main">{summary.update_actions}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Delete Actions</Typography>
                  <Typography variant="h6" color="error.main">{summary.delete_actions}</Typography>
                </Grid>
              </Grid>

              {/* Most Active User */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Most Active User
                </Typography>
                <Typography variant="h5" color="primary.main">
                  {summary.most_active_user}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Primary contributor to system activities
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Action Type Breakdown */}
      {action_analysis && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Action Type Breakdown</Typography>
              
              <List dense>
                {action_analysis.map((action, index) => (
                  <ListItem key={action.action}>
                    <ListItemIcon>
                      {action.action === 'CREATE' && <AddCircle color="success" />}
                      {action.action === 'UPDATE' && <Edit color="warning" />}
                      {action.action === 'DELETE' && <Delete color="error" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={action.action} 
                      secondary={`${action.count} entries (${action.percentage}%)`}
                    />
                    <Chip 
                      label={`${action.users_involved} user${action.users_involved !== 1 ? 's' : ''}`}
                      size="small"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>

              {/* Action Statistics */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Action Statistics</Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6 }}>
                    <Chip 
                      label={`Total: ${summary?.total_audit_entries || 0}`}
                      size="small"
                      color="primary"
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Chip 
                      label={`Avg per User: ${user_activity?.[0]?.activity_count || 0}`}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* User Activity Details */}
      {user_activity && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>User Activity Details</Typography>
              
              {/* Top Users */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>User Ranking</Typography>
                {user_activity
                  .sort((a, b) => (b.activity_count || 0) - (a.activity_count || 0))
                  .map((user, index) => (
                  <Box key={user.user_id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {index + 1}. {user.user_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Last activity: {new Date(user.last_activity).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${user.activity_count} actions`}
                        size="small"
                        color={index === 0 ? "primary" : "default"}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Activity Distribution */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Activity Distribution</Typography>
                <Grid container spacing={1}>
                  {user_activity.map((user) => (
                    <Grid size={{ xs: 12 }} key={user.user_id}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">
                          {user.user_name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" color="textSecondary">
                            {Math.round((user.activity_count / summary.total_audit_entries) * 100)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(user.activity_count / summary.total_audit_entries) * 100}
                            sx={{ width: 60, height: 6 }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* System Information */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>System Audit Information</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Data Integrity Score</Typography>
                  <Typography variant="h4" color="success.main">
                    {summary ? Math.min(100, Math.round((summary.create_actions / summary.total_audit_entries) * 100)) : 100}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Based on audit completeness
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">User Engagement</Typography>
                  <Typography variant="h4" color="info.main">
                    {summary?.unique_users || 1}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    active users in period
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Activity Density</Typography>
                  <Typography variant="h4" color="warning.main">
                    {summary?.total_audit_entries || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    total audit entries
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Activity Summary */}
            {audit_trail && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Recent Activity Summary</Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Chip 
                      label={`First: ${new Date(audit_trail[0]?.timestamp).toLocaleDateString()}`}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Chip 
                      label={`Last: ${new Date(audit_trail[audit_trail.length - 1]?.timestamp).toLocaleDateString()}`}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Chip 
                      label={`Tables: ${new Set(audit_trail.map(item => item.table)).size}`}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Chip 
                      label={`Avg Changes: ${(audit_trail.reduce((sum, item) => sum + (item.changes_count || 0), 0) / audit_trail.length).toFixed(1)}`}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Procurement Summary Cards
const ProcurementSummaryCards = ({ summary }) => {
  if (!summary || typeof summary !== 'object') {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No procurement summary data available.
      </Alert>
    );
  }

  const summaryMetrics = [
    {
      label: 'Total Orders',
      value: summary.total_orders?.toLocaleString() || '0',
      icon: <ShoppingCart color="primary" />,
      color: 'primary'
    },
    {
      label: 'Total Value',
      value: `₵${(summary.total_value || 0).toLocaleString()}`,
      icon: <AttachMoney color="success" />,
      color: 'success'
    },
    {
      label: 'Average Order Value',
      value: `₵${(summary.average_order_value || 0).toLocaleString()}`,
      icon: <Analytics color="info" />,
      color: 'info'
    },
    {
      label: 'Average Lead Time',
      value: `${(summary.average_lead_time_days || 0).toFixed(1)} days`,
      icon: <Schedule color="warning" />,
      color: 'warning'
    },
    {
      label: 'On-Time Delivery Rate',
      value: `${((summary.on_time_delivery_rate || 0) * 100).toFixed(1)}%`,
      icon: <LocalShipping color={summary.on_time_delivery_rate > 0.8 ? "success" : "error"} />,
      color: summary.on_time_delivery_rate > 0.8 ? "success" : "error"
    },
    {
      label: 'Completed Orders',
      value: `${summary.completed_orders || 0}/${summary.total_orders || 0}`,
      icon: <CheckCircle color="secondary" />,
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

// Procurement Tables
const ProcurementTables = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No procurement table data available.
      </Alert>
    );
  }

  const { category_spend, supplier_performance, lead_time_analysis } = reportData;

  return (
    <Grid container spacing={3}>
      {/* Category Spend Analysis */}
      {category_spend && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Category Spend Analysis"
            data={category_spend}
            columns={[
              { key: 'category', label: 'Category' },
              { key: 'order_count', label: 'Orders' },
              { key: 'item_count', label: 'Items' },
              { 
                key: 'total_spend', 
                label: 'Total Spend', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'average_order_value', 
                label: 'Avg Order Value', 
                render: (value, row) => `₵${(row.total_spend / row.order_count).toLocaleString()}`
              }
            ]}
          />
        </Grid>
      )}

      {/* Supplier Performance */}
      {supplier_performance && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Supplier Performance"
            data={supplier_performance}
            columns={[
              { key: 'supplier_name', label: 'Supplier' },
              { key: 'total_orders', label: 'Total Orders' },
              { key: 'completed_orders', label: 'Completed' },
              { 
                key: 'total_spend', 
                label: 'Total Spend', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'on_time_delivery_rate', 
                label: 'On-Time Rate', 
                render: (value) => `${(value * 100).toFixed(1)}%`
              },
              { 
                key: 'quality_rating', 
                label: 'Quality Rating', 
                render: (value) => value ? `${value}%` : 'N/A'
              },
              { 
                key: 'average_lead_time_days', 
                label: 'Avg Lead Time', 
                render: (value) => value ? `${value} days` : 'N/A'
              }
            ]}
          />
        </Grid>
      )}

      {/* Lead Time Analysis */}
      {lead_time_analysis && (
        <Grid size={{ xs: 12 }}>
          <DataTable
            title="Lead Time Analysis"
            data={lead_time_analysis}
            columns={[
              { key: 'po_number', label: 'PO Number' },
              { key: 'supplier', label: 'Supplier' },
              { 
                key: 'order_date', 
                label: 'Order Date',
                render: (value) => new Date(value).toLocaleDateString()
              },
              { 
                key: 'delivery_date', 
                label: 'Delivery Date',
                render: (value) => new Date(value).toLocaleDateString()
              },
              { key: 'lead_time_days', label: 'Lead Time (Days)' },
              { 
                key: 'total_amount', 
                label: 'Order Value', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'status', 
                label: 'Status',
                render: (value) => (
                  <Chip 
                    label={value?.replace(/_/g, ' ') || 'Unknown'} 
                    size="small"
                    color={
                      value === 'completed' || value === 'received' ? 'success' :
                      value === 'cancelled' ? 'error' :
                      value === 'partially_received' ? 'warning' : 'default'
                    }
                  />
                )
              }
            ]}
          />
        </Grid>
      )}
    </Grid>
  );
};
// Procurement Analytics
const ProcurementAnalytics = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No procurement analytics data available.
      </Alert>
    );
  }

  const { category_spend, supplier_performance, lead_time_analysis } = reportData;

  // Prepare category data for charts
  const categoryChartData = category_spend?.map(cat => ({
    name: cat.category,
    total_spend: cat.total_spend,
    order_count: cat.order_count,
    item_count: cat.item_count,
    average_spend: cat.total_spend / cat.order_count
  })) || [];

  // Prepare supplier performance data
  const supplierChartData = supplier_performance?.map(supplier => ({
    name: supplier.supplier_name,
    total_spend: supplier.total_spend,
    total_orders: supplier.total_orders,
    completed_orders: supplier.completed_orders,
    quality_rating: supplier.quality_rating,
    on_time_rate: supplier.on_time_delivery_rate * 100
  })) || [];

  // Prepare lead time data
  const leadTimeData = lead_time_analysis?.map(order => ({
    name: order.po_number,
    lead_time: order.lead_time_days,
    amount: order.total_amount,
    status: order.status
  })) || [];

  return (
    <Grid container spacing={3}>
      {/* Category Spend Distribution */}
      {data.chart_types?.includes('pie') && categoryChartData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Spend by Category</Typography>
              {renderPieChart(categoryChartData, 'total_spend')}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Supplier Performance - Total Spend */}
      {data.chart_types?.includes('bar') && supplierChartData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Supplier Spending</Typography>
              {renderBarChart(
                supplierChartData.sort((a, b) => b.total_spend - a.total_spend).slice(0, 8),
                'total_spend',
                'Total Spend (₵)',
                'name',
                '#0088FE'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Order Count by Category */}
      {data.chart_types?.includes('bar') && categoryChartData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Orders by Category</Typography>
              {renderBarChart(
                categoryChartData,
                'order_count',
                'Order Count',
                'name',
                '#00C49F'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Lead Time Analysis */}
      {data.chart_types?.includes('bar') && leadTimeData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Lead Time by Purchase Order</Typography>
              {renderBarChart(
                leadTimeData.sort((a, b) => b.lead_time - a.lead_time).slice(0, 8),
                'lead_time',
                'Lead Time (Days)',
                'name',
                '#FF8042'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Quality Ratings */}
      {data.chart_types?.includes('bar') && supplierChartData.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Supplier Quality Ratings</Typography>
              {renderBarChart(
                supplierChartData.filter(s => s.quality_rating).sort((a, b) => b.quality_rating - a.quality_rating),
                'quality_rating',
                'Quality Rating (%)',
                'name',
                '#8884d8'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};
// Procurement Details
const ProcurementDetails = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No procurement details available.
      </Alert>
    );
  }

  const { procurement_summary, category_spend, supplier_performance, lead_time_analysis } = reportData;

  return (
    <Grid container spacing={3}>
      {/* Overall Procurement Summary */}
      {procurement_summary && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Procurement Performance Overview</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Orders</Typography>
                  <Typography variant="h6">{procurement_summary.total_orders}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Value</Typography>
                  <Typography variant="h6">₵{procurement_summary.total_value?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Avg Order Value</Typography>
                  <Typography variant="h6">₵{procurement_summary.average_order_value?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Avg Lead Time</Typography>
                  <Typography variant="h6">{procurement_summary.average_lead_time_days?.toFixed(1)} days</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">On-Time Rate</Typography>
                  <Typography variant="h6" color={procurement_summary.on_time_delivery_rate > 0.8 ? "success.main" : "error.main"}>
                    {(procurement_summary.on_time_delivery_rate * 100)?.toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>

              {/* Performance Indicators */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Procurement Health Indicators
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="textSecondary">Lead Time Efficiency</Typography>
                      <Typography variant="h4" color={procurement_summary.average_lead_time_days < 30 ? "success.main" : "warning.main"}>
                        {procurement_summary.average_lead_time_days < 30 ? "Good" : "Needs Improvement"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="textSecondary">Delivery Performance</Typography>
                      <Typography variant="h4" color={procurement_summary.on_time_delivery_rate > 0.8 ? "success.main" : "error.main"}>
                        {procurement_summary.on_time_delivery_rate > 0.8 ? "Excellent" : "Poor"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="textSecondary">Order Volume</Typography>
                      <Typography variant="h4" color="info.main">
                        {procurement_summary.total_orders >= 10 ? "Active" : "Moderate"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Category Performance */}
      {category_spend && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Category Performance</Typography>
              
              {/* Top Spending Categories */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Top Spending Categories</Typography>
                {category_spend
                  .sort((a, b) => (b.total_spend || 0) - (a.total_spend || 0))
                  .slice(0, 3)
                  .map((category, index) => (
                  <Box key={category.category} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight="bold">
                        {index + 1}. {category.category}
                      </Typography>
                      <Chip 
                        label={`₵${category.total_spend?.toLocaleString()}`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {category.order_count} orders • {category.item_count} items
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Category Statistics */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Category Statistics</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Total Categories" 
                      secondary={category_spend.length}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Highest Avg Order Value" 
                      secondary={`₵${Math.max(...category_spend.map(cat => cat.total_spend / cat.order_count)).toLocaleString()}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Most Orders" 
                      secondary={Math.max(...category_spend.map(cat => cat.order_count))}
                    />
                  </ListItem>
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Supplier Performance Details */}
      {supplier_performance && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Supplier Performance Details</Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Total Suppliers" 
                    secondary={supplier_performance.length}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Total Completed Orders" 
                    secondary={supplier_performance.reduce((sum, s) => sum + (s.completed_orders || 0), 0)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Average Quality Rating" 
                    secondary={`${(supplier_performance.reduce((sum, s) => sum + (s.quality_rating || 0), 0) / supplier_performance.filter(s => s.quality_rating).length).toFixed(1)}%`}
                  />
                </ListItem>
              </List>

              {/* Supplier Rankings */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Top Suppliers by Spend</Typography>
                {supplier_performance
                  .sort((a, b) => (b.total_spend || 0) - (a.total_spend || 0))
                  .slice(0, 3)
                  .map((supplier, index) => (
                  <Box key={supplier.supplier_name} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {index + 1}. {supplier.supplier_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {supplier.completed_orders || 0}/{supplier.total_orders} completed
                        </Typography>
                      </Box>
                      <Chip 
                        label={`₵${supplier.total_spend?.toLocaleString()}`}
                        size="small"
                        color={index === 0 ? "success" : "default"}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Lead Time Analysis Details */}
      {lead_time_analysis && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Lead Time Analysis</Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary">Shortest Lead Time</Typography>
                  <Typography variant="h6" color="success.main">
                    {Math.min(...lead_time_analysis.map(lt => lt.lead_time_days))} days
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary">Longest Lead Time</Typography>
                  <Typography variant="h6" color="warning.main">
                    {Math.max(...lead_time_analysis.map(lt => lt.lead_time_days))} days
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary">Average Lead Time</Typography>
                  <Typography variant="h6">
                    {(lead_time_analysis.reduce((sum, lt) => sum + lt.lead_time_days, 0) / lead_time_analysis.length).toFixed(1)} days
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography variant="body2" color="textSecondary">Orders Analyzed</Typography>
                  <Typography variant="h6">
                    {lead_time_analysis.length}
                  </Typography>
                </Grid>
              </Grid>

              {/* Status Distribution */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Order Status Distribution</Typography>
                <Grid container spacing={1}>
                  {Object.entries(
                    lead_time_analysis.reduce((acc, order) => {
                      const status = order.status || 'unknown';
                      acc[status] = (acc[status] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([status, count]) => (
                    <Grid size={{ xs: 6, md: 3 }} key={status}>
                      <Chip 
                        label={`${status.replace(/_/g, ' ')}: ${count}`}
                        size="small"
                        variant="outlined"
                        color={
                          status === 'completed' || status === 'received' ? 'success' :
                          status === 'cancelled' ? 'error' :
                          status === 'partially_received' ? 'warning' : 'default'
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};


// Maintenance Summary Cards
const MaintenanceSummaryCards = ({ summary }) => {
  if (!summary || typeof summary !== 'object') {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No maintenance summary data available.
      </Alert>
    );
  }

  const summaryMetrics = [
    {
      label: 'Total Activities',
      value: summary.total_maintenance_activities?.toLocaleString() || '0',
      icon: <Build color="primary" />,
      color: 'primary'
    },
    {
      label: 'Completion Rate',
      value: `${(summary.completion_rate || 0).toFixed(1)}%`,
      icon: <CheckCircle color={summary.completion_rate > 50 ? "success" : "warning"} />,
      color: summary.completion_rate > 50 ? "success" : "warning"
    },
    {
      label: 'Total Cost',
      value: `₵${(summary.total_cost || 0).toLocaleString()}`,
      icon: <AttachMoney color="info" />,
      color: 'info'
    },
    {
      label: 'Total Downtime',
      value: `${summary.total_downtime_hours || 0} hours`,
      icon: <Schedule color="error" />,
      color: 'error'
    },
    {
      label: 'Completed Activities',
      value: `${summary.completed_activities || 0}/${summary.total_maintenance_activities || 0}`,
      icon: <TaskAlt color="secondary" />,
      color: 'secondary'
    },
    {
      label: 'Emergency Maintenance',
      value: `${(summary.emergency_maintenance_percentage || 0).toFixed(1)}%`,
      icon: <Warning color="warning" />,
      color: 'warning'
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


// Maintenance Analytics
const MaintenanceAnalytics = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No maintenance analytics data available.
      </Alert>
    );
  }

  const { cost_analysis, downtime_analysis, cost_by_type, downtime_by_type, preventive_maintenance_effectiveness } = reportData;

  // Prepare cost by type data
  const costByTypeData = cost_by_type?.map(item => ({
    name: item.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    cost: item.total_cost,
    count: item.count,
    average_cost: item.average_cost
  })) || [];

  // Prepare downtime by type data
  const downtimeByTypeData = downtime_by_type?.map(item => ({
    name: item.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    downtime: item.total_downtime,
    count: item.count,
    average_downtime: item.average_downtime
  })) || [];

  // Prepare cost distribution data
  const costDistributionData = [
    { name: 'Labor Cost', value: cost_analysis?.labor_cost || 0 },
    { name: 'Parts Cost', value: cost_analysis?.parts_cost || 0 }
  ];

  // Prepare maintenance type effectiveness
  const maintenanceTypeData = [
    { 
      name: 'Preventive', 
      value: preventive_maintenance_effectiveness?.preventive_maintenance_count || 0,
      cost_percentage: preventive_maintenance_effectiveness?.preventive_maintenance_cost_percentage || 0
    },
    { 
      name: 'Corrective', 
      value: preventive_maintenance_effectiveness?.corrective_maintenance_count || 0,
      cost_percentage: preventive_maintenance_effectiveness?.corrective_maintenance_cost_percentage || 0
    },
    { 
      name: 'Emergency', 
      value: preventive_maintenance_effectiveness?.emergency_maintenance_count || 0 
    }
  ];

  return (
    <Grid container spacing={3}>
      {/* Cost Distribution */}
      {data.chart_types?.includes('pie') && costDistributionData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cost Distribution</Typography>
              {renderPieChart(costDistributionData, 'value')}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Cost by Maintenance Type */}
      {data.chart_types?.includes('bar') && costByTypeData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cost by Maintenance Type</Typography>
              {renderBarChart(
                costByTypeData,
                'cost',
                'Total Cost (₵)',
                'name',
                '#FF8042'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Downtime by Maintenance Type */}
      {data.chart_types?.includes('bar') && downtimeByTypeData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Downtime by Maintenance Type</Typography>
              {renderBarChart(
                downtimeByTypeData,
                'downtime',
                'Downtime Hours',
                'name',
                '#0088FE'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Maintenance Type Distribution */}
      {data.chart_types?.includes('pie') && maintenanceTypeData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Maintenance Type Distribution</Typography>
              {renderPieChart(
                maintenanceTypeData,
                'value'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Average Cost by Type */}
      {data.chart_types?.includes('bar') && costByTypeData.length > 0 && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Average Cost per Maintenance Type</Typography>
              {renderBarChart(
                costByTypeData,
                'average_cost',
                'Average Cost (₵)',
                'name',
                '#00C49F'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Equipment Downtime */}
      {data.chart_types?.includes('bar') && downtime_analysis?.most_affected_equipment && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Most Affected Equipment</Typography>
              {renderBarChart(
                downtime_analysis.most_affected_equipment
                  .sort((a, b) => b.downtime_hours - a.downtime_hours)
                  .slice(0, 8),
                'downtime_hours',
                'Downtime Hours',
                'item_name',
                '#8884d8'
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// Maintenance Tables
const MaintenanceTables = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No maintenance table data available.
      </Alert>
    );
  }

  const { equipment_reliability, downtime_analysis, cost_by_type, downtime_by_type } = reportData;

  return (
    <Grid container spacing={3}>
      {/* Equipment Reliability */}
      {equipment_reliability?.equipment_metrics && (
        <Grid size={{ xs: 12 }}>
          <DataTable
            title="Equipment Reliability Metrics"
            data={equipment_reliability.equipment_metrics}
            columns={[
              { key: 'item_name', label: 'Equipment Name' },
              { key: 'total_maintenance_count', label: 'Total Maintenance' },
              { key: 'preventive_count', label: 'Preventive' },
              { key: 'emergency_count', label: 'Emergency' },
              { 
                key: 'total_maintenance_cost', 
                label: 'Total Cost', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'total_downtime_hours', 
                label: 'Downtime Hours', 
                render: (value) => value || 0
              },
              { 
                key: 'reliability_score', 
                label: 'Reliability Score', 
                render: (value) => `${value || 0}%`
              },
              { 
                key: 'mean_time_to_repair', 
                label: 'MTTR (Hours)', 
                render: (value) => value || 'N/A'
              },
              { 
                key: 'mean_time_between_failures', 
                label: 'MTBF (Hours)', 
                render: (value) => value || 'N/A'
              }
            ]}
          />
        </Grid>
      )}

      {/* Cost by Type */}
      {cost_by_type && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Cost Analysis by Maintenance Type"
            data={cost_by_type}
            columns={[
              { 
                key: 'type', 
                label: 'Maintenance Type',
                render: (value) => value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              },
              { key: 'count', label: 'Count' },
              { 
                key: 'total_cost', 
                label: 'Total Cost', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              },
              { 
                key: 'average_cost', 
                label: 'Average Cost', 
                render: (value) => `₵${Number(value || 0).toLocaleString()}`
              }
            ]}
          />
        </Grid>
      )}

      {/* Downtime by Type */}
      {downtime_by_type && (
        <Grid size={{ xs: 12, md: 6 }}>
          <DataTable
            title="Downtime Analysis by Maintenance Type"
            data={downtime_by_type}
            columns={[
              { 
                key: 'type', 
                label: 'Maintenance Type',
                render: (value) => value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              },
              { key: 'count', label: 'Count' },
              { key: 'total_downtime', label: 'Total Downtime (Hours)' },
              { 
                key: 'average_downtime', 
                label: 'Avg Downtime', 
                render: (value) => `${Number(value || 0).toFixed(2)} hours`
              }
            ]}
          />
        </Grid>
      )}

      {/* Most Affected Equipment */}
      {downtime_analysis?.most_affected_equipment && (
        <Grid size={{ xs: 12 }}>
          <DataTable
            title="Most Affected Equipment by Downtime"
            data={downtime_analysis.most_affected_equipment}
            columns={[
              { key: 'item_name', label: 'Equipment Name' },
              { key: 'downtime_hours', label: 'Downtime Hours' },
              { key: 'maintenance_count', label: 'Maintenance Count' },
              { 
                key: 'average_downtime_per_maintenance', 
                label: 'Avg Downtime per Maintenance',
                render: (value, row) => {
                  const avg = row.downtime_hours / row.maintenance_count;
                  return `${avg.toFixed(2)} hours`;
                }
              }
            ]}
          />
        </Grid>
      )}
    </Grid>
  );
};

// Maintenance Details
const MaintenanceDetails = () => {
  if (!reportData) {
    return (
      <Alert severity="info">
        No maintenance details available.
      </Alert>
    );
  }

  const { maintenance_summary, cost_analysis, downtime_analysis, equipment_reliability, preventive_maintenance_effectiveness } = reportData;

  return (
    <Grid container spacing={3}>
      {/* Overall Maintenance Summary */}
      {maintenance_summary && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Maintenance Performance Overview</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Activities</Typography>
                  <Typography variant="h6">{maintenance_summary.total_maintenance_activities}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Completion Rate</Typography>
                  <Typography variant="h6" color={maintenance_summary.completion_rate > 50 ? "success.main" : "warning.main"}>
                    {maintenance_summary.completion_rate?.toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Cost</Typography>
                  <Typography variant="h6">₵{maintenance_summary.total_cost?.toLocaleString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Total Downtime</Typography>
                  <Typography variant="h6">{maintenance_summary.total_downtime_hours} hours</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <Typography variant="body2" color="textSecondary">Avg Response Time</Typography>
                  <Typography variant="h6">{maintenance_summary.average_response_time_hours} hours</Typography>
                </Grid>
              </Grid>

              {/* Performance Indicators */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Maintenance Health Indicators
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="textSecondary">Reliability Score</Typography>
                      <Typography variant="h4" color={equipment_reliability?.overall_reliability?.overall_reliability_score > 80 ? "success.main" : "warning.main"}>
                        {equipment_reliability?.overall_reliability?.overall_reliability_score || 0}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="textSecondary">Emergency Maintenance</Typography>
                      <Typography variant="h4" color={maintenance_summary.emergency_maintenance_percentage < 20 ? "success.main" : "error.main"}>
                        {maintenance_summary.emergency_maintenance_percentage?.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="textSecondary">Cost Avoidance</Typography>
                      <Typography variant="h4" color="success.main">
                        ₵{(preventive_maintenance_effectiveness?.cost_avoidance_estimate || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Cost Analysis Details */}
      {cost_analysis && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cost Analysis Details</Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Total Maintenance Cost" 
                    secondary={`₵${cost_analysis.total_cost?.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Labor Cost" 
                    secondary={`₵${cost_analysis.labor_cost?.toLocaleString()} (${cost_analysis.labor_cost_percentage?.toFixed(1)}%)`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Parts Cost" 
                    secondary={`₵${cost_analysis.parts_cost?.toLocaleString()} (${cost_analysis.parts_cost_percentage?.toFixed(1)}%)`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Average Cost per Maintenance" 
                    secondary={`₵${cost_analysis.average_cost_per_maintenance?.toLocaleString()}`}
                  />
                </ListItem>
              </List>

              {/* Cost Efficiency */}
              <Box sx={{ mt: 2, p: 1, bgcolor: cost_analysis.average_cost_per_maintenance < 2000 ? 'success.light' : 'warning.light', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  Cost Efficiency: {cost_analysis.average_cost_per_maintenance < 2000 ? 'Good' : 'Needs Improvement'}
                </Typography>
                <Typography variant="caption" display="block">
                  Average cost per maintenance: ₵{cost_analysis.average_cost_per_maintenance?.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Downtime Analysis Details */}
      {downtime_analysis && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Downtime Analysis Details</Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Total Downtime" 
                    secondary={`${downtime_analysis.total_downtime_hours} hours`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Average Downtime per Maintenance" 
                    secondary={`${downtime_analysis.average_downtime_per_maintenance?.toFixed(2)} hours`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Most Affected Equipment" 
                    secondary={`${downtime_analysis.most_affected_equipment?.length || 0} items`}
                  />
                </ListItem>
              </List>

              {/* Downtime by Priority */}
              {downtime_analysis.downtime_by_priority && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Downtime by Priority</Typography>
                  <Grid container spacing={1}>
                    {downtime_analysis.downtime_by_priority.map((priority, index) => (
                      <Grid size={{ xs: 6 }} key={priority.priority}>
                        <Chip 
                          label={`${priority.priority}: ${priority.total_downtime}h`}
                          size="small"
                          variant="outlined"
                          color={
                            priority.priority === 'critical' ? 'error' :
                            priority.priority === 'high' ? 'warning' : 'default'
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Preventive Maintenance Effectiveness */}
      {preventive_maintenance_effectiveness && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Preventive Maintenance Effectiveness</Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Preventive Maintenance Ratio" 
                    secondary={`${preventive_maintenance_effectiveness.preventive_maintenance_ratio?.toFixed(1)}%`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Preventive Maintenance Count" 
                    secondary={preventive_maintenance_effectiveness.preventive_maintenance_count}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Corrective Maintenance Count" 
                    secondary={preventive_maintenance_effectiveness.corrective_maintenance_count}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Emergency Maintenance Count" 
                    secondary={preventive_maintenance_effectiveness.emergency_maintenance_count}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Cost Avoidance Estimate" 
                    secondary={`₵${preventive_maintenance_effectiveness.cost_avoidance_estimate?.toLocaleString()}`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Overall Reliability */}
      {equipment_reliability?.overall_reliability && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Overall Equipment Reliability</Typography>
              
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Overall Reliability Score" 
                    secondary={`${equipment_reliability.overall_reliability.overall_reliability_score?.toFixed(1)}%`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Total Maintenance Activities" 
                    secondary={equipment_reliability.overall_reliability.total_maintenance_activities}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Emergency Maintenance %" 
                    secondary={`${equipment_reliability.overall_reliability.emergency_maintenance_percentage?.toFixed(1)}%`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Preventive Maintenance %" 
                    secondary={`${equipment_reliability.overall_reliability.preventive_maintenance_percentage?.toFixed(1)}%`}
                  />
                </ListItem>
              </List>

              {/* Reliability Assessment */}
              <Box sx={{ mt: 2, p: 1, bgcolor: equipment_reliability.overall_reliability.overall_reliability_score > 80 ? 'success.light' : 'warning.light', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  Reliability Status: {equipment_reliability.overall_reliability.overall_reliability_score > 80 ? 'Excellent' : 'Needs Attention'}
                </Typography>
                <Typography variant="caption" display="block">
                  Target: 80% reliability score
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Key Performance Indicators */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Maintenance Key Performance Indicators</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Maintenance Efficiency</Typography>
                  <Typography variant="h4" color={maintenance_summary?.completion_rate > 50 ? "success.main" : "warning.main"}>
                    {maintenance_summary?.completion_rate?.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Completion rate
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Cost per Maintenance</Typography>
                  <Typography variant="h4" color={cost_analysis?.average_cost_per_maintenance < 2000 ? "success.main" : "warning.main"}>
                    ₵{cost_analysis?.average_cost_per_maintenance?.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Average cost
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Downtime Efficiency</Typography>
                  <Typography variant="h4" color={downtime_analysis?.average_downtime_per_maintenance < 1 ? "success.main" : "warning.main"}>
                    {downtime_analysis?.average_downtime_per_maintenance?.toFixed(2)}h
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Avg downtime per maintenance
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">Preventive Ratio</Typography>
                  <Typography variant="h4" color={preventive_maintenance_effectiveness?.preventive_maintenance_ratio > 20 ? "success.main" : "error.main"}>
                    {preventive_maintenance_effectiveness?.preventive_maintenance_ratio?.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Preventive vs corrective
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

  return (
    <Box sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {reportTypes.find(t => t.value === currentReportType)?.label || 'Generated Report'}
              </Typography>
              <Typography color="textSecondary">
                Generated on {new Date(reportData.reportGeneratedAt || Date.now()).toLocaleDateString()} • {data.data_depth} level
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title="Print Report">
                <IconButton onClick={() => window.print()}>
                  <Print />
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
             {data.include_summary && (
              currentReportType === 'comprehensive' ? (
                <ComprehensiveSummaryCards 
                  summary={reportData.summary}
                  stockLevelSummary={reportData.stock_level_summary}
                  maintenanceSummary={reportData.maintenance_analysis?.summary}
                  purchaseSummary={reportData.purchase_analysis?.summary}
                />
              ) : (
                <SummaryCards 
                  summary={
                    currentReportType === 'procurement' 
                      ? reportData.procurement_summary 
                      : currentReportType === 'maintenance'
                      ? reportData.maintenance_summary
                      : summaryData
                  } 
                  reportType={currentReportType} 
                />
              )
            )}

            {/* Additional comprehensive summary sections */}
            {currentReportType === 'comprehensive' && (
              <Grid container spacing={2}>
                {/* Quick Stats */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Quick Stats</Typography>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" color="textSecondary">Critical Items</Typography>
                          <Typography variant="h6" color="error">
                            {reportData.critical_items?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" color="textSecondary">Active Suppliers</Typography>
                          <Typography variant="h6">
                            {reportData.purchase_analysis?.supplier_performance?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" color="textSecondary">Equipment Tracked</Typography>
                          <Typography variant="h6">
                            {reportData.maintenance_analysis?.equipment_reliability?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2" color="textSecondary">Recent Activities</Typography>
                          <Typography variant="h6">
                            {reportData.recent_activities?.length || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            
            {/* Additional summary sections based on report type */}
            {currentReportType === 'stock-level' && reportData.stock_level_summary && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Stock Level Overview</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary">Total Committed Quantity</Typography>
                      <Typography variant="h6">{reportData.stock_level_summary.total_committed_quantity?.toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary">Total On Order Quantity</Typography>
                      <Typography variant="h6">{reportData.stock_level_summary.total_on_order_quantity?.toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary">Low Stock Items</Typography>
                      <Typography variant="h6">{reportData.stock_level_summary.low_stock_items?.toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary">Items Need Reorder</Typography>
                      <Typography variant="h6">{reportData.stock_level_summary.items_need_reorder?.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Add Acquisition Report Summary Section */}
            {currentReportType === 'acquisition' && reportData.summary && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Acquisition Performance</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary">Total Acquisitions</Typography>
                      <Typography variant="h6">{reportData.summary.total_acquisitions?.toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary">Total Quantity</Typography>
                      <Typography variant="h6">{reportData.summary.total_quantity?.toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary">Total Value</Typography>
                      <Typography variant="h6">₵{reportData.summary.total_value?.toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="body2" color="textSecondary">Average Unit Cost</Typography>
                      <Typography variant="h6">₵{reportData.summary.average_unit_cost?.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {currentReportType === 'depreciation' && reportData.summary && (
              <DepreciationSummaryCards summary={reportData.summary} />
            )}

            {currentReportType === 'audit' && reportData.summary && (
              <AuditSummaryCards summary={reportData.summary} />
            )}

            {currentReportType === 'procurement' && reportData.procurement_summary && (
              <ProcurementSummaryCards summary={reportData.procurement_summary} />
            )}    
            
            {currentReportType === 'maintenance' && reportData.maintenance_summary && (
              <MaintenanceSummaryCards summary={reportData.maintenance_summary} />
            )}

            {currentReportType === 'comprehensive' && (
              <Grid container spacing={2}>
                {/* Transaction Type Breakdown */}
                {/* {summaryData.purchase_count !== undefined && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Transaction Type Breakdown</Typography>
                        <Grid container spacing={1}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="textSecondary">Purchases</Typography>
                            <Typography variant="h6">{summaryData.purchase_count || 0}</Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="textSecondary">Sales</Typography>
                            <Typography variant="h6">{summaryData.sale_count || 0}</Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="textSecondary">Transfers</Typography>
                            <Typography variant="h6">{summaryData.transfer_count || 0}</Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="textSecondary">Adjustments</Typography>
                            <Typography variant="h6">{summaryData.adjustment_count || 0}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )} */}

                {/* Stock Level Overview */}
                {/* {reportData.stock_level_summary && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Inventory Overview</Typography>
                        <Grid container spacing={1}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="textSecondary">Total Items</Typography>
                            <Typography variant="h6">{reportData.stock_level_summary.total_items_tracked || 0}</Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="textSecondary">Total Value</Typography>
                            <Typography variant="h6">₵{(reportData.stock_level_summary.total_inventory_value || 0).toLocaleString()}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                )} */}
              </Grid>
            )}

          </Box>
        )}

        {activeTab === 1 && data.include_charts && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Visual Analytics</Typography>
            
            {currentReportType === 'stock-level' ? (
              <StockLevelAnalytics />
            ) : currentReportType === 'acquisition' ? (
              <AcquisitionAnalytics />
            ) : currentReportType === 'depreciation' ? (
              <DepreciationAnalytics />
            ) :currentReportType === 'audit' ? (
              <AuditAnalytics />
            ) : currentReportType === 'procurement' ? (
              <ProcurementAnalytics />
            ) : currentReportType === 'maintenance' ? (
              <MaintenanceAnalytics />
            ) :(
              <ComprehensiveAnalytics />
            )}
          </Box>
        )}

        {activeTab === 2 && data.include_tables && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Detailed Data Tables</Typography>
            
            {currentReportType === 'stock-level' ? (
              <StockLevelTables />
            ) : currentReportType === 'acquisition' ? (
              <AcquisitionTables />
            ) :  currentReportType === 'depreciation' ? (
              <DepreciationTables />
            ): currentReportType === 'audit' ? (
              <AuditTables />
            ) : currentReportType === 'procurement' ? (
              <ProcurementTables />
            ): currentReportType === 'maintenance' ? (
              <MaintenanceTables />
            ) : (
              <ComprehensiveTables />
            )}

          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Report Details</Typography>
            
            {currentReportType === 'stock-level' ? (
              <StockLevelDetails />
            ) : currentReportType === 'acquisition' ? (
              <AcquisitionDetails />
            ) :currentReportType === 'depreciation' ? (
              <DepreciationDetails />
            ) : currentReportType === 'audit' ? (
              <AuditDetails />
            ): currentReportType === 'procurement' ? (
              <ProcurementDetails />
            ): currentReportType === 'maintenance' ? (
              <MaintenanceDetails />
            ) : (
              <ComprehensiveDetails />
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
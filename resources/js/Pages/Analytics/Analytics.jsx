import React, { useState, useEffect, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText as MuiListItemText,
  Chip,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  Inventory2,
  Warning,
  AttachMoney,
  Build,
  ShoppingCart,
  History,
  Download,
  Refresh,
  Dashboard,
  ShowChart,
  PieChart,
  Timeline,
  Speed,
  Assessment,
  School,
  Computer,
  Science,
  LocalLibrary,
  Engineering,
  BusinessCenter,
  AdminPanelSettings,
  MedicalServices,
  Calculate,
  AutoGraph,
  Insights,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
  Area,
  AreaChart,
  LineChart,
} from 'recharts';

const AnalyticsDashboard = ({ auth, dashboardData, flash }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('last30days');
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Time range options - matching backend
  const timeRanges = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'currentQuarter', label: 'Current Quarter' },
    { value: 'currentYear', label: 'Current Year' },
  ];

  // Color schemes with better accessibility
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#FF6B6B', '#4ECDC4'];
  const STATUS_COLORS = {
    excellent: '#00C49F',
    healthy: '#0088FE',
    warning: '#FFBB28',
    critical: '#FF8042',
    poor: '#FF6B6B'
  };

  // Enhanced data processing with calculations
  const processedData = useMemo(() => {
    if (!dashboardData) {
      return generateDefaultData();
    }

    const data = { ...dashboardData };
    

      // Helper functions for calculations
  const calculateDynamicTarget = (currentValue, baseTarget) => {
    if (currentValue >= baseTarget + 10) return Math.min(100, currentValue + 5);
    if (currentValue >= baseTarget) return baseTarget + 5;
    return baseTarget;
  };

    const getPerformanceStatus = (value, higherIsBetter = true) => {
    if (higherIsBetter) {
      if (value >= 90) return 'excellent';
      if (value >= 80) return 'healthy';
      if (value >= 70) return 'warning';
      return 'critical';
    } else {
      // For metrics where lower is better (like costs)
      if (value <= 10) return 'excellent';
      if (value <= 20) return 'healthy';
      if (value <= 30) return 'warning';
      return 'critical';
    }
  };

 const calculateGrowthRate = (totalAssets, newAcquisitions) => {
    if (!totalAssets || totalAssets === 0) return 0;
    return ((newAcquisitions / totalAssets) * 100).toFixed(1);
  };

    const calculateValueGrowth = (totalValue, depreciatedValue) => {
    if (!totalValue || totalValue === 0) return 0;
    const netValue = totalValue - depreciatedValue;
    return ((netValue / totalValue) * 100).toFixed(1);
  };

  const calculateMaintenanceTrend = (maintenanceDue) => {
    // Simple trend calculation - in real app, this would compare with previous period
    if (maintenanceDue <= 10) return -15; // Improving
    if (maintenanceDue <= 25) return 5;   // Stable
    return 25; // Worsening
  };

  const calculateStockHealth = (lowStockItems, totalAssets) => {
    if (!totalAssets || totalAssets === 0) return 100;
    const healthPercentage = 100 - (lowStockItems / totalAssets * 100);
    return Math.max(0, healthPercentage.toFixed(1));
  };

  const addTrendProjections = (spendingData) => {
    if (!spendingData || spendingData.length === 0) return spendingData;
    
    // Simple linear projection for next 3 months
    const lastMonths = spendingData.slice(-3);
    const avgSpending = lastMonths.reduce((sum, month) => sum + (month.spending || 0), 0) / lastMonths.length;
    const avgAcquisitions = lastMonths.reduce((sum, month) => sum + (month.acquisitions || 0), 0) / lastMonths.length;
    
    const projectedData = [...spendingData];
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 3; i++) {
      projectedData.push({
        month: months[i] || `Proj ${i + 1}`,
        spending: avgSpending * (1 + (i * 0.05)), // 5% growth projection
        acquisitions: Math.round(avgAcquisitions * (1 + (i * 0.03))), // 3% growth projection
        isProjected: true
      });
    }
    
    return projectedData;
  };


    // Calculate trends and performance indicators
    if (data.performance) {
      // Enhanced performance metrics with dynamic targets
      data.performance.calculatedTargets = {
        inventoryHealth: calculateDynamicTarget(data.performance.inventoryHealth, 85),
        maintenanceEfficiency: calculateDynamicTarget(data.performance.maintenanceEfficiency, 90),
        procurementSuccess: calculateDynamicTarget(data.performance.procurementSuccess, 85),
        costSavings: calculateDynamicTarget(data.performance.costSavings, 12)
      };

      // Calculate performance status
      data.performance.status = {
        inventoryHealth: getPerformanceStatus(data.performance.inventoryHealth),
        maintenanceEfficiency: getPerformanceStatus(data.performance.maintenanceEfficiency),
        procurementSuccess: getPerformanceStatus(data.performance.procurementSuccess),
        costSavings: getPerformanceStatus(data.performance.costSavings, true) // Higher is better for cost savings
      };
    }

    // Enhance overview with trends
    if (data.overview) {
      data.overview.trends = {
        assetGrowth: calculateGrowthRate(data.overview.totalAssets, data.overview.newAcquisitions),
        valueGrowth: calculateValueGrowth(data.overview.totalValue, data.overview.depreciatedValue),
        maintenanceTrend: calculateMaintenanceTrend(data.overview.maintenanceDue),
        stockHealth: calculateStockHealth(data.overview.lowStockItems, data.overview.totalAssets)
      };
    }

    // Enhance charts data
    if (data.trends) {
      // Add trend lines and projections
      if (data.trends.monthlySpending) {
        data.trends.monthlySpending = addTrendProjections(data.trends.monthlySpending);
      }
      
      // Add value formatting for charts
      if (data.trends.departmentUsage) {
        data.trends.departmentUsage = data.trends.departmentUsage.map(dept => ({
          ...dept,
          formattedValue: `₵${(dept.value || 0).toLocaleString()}`,
          efficiency: Math.min(100, Math.round((dept.usage / 100) * 100))
        }));
      }
    }

    return data;
  }, [dashboardData]);








  const generateDefaultData = () => ({
    overview: {
      totalAssets: 0,
      totalValue: 0,
      maintenanceDue: 0,
      lowStockItems: 0,
      newAcquisitions: 0,
      depreciatedValue: 0,
      trends: {
        assetGrowth: 0,
        valueGrowth: 0,
        maintenanceTrend: 0,
        stockHealth: 0
      }
    },
    performance: {
      inventoryHealth: 0,
      maintenanceEfficiency: 0,
      procurementSuccess: 0,
      costSavings: 0,
      calculatedTargets: {
        inventoryHealth: 85,
        maintenanceEfficiency: 90,
        procurementSuccess: 85,
        costSavings: 12
      },
      status: {
        inventoryHealth: 'critical',
        maintenanceEfficiency: 'critical',
        procurementSuccess: 'critical',
        costSavings: 'critical'
      }
    },
    trends: {
      monthlySpending: [],
      categoryDistribution: [],
      departmentUsage: []
    },
    alerts: {
      critical: [],
      warnings: []
    },
    recentActivity: []
  });

  // Event handlers
  const handleRefresh = async () => {
    setRefreshLoading(true);
    
    router.get(route('analytics.dashboard'), {
      time_range: timeRange,
      real_time: realTimeMode
    }, {
      preserveState: true,
      onFinish: () => {
        setRefreshLoading(false);
        setLastUpdated(new Date());
      }
    });
  };

  const handleTimeRangeChange = (event) => {
    const newTimeRange = event.target.value;
    setTimeRange(newTimeRange);
    
    router.get(route('analytics.dashboard'), {
      time_range: newTimeRange,
      real_time: realTimeMode
    }, {
      preserveState: true,
      onStart: () => setLoading(true),
      onFinish: () => setLoading(false)
    });
  };

  const handleRealTimeModeChange = (event) => {
    const newRealTimeMode = event.target.checked;
    setRealTimeMode(newRealTimeMode);
    
    router.get(route('analytics.dashboard'), {
      time_range: timeRange,
      real_time: newRealTimeMode
    }, {
      preserveState: true,
      onStart: () => setLoading(true),
      onFinish: () => setLoading(false)
    });
  };

  const handleExport = () => {
    router.post(route('analytics.export'), {
      time_range: timeRange,
      format: 'pdf'
    });
  };

  // Enhanced KPI Cards with real calculations
  const KPICards = () => {
    const kpis = [
      {
        title: 'Total Inventory Value',
        value: `₵${(processedData.overview?.totalValue || 0).toLocaleString()}`,
        icon: <AttachMoney />,
        color: 'success',
        trend: processedData.overview?.trends?.valueGrowth || 0,
        subtitle: `Net Growth: ${processedData.overview?.trends?.valueGrowth}%`,
        description: 'Current total value of all inventory assets'
      },
      {
        title: 'Active Assets',
        value: (processedData.overview?.totalAssets || 0).toLocaleString(),
        icon: <Inventory2 />,
        color: 'primary',
        trend: processedData.overview?.trends?.assetGrowth || 0,
        subtitle: `Growth Rate: ${processedData.overview?.trends?.assetGrowth}%`,
        description: 'Total number of tracked inventory items'
      },
      {
        title: 'Maintenance Due',
        value: (processedData.overview?.maintenanceDue || 0).toString(),
        icon: <Build />,
        color: 'warning',
        trend: processedData.overview?.trends?.maintenanceTrend || 0,
        subtitle: `Trend: ${processedData.overview?.trends?.maintenanceTrend > 0 ? '+' : ''}${processedData.overview?.trends?.maintenanceTrend}%`,
        description: 'Items requiring maintenance attention'
      },
      {
        title: 'Low Stock Items',
        value: (processedData.overview?.lowStockItems || 0).toString(),
        icon: <Warning />,
        color: 'error',
        trend: -((processedData.overview?.trends?.stockHealth || 0) - 100),
        subtitle: `Health: ${processedData.overview?.trends?.stockHealth}%`,
        description: 'Items below reorder level'
      },
      {
        title: 'New Acquisitions',
        value: (processedData.overview?.newAcquisitions || 0).toString(),
        icon: <TrendingUp />,
        color: 'info',
        trend: 22.4, // This would come from comparison with previous period
        subtitle: `This ${timeRange.replace('last', '').replace('current', '')}`,
        description: 'New items added in selected period'
      },
      {
        title: 'Depreciated Value',
        value: `₵${(processedData.overview?.depreciatedValue || 0).toLocaleString()}`,
        icon: <TrendingDown />,
        color: 'secondary',
        trend: -18.2, // This would come from depreciation calculations
        subtitle: 'Accumulated depreciation',
        description: 'Total value lost to depreciation'
      }
    ];

    return (
      <Grid container spacing={3}>
        {kpis.map((kpi, index) => (
          <Grid key={index} size={{ xs:12, sm:6, md:4, lg:2}}>
            <Card sx={{ 
              height: '100%', 
              transition: 'all 0.3s ease-in-out',
              '&:hover': { 
                transform: 'translateY(-8px)', 
                boxShadow: 6,
                borderLeft: `4px solid ${STATUS_COLORS[kpi.trend > 0 ? 'healthy' : kpi.trend < 0 ? 'warning' : 'excellent']}`
              } 
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Tooltip title={kpi.description}>
                    <Avatar sx={{ 
                      bgcolor: `${kpi.color}.light`, 
                      color: `${kpi.color}.main`,
                      width: 48,
                      height: 48
                    }}>
                      {kpi.icon}
                    </Avatar>
                  </Tooltip>
                  <Chip 
                    label={`${kpi.trend > 0 ? '+' : ''}${kpi.trend}%`}
                    size="small"
                    color={kpi.trend > 0 ? 'success' : kpi.trend < 0 ? 'error' : 'default'}
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: '1.5rem' }}>
                  {kpi.value}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom fontWeight="medium">
                  {kpi.title}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ opacity: 0.8 }}>
                  {kpi.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Enhanced Performance Metrics with dynamic targets
  const PerformanceMetrics = () => {
    const metrics = [
      {
        label: 'Inventory Health',
        value: processedData.performance?.inventoryHealth || 0,
        target: processedData.performance?.calculatedTargets?.inventoryHealth || 85,
        status: processedData.performance?.status?.inventoryHealth || 'critical',
        icon: <Speed />,
        description: 'Overall health and adequacy of inventory levels'
      },
      {
        label: 'Maintenance Efficiency',
        value: processedData.performance?.maintenanceEfficiency || 0,
        target: processedData.performance?.calculatedTargets?.maintenanceEfficiency || 90,
        status: processedData.performance?.status?.maintenanceEfficiency || 'critical',
        icon: <Build />,
        description: 'Effectiveness of maintenance operations and scheduling'
      },
      {
        label: 'Procurement Success',
        value: processedData.performance?.procurementSuccess || 0,
        target: processedData.performance?.calculatedTargets?.procurementSuccess || 85,
        status: processedData.performance?.status?.procurementSuccess || 'critical',
        icon: <ShoppingCart />,
        description: 'Success rate of procurement and purchasing processes'
      },
      {
        label: 'Cost Savings',
        value: processedData.performance?.costSavings || 0,
        target: processedData.performance?.calculatedTargets?.costSavings || 12,
        status: processedData.performance?.status?.costSavings || 'critical',
        icon: <AttachMoney />,
        description: 'Percentage of cost savings achieved through optimization'
      }
    ];

    const getProgressColor = (status) => {
      return STATUS_COLORS[status] || STATUS_COLORS.critical;
    };

    return (
      <Card sx={{ mt: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
              <AutoGraph />
              Performance Metrics
            </Typography>
            <Chip 
              label="Dynamic Targets" 
              color="primary" 
              variant="outlined"
              size="small"
            />
          </Box>
          <Grid container spacing={4}>
            {metrics.map((metric, index) => (
              <Grid key={index} size={{ xs:12, sm:6, md:3}}>
                <Tooltip title={metric.description}>
                  <Box textAlign="center" sx={{ p: 2, borderRadius: 2, bgcolor: 'white' }}>
                    <Box position="relative" display="inline-flex" mb={2}>
                      <CircularProgress 
                        variant="determinate" 
                        value={metric.value} 
                        size={100}
                        thickness={6}
                        sx={{ 
                          color: getProgressColor(metric.status),
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                        }}
                      />
                      <Box
                        top={0}
                        left={0}
                        bottom={0}
                        right={0}
                        position="absolute"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexDirection="column"
                      >
                        <Typography variant="h6" component="div" fontWeight="bold">
                          {metric.value}%
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Target: {metric.target}%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" fontWeight="medium" gutterBottom>
                      {metric.label}
                    </Typography>
                    <Chip 
                      label={metric.status.toUpperCase()}
                      size="small"
                      sx={{ 
                        bgcolor: getProgressColor(metric.status),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                    <LinearProgress 
                      variant="determinate" 
                      value={(metric.value / metric.target) * 100} 
                      sx={{ 
                        mt: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getProgressColor(metric.status)
                        }
                      }}
                    />
                  </Box>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Enhanced Charts Section
  const ChartsSection = () => {
    if (!processedData.trends || Object.keys(processedData.trends).length === 0) {
      return (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analytics Charts
            </Typography>
            <Alert severity="info">
              No chart data available for the selected time range.
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Enhanced Spending Trends with Projections */}
        {processedData.trends.monthlySpending && processedData.trends.monthlySpending.length > 0 && (
          <Grid size={{ xs:12, md:8 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                    <ShowChart />
                    Spending & Acquisition Trends
                  </Typography>
                  <Chip label="With Projections" color="info" variant="outlined" size="small" />
                </Box>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={processedData.trends.monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: '#666' }}
                      tickFormatter={(value) => `₵${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: '#666' }}
                    />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        name === 'spending' ? `₵${Number(value).toLocaleString()}` : value,
                        name === 'spending' ? 'Spending' : 'Acquisitions'
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload[0]?.payload?.isProjected) {
                          return `${label} (Projected)`;
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="spending" 
                      fill="#8884d8" 
                      name="Spending"
                      radius={[4, 4, 0, 0]}
                      fillOpacity={0.8}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="acquisitions" 
                      stroke="#ff7300" 
                      name="Acquisitions"
                      strokeWidth={3}
                      dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                    />
                    {processedData.trends.monthlySpending.some(item => item.isProjected) && (
                      <Line 
                        yAxisId="right"
                        type="monotone"
                        dataKey="acquisitions"
                        stroke="#ff7300"
                        strokeDasharray="5 5"
                        strokeOpacity={0.5}
                        dot={false}
                        name="Projected Trend"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Enhanced Category Distribution */}
        {processedData.trends.categoryDistribution && processedData.trends.categoryDistribution.length > 0 && (
          <Grid size={{ xs: 12, md:4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <PieChart />
                  Inventory by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={processedData.trends.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {processedData.trends.categoryDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name, props) => [
                        `${value}% (${props.payload.count} items)`,
                        props.payload.name
                      ]} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <Box mt={2}>
                  <Grid container spacing={1}>
                    {processedData.trends.categoryDistribution.map((category, index) => (
                      <Grid size={{ xs:6}} key={index}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            width={12}
                            height={12}
                            bgcolor={COLORS[index % COLORS.length]}
                            borderRadius={1}
                          />
                          <Typography variant="caption">
                            {category.name}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Enhanced Department Usage */}
        {processedData.trends.departmentUsage && processedData.trends.departmentUsage.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <BarChartIcon />
                  Department Usage & Efficiency
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart data={processedData.trends.departmentUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="department" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: '#666' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fill: '#666' }}
                      tickFormatter={(value) => `₵${(value / 1000).toFixed(0)}K`}
                    />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        name === 'value' ? `₵${Number(value).toLocaleString()}` : `${value}%`,
                        name === 'value' ? 'Total Value' : 'Usage %'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="usage" 
                      fill="#00C49F" 
                      name="Usage %"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="value" 
                      fill="#0088FE" 
                      name="Total Value"
                      radius={[4, 4, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  // Enhanced Alerts Section
  const AlertsSection = () => {
    if (!processedData.alerts || (!processedData.alerts.critical?.length && !processedData.alerts.warnings?.length)) {
      return (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Alerts
            </Typography>
            <Alert severity="success" icon={<CheckCircle />}>
              No critical alerts at this time. All systems are operating normally.
            </Alert>
          </CardContent>
        </Card>
      );
    }

    const getAlertIcon = (type) => {
      switch (type) {
        case 'maintenance': return <Build />;
        case 'stock': return <Inventory2 />;
        case 'expiry': return <Warning />;
        case 'procurement': return <ShoppingCart />;
        default: return <Warning />;
      }
    };

    const getAlertColor = (priority) => {
      switch (priority) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'default';
      }
    };

    return (
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {processedData.alerts.critical && processedData.alerts.critical.length > 0 && (
          <Grid size={{ xs:12, md:6 }}>
            <Card sx={{ borderLeft: '4px solid #FF4040' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <Warning color="error" />
                  Critical Alerts
                  <Chip label={processedData.alerts.critical.length} color="error" size="small" />
                </Typography>
                <List dense>
                  {processedData.alerts.critical.map((alert, index) => (
                    <ListItem 
                      key={alert.id} 
                      divider={index < processedData.alerts.critical.length - 1}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon>
                        {getAlertIcon(alert.type)}
                      </ListItemIcon>
                      <MuiListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium">
                            {alert.title}
                          </Typography>
                        }
                        secondary={`Department: ${alert.department} • ${alert.scheduled_date || ''}`}
                      />
                      <Chip 
                        label={alert.priority} 
                        size="small" 
                        color={getAlertColor(alert.priority)}
                        variant="filled"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {processedData.alerts.warnings && processedData.alerts.warnings.length > 0 && (
          <Grid size={{ xs:12, md:6 }}>
            <Card sx={{ borderLeft: '4px solid #FFA500' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                  <Warning color="warning" />
                  Warnings
                  <Chip label={processedData.alerts.warnings.length} color="warning" size="small" />
                </Typography>
                <List dense>
                  {processedData.alerts.warnings.map((alert, index) => (
                    <ListItem 
                      key={alert.id} 
                      divider={index < processedData.alerts.warnings.length - 1}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon>
                        {getAlertIcon(alert.type)}
                      </ListItemIcon>
                      <MuiListItemText
                        primary={
                          <Typography variant="body1" fontWeight="medium">
                            {alert.title}
                          </Typography>
                        }
                        secondary={`Department: ${alert.department} • Qty: ${alert.current_quantity || 'N/A'}`}
                      />
                      <Chip 
                        label={alert.priority} 
                        size="small" 
                        color={getAlertColor(alert.priority)}
                        variant="filled"
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

  // Enhanced Recent Activity
  const RecentActivity = () => {
    const getActionIcon = (action) => {
      switch (action.toLowerCase()) {
        case 'acquisition': return <TrendingUp color="success" />;
        case 'maintenance': return <Build color="warning" />;
        case 'procurement': return <ShoppingCart color="info" />;
        case 'depreciation': return <TrendingDown color="error" />;
        default: return <Inventory2 color="action" />;
      }
    };

    const getActionColor = (action) => {
      switch (action.toLowerCase()) {
        case 'acquisition': return 'success';
        case 'maintenance': return 'warning';
        case 'procurement': return 'info';
        case 'depreciation': return 'error';
        default: return 'default';
      }
    };

    if (!processedData.recentActivity || processedData.recentActivity.length === 0) {
      return (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Alert severity="info">
              No recent activity recorded for the selected time period.
            </Alert>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <Timeline />
              Recent Activity
            </Typography>
            <Chip 
              label={`${processedData.recentActivity.length} activities`} 
              size="small" 
              variant="outlined" 
            />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processedData.recentActivity.map((activity) => (
                  <TableRow key={activity.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getActionIcon(activity.action)}
                        <Chip 
                          label={activity.action}
                          size="small"
                          color={getActionColor(activity.action)}
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.item}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {activity.department || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {activity.user}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {activity.time}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2"
                        fontWeight="bold"
                        color={
                          activity.value > 0 ? 'success.main' : 
                          activity.value < 0 ? 'error.main' : 'textSecondary'
                        }
                      >
                        {activity.value > 0 ? `+₵${Number(activity.value).toLocaleString()}` : 
                         activity.value < 0 ? `-₵${Math.abs(Number(activity.value)).toLocaleString()}` : '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  // Enhanced Department Overview
  const DepartmentOverview = () => {
    const departments = processedData.trends?.departmentUsage?.map(dept => ({
      name: dept.department,
      assets: dept.item_count || Math.round((dept.value || 0) / 5000),
      value: dept.value || 0,
      efficiency: dept.efficiency || Math.min(100, Math.round((dept.usage / 100) * 100)),
      usage: dept.usage || 0
    })) || [];

    if (departments.length === 0) {
      return (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Overview
            </Typography>
            <Alert severity="info">
              No department data available.
            </Alert>
          </CardContent>
        </Card>
      );
    }

    const getDepartmentIcon = (departmentName) => {
      const name = departmentName.toLowerCase();
      if (name.includes('computer') || name.includes('it')) return <Computer />;
      if (name.includes('engineer')) return <Engineering />;
      if (name.includes('science') || name.includes('research')) return <Science />;
      if (name.includes('business') || name.includes('commerce')) return <BusinessCenter />;
      if (name.includes('medical') || name.includes('health')) return <MedicalServices />;
      if (name.includes('art') || name.includes('library') || name.includes('humanities')) return <LocalLibrary />;
      if (name.includes('admin')) return <AdminPanelSettings />;
      return <School />;
    };

    const getEfficiencyColor = (efficiency) => {
      if (efficiency >= 90) return 'success';
      if (efficiency >= 80) return 'warning';
      return 'error';
    };

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <Insights />
            Department Performance Overview
          </Typography>
          <Grid container spacing={3}>
            {departments.map((dept, index) => (
              <Grid key={index} size={{ xs:12, sm:6, md:4, lg:3}}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                        {getDepartmentIcon(dept.name)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h6" noWrap>
                          {dept.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {dept.assets} assets
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${dept.efficiency}%`}
                        color={getEfficiencyColor(dept.efficiency)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Total Value
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ₵{(dept.value || 0).toLocaleString()}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Usage Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={dept.usage} 
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: dept.usage >= 80 ? '#00C49F' : dept.usage >= 60 ? '#FFBB28' : '#FF8042'
                          }
                        }}
                      />
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                        {dept.usage}% utilization
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="textSecondary">
                        Efficiency
                      </Typography>
                      <Box 
                        sx={{ 
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: dept.efficiency >= 90 ? '#00C49F' : dept.efficiency >= 80 ? '#FFBB28' : '#FF8042'
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Analytics Dashboard"
      header={
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 Inventory Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Real-time insights and performance metrics for university inventory management
            {lastUpdated && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
          </Typography>
        </Box>
      }
    >
      <Box p={3}>
        {/* Flash Messages */}
        {flash?.success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {flash.success}
          </Alert>
        )}

        {flash?.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {flash.error}
          </Alert>
        )}

        {/* Enhanced Header Controls */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControl size="small" sx={{ minWidth: 140, bgcolor: 'white', borderRadius: 1 }}>
                  <InputLabel>Time Range</InputLabel>
                  <Select
                    value={timeRange}
                    label="Time Range"
                    onChange={handleTimeRangeChange}
                    disabled={loading}
                  >
                    {timeRanges.map((range) => (
                      <MenuItem key={range.value} value={range.value}>
                        {range.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={realTimeMode}
                      onChange={handleRealTimeModeChange}
                      color="primary"
                      disabled={loading}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={1} color="white">
                      <AutoGraph />
                      Real-time Mode
                    </Box>
                  }
                />
                
                {loading && (
                  <Box display="flex" alignItems="center" gap={1} color="white">
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                    <Typography variant="body2">Loading...</Typography>
                  </Box>
                )}
              </Box>
              
              <Box display="flex" gap={1}>
                <Tooltip title="Export dashboard as PDF">
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleExport}
                    disabled={loading}
                    sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f5f5f5' } }}
                  >
                    Export
                  </Button>
                </Tooltip>
                
                <Tooltip title="Refresh dashboard data">
                  <Button
                    variant="contained"
                    startIcon={refreshLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Refresh />}
                    onClick={handleRefresh}
                    disabled={refreshLoading || loading}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    {refreshLoading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" my={8} flexDirection="column" gap={2}>
            <CircularProgress size={60} />
            <Typography variant="h6" color="textSecondary">
              Loading dashboard data...
            </Typography>
          </Box>
        )}

        {/* Main Content */}
        {!loading && (
          <>
            {/* Enhanced Tabs Navigation */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ py: 1 }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      minHeight: 60,
                      fontWeight: 600,
                      '&.Mui-selected': {
                        color: 'primary.main',
                      }
                    }
                  }}
                >
                  <Tab 
                    label="Overview" 
                    icon={<Dashboard />} 
                    iconPosition="start" 
                  />
                  <Tab 
                    label="Performance" 
                    icon={<Analytics />} 
                    iconPosition="start" 
                  />
                  <Tab 
                    label="Trends & Charts" 
                    icon={<ShowChart />} 
                    iconPosition="start" 
                  />
                  <Tab 
                    label="Alerts & Notifications" 
                    icon={<Warning />} 
                    iconPosition="start" 
                  />
                  <Tab 
                    label="Department Analysis" 
                    icon={<School />} 
                    iconPosition="start" 
                  />
                </Tabs>
              </CardContent>
            </Card>

            {/* Enhanced Tab Content */}
            {activeTab === 0 && (
              <Box>
                <KPICards />
                <PerformanceMetrics />
                <ChartsSection />
                <RecentActivity />
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <PerformanceMetrics />
                <DepartmentOverview />
                <ChartsSection />
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <ChartsSection />
                <RecentActivity />
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <AlertsSection />
                <PerformanceMetrics />
              </Box>
            )}

            {activeTab === 4 && (
              <Box>
                <DepartmentOverview />
                <ChartsSection />
              </Box>
            )}
          </>
        )}
      </Box>
    </AuthenticatedLayout>
  );
};

export default AnalyticsDashboard;
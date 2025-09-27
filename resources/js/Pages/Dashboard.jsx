import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  alpha,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  TrendingUp,
  People,
  LocalShipping,
  Category,
  Refresh,
  MoreVert
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import {
  BarChart,
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
  AreaChart,
  Area,
} from 'recharts';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Custom components for better reusability
const StatusCard = ({ text, color, icon, count, loading = false }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.3s',
        animation: `${fadeIn} 0.6s ease-in`,
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box
        sx={{
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
        }}
      />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: `${color}.main`,
              mr: 2,
              animation: `${pulse} 2s infinite`,
            }}
          >
            {icon}
          </Box>
          <Box>
            {loading ? (
              <Skeleton variant="rectangular" width={60} height={32} />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {count}
              </Typography>
            )}
            {loading ? (
              <Skeleton variant="text" width={80} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {text}
              </Typography>
            )}
          </Box>
        </Box>
        {loading ? (
          <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
        ) : (
          <LinearProgress
            variant="determinate"
            value={Math.min(count, 100)}
            color={color}
            sx={{
              height: 8,
              borderRadius: 4,
              background: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

const MetricCard = ({ title, value, icon, color, change, loading = false }) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        animation: `${slideIn} 0.5s ease-in`,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)}, ${alpha(color, 0.2)})`,
        border: `1px solid ${alpha(color, 0.2)}`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 20px -5px ${alpha(color, 0.3)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            color: color,
          }}
        >
          {icon}
        </Box>
        {loading ? (
          <>
            <Skeleton variant="rectangular" width={100} height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={120} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width={60} height={24} />
          </>
        ) : (
          <>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Chip
              label={change}
              size="small"
              sx={{
                bgcolor: change.startsWith('+') ? 'success.light' : 'error.light',
                color: change.startsWith('+') ? 'success.dark' : 'error.dark',
                fontWeight: 'bold',
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setLastUpdated(new Date());
    setTimeout(() => setLoading(false), 1000);
  };

  // Status Items
  const statusItems = [
    { text: 'In Stock', color: 'success', icon: <CheckCircleIcon />, count: 245 },
    { text: 'Low Stock', color: 'warning', icon: <WarningIcon />, count: 32 },
    { text: 'Out of Stock', color: 'error', icon: <InventoryIcon />, count: 18 },
  ];

  // Metric Cards
  const metricCards = [
    { title: 'Total Items', value: '1,245', icon: <InventoryIcon />, color: '#8884d8', change: '+12%' },
    { title: 'Total Categories', value: '12', icon: <Category />, color: '#82ca9d', change: '+5%' },
    { title: 'Active Users', value: '48', icon: <People />, color: '#ff8042', change: '+8%' },
    { title: 'Pending Orders', value: '16', icon: <LocalShipping />, color: '#ffc658', change: '-3%' },
  ];

  // Chart Data
  const categoryData = [
    { name: 'Electronics', value: 35, color: '#8884d8' },
    { name: 'Clothing', value: 20, color: '#82ca9d' },
    { name: 'Furniture', value: 15, color: '#ffc658' },
    { name: 'Office Supplies', value: 10, color: '#ff8042' },
    { name: 'Books', value: 20, color: '#0088FE' },
  ];

  const monthlyData = [
    { name: 'Jan', items: 45, orders: 24 },
    { name: 'Feb', items: 52, orders: 19 },
    { name: 'Mar', items: 49, orders: 27 },
    { name: 'Apr', items: 63, orders: 38 },
    { name: 'May', items: 79, orders: 42 },
    { name: 'Jun', items: 86, orders: 51 },
  ];

  const stockLevelData = [
    { name: 'Week 1', inStock: 200, lowStock: 30, outOfStock: 5 },
    { name: 'Week 2', inStock: 220, lowStock: 25, outOfStock: 8 },
    { name: 'Week 3', inStock: 210, lowStock: 35, outOfStock: 10 },
    { name: 'Week 4', inStock: 240, lowStock: 28, outOfStock: 6 },
    { name: 'Week 5', inStock: 260, lowStock: 32, outOfStock: 12 },
  ];

  const categories = [
    'Electronics',
    'Clothing',
    'Furniture',
    'Food & Beverages',
    'Office Supplies',
    'Sports Equipment',
    'Books',
    'Health & Beauty',
  ];

  const activities = [
    { user: 'John Doe', action: 'added new product', item: 'Wireless Headphones', time: '2 min ago' },
    { user: 'Jane Smith', action: 'updated inventory', item: 'Office Chairs', time: '10 min ago' },
    { user: 'Mike Johnson', action: 'processed order', item: '#ORD-28471', time: '30 min ago' },
    { user: 'Sarah Wilson', action: 'added new supplier', item: 'Tech Solutions Inc.', time: '1 hour ago' },
  ];

  const inventoryItems = [
    { id: 1, name: 'Wireless Headphones', category: 'Electronics', stock: 45, price: 89.99, status: 'In Stock' },
    { id: 2, name: 'Office Chair', category: 'Furniture', stock: 12, price: 199.99, status: 'Low Stock' },
    { id: 3, name: 'Sports Water Bottle', category: 'Sports Equipment', stock: 0, price: 24.99, status: 'Out of Stock' },
    { id: 4, name: 'Programming Book', category: 'Books', stock: 67, price: 39.99, status: 'In Stock' },
  ];

  // Format last updated time
  const formatLastUpdated = (date) => {
    return `Last updated: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <AuthenticatedLayout>
      {/* Header with refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, animation: `${fadeIn} 0.5s ease-in` }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
            University Inventory Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, Michael! Here's what's happening with your inventory today.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatLastUpdated(lastUpdated)}
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton 
            onClick={handleRefresh} 
            color="primary"
            sx={{ 
              animation: `${loading ? pulse : 'none'} 1s infinite`,
              bgcolor: 'primary.light',
              '&:hover': { bgcolor: 'primary.main', color: 'white' }
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricCards.map((card, index) => (
          <Grid size={{xs:12, sm:6, md:3 }}  key={index}>
            <MetricCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              change={card.change}
              loading={loading}
            />
          </Grid>
        ))}
      </Grid>

      {/* Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statusItems.map((item, index) => (
          <Grid size={{xs:12, md:4 }} key={index}>
            <StatusCard
              text={item.text}
              color={item.color}
              icon={item.icon}
              count={item.count}
              loading={loading}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Stock Level Chart */}
        <Grid size={{xs:12, sm:6, lg:6 }}>
          <Card sx={{ borderRadius: 2, animation: `${fadeIn} 0.7s ease-in`, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Stock Levels Over Time
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <Box sx={{ height: 300 }}>
                {loading ? (
                  <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 1 }} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockLevelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorInStock" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLowStock" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOutOfStock" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff8042" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ff8042" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="inStock" stroke="#82ca9d" fillOpacity={1} fill="url(#colorInStock)" />
                      <Area type="monotone" dataKey="lowStock" stroke="#ffc658" fillOpacity={1} fill="url(#colorLowStock)" />
                      <Area type="monotone" dataKey="outOfStock" stroke="#ff8042" fillOpacity={1} fill="url(#colorOutOfStock)" />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Inventory & Orders Chart */}
        <Grid size={{xs:12, sm:6 , lg:6}}>
          <Card sx={{ borderRadius: 2, animation: `${fadeIn} 0.8s ease-in`, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Monthly Inventory & Orders
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              <Box sx={{ height: 300 }}>
                {loading ? (
                  <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 1 }} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="items" fill="#8884d8" name="Inventory Items" />
                      <Bar dataKey="orders" fill="#82ca9d" name="Orders Processed" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Inventory */}
      <Card sx={{ borderRadius: 2, animation: `${fadeIn} 0.9s ease-in`, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Recent Inventory
            </Typography>
            <Chip
              label="Updated 10 min ago"
              size="small"
              icon={<TrendingUp />}
              sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}
            />
          </Box>

          {loading ? (
            <>
              {[...Array(4)].map((_, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ width: '100%' }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </Box>
              ))}
            </>
          ) : (
            <Box sx={{ overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{item.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.category}
                          size="small"
                          variant="outlined"
                          sx={{
                            bgcolor: 'grey.50',
                            borderColor: 'grey.300',
                          }}
                        />
                      </TableCell>
                      <TableCell>{item.stock} units</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          sx={{
                            bgcolor:
                              item.status === 'In Stock'
                                ? 'success.light'
                                : item.status === 'Low Stock'
                                ? 'warning.light'
                                : 'error.light',
                            color:
                              item.status === 'In Stock'
                                ? 'success.dark'
                                : item.status === 'Low Stock'
                                ? 'warning.dark'
                                : 'error.dark',
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Categories Distribution & Recent Activity */}
      <Grid container spacing={3}>
        {/* Categories Card */}
        <Grid  size={{xs:12, sm:6, lg:6 }}>
          <Card sx={{ borderRadius: 2, animation: `${fadeIn} 1s ease-in`, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Category sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Categories Distribution
                  </Typography>
                </Box>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>

              {loading ? (
                <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 1, mb: 2 }} />
              ) : (
                <Box sx={{ height: 300, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories.map((category, index) => (
                  <Chip
                    key={index}
                    label={category}
                    variant="outlined"
                    sx={{
                      mb: 1,
                      bgcolor: 'grey.50',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                      },
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity Card */}
        <Grid size={{xs:12, sm:6, lg:6 }}>
          <Card sx={{ borderRadius: 2, animation: `${fadeIn} 1.1s ease-in`, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Recent Activity
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>

              <List>
                {loading ? (
                  [...Array(4)].map((_, index) => (
                    <ListItem key={index} disableGutters sx={{ mb: 1, p: 1.5 }}>
                      <ListItemAvatar>
                        <Skeleton variant="circular" width={40} height={40} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Skeleton variant="text" width="80%" />}
                        secondary={<Skeleton variant="text" width="40%" />}
                      />
                    </ListItem>
                  ))
                ) : (
                  activities.map((activity, index) => (
                    <ListItem
                      key={index}
                      disableGutters
                      sx={{
                        mb: 1,
                        p: 1.5,
                        borderRadius: 2,
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: `hsl(${index * 90}, 70%, 50%)`,
                            animation: `${pulse} 2s infinite ${index * 0.2}s`,
                          }}
                        >
                          {activity.user.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            <strong>{activity.user}</strong> {activity.action} <strong>{activity.item}</strong>
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
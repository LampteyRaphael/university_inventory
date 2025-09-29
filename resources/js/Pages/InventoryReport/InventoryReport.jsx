import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
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
} from '@mui/icons-material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ModernReportGenerator = ({ auth, categories: initialCategories, locations: initialLocations }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [customDateRange, setCustomDateRange] = useState({
    start: null,
    end: null
  });

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
    return {
      type: type?.label || 'Unknown Report',
      categories: data.categories.length > 0 ? data.categories.join(', ') : 'All Categories',
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

  const preview = getReportPreview();

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
          {recentlySuccessful && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Report generated successfully! Download will start shortly.
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
            <Grid item xs={12} md={8}>
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
                                <Grid item xs={12} sm={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Categories</InputLabel>
                                    <Select
                                      multiple
                                      value={data.categories}
                                      onChange={(e) => setData('categories', e.target.value)}
                                      input={<OutlinedInput label="Categories" />}
                                      renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                          {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                          ))}
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

                                <Grid item xs={12} sm={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Locations</InputLabel>
                                    <Select
                                      multiple
                                      value={data.locations}
                                      onChange={(e) => setData('locations', e.target.value)}
                                      input={<OutlinedInput label="Locations" />}
                                      renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                          {selected.map((value) => (
                                            <Chip key={value} label={value} size="small" />
                                          ))}
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

                                <Grid item xs={12}>
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
                                  <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={6}>
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
                                      <Grid item xs={12} sm={6}>
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
                                <Grid item xs={12}>
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
                                  <Grid item xs={12}>
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

                                <Grid item xs={12}>
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

                                <Grid item xs={12}>
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
                                <Grid item xs={12}>
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

                                <Grid item xs={12}>
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
                              onClick={index === steps?.length - 1 ? handleGenerateReport : handleNext}
                              disabled={processing}
                              startIcon={processing ? <CircularProgress size={20} /> : null}
                              sx={{ mt: 1, mr: 1 }}
                            >
                              {processing ? 'Generating...' : index === steps?.length - 1 ? 'Generate Report' : 'Continue'}
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

            <Grid item xs={12} md={4}>
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
        </Box>
      </LocalizationProvider>
    </AuthenticatedLayout>
  );
};

export default ModernReportGenerator;
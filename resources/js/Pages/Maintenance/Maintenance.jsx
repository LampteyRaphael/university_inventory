import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  Fade,
  Tooltip,
  Avatar,
  LinearProgress,
  InputAdornment,
  FormHelperText,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import moment from "moment";
import Notification from "@/Components/Notification";

// Icons
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  AddCircleOutline,
  Build as MaintenanceIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  Error as CriticalIcon,
  Assignment as WorkOrderIcon,
  CloudUpload,
  Download,
} from "@mui/icons-material";
import { useForm, usePage, router } from "@inertiajs/react";
import SummaryCard from "@/Components/SummaryCard";
import EnhancedDataGrid from "@/Components/EnhancedDataGrid";
import PageHeader from "@/Components/PageHeader";
import formatNumber from "../Service/FormatNumber";

// Custom Hooks for Maintenance Records
const useMaintenanceManager = (initialRecords, auth) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setLoading(true);
    const formatted = initialRecords?.map((record, index) => ({
      id: record?.maintenance_id ?? index + 1,
      ...record,
      university_id:record?.university_id,
      labor_cost: Number(record?.labor_cost ?? 0),
      parts_cost: Number(record?.parts_cost ?? 0),
      total_cost: Number(record?.total_cost ?? 0),
      downtime_hours: Number(record?.downtime_hours ?? 0),
      scheduled_date: record?.scheduled_date ? moment(record.scheduled_date).format("MMM DD, YYYY") : "",
      completed_date: record?.completed_date ? moment(record.completed_date).format("MMM DD, YYYY") : "",
      next_maintenance_date: record?.next_maintenance_date ? moment(record.next_maintenance_date).format("MMM DD, YYYY") : "",
      created_at: record?.created_at ? moment(record.created_at).format("MMM DD, YYYY") : "",
    }));
    setRows(formatted);
    setLoading(false);
  }, [initialRecords]);

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const query = searchText.toLowerCase();
    return rows.filter(record =>
      record.maintenance_code?.toLowerCase().includes(query) ||
      record.description?.toLowerCase().includes(query) ||
      record.technician?.toLowerCase().includes(query) ||
      record.vendor?.toLowerCase().includes(query)
    );
  }, [rows, searchText]);

  const statistics = useMemo(() => {
    const totalRecords = rows?.length?? 0 ;
    const scheduled = rows?.filter(r => r.status === 'scheduled').length;
    const inProgress = rows?.filter(r => r.status === 'in_progress').length;
    const completed = rows?.filter(r => r.status === 'completed').length;
    const critical = rows?.filter(r => r.priority === 'critical').length;
    const totalCost = rows?.reduce((sum, record) => sum + (record.total_cost || 0), 0);

    return { totalRecords, scheduled, inProgress, completed, critical, totalCost };
  }, [rows]);

  return {
    rows: filteredRows,
    loading,
    searchText,
    setSearchText,
    setRows,
    statistics
  };
};


const MaintenanceFormDialog = ({ open, onClose, record = null, items = [], departments = [],universities=[], auth = null }) => {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    university_id:record?.university_id || '',
    item_id: record?.item_id || '',
    department_id: record?.department_id || '',
    maintenance_code: record?.maintenance_code || `MNT-${Date.now()}`,
    scheduled_date: record?.scheduled_date || '',
    completed_date: record?.completed_date || '',
    maintenance_type: record?.maintenance_type || 'preventive',
    priority: record?.priority || 'medium',
    description: record?.description || '',
    work_performed: record?.work_performed || '',
    root_cause: record?.root_cause || '',
    recommendations: record?.recommendations || '',
    labor_cost: record?.labor_cost ?? 0,
    parts_cost: record?.parts_cost ?? 0,
    total_cost: record?.total_cost ?? 0,
    downtime_hours: record?.downtime_hours ?? 0,
    technician: record?.technician || '',
    vendor: record?.vendor || '',
    next_maintenance_date: record?.next_maintenance_date || '',
    status: record?.status || 'scheduled',
    assigned_to: record?.assigned_to || '',
  });

  useEffect(() => {
    if (open) {
      reset();
      setData({
        university_id: record?.university_id||'',
        item_id: record?.item_id || '',
        department_id: record?.department_id || '',
        maintenance_code: record?.maintenance_code || `MNT-${Date.now()}`,
        scheduled_date: record?.scheduled_date || moment().format('YYYY-MM-DD'),
        completed_date: record?.completed_date || '',
        maintenance_type: record?.maintenance_type || 'preventive',
        priority: record?.priority || 'medium',
        description: record?.description || '',
        work_performed: record?.work_performed || '',
        root_cause: record?.root_cause || '',
        recommendations: record?.recommendations || '',
        labor_cost: record?.labor_cost ?? 0,
        parts_cost: record?.parts_cost ?? 0,
        total_cost: record?.total_cost ?? 0,
        downtime_hours: record?.downtime_hours ?? 0,
        technician: record?.technician || '',
        vendor: record?.vendor || '',
        next_maintenance_date: record?.next_maintenance_date || '',
        status: record?.status || 'scheduled',
        assigned_to: record?.assigned_to || '',
      });
    }
  }, [open, record, reset, setData, auth]);

  const handleSubmit = () => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    if (record?.maintenance_id) {
      put(route('maintenance.update', record.maintenance_id), {
        data: formData,
        preserveScroll: true,
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    } else {
      post(route('maintenance.store'), {
        data: formData,
        preserveScroll: true,
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        backgroundColor: 'primary.main', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        py: 2
      }}>
        <Typography variant="body2" fontWeight={600}>
          {record ? 'Edit Maintenance Record' : 'Create New Maintenance Record'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {processing && <LinearProgress />}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth error={!!errors.university_id}>
              <InputLabel>University</InputLabel>
              <Select 
                value={data.university_id} 
                label="University" 
                onChange={(e) => setData('university_id', e.target.value)}
              >
                {universities?.map(university => (
                  <MenuItem key={university.university_id} value={university.university_id}>
                    {university.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.university_id && <FormHelperText>{errors.university_id}</FormHelperText>}
            </FormControl>
          </Grid>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Maintenance Code"
              value={data.maintenance_code}
              onChange={(e) => setData('maintenance_code', e.target.value)}
              error={!!errors.maintenance_code}
              helperText={errors.maintenance_code}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth error={!!errors.item_id}>
              <InputLabel>Item</InputLabel>
              <Select
                value={data.item_id}
                label="Item"
                onChange={(e) => setData('item_id', e.target.value)}
              >
                <MenuItem value="">— Select Item —</MenuItem>
                {items?.map((item) => (
                  <MenuItem key={item.item_id} value={item.item_id}>
                    {item.item_code} - {item.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.item_id && <FormHelperText>{errors.item_id}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth error={!!errors.department_id}>
              <InputLabel>Department</InputLabel>
              <Select
                value={data.department_id}
                label="Department"
                onChange={(e) => setData('department_id', e.target.value)}
              >
                <MenuItem value="">— Select Department —</MenuItem>
                {departments?.map((dept) => (
                  <MenuItem key={dept.department_id} value={dept.department_id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.department_id && <FormHelperText>{errors.department_id}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Maintenance Type</InputLabel>
              <Select
                value={data.maintenance_type}
                label="Maintenance Type"
                onChange={(e) => setData('maintenance_type', e.target.value)}
              >
                <MenuItem value="preventive">Preventive</MenuItem>
                <MenuItem value="corrective">Corrective</MenuItem>
                <MenuItem value="predictive">Predictive</MenuItem>
                <MenuItem value="condition_based">Condition Based</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={data.priority}
                label="Priority"
                onChange={(e) => setData('priority', e.target.value)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={data.status}
                label="Status"
                onChange={(e) => setData('status', e.target.value)}
              >
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="deferred">Deferred</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="Scheduled Date"
              InputLabelProps={{ shrink: true }}
              value={data.scheduled_date}
              onChange={(e) => setData('scheduled_date', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="Completed Date"
              InputLabelProps={{ shrink: true }}
              value={data.completed_date}
              onChange={(e) => setData('completed_date', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="Next Maintenance Date"
              InputLabelProps={{ shrink: true }}
              value={data.next_maintenance_date}
              onChange={(e) => setData('next_maintenance_date', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Labor Cost"
              value={data.labor_cost}
              onChange={(e) => setData('labor_cost', e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Parts Cost"
              value={data.parts_cost}
              onChange={(e) => setData('parts_cost', e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Downtime Hours"
              value={data.downtime_hours}
              onChange={(e) => setData('downtime_hours', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              fullWidth
              label="Technician"
              value={data.technician}
              onChange={(e) => setData('technician', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              fullWidth
              label="Vendor"
              value={data.vendor}
              onChange={(e) => setData('vendor', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Work Performed"
              value={data.work_performed}
              onChange={(e) => setData('work_performed', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Root Cause"
              value={data.root_cause}
              onChange={(e) => setData('root_cause', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Recommendations"
              value={data.recommendations}
              onChange={(e) => setData('recommendations', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={processing}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={record ? <SaveIcon /> : <AddIcon />}
          disabled={processing}
        >
          {processing ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            record ? "Update Record" : "Create Record"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({ open, onClose, record, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Are you sure you want to delete this maintenance record?
        </Typography>
        <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {record?.maintenance_code}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type: {record?.maintenance_type} | Priority: {record?.priority}
          </Typography>
          <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </Card>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>Cancel</Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
        >
          {loading ? 'Deleting...' : 'Delete Permanently'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};




// Main Component
export default function MaintenanceRecords({ records, auth, items=[], departments=[],universities=[] }) {
  const theme = useTheme();
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { flash } = usePage().props;

  const {
    rows,
    loading,
    searchText,
    setSearchText,
    statistics
  } = useMaintenanceManager(records, auth);

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  const handleExport = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows?.map(record => ({
      'Maintenance Code': record.maintenance_code,
      'Item': items?.find(i => i.item_id === record.item_id)?.name,
      'Type': record.maintenance_type,
      'Priority': record.priority,
      'Status': record.status,
      'Scheduled Date': record.scheduled_date,
      'Completed Date': record.completed_date,
      'Technician': record.technician,
      'Total Cost': record.total_cost,
      'Downtime Hours': record.downtime_hours,
    })));
    XLSX.utils.book_append_sheet(wb, ws, 'Maintenance Records');
    XLSX.writeFile(wb, `maintenance_records_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
    showAlert('Maintenance data exported successfully');
  }, [rows, items]);

  const handleCreate = () => {
    setSelectedRecord(null);
    setDialogOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;

    try {
      router.delete(route('maintenance.destroy', selectedRecord.maintenance_id), {
        preserveScroll: true,
        onSuccess: () => {
          showAlert('Maintenance record deleted successfully');
          setDeleteDialogOpen(false);
        },
        onError: () => {
          showAlert('Error deleting maintenance record', 'error');
        }
      });
    } catch (error) {
      showAlert('Error deleting maintenance record', 'error');
    }
  };

  useEffect(() => {
    if (flash.success) {
      showAlert(flash.success, "success");
    }
    if (flash.error) {
      showAlert(flash.error, "error");
    }
  }, [flash]);

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'primary',
      in_progress: 'warning',
      completed: 'success',
      cancelled: 'error',
      deferred: 'default'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      field: 'maintenance_code',
      headerName: 'CODE',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600" fontFamily="monospace">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'item_id',
      headerName: 'ITEM',
      width: 200,
      renderCell: (params) => {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {params.row?.item_code||""}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row?.item_name||""}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'maintenance_type',
      headerName: 'TYPE',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'PRIORITY',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getPriorityColor(params.value)}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value.replace('_', ' ')}
          size="small"
          color={getStatusColor(params.value)}
        />
      ),
    },
    {
      field: 'dates',
      headerName: 'DATES',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="caption" display="block">
            Scheduled: {params.row.scheduled_date}
          </Typography>
          {params.row.completed_date && (
            <Typography variant="caption" display="block" color="success.main">
              Completed: {params.row.completed_date}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'costs',
      headerName: 'COSTS',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="600" color="primary.main">
            ₵{Number(params.row.total_cost).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Labor: ₵{params.row.labor_cost} | Parts: ₵{params.row.parts_cost}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'downtime',
      headerName: 'DOWNTIME',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.downtime_hours}h
        </Typography>
      ),
    },
    {
      field: 'technician',
      headerName: 'TECHNICIAN',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 120,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit record">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete record">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedRecord(params.row);
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];


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
        New Record
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
          // onChange={handleImport}
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
      title="Maintenance Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Maintenance Records' }
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
          
        <PageHeader
          title="Maintenance Records"
          subtitle="Manage maintenance schedules, track repairs, and monitor equipment performance"
          icon={<AddCircleOutline sx={{ fontSize: 28 }} />}
          actionButtons={actionButtons}
          searchText={searchText}
          onSearchClear={() => setSearchText('')}
          filteredCount={rows?.length||0}
          totalCount={rows?.length || 0}
        />

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md:4  }}>
              <SummaryCard
                title="Total Records"
                value={formatNumber(statistics?.totalRecords)}
                change={"+" + formatNumber(statistics?.totalRecords)}
                animationDelay="1"
                icon={<WorkOrderIcon />}
                color={theme.palette.primary.main||""}
                subtitle="All maintenance records"
              />
            </Grid>
            <Grid size={{ xs: 1, sm: 6, md: 4 }}>
              <SummaryCard
                title="Scheduled"
                value={formatNumber(statistics?.scheduled??0)}
                change={"+" + formatNumber(statistics?.scheduled??0)}
                animationDelay="1"
                icon={<ScheduleIcon />}
                color={theme.palette.info.main||""}
                subtitle="Upcoming maintenance"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md:4}}>
              <SummaryCard
                title="In Progress"
                value={formatNumber(statistics?.inProgress??0)}
                change={"+" + formatNumber(statistics?.inProgress??0)}
                animationDelay="1"
                icon={<MaintenanceIcon />}
                color={theme.palette.warning.main||""}
                subtitle="Active repairs"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryCard
                title="Completed"
                value={formatNumber(statistics?.completed??0)}
                change={"+" + formatNumber(statistics?.completed??0)}
                animationDelay="1"
                icon={<CompletedIcon />}
                color={theme.palette.success.main}
                subtitle="Finished maintenance"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryCard
                title="Critical"
                value={formatNumber(statistics.critical??0)}
                change={"+" + formatNumber(statistics?.critical??0)}
                animationDelay="1"
                icon={<CriticalIcon />}
                color={theme.palette.error.main}
                subtitle="High priority issues"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <SummaryCard
                title="Total Cost"
                value={`₵${formatNumber(statistics?.totalCost??0)}`}
                change={"+" + formatNumber(statistics?.totalCost??0)}
                icon={<DownloadIcon />}
                color={theme.palette.secondary.main}
                subtitle="Maintenance costs"
              />
            </Grid>
          </Grid>

        <EnhancedDataGrid
          rows={rows}  // Use the filtered rows from your hook
          columns={columns}
          loading={loading}  // Use loading state from your hook
          searchText={searchText}
          onSearchChange={setSearchText}
          onSearchClear={() => setSearchText('')}
          onAdd={handleCreate}
          onExport={handleExport}
          onRefresh={() => router.reload()}  // Add refresh handler
          title="Maintenance Records"
          subtitle="History"
          icon={<MaintenanceIcon />}
          addButtonText="New Record"
          pageSizeOptions={[5, 10, 20, 50, 100]}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
            sorting: { sortModel: [{ field: 'scheduled_date', sort: 'desc' }] }  // Sort by most recent
          }}
        />

          <MaintenanceFormDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            record={selectedRecord}
            items={items}
            departments={departments}
            auth={auth}
            universities={universities}
          />

          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            record={selectedRecord}
            onConfirm={handleDelete}
          />
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
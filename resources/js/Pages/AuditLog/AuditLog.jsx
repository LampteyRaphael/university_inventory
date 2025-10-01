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
  Paper,
  CircularProgress,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import moment from "moment";
import Notification from "@/Components/Notification";

// Icons
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  AddCircleOutline,
  History as AuditIcon,
  Create as CreateIcon,
  Update as UpdateIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Computer as ComputerIcon,
  Person as PersonIcon,
  TableChart as TableIcon,
  Link as LinkIcon,
  Download,
} from "@mui/icons-material";
import { useForm, usePage, router } from "@inertiajs/react";

// Custom Hooks for Audit Logs
const useAuditManager = (initialLogs, auth) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setLoading(true);
    console.log(initialLogs)
    const formatted = initialLogs?.map((log, index) => ({
      id: log?.audit_id ?? index + 1,
      ...log,
    
      old_values: log.old_values ? log.old_values: null,
      new_values: log.new_values ? log.new_values : null,
      performed_at: log?.performed_at ? moment(log.performed_at).format("MMM DD, YYYY HH:mm") : "",
      created_at: log?.created_at ? moment(log.created_at).format("MMM DD, YYYY") : "",
    }));
    setRows(formatted);
    setLoading(false);
  }, [initialLogs]);

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const query = searchText.toLowerCase();
    return rows.filter(log =>
      log.table_name?.toLowerCase().includes(query) ||
      log.record_id?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.url?.toLowerCase().includes(query) ||
      log.ip_address?.toLowerCase().includes(query) ||
      log.user_agent?.toLowerCase().includes(query)
    );
  }, [rows, searchText]);

  const statistics = useMemo(() => {
    const totalLogs = rows?.length??0;
    const createActions = rows?.filter(r => r.action === 'CREATE').length;
    const updateActions = rows?.filter(r => r.action === 'UPDATE').length;
    const deleteActions = rows?.filter(r => r.action === 'DELETE').length;
    const todayLogs = rows?.filter(r => 
      moment(r.performed_at).isSame(moment(), 'day')
    ).length;

    return { totalLogs, createActions, updateActions, deleteActions, todayLogs };
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

// Components
const SummaryCard = ({ title, value, icon, color, subtitle }) => {
  const theme = useTheme();
  return (
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
      <CardContent sx={{ p: '0 !important' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={700} color={color}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}08`, color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};

const CustomToolbar = ({ searchText, onSearchChange, loading, filteredRows, rows }) => (
  <Box
    sx={{
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "background.paper",
      p: 2,
      borderRadius: 2,
      boxShadow: 1,
      mb: 2,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <AuditIcon color="primary" fontSize="medium" />
      <Typography variant="body2" fontWeight={700} color="text.primary">
        Audit Logs
      </Typography>
      {searchText && (
        <Chip
          label={`${filteredRows.length} of ${rows.length} logs`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      )}
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <TextField
        size="small"
        placeholder="Search by table, record, action, or IP..."
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          width: { xs: "100%", sm: 300 },
          backgroundColor: "background.default",
          borderRadius: 1,
        }}
      />
      <Tooltip title="Refresh">
        <IconButton onClick={() => router.reload()} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);

// Audit Detail Dialog
const AuditDetailDialog = ({ open, onClose, log = null }) => {
  if (!log) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ 
        backgroundColor: 'primary.main', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        py: 2
      }}>
        <Typography variant="body2" fontWeight={600}>
          Audit Log Details
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Action
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {log.action}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Table
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {log.table_name}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Record ID
            </Typography>
            <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
              {log.record_id}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Performed At
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {log.performed_at}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              IP Address
            </Typography>
            <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
              {log.ip_address}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="caption" color="text.secondary">
              User ID
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {log.user_id || 'System'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              URL
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {log.url}
            </Typography>
          </Grid>

          {log.user_agent && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                User Agent
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {log.user_agent}
              </Typography>
            </Grid>
          )}

          {/* Old Values */}
          {log.old_values && Object.keys(log.old_values).length > 0 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Old Values
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <pre style={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(log.old_values, null, 2)}
                    </pre>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}

          {/* New Values */}
          {log.new_values && Object.keys(log.new_values).length > 0 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    New Values
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <pre style={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(log.new_values, null, 2)}
                    </pre>
                  </Paper>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}

          {/* Show message if no changes */}
          {(!log.old_values || Object.keys(log.old_values).length === 0) && 
           (!log.new_values || Object.keys(log.new_values).length === 0) && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No data changes recorded for this action.
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
export default function AuditLogs({ logs, auth }) {
  const theme = useTheme();
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const { flash } = usePage().props;

  const {
    rows,
    loading,
    searchText,
    setSearchText,
    statistics
  } = useAuditManager(logs, auth);

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  const handleExport = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows.map(log => ({
      'Action': log.action,
      'Table': log.table_name,
      'Record ID': log.record_id,
      'Performed At': log.performed_at,
      'IP Address': log.ip_address,
      'User ID': log.user_id,
      'URL': log.url,
    })));
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs');
    XLSX.writeFile(wb, `audit_logs_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
    showAlert('Audit logs exported successfully');
  }, [rows]);

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
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

  const getActionIcon = (action) => {
    const icons = {
      'CREATE': <CreateIcon fontSize="small" />,
      'UPDATE': <UpdateIcon fontSize="small" />,
      'DELETE': <DeleteIcon fontSize="small" />,
    };
    return icons[action] || <ViewIcon fontSize="small" />;
  };

  const getActionColor = (action) => {
    const colors = {
      'CREATE': 'success',
      'UPDATE': 'warning',
      'DELETE': 'error',
    };
    return colors[action] || 'default';
  };

  const columns = [
    {
      field: 'action',
      headerName: 'ACTION',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={getActionIcon(params.value)}
          label={params.value}
          size="small"
          color={getActionColor(params.value)}
          variant="filled"
        />
      ),
    },
    {
      field: 'table_name',
      headerName: 'TABLE',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TableIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight="500">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'record_id',
      headerName: 'RECORD ID',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'changes',
      headerName: 'CHANGES',
      width: 200,
      renderCell: (params) => {
        const hasOldValues = params.row.old_values && Object.keys(params.row.old_values).length > 0;
        const hasNewValues = params.row.new_values && Object.keys(params.row.new_values).length > 0;
        
        return (
          <Box>
            {hasOldValues && (
              <Typography variant="caption" display="block" color="error.main">
                Old: {Object.keys(params.row.old_values).length} fields
              </Typography>
            )}
            {hasNewValues && (
              <Typography variant="caption" display="block" color="success.main">
                New: {Object.keys(params.row.new_values).length} fields
              </Typography>
            )}
            {!hasOldValues && !hasNewValues && (
              <Typography variant="caption" color="text.secondary">
                No data changes
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'user_info',
      headerName: 'USER & IP',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="caption" fontWeight="500">
              {params.row.user_id || 'System'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ComputerIcon fontSize="small" color="action" />
            <Typography variant="caption" fontFamily="monospace">
              {params.row.ip_address}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'url',
      headerName: 'URL',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LinkIcon fontSize="small" color="action" />
          <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
            {params.value.length > 40 ? params.value.substring(0, 40) + '...' : params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'performed_at',
      headerName: 'TIMESTAMP',
      width: 180,
      renderCell: (params) => (
        <Typography variant="caption">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 100,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => handleViewDetails(params.row)}
            color="primary"
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Audit Logs"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Audit Logs' }
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
          
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: "background.paper",
              boxShadow: 1,
            }}
          >
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <AuditIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      Audit Logs
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Track all system activities, data changes, and user actions
                    </Typography>
                  </Box>
                  {searchText && (
                    <Chip
                      label={`${rows.length} logs filtered`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: "auto" }}>
                <Grid
                  container
                  spacing={1.5}
                  alignItems="center"
                  justifyContent={{ xs: "flex-start", md: "flex-end" }}
                  wrap="wrap"
                >
                  <Grid>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={handleExport}
                      variant="outlined"
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Export Logs
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/* <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <SummaryCard
                title="Total Logs"
                value={statistics.totalLogs || 0}
                icon={<AuditIcon />}
                color={theme.palette.primary.main}
                subtitle="All audit records"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <SummaryCard
                title="Created"
                value={statistics?.createActions||0}
                icon={<CreateIcon />}
                color={theme.palette.success.main}
                subtitle="CREATE actions"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <SummaryCard
                title="Updated"
                value={statistics?.updateActions||0}
                icon={<UpdateIcon />}
                color={theme.palette.warning.main}
                subtitle="UPDATE actions"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <SummaryCard
                title="Deleted"
                value={statistics.deleteActions||0}
                icon={<DeleteIcon />}
                color={theme.palette.error.main}
                subtitle="DELETE actions"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <SummaryCard
                title="Today"
                value={statistics.todayLogs}
                icon={<ViewIcon />}
                color={theme.palette.info.main}
                subtitle="Today's activities"
              />
            </Grid>
          </Grid> */}

          <Paper sx={{
            height: "100%",
            width: "100%",
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
          }}>
            <CustomToolbar
              searchText={searchText}
              onSearchChange={setSearchText}
              loading={loading}
              filteredRows={rows}
              rows={rows}
            />
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: { sortModel: [{ field: 'performed_at', sort: 'desc' }] },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: theme.palette.grey[50],
                  borderBottom: `2px solid ${theme.palette.divider}`,
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: theme.palette.background.paper,
                },
              }}
            />
            
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  zIndex: 1,
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary">
                    Loading audit logs...
                  </Typography>
                </Stack>
              </Box>
            )}
          </Paper>

          <AuditDetailDialog
            open={detailDialogOpen}
            onClose={() => setDetailDialogOpen(false)}
            log={selectedLog}
          />
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
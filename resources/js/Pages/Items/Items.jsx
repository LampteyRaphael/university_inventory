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
  Slide,
  Fade,
  Tooltip,
  Avatar,
  LinearProgress,
  InputAdornment,
  FormHelperText,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
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
  Close as CloseIcon,
  Inventory as StockIcon,
  Warning as WarningIcon,
  AttachMoney as AmountIcon,
  Error as OverdueIcon,
  AddCircleOutline,
  MoreHoriz,
  QrCode as QrCodeIcon,
  FilterList as FilterIcon,
  Inventory,
  CloudUpload,
  Download,
} from "@mui/icons-material";
import { useForm, usePage, router } from "@inertiajs/react";

// Custom Hooks
const useInventoryManager = (initialItems, auth) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setLoading(true);
    const formatted = initialItems.data?.map((item, index) => ({
      id: item?.item_id ?? index + 1,
      ...item,
      unit_cost: Number(item?.unit_cost ?? 0),
      current_value: Number(item?.current_value ?? 0),
      minimum_stock_level: Number(item?.minimum_stock_level ?? 0),
      maximum_stock_level: item?.maximum_stock_level ? Number(item.maximum_stock_level) : null,
      reorder_point: Number(item?.reorder_point ?? 0),
      abc_classification: item?.abc_classification ?? "C",
      weight_kg: item?.weight_kg ? Number(item.weight_kg) : null,
      volume_cubic_m: item?.volume_cubic_m ? Number(item.volume_cubic_m) : null,
      is_hazardous: !!item?.is_hazardous,
      is_active: item?.is_active ?? true,
      created_at: item?.created_at ? moment(item.created_at).format("MMM DD, YYYY") : "",
      updated_at: item?.updated_at ? moment(item.updated_at).format("MMM DD, YYYY") : "",
    }));
    setRows(formatted);
    setLoading(false);
  }, [initialItems]);

  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const query = searchText.toLowerCase();
    return rows.filter(item =>
      item.name?.toLowerCase().includes(query) ||
      item.item_code?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      (item.barcode || "").toLowerCase().includes(query)
    );
  }, [rows, searchText]);

  const statistics = useMemo(() => {
    const totalItems = rows.length;
    const activeItems = rows.filter(r => r.is_active).length;
    const hazardousItems = rows.filter(r => r.is_hazardous).length;
    const lowStockItems = rows.filter(r => r.minimum_stock_level && r.current_value <= r.minimum_stock_level).length;
    const totalValue = rows.reduce((sum, item) => sum + (item.current_value || 0), 0);

    return { totalItems, activeItems, hazardousItems, lowStockItems, totalValue };
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
      <Inventory color="primary" fontSize="medium" />
      <Typography variant="body2" fontWeight={700} color="text.primary">
        Items History
      </Typography>
      {searchText && (
        <Chip
          label={`${filteredRows.length} of ${rows.length} transactions`}
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
        placeholder="Search items by name, code, or barcode..."
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
          width: { xs: "100%", sm: 250 },
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

const ItemFormDialog = ({ open, onClose, item = null, categories = [], universities = [], auth = null }) => {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    university_id: item?.university_id || (auth?.user?.university_id ?? ''),
    category_id: item?.category_id || '',
    item_code: item?.item_code || '',
    name: item?.name || '',
    description: item?.description || '',
    specifications: item?.specifications ? JSON.stringify(item.specifications, null, 2) : '',
    unit_of_measure: item?.unit_of_measure || '',
    unit_cost: item?.unit_cost ?? 0,
    current_value: item?.current_value ?? 0,
    minimum_stock_level: item?.minimum_stock_level ?? 0,
    maximum_stock_level: item?.maximum_stock_level ?? null,
    reorder_point: item?.reorder_point ?? 0,
    economic_order_quantity: item?.economic_order_quantity ?? null,
    abc_classification: item?.abc_classification || 'C',
    weight_kg: item?.weight_kg ?? null,
    volume_cubic_m: item?.volume_cubic_m ?? null,
    is_hazardous: !!item?.is_hazardous,
    hazard_type: item?.hazard_type || '',
    handling_instructions: item?.handling_instructions || '',
    storage_conditions: item?.storage_conditions || '',
    shelf_life_days: item?.shelf_life_days ?? null,
    expiry_date: item?.expiry_date || '',
    barcode: item?.barcode || '',
    qr_code: item?.qr_code || '',
    rfid_tag: item?.rfid_tag || '',
    image: null,
    document: null,
    is_active: item?.is_active ?? true,
  });

  useEffect(() => {
    if (open) {
      reset();
      setData({
        university_id: item?.university_id || (auth?.user?.university_id ?? ''),
        category_id: item?.category_id || '',
        item_code: item?.item_code || '',
        name: item?.name || '',
        description: item?.description || '',
        specifications: item?.specifications ? JSON.stringify(item.specifications, null, 2) : '',
        unit_of_measure: item?.unit_of_measure || '',
        unit_cost: item?.unit_cost ?? 0,
        current_value: item?.current_value ?? 0,
        minimum_stock_level: item?.minimum_stock_level ?? 0,
        maximum_stock_level: item?.maximum_stock_level ?? null,
        reorder_point: item?.reorder_point ?? 0,
        economic_order_quantity: item?.economic_order_quantity ?? null,
        abc_classification: item?.abc_classification || 'C',
        weight_kg: item?.weight_kg ?? null,
        volume_cubic_m: item?.volume_cubic_m ?? null,
        is_hazardous: !!item?.is_hazardous,
        hazard_type: item?.hazard_type || '',
        handling_instructions: item?.handling_instructions || '',
        storage_conditions: item?.storage_conditions || '',
        shelf_life_days: item?.shelf_life_days ?? null,
        expiry_date: item?.expiry_date || '',
        barcode: item?.barcode || '',
        qr_code: item?.qr_code || '',
        rfid_tag: item?.rfid_tag || '',
        image: null,
        document: null,
        is_active: item?.is_active ?? true,
      });
    }
  }, [open, item, reset, setData, auth]);

  const handleFileChange = (field, files) => {
    setData(field, files?.[0] || null);
  };

  const handleSubmit = () => {
    if (data.specifications) {
      try {
        const parsed = JSON.parse(data.specifications);
        setData('specifications', parsed);
      } catch (e) {
        setData('errors', { ...errors, specifications: 'Invalid JSON format for specifications.' });
        return;
      }
    }

    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    if (item?.item_id) {
      put(route('item.update', item.item_id), {
        data: formData,
        preserveScroll: true,
        onSuccess: () => {
          onClose();
          reset();
        },
      });
    } else {
      post(route('item.store'), {
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
          {item ? 'Edit Inventory Item' : 'Create New Inventory Item'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {processing && <LinearProgress />}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Item Code"
              value={data.item_code}
              onChange={(e) => setData('item_code', e.target.value)}
              error={!!errors.item_code}
              helperText={errors.item_code}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Item Name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

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

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth error={!!errors.category_id}>
              <InputLabel>Category</InputLabel>
              <Select
                value={data.category_id}
                label="Category"
                onChange={(e) => setData('category_id', e.target.value)}
              >
                <MenuItem value="">— Select —</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.category_id ?? cat.id} value={cat.category_id ?? cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category_id && <FormHelperText>{errors.category_id}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* ... Other form fields remain the same ... */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Unit of Measure"
              value={data.unit_of_measure}
              onChange={(e) => setData('unit_of_measure', e.target.value)}
              error={!!errors.unit_of_measure}
              helperText={errors.unit_of_measure}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Unit Cost"
              value={data.unit_cost}
              onChange={(e) => setData('unit_cost', e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Current Value"
              value={data.current_value}
              onChange={(e) => setData('current_value', e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Minimum Stock Level"
              value={data.minimum_stock_level}
              onChange={(e) => setData('minimum_stock_level', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Stock Level"
              value={data.maximum_stock_level ?? ''}
              onChange={(e) => setData('maximum_stock_level', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Reorder Point"
              value={data.reorder_point}
              onChange={(e) => setData('reorder_point', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Economic Order Quantity"
              value={data.economic_order_quantity ?? ''}
              onChange={(e) => setData('economic_order_quantity', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>ABC Classification</InputLabel>
              <Select
                value={data.abc_classification}
                label="ABC Classification"
                onChange={(e) => setData('abc_classification', e.target.value)}
              >
                <MenuItem value="A">A - High</MenuItem>
                <MenuItem value="B">B - Medium</MenuItem>
                <MenuItem value="C">C - Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Weight (kg)"
              value={data.weight_kg ?? ''}
              onChange={(e) => setData('weight_kg', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Volume (m³)"
              value={data.volume_cubic_m ?? ''}
              onChange={(e) => setData('volume_cubic_m', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={data.is_hazardous}
                  onChange={(e) => setData('is_hazardous', e.target.checked)}
                />
              }
              label="Is Hazardous"
            />
          </Grid>

          {data.is_hazardous && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Hazard Type"
                  value={data.hazard_type}
                  onChange={(e) => setData('hazard_type', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Handling Instructions"
                  value={data.handling_instructions}
                  onChange={(e) => setData('handling_instructions', e.target.value)}
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              fullWidth
              label="Storage Conditions"
              value={data.storage_conditions}
              onChange={(e) => setData('storage_conditions', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Shelf Life (days)"
              value={data.shelf_life_days ?? ''}
              onChange={(e) => setData('shelf_life_days', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Expiry Date"
              InputLabelProps={{ shrink: true }}
              value={data.expiry_date || ''}
              onChange={(e) => setData('expiry_date', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Barcode"
              value={data.barcode}
              onChange={(e) => setData('barcode', e.target.value)}
              error={!!errors.barcode}
              helperText={errors.barcode}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="QR Code"
              value={data.qr_code}
              onChange={(e) => setData('qr_code', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="RFID Tag"
              value={data.rfid_tag}
              onChange={(e) => setData('rfid_tag', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button component="label" variant="outlined" fullWidth>
              Upload Image
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange('image', e.target.files)}
              />
            </Button>
            {item?.image_url && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Current: {item.image_url}
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button component="label" variant="outlined" fullWidth>
              Upload Document
              <input
                hidden
                type="file"
                onChange={(e) => handleFileChange('document', e.target.files)}
              />
            </Button>
            {item?.document_url && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Current: {item.document_url}
              </Typography>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                />
              }
              label="Active"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Specifications (JSON)"
              value={data.specifications}
              onChange={(e) => setData('specifications', e.target.value)}
              error={!!errors.specifications}
              helperText={errors.specifications || 'Enter a valid JSON object (optional).'}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={processing}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={item ? <SaveIcon /> : <AddIcon />}
          disabled={processing}
        >
          {processing ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            item ? "Update Item" : "Create Item"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Advanced Delete Confirmation Dialog
const DeleteConfirmationDialog = ({ open, onClose, item, onConfirm }) => {
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
          Are you sure you want to delete the following item?
        </Typography>
        <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {item?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Code: {item?.item_code} | Category: {
              item?.category_id ? 
              item.category_id : 
              'Uncategorized'
            }
          </Typography>
          <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
            This action cannot be undone and will permanently remove the item from the database.
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
export default function InventoryItems({ items, auth, categories, universities }) {
  const theme = useTheme();
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { flash } = usePage().props;

  const {
    rows,
    loading,
    searchText,
    setSearchText,
    statistics
  } = useInventoryManager(items, auth);

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  const handleExport = useCallback(() => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows.map(item => ({
      'Item Code': item.item_code,
      'Name': item.name,
      'Category': categories.find(c => c.category_id === item.category_id)?.name,
      'Unit of Measure': item.unit_of_measure,
      'Unit Cost': item.unit_cost,
      'Current Value': item.current_value,
      'Min Stock': item.minimum_stock_level,
      'Status': item.is_active ? 'Active' : 'Inactive',
      'ABC Classification': item.abc_classification,
    })));
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Items');
    XLSX.writeFile(wb, `inventory_items_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
    showAlert('Inventory data exported successfully');
  }, [rows, categories]);

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const importedData = XLSX.utils.sheet_to_json(sheet);
        
        showAlert(`${importedData.length} items imported successfully`);
      } catch (error) {
        showAlert('Error importing file', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await router.delete(route('item.destroy', selectedItem.item_id), {
        preserveScroll: true,
        onSuccess: () => {
          showAlert('Item deleted successfully');
          setDeleteDialogOpen(false);
        },
        onError: () => {
          showAlert('Error deleting item', 'error');
        }
      });
    } catch (error) {
      showAlert('Error deleting item', 'error');
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

  const columns = [
    {
      field: 'item_code',
      headerName: 'CODE',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600" fontFamily="monospace">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'ITEM',
      width: 240,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" fontWeight="bold" noWrap>
            {params.value}
          </Typography>
          {params.row.description && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.description}
            </Typography>
          )}
        </Box>
      )
    },
    {
      field: 'category_id',
      headerName: 'CATEGORY',
      width: 160,
      renderCell: (params) => {
        const category = categories.find(c => c.category_id === params.value);
        return (
          <Chip
            label={category?.name || 'Uncategorized'}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'unit',
      headerName: 'UNIT',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="caption" color="text.secondary">
            ₵{Number(params.row.unit_cost).toFixed(2)}
          </Typography>
          <Typography variant="body2">
            {params.row.unit_of_measure}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'stock',
      headerName: 'STOCK',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">
            Min: {params.row.minimum_stock_level} | Max: {params.row.maximum_stock_level}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Reorder: {params.row.reorder_point} | EOQ: {params.row.economic_order_quantity}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'value',
      headerName: 'VALUE',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="600" color="primary.main">
            ₵{Number(params.row.current_value).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Weight: {params.row.weight_kg || 0}kg | Vol: {params.row.volume_cubic_m || 0}m³
          </Typography>
        </Box>
      ),
    },
    {
      field: 'hazard',
      headerName: 'HAZARD',
      width: 200,
      renderCell: (params) =>
        params.row.is_hazardous ? (
          <Box>
            <Chip label="Hazardous" size="small" color="error" />
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.hazard_type}
            </Typography>
          </Box>
        ) : (
          <Chip label="Safe" size="small" color="success" variant="outlined" />
        ),
    },
    {
      field: 'storage',
      headerName: 'STORAGE & EXPIRY',
      width: 200,
      renderCell: (params) => (
        <Box>
          {params.row.storage_conditions && (
            <Typography variant="caption" noWrap>
              {params.row.storage_conditions}
            </Typography>
          )}
          {params.row.expiry_date && (
            <Typography variant="caption" color="error" noWrap>
              Exp: {new Date(params.row.expiry_date).toLocaleDateString()}
            </Typography>
          )}
          {params.row.shelf_life_days && (
            <Typography variant="caption" color="text.secondary" noWrap>
              Shelf: {params.row.shelf_life_days} days
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'abc_classification',
      headerName: 'CLASS',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'A'
              ? 'error'
              : params.value === 'B'
              ? 'warning'
              : 'default'
          }
          variant="filled"
        />
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
          <Tooltip title="Edit item">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete item">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedItem(params.row);
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

  return (
    <AuthenticatedLayout
      auth={auth}
      title="Inventory Management"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Inventory Items' }
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
                  <Inventory color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      Inventory Items
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Manage your inventory items, track stock levels, and monitor item performance
                    </Typography>
                  </Box>
                  {searchText && (
                    <Chip
                      label={`${rows.length} items filtered`}
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
                      variant="contained"
                      startIcon={<AddCircleOutline />}
                      onClick={handleCreate}
                      size="small"
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      New Item
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      size="small"
                      startIcon={<CloudUpload />}
                      component="label"
                      variant="outlined"
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Import
                      <input
                        hidden
                        accept=".xlsx,.xls,.csv"
                        type="file"
                        onChange={handleImport}
                      />
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={handleExport}
                      variant="outlined"
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Export
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Total Items"
                value={statistics.totalItems}
                icon={<StockIcon />}
                color={theme.palette.primary.main}
                subtitle="All inventory items"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Total Value"
                value={`₵${statistics.totalValue.toLocaleString()}`}
                icon={<AmountIcon />}
                color={theme.palette.success.main}
                subtitle="Current inventory value"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Active Items"
                value={statistics.activeItems}
                icon={<QrCodeIcon />}
                color={theme.palette.info.main}
                subtitle="Currently active"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Low Stock"
                value={statistics.lowStockItems}
                icon={<WarningIcon />}
                color={theme.palette.warning.main}
                subtitle="Need reordering"
              />
            </Grid>
          </Grid>

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
                sorting: { sortModel: [{ field: 'updated_at', sort: 'desc' }] },
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
                    Loading inventory items...
                  </Typography>
                </Stack>
              </Box>
            )}
          </Paper>

          <ItemFormDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            item={selectedItem}
            categories={categories}
            universities={universities}
            auth={auth}
          />

          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            item={selectedItem}
            onConfirm={handleDelete}
          />
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
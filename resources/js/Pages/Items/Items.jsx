import React, { useEffect, useState, useMemo, useCallback } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  Box,
  Chip,
  Typography,
  Button,
  Grid,
  IconButton,
  Fade,
  Tooltip,
  useTheme,
  Stack,
} from "@mui/material";
import * as XLSX from "xlsx";
import moment from "moment";
import Notification from "@/Components/Notification";

// Icons
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as StockIcon,
  Warning as WarningIcon,
  AttachMoney as AmountIcon,
  AddCircleOutline,
  QrCode as QrCodeIcon,
  Inventory,
  CloudUpload,
  Download,
  AccountTree,
  CheckCircle,
  BarcodeReader,
} from "@mui/icons-material";
import { usePage, router } from "@inertiajs/react";
import PageHeader from "@/Components/PageHeader";
import EnhancedDataGrid from "@/Components/EnhancedDataGrid";
import SummaryCard from "@/Components/SummaryCard";
import DeleteConfirmationDialog from "./DeleteConfirmationDialogItem";
import ItemFormDialog from "./ItemFormDialog";
import formatNumber from "../Service/FormatNumber";
import SchoolIcon from '@mui/icons-material/School';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ScaleIcon from '@mui/icons-material/Scale';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import StorageIcon from '@mui/icons-material/Storage';
import EventIcon from '@mui/icons-material/Event';
import NfcIcon from '@mui/icons-material/Nfc';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Badge from '@mui/material/Badge';

// Custom Hooks
const useInventoryManager = (initialItems, auth) => {
  const [rows, setRows] = useState([]);
  const [gridLoading, setGridLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setGridLoading(true);
    // console.log(initialItems)
    const formatted = initialItems?.map((item, index) => ({
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
      name:item?.item_name??"",
      // expiry_date:item?.expiry_date??null,
      expiry_date:moment(item?.expiry_date).format('YYYY-MM-DD'),
      created_at: item?.created_at ? moment(item.created_at).format("MMM DD, YYYY") : "",
      updated_at: item?.updated_at ? moment(item.updated_at).format("MMM DD, YYYY") : "",
    }));
    setRows(formatted);
    setGridLoading(false);
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
    const totalItems = rows?.length || "";
    const activeItems = rows?.filter(r => r.is_active).length;
    const hazardousItems = rows?.filter(r => r.is_hazardous).length;
    const lowStockItems = rows?.filter(r => r.minimum_stock_level && r.current_value <= r.minimum_stock_level).length;
    const totalValue = rows?.reduce((sum, item) => sum + (item.current_value || 0), 0);

    return { totalItems, activeItems, hazardousItems, lowStockItems, totalValue };
  }, [rows]);

  return {
    rows: filteredRows,
    gridLoading,
    searchText,
    setSearchText,
    setRows,
    statistics
  };
};

export const summaryColors = {
  primary: '#667eea',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1'
};




export default function InventoryItems({ items=[], auth, categories=[], universities=[] }) {
  const theme = useTheme();
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { flash } = usePage().props;
  const [gridLoading, setGridLoading] = useState(true);

  const {
    rows,
    rows:filteredRows,
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
      router.delete(route('item.destroy', selectedItem.item_id), {
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

  // const columns = [
  //     {
  //       field: 'item_id',
  //       headerName: 'ID',
  //       width: 120,
  //       renderCell: (params) => {
  //         const id = params.value;
  //         const shortId = id ? id.substring(0, 8) : '';
  //         return (
  //           <Tooltip title={id} arrow>
  //             <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
  //               {shortId}
  //             </Typography>
  //           </Tooltip>
  //         );
  //       }
  //     },
  //     {
  //       field: 'item_code',
  //       headerName: 'CODE',
  //       width: 120,
  //       renderCell: (params) => {
  //         const id = params.value;
  //         const shortId = id ? id.substring(0, 8) : '';
  //         return (
  //           <Tooltip title={id} arrow>
  //             <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace' }}>
  //               {shortId}
  //             </Typography>
  //           </Tooltip>
  //         );
  //       }
  //     },
  //     {
  //       field: 'name',
  //       headerName: 'ITEM',
  //       width: 240,
  //       renderCell: (params) => (
  //         <Box sx={{ display: 'flex', flexDirection: 'column' }}>
  //           <Typography variant="body2" fontWeight="bold" noWrap sx={{ color: 'text.primary' }}>
  //             {params.row.item_name}
  //           </Typography>
  //           {/* {params.row.description && (
  //             <Typography variant="caption" color="text.secondary" noWrap>
  //               {params.row.description}
  //             </Typography>
  //           )} */}
  //         </Box>
  //       )
  //     },
  //     {
  //       field: 'category_id',
  //       headerName: 'CATEGORY',
  //       width: 160,
  //       renderCell: (params) => {
  //         const category = categories.find(c => c.category_id === params.value);
  //         const categoryColors = {
  //           'Electronics': { color: 'primary', variant: 'filled' },
  //           'Tools': { color: 'secondary', variant: 'filled' },
  //           'Raw Materials': { color: 'success', variant: 'filled' },
  //           'Consumables': { color: 'info', variant: 'filled' },
  //           'Safety Equipment': { color: 'warning', variant: 'filled' },
  //           'Office Supplies': { color: 'secondary', variant: 'outlined' }
  //         };
          
  //         const categoryName = category?.name || 'Uncategorized';
  //         const categoryStyle = categoryColors[categoryName] || { color: 'default', variant: 'outlined' };
          
  //         return (
  //           <Chip
  //             label={categoryName}
  //             size="small"
  //             variant={categoryStyle.variant}
  //             color={categoryStyle.color}
  //             sx={{ 
  //               fontWeight: 600,
  //               fontSize: '0.75rem',
  //               ...(categoryStyle.variant === 'filled' && {
  //                 color: 'white'
  //               })
  //             }}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       field: 'unit',
  //       headerName: 'UNIT',
  //       width: 160,
  //       renderCell: (params) => (
  //         <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
  //           <Chip 
  //             label={`₵${Number(params.row.unit_cost).toFixed(2)}`}
  //             size="small"
  //             variant="outlined"
  //             color="success"
  //             sx={{ fontWeight: 600 }}
  //           />
  //           <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
  //             {params.row.unit_of_measure}
  //           </Typography>
  //         </Box>
  //       ),
  //     },
  //     {
  //       field: 'stock',
  //       headerName: 'STOCK',
  //       width: 180,
  //       renderCell: (params) => (
  //         <Box>
  //           <Box sx={{ display: 'flex', gap: 1, pb: 0.1 }}>
  //             <Chip 
  //               label={`Min: ${params.row.minimum_stock_level}`}
  //               size="small"
  //               variant="outlined"
  //               color="info"
  //             />
  //             <Chip 
  //               label={`Max: ${params.row.maximum_stock_level}`}
  //               size="small"
  //               variant="outlined"
  //               color="info"
  //             />
  //           </Box>
  //           <Box sx={{ display: 'flex', gap: 0.5 }}>
  //             <Typography variant="caption" color="warning.main" fontWeight={600}>
  //               Reorder: {params.row.reorder_point}
  //             </Typography>
  //             <Typography variant="caption" color="text.secondary">
  //               | EOQ: {params.row.economic_order_quantity}
  //             </Typography>
  //           </Box>
  //         </Box>
  //       ),
  //     },
  //     {
  //       field: 'value',
  //       headerName: 'VALUE',
  //       width: 180,
  //       renderCell: (params) => (
  //         <Box>
  //           <Chip 
  //             label={`₵${Number(params.row.current_value).toLocaleString()}`}
  //             size="small"
  //             color="success"
  //             variant="filled"
  //             sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}
  //           />
  //           <Box sx={{ display: 'flex', gap: 1 }}>
  //             <Typography variant="caption" color="text.secondary">
  //               {params.row.weight_kg || 0}kg
  //             </Typography>
  //             <Typography variant="caption" color="text.secondary">
  //               | {params.row.volume_cubic_m || 0}m³
  //             </Typography>
  //           </Box>
  //         </Box>
  //       ),
  //     },
  //     {
  //       field: 'hazard',
  //       headerName: 'HAZARD',
  //       width: 200,
  //       renderCell: (params) =>
  //         params.row.is_hazardous ? (
  //           <Box>
  //             <Chip 
  //               label="Hazardous" 
  //               size="small" 
  //               color="error" 
  //               variant="filled"
  //               sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}
  //             />
  //             <Typography variant="caption" color="error.main" fontWeight={600} noWrap>
  //               {params.row.hazard_type}
  //             </Typography>
  //           </Box>
  //         ) : (
  //           <Chip 
  //             label="Safe" 
  //             size="small" 
  //             color="success" 
  //             variant="filled"
  //             sx={{ fontWeight: 600, color: 'white' }}
  //           />
  //         ),
  //     },
  //     {
  //       field: 'storage',
  //       headerName: 'STORAGE & EXPIRY',
  //       width: 350,
  //       renderCell: (params) => {
  //         const { storage_conditions, expiry_date, shelf_life_days } = params.row;
  //         const isExpired = expiry_date && new Date(expiry_date) < new Date();

  //         return (
  //           <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}>
  //             {storage_conditions && (
  //               <Tooltip title={storage_conditions} arrow>
  //                 <Chip
  //                   label="Storage Info"
  //                   size="small"
  //                   variant="outlined"
  //                   color="info"
  //                   // sx={{ maxWidth: 200 }}
  //                 />
  //               </Tooltip>
  //             )}
  //             {expiry_date && (
  //               <Chip
  //                 label={`Exp: ${new Date(expiry_date).toLocaleDateString("en-US", {
  //                   month: "short",
  //                   day: "2-digit",
  //                   year: "numeric"
  //                 })}`}
  //                 size="small"
  //                 color={isExpired ? 'error' : 'warning'}
  //                 variant={isExpired ? 'filled' : 'outlined'}
  //                 // sx={{ fontWeight: 600 }}
  //               />
  //             )}
  //             {shelf_life_days && (
  //               <Typography variant="caption" color="text.secondary" noWrap>
  //                 Shelf: {shelf_life_days} days
  //               </Typography>
  //             )}
  //           </Box>
  //         );
  //       },
  //     },
  //     {
  //       field: 'abc_classification',
  //       headerName: 'CLASS',
  //       width: 100,
  //       align: 'center',
  //       headerAlign: 'center',
  //       renderCell: (params) => {
  //         const classColors = {
  //           'A': { color: 'error', variant: 'filled' },
  //           'B': { color: 'warning', variant: 'filled' },
  //           'C': { color: 'info', variant: 'filled' },
  //           'D': { color: 'default', variant: 'outlined' }
  //         };
          
  //         const classConfig = classColors[params.value] || { color: 'default', variant: 'outlined' };
          
  //         return (
  //           <Chip
  //             label={params.value}
  //             size="small"
  //             color={classConfig.color}
  //             variant={classConfig.variant}
  //             sx={{ 
  //               fontWeight: 700,
  //               minWidth: 40,
  //               ...(classConfig.variant === 'filled' && {
  //                 color: 'white'
  //               })
  //             }}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       field: 'actions',
  //       headerName: 'ACTIONS',
  //       width: 120,
  //       sortable: false,
  //       align: 'center',
  //       headerAlign: 'center',
  //       renderCell: (params) => (
  //         <Stack direction="row" spacing={0.5}>
  //           <Tooltip title="Edit item">
  //             <IconButton
  //               size="small"
  //               onClick={() => handleEdit(params.row)}
  //               sx={{ 
  //                 color: 'primary.main',
  //                 backgroundColor: 'primary.light',
  //                 '&:hover': { backgroundColor: 'primary.main', color: 'white' }
  //               }}
  //             >
  //               <EditIcon fontSize="small" />
  //             </IconButton>
  //           </Tooltip>
  //           <Tooltip title="Delete item">
  //             <IconButton
  //               size="small"
  //               sx={{ 
  //                 color: 'error.main',
  //                 backgroundColor: 'error.light',
  //                 '&:hover': { backgroundColor: 'error.main', color: 'white' }
  //               }}
  //               onClick={() => {
  //                 setSelectedItem(params.row);
  //                 setDeleteDialogOpen(true);
  //               }}
  //             >
  //               <DeleteIcon fontSize="small" />
  //             </IconButton>
  //           </Tooltip>
  //         </Stack>
  //       ),
  //     },
  // ];

  // Create action buttons for header
const columns = [
  {
    field: 'item_id',
    headerName: 'ID',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Tooltip title={params.value} arrow>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ 
            fontFamily: 'monospace', 
            fontWeight: 700,
            color: 'primary.main',
            backgroundColor: 'primary.50',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            display: 'block'
          }}>
            {params.value ? params.value.substring(0, 6) + '...' : 'N/A'}
          </Typography>
        </Box>
      </Tooltip>
    )
  },
  {
    field: 'university',
    headerName: 'UNIVERSITY',
    width: 160,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon color="primary" fontSize="small" />
        <Typography variant="body2" fontWeight="500" noWrap>
          {params.value || 'N/A'}
        </Typography>
      </Box>
    )
  },
  {
    field: 'item_code',
    headerName: 'ITEM CODE',
    width: 130,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        variant="outlined"
        color="secondary"
        sx={{ 
          fontWeight: 600,
          fontFamily: 'monospace',
          fontSize: '0.75rem'
        }}
      />
    )
  },
  {
    field: 'item_name',
    headerName: 'ITEM DETAILS',
    width: 280,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', }}>
        <Typography variant="subtitle2" fontWeight="600" noWrap>
          {params.value}
        </Typography>
        {params.row.description && (
          <Tooltip title={params.row.description} arrow>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.description.length > 60 
                ? `${params.row.description.substring(0, 60)}...` 
                : params.row.description
              }
            </Typography>
          </Tooltip>
        )}
      </Box>
    )
  },
  {
    field: 'category',
    headerName: 'CATEGORY',
    width: 150,
    renderCell: (params) => {    
      return (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            textAlign: 'center',
            width: '100%'
          }}
        >
          <Typography variant="caption" fontWeight="600">
            {params.value || 'Uncategorized'}
          </Typography>
        </Box>
      );
    },
  },
  {
    field: 'pricing',
    headerName: 'PRICING & UNIT',
    width: 180,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" fontWeight="600" color="success.main">
            ₵{Number(params.row.unit_cost).toFixed(2)}
          </Typography>
          <Chip 
            label={params.row.unit_of_measure}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" textAlign="center">
          Value: ₵{Number(params.row.current_value).toLocaleString()}
        </Typography>
      </Box>
    ),
  },
{
  field: 'inventory_metrics',
  headerName: 'INVENTORY METRICS',
  width: 200,
  renderCell: (params) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Stock Level Indicators */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" display="block">Min</Typography>
          <Typography variant="body2" fontWeight="600" color="success.main">
            {params.row.minimum_stock_level}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" display="block">Max</Typography>
          <Typography variant="body2" fontWeight="600" color="info.main">
            {params.row.maximum_stock_level}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" display="block">Reorder</Typography>
          <Typography variant="body2" fontWeight="600" color="warning.main">
            {params.row.reorder_point}
          </Typography>
        </Box>
      </Box>

      {/* EOQ and Classification */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Economic Order Quantity" arrow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Inventory fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" fontWeight="500">
              {params.row.economic_order_quantity}
            </Typography>
          </Box>
        </Tooltip>
        
        {/* ABC Classification with better styling */}
        <Chip
          label={`Class ${params.row.abc_classification}`}
          size="small"
          color={
            params.row.abc_classification === 'A' ? 'error' :
            params.row.abc_classification === 'B' ? 'warning' :
            params.row.abc_classification === 'C' ? 'info' : 'default'
          }
          variant="filled"
          sx={{ 
            fontWeight: 700,
            fontSize: '0.7rem',
            minWidth: 60,
            height: 24
          }}
        />
      </Box>
    </Box>
  ),
},
  {
    field: 'physical_properties',
    headerName: 'PHYSICAL PROPERTIES',
    width: 180,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScaleIcon fontSize="small" color="action" />
            <Typography variant="caption">
              {params.row.weight_kg || 0} kg
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AspectRatioIcon fontSize="small" color="action" />
            <Typography variant="caption">
              {params.row.volume_cubic_m || 0} m³
            </Typography>
          </Box>
        </Box>
        {params.row.is_hazardous && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: 'error.light'
          }}>
            <WarningIcon fontSize="small" sx={{ color: 'error.main' }} />
            <Typography variant="caption" fontWeight="600" color="error.main">
              {params.row.hazard_type}
            </Typography>
          </Box>
        )}
      </Box>
    ),
  },
  {
    field: 'storage_expiry',
    headerName: 'STORAGE & EXPIRY',
    width: 290,
    renderCell: (params) => {
      const isExpired = params.row.expiry_date && new Date(params.row.expiry_date) < new Date();
      const isExpiringSoon = params.row.expiry_date && 
        new Date(params.row.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
          {params.row.storage_conditions && (
            <Tooltip title={params.row.storage_conditions} arrow>
              <Chip
                icon={<StorageIcon />}
                label="Storage Info"
                size="small"
                variant="outlined"
                color="info"
              />
            </Tooltip>
          )}
          {params.row.expiry_date && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: isExpired ? 'error.light' : 
                             isExpiringSoon ? 'warning.light' : 'success.light'
            }}>
              <EventIcon fontSize="small" />
              <Typography variant="caption" fontWeight="600">
                {new Date(params.row.expiry_date).toLocaleDateString()}
              </Typography>
              {params.row.shelf_life_days && (
                <Typography variant="caption" color="text.secondary">
                  ({params.row.shelf_life_days}d)
                </Typography>
              )}
            </Box>
          )}
        </Box>
      );
    },
  },
  {
    field: 'tracking_codes',
    headerName: 'TRACKING',
    width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5 }}>
        {params.row.barcode && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BarcodeReader fontSize="small" color="action" />
            <Typography variant="caption" fontFamily="monospace">
              {params.row.barcode}
            </Typography>
          </Box>
        )}
        {params.row.rfid_tag && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <NfcIcon fontSize="small" color="action" />
            <Typography variant="caption" fontFamily="monospace">
              {params.row.rfid_tag.substring(0, 10)}...
            </Typography>
          </Box>
        )}
        {params.row.qr_code && (
          <Chip
            icon={<QrCodeIcon />}
            label="QR Code"
            size="small"
            variant="outlined"
          />
        )}
      </Box>
    ),
  },
  {
    field: 'audit_info',
    headerName: 'AUDIT INFO',
    width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">Created</Typography>
          <Typography variant="caption" fontWeight="500">
            {new Date(params.row.created_at).toLocaleDateString()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">By</Typography>
          <Typography variant="caption" fontWeight="500">
            {params.row.creator || 'System'}
          </Typography>
        </Box>
        {params.row.updater && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary">Updated by</Typography>
            <Typography variant="caption" fontWeight="500">
              {params.row.updater}
            </Typography>
          </Box>
        )}
      </Box>
    ),
  },
  {
    field: 'status',
    headerName: 'STATUS',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box sx={{ position: 'relative' }}>
        <Chip
          label={params.row.is_active ? 'Active' : 'Inactive'}
          size="small"
          color={params.row.is_active ? 'success' : 'default'}
          variant={params.row.is_active ? 'filled' : 'outlined'}
          sx={{ 
            fontWeight: 600,
            minWidth: 70
          }}
        />
        {!params.row.is_active && (
          <CancelIcon 
            sx={{ 
              position: 'absolute',
              top: -4,
              right: -4,
              fontSize: 16,
              color: 'error.main',
              backgroundColor: 'white',
              borderRadius: '50%'
            }} 
          />
        )}
      </Box>
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
            sx={{ 
              color: 'primary.main',
              backgroundColor: 'action.hover',
              '&:hover': { backgroundColor: 'primary.main', color: 'white' }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="View details">
          <IconButton
            size="small"
            sx={{ 
              color: 'info.main',
              backgroundColor: 'action.hover',
              '&:hover': { backgroundColor: 'info.main', color: 'white' }
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete item">
          <IconButton
            size="small"
            sx={{ 
              color: 'error.main',
              backgroundColor: 'action.hover',
              '&:hover': { backgroundColor: 'error.main', color: 'white' }
            }}
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

  const actionButtons = [
    <Button
      key="new-item"
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
      New Item
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
        onChange={handleImport}
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

  const handleRefresh = () => {
    router.reload({ preserveScroll: true });
  };
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
          
          {/* Header Section */}
          <PageHeader
            title="Inventory Items "
            subtitle="Manage your inventory items, track stock levels, and monitor item performance"
            icon={<Inventory sx={{ fontSize: 28 }} />}
            actionButtons={actionButtons}
            searchText={searchText}
            onSearchClear={() => setSearchText('')}
            filteredCount={filteredRows.length}
            totalCount={rows.length}
          />
       
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Total Items"
                icon={<StockIcon />}
                animationDelay="1"
                value={statistics.totalItems??0} 
                change={"+"+statistics.totalItems??0}
                color={summaryColors.primary}
                subtitle="All inventory items"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Total Value"
                dataType="inventory"
                change={"+"+formatNumber(statistics.totalValue??0)}
                value={`₵${formatNumber(statistics?.totalValue)?? 0 }`}
                icon={<AmountIcon />}
                color={theme.palette.success.main}
                subtitle="Current inventory value"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Active Items"
                dataType="inventory"
                value={formatNumber(statistics?.activeItems)??0}
                change={"+"+formatNumber(statistics.activeItems??0)}
                icon={<QrCodeIcon />}
                color={theme.palette.info.main}
                subtitle="Currently active"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard
                title="Low Stock"
                dataType="inventory"
                value={formatNumber(statistics?.lowStockItems)??0}
                change={"+"+formatNumber(statistics.lowStockItems)?? 0}
                icon={<WarningIcon />}
                color={theme.palette.warning.main}
                subtitle="Need reordering"
              />
            </Grid>
          </Grid>

          
          {/* Data Grid */}
          <EnhancedDataGrid
            rows={filteredRows}
            columns={columns}
            loading={false}
            searchText={searchText}
            onSearchChange={setSearchText}
            onSearchClear={() => setSearchText('')}
            onAdd={handleCreate}
            onExport={handleExport}
            onImport={handleImport}
            onRefresh={handleRefresh}
            title="Items"
            subtitle="inventory Items"
            icon={<AccountTree />}
            addButtonText="New"
            pageSizeOptions={[5, 10, 20, 50, 100]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
              sorting: { sortModel: [{ field: 'lft', sort: 'asc' }] }
            }}
          />
          
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
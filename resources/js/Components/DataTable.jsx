import { router, usePage } from "@inertiajs/react";
import { 
  AccountTree, 
  Close, 
  Refresh, 
  Save, 
  Search, 
  UploadFile,
  Inventory2,
  SearchOff 
} from "@mui/icons-material";
import { 
  Avatar, 
  Box, 
  Chip, 
  CircularProgress, 
  IconButton, 
  InputAdornment, 
  Paper, 
  Stack, 
  TextField, 
  Tooltip, 
  Typography,
  alpha,
  useTheme 
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect } from "react";
import Notification from "@/Components/Notification";

// Custom Toolbar Component
const CustomToolbar = ({ searchText, onSearchChange, loading, filteredRows, rows, handleRefresh }) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "background.paper",
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <AccountTree color="primary" fontSize="medium" />
        <Typography variant="h6" fontWeight={600} color="text.primary">
          Items History
        </Typography>
        {searchText && (
          <Chip
            label={`${filteredRows.length} of ${rows.length} items`}
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
          placeholder="Search items..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", sm: 250 },
            backgroundColor: "background.default",
            borderRadius: 1,
          }}
        />
                <Tooltip title="Refresh Data">
                  <IconButton 
                    color="primary" 
                    size="medium"
                    onClick={handleRefresh}
                    sx={{
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        transform: 'rotate(45deg)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Tooltip>
      </Box>
    </Box>
  );
};


// Main DataTable Component
export default function DataTable({ 
  filteredRows = [], 
  columns = [], 
  searchText = "", 
  setSearchText,
  loading = false,
  rows = [] 
}) {
  const theme = useTheme();
 const { flash } = usePage().props;

const handleRefresh = () => {
   router.reload({ preserveScroll: true });
};


const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
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


  return (
    <Paper sx={{
      height: "100%",
      width: "100%",
      borderRadius: 2,
      overflow: 'hidden',
      backgroundColor: "background.paper",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      border: "1px solid",
      borderColor: "divider",
      position: 'relative',
    }}>
      {/* Custom Toolbar */}
      <CustomToolbar
        searchText={searchText}
        onSearchChange={setSearchText}
        loading={loading}
        filteredRows={filteredRows}
        rows={rows}
        handleRefresh={handleRefresh}
      />
      
      {/* DataGrid */}
      <Box sx={{ position: 'relative', height: 'calc(100% - 80px)' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={false} // We handle loading manually
          density="comfortable"
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: 'updated_at', sort: 'desc' }] },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-main': {
              backgroundColor: 'transparent',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 1,
              fontSize: '0.875rem',
              '&:focus': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                }
              }
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'grey.50',
              borderBottom: '2px solid',
              borderColor: 'divider',
              fontSize: '0.875rem',
              fontWeight: 600,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'grey.50',
            },
            '& .MuiTablePagination-root': {
              fontSize: '0.875rem',
            },
            '& .MuiCheckbox-root': {
              color: alpha(theme.palette.primary.main, 0.6),
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              }
            },
          }}
          disableRowSelectionOnClick
          slots={{
            loadingOverlay: () => null,
            noRowsOverlay: () => (
              <Stack spacing={1} alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                <Inventory2 sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary">
                  No inventory items found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or filters
                </Typography>
              </Stack>
            ),
            noResultsOverlay: () => (
              <Stack spacing={1} alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
                <SearchOff sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary">
                  No results found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No items match your search criteria
                </Typography>
              </Stack>
            )
          }}
        />
        
        {/* Custom Loading Overlay */}
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
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 1,
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={40} />
              <Box textAlign="center">
                <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
                  Loading Inventory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fetching your inventory items...
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Box>

        <Notification 
            open={alert.open} 
            severity={alert.severity} 
            message={alert.message}
            onClose={handleCloseAlert}
        />

    </Paper>

    
  );
}
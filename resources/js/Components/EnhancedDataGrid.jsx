import React from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Avatar,
  Typography,
  Stack,
  Tooltip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  UploadFile as UploadFileIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const EnhancedDataGrid = ({
  rows = [],
  columns = [],
  loading = false,
  searchText = '',
  onSearchChange,
  onSearchClear,
  onAdd,
  onExport,
  onImport,
  onRefresh,
  title = "Data Grid",
  subtitle = "Manage your data",
  icon = <AccountTreeIcon />,
  addButtonText = "Add New",
  showHeader = true,
  ...dataGridProps
}) => {
  return (
    <Box sx={{
      height: "100%",
      width: "100%",
      backgroundColor: "background.paper",
      borderRadius: 3,
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      border: '1px solid rgba(255,255,255,0.8)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        zIndex: 2
      }
    }}>
      {showHeader && (
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
              }}
            >
              {icon}
            </Avatar>
            <Box>
              <Typography 
                variant="h5" 
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                {title}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main',
                  }} 
                />
                {subtitle}
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              placeholder="Search..."
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="primary" />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={onSearchClear}
                      sx={{ color: 'text.secondary' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                width: 280,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  }
                }
              }}
            />
            
            <Tooltip title="Refresh Data">
              <IconButton 
                color="primary" 
                size="medium"
                onClick={onRefresh}
                sx={{
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    transform: 'rotate(45deg)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {onAdd && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                color="primary"
                onClick={onAdd}
                size="medium"
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
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
                {addButtonText}
              </Button>
            )}
            
            {onExport && (
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                color="success"
                onClick={onExport}
                size="medium"
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  border: '2px solid',
                  borderColor: 'success.light',
                  color: 'success.main',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.04)',
                    borderColor: 'success.main',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Export
              </Button>
            )}
            
            {onImport && (
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                color="secondary"
                size="medium"
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  border: '2px solid',
                  borderColor: 'secondary.light',
                  color: 'secondary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(168, 85, 247, 0.04)',
                    borderColor: 'secondary.main',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Import
                <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={onImport} />
              </Button>
            )}
          </Stack>
        </Box>
      )}
      
      <Box sx={{ height: showHeader ? 'calc(100% - 100px)' : '100%', position: 'relative' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              py: 1.5,
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row': {
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.04)',
                transform: 'translateX(2px)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(102, 126, 234, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.12)',
                }
              }
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
              borderBottom: '2px solid rgba(0,0,0,0.08)',
              fontSize: '0.875rem',
              fontWeight: 700,
            },
            '& .MuiDataGrid-toolbarContainer': {
              p: 2,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
              backgroundColor: 'rgba(255,255,255,0.5)',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid rgba(0,0,0,0.06)',
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
            },
          }}
          loading={loading}
          {...dataGridProps}
        />
        
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,255,0.95) 100%)',
            backdropFilter: 'blur(4px)',
            zIndex: 1,
            borderRadius: '0 0 12px 12px',
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <CircularProgress 
                  size={60} 
                  thickness={4}
                  sx={{
                    color: 'primary.main',
                    background: 'conic-gradient(rgba(102, 126, 234, 0.2) 0%, transparent 50%)',
                    borderRadius: '50%',
                  }}
                />
                <AccountTreeIcon 
                  sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 24,
                    color: 'primary.main',
                    opacity: 0.8
                  }} 
                />
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mt: 2, color: 'text.primary' }}>
                Loading Data
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Please wait...
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EnhancedDataGrid;
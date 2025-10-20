import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Delete, Delete as DeleteIcon, Warning } from '@mui/icons-material';

const DeleteDialog = ({
  open,
  onClose,
  selectedItem,
  onConfirm,
  gridLoading
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ 
      backgroundColor: 'error.main', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: 1
    }}>
      <Warning />
      Confirm Deletion
    </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the category "{selectedItem?.name}"? This action cannot be undone.
        </Typography>
        {selectedItem?.items_count > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This category contains {selectedItem.items_count} items. Deleting it may affect those items.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error"
        disabled={gridLoading}
        startIcon={gridLoading ? <CircularProgress size={16} /> : <Delete />}
        // startIcon={<DeleteIcon />}
        >
          Delete Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
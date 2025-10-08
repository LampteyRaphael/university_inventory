import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const DeleteDialog = ({
  open,
  onClose,
  selectedItem,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Delete</DialogTitle>
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
        <Button onClick={onConfirm} variant="contained" color="error" startIcon={<DeleteIcon />}>
          Delete Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
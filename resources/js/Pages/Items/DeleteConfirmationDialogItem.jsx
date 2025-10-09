import { Delete, Warning } from "@mui/icons-material";
import { Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useState } from "react";


export default function DeleteConfirmationDialog({ open, onClose, item, onConfirm }){

          const [gridLoading, setGridLoading] = useState(false);
        
          const handleDelete = async () => {
            setGridLoading(true);
            try {
              await onConfirm();
              onClose();
            } catch (error) {
              console.error('Delete error:', error);
            } finally {
              setGridLoading(false);
            }
          };
        
          return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableRestoreFocus>
              <DialogTitle sx={{ 
                backgroundColor: 'error.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <Warning />
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
                  disabled={gridLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  disabled={gridLoading}
                  startIcon={gridLoading ? <CircularProgress size={16} /> : <Delete />}
                >
                  {gridLoading ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </DialogActions>
            </Dialog>
          );
}
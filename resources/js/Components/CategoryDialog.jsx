import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Button,
  IconButton,
  LinearProgress,
  CircularProgress,
  InputAdornment,
  FormHelperText,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { Slide } from '@mui/material';

const CategoryDialog = ({
  open,
  onClose,
  selectedItem,
  data,
  setData,
  errors,
  processing,
  universities,
  categories,
  onSubmit,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={() => !processing && onClose()}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Slide}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: 'primary.main',
        color: 'white'
      }}>
        <Typography variant="h6" component="span">
          {selectedItem ? "Edit Category" : "Create New Category"}
        </Typography>
        <IconButton 
          onClick={() => !processing && onClose()} 
          sx={{ color: 'white' }}
          disabled={processing}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ pt: 3 }}>
        {processing && <LinearProgress />}
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <FormControl fullWidth error={!!errors.university_id}>
              <InputLabel>University</InputLabel>
              <Select 
                value={universities?.some(uni=>uni.university_id===data.university_id)
                  ? data.university_id:''
                } 
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
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Category Name"
              name="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              disabled={processing}
              required
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Category Code"
              name="category_code"
              value={data.category_code}
              onChange={(e) => setData('category_code', e.target.value)}
              error={!!errors.category_code}
              helperText={errors.category_code}
              disabled={processing}
              required
            />
          </Grid>
        
          <Grid size={{ xs: 12, sm: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                name="parent_category_id"
                value={categories?.some(c=>c.category_id===data.parent_category_id)
                  ?data.parent_category_id:''
                }
                label="Parent Category"
                onChange={(e) => setData('parent_category_id', e.target.value)}
                disabled={processing}
              >
                <MenuItem value="">None (Root Category)</MenuItem>
                {categories.filter(row => !row.parent_category_id).map((category) => (
                  <MenuItem key={category.id} value={category.category_id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              multiline
              rows={2}
              disabled={processing}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Image URL"
              name="image_url"
              value={data.image_url}
              onChange={(e) => setData('image_url', e.target.value)}
              error={!!errors.image_url}
              helperText={errors.image_url}
              disabled={processing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ImageIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Warranty Period (Days)"
              name="warranty_period_days"
              type="number"
              value={data.warranty_period_days}
              onChange={(e) => setData('warranty_period_days', parseInt(e.target.value) || 0)}
              error={!!errors.warranty_period_days}
              helperText={errors.warranty_period_days}
              disabled={processing}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Depreciation Rate (%)"
              name="depreciation_rate"
              type="number"
              value={data.depreciation_rate}
              onChange={(e) => setData('depreciation_rate', parseFloat(e.target.value) || 0)}
              error={!!errors.depreciation_rate}
              helperText={errors.depreciation_rate}
              disabled={processing}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Depreciation Method</InputLabel>
              <Select
                name="depreciation_method"
                value={data.depreciation_method}
                label="Depreciation Method"
                onChange={(e) => setData('depreciation_method', e.target.value)}
                disabled={processing}
              >
                <MenuItem value="straight_line">Straight Line</MenuItem>
                <MenuItem value="reducing_balance">Reducing Balance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Maintenance Interval (Days)"
              name="maintenance_interval_days"
              type="number"
              value={data.maintenance_interval_days}
              onChange={(e) => setData('maintenance_interval_days', parseInt(e.target.value) || "")}
              error={!!errors.maintenance_interval_days}
              helperText={errors.maintenance_interval_days}
              disabled={processing}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Depth"
              name="depth"
              type="number"
              value={data.depth}
              onChange={(e) => setData('depth', parseInt(e.target.value) || 0)}
              error={!!errors.depth}
              helperText={errors.depth}
              disabled={processing}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Left Position (LFT)"
              name="lft"
              type="number"
              value={data.lft}
              onChange={(e) => setData('lft', parseInt(e.target.value) || "")}
              error={!!errors.lft}
              helperText={errors.lft}
              disabled={processing}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Right Position (RGT)"
              name="rgt"
              type="number"
              value={data.rgt}
              onChange={(e) => setData('rgt', parseInt(e.target.value) || "")}
              error={!!errors.rgt}
              helperText={errors.rgt}
              disabled={processing}
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={data.requires_serial_number}
                  onChange={(e) => setData('requires_serial_number', e.target.checked)}
                  disabled={processing}
                />
              }
              label="Requires Serial Number"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={data.requires_maintenance}
                  onChange={(e) => setData('requires_maintenance', e.target.checked)}
                  disabled={processing}
                />
              }
              label="Requires Maintenance"
            />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  disabled={processing}
                />
              }
              label="Active Category"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => onClose()}
          color="inherit"
          disabled={processing}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSubmit}
          variant="contained"
          disabled={processing}
          startIcon={processing ? <CircularProgress size={16} /> : (selectedItem ? <SaveIcon /> : <AddIcon />)}
        >
          {processing ? 'Processing...' : (selectedItem ? "Update Category" : "Create Category")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
import InputLabel from "@/Components/InputLabel";
import { useForm } from "@inertiajs/react";
import { Add, Create, Edit, EditAttributesRounded, Save } from "@mui/icons-material";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormHelperText, Grid, InputAdornment, LinearProgress, MenuItem, Select, Switch, TextField, Typography } from "@mui/material";
import moment from "moment/moment";
import { useEffect } from "react";


export default function ItemFormDialog ({ open, onClose, item = null, categories = [], universities = [], auth = null }) {
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
        is_hazardous: item?.is_hazardous,
        hazard_type: item?.hazard_type || '',
        handling_instructions: item?.handling_instructions || '',
        storage_conditions: item?.storage_conditions || '',
        shelf_life_days: item?.shelf_life_days ?? null,
        expiry_date:moment(item?.expiry_date).format('YYYY-MM-DD'),
        // expiry_date: item?.expiry_date || '',
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
        const parsed = (data.specifications);
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
    <Dialog open={open} onClose={onClose} maxWidth="md" disableRestoreFocus fullWidth>
      <DialogTitle sx={{ 
        backgroundColor: 'primary.main', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        py: 2
      }}>
        <Typography variant="body2" fontWeight={600}>
        {item? <Edit /> : <Create />} {item ? 'Edit Inventory Item' : 'Create New Inventory Item'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {processing && <LinearProgress />}

          <Grid size={{ xs: 12, sm: 6, md:4 }} sx={{ mb:2}}>
            <FormControl fullWidth error={!!errors.university_id}>
              <InputLabel>University</InputLabel>
              <Select 
                value={universities.some(u=>u.university_id===data.university_id)?
                 data.university_id : ''
                } 
                label="University" 
                onChange={(e) => setData('university_id', e.target.value)}
              >
                {universities?.map(university => (
                  <MenuItem key={university?.university_id} value={university?.university_id}>
                    {university?.name}
                  </MenuItem>
                ))}
              </Select>
              {errors?.university_id && <FormHelperText>{errors?.university_id}</FormHelperText>}
            </FormControl>
          </Grid>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Item Code"
              value={data.item_code || ""}
              onChange={(e) => setData('item_code', e.target.value)}
              error={!!errors.item_code}
              helperText={errors.item_code}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Item Name"
              value={data.name || ""}
              onChange={(e) => setData('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth error={!!errors.category_id}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categories.some(c=>c.category_id===data.category_id)?
                  data.category_id:''
                }
                label="Category"
                onChange={(e) => setData('category_id', e.target.value)}
              >
                <MenuItem value="">— Select —</MenuItem>
                {categories?.map((cat) => (
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
              value={data.unit_of_measure||""}
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
              value={data.unit_cost||""}
              onChange={(e) => setData('unit_cost', e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Current Value"
              value={data.current_value||""}
              onChange={(e) => setData('current_value', e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Minimum Stock Level"
              value={data.minimum_stock_level||""}
              onChange={(e) => setData('minimum_stock_level', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Stock Level"
              value={data.maximum_stock_level ||""}
              onChange={(e) => setData('maximum_stock_level', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Reorder Point"
              value={data.reorder_point||""}
              onChange={(e) => setData('reorder_point', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Economic Order Quantity"
              value={data.economic_order_quantity ||""}
              onChange={(e) => setData('economic_order_quantity', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>ABC Classification</InputLabel>
              <Select
                value={data?.abc_classification||""}
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
              value={data.weight_kg ||""}
              onChange={(e) => setData('weight_kg', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Volume (m³)"
              value={data.volume_cubic_m ||""}
              onChange={(e) => setData('volume_cubic_m', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={data?.is_hazardous || false}
                  onChange={(e) => setData('is_hazardous', e.target.checked)}
                />
              }
              label="Is Hazardous"
            />
          </Grid>

          {data?.is_hazardous && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Hazard Type"
                  value={data.hazard_type||""}
                  onChange={(e) => setData('hazard_type', e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Handling Instructions"
                  value={data.handling_instructions||""}
                  onChange={(e) => setData('handling_instructions', e.target.value)}
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField
              fullWidth
              label="Storage Conditions"
              value={data.storage_conditions||""}
              onChange={(e) => setData('storage_conditions', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Shelf Life (days)"
              value={data.shelf_life_days ||""}
              onChange={(e) => setData('shelf_life_days', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Expiry Date"
              InputLabelProps={{ shrink: true }}
              value={data?.expiry_date || ""}
              onChange={(e) => setData('expiry_date', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Barcode"
              value={data.barcode|| "" }
              onChange={(e) => setData('barcode', e.target.value)}
              error={!!errors.barcode}
              helperText={errors.barcode}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="QR Code"
              value={data.qr_code||""}
              onChange={(e) => setData('qr_code', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="RFID Tag"
              value={data.rfid_tag||""}
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
                  checked={data?.is_active}
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
              value={data?.description||''}
              onChange={(e) => setData('description', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Specifications (JSON)"
              value={data?.specifications|| ''}
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
          startIcon={item ? <Save /> : <Add />}
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

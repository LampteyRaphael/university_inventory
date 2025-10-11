import { Add, Close, Edit, Save } from "@mui/icons-material";
import { alpha, Avatar, Box, Button, createTheme, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, Typography } from "@mui/material";
import { orange } from "@mui/material/colors";


// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: orange[500],
    },
  },
});


export default function Dialogheader({children,openDialog, subtitle, subtitle2, handleSubmit, submit, processing, onClose}){

    return (
                  <Dialog 
                    open={openDialog} 
                    onClose={onClose} 
                    maxWidth="md" 
                    fullWidth
                    scroll="paper"
                    PaperProps={{
                      sx: {
                        borderRadius: 3,
                        boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <DialogTitle sx={{ 
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      color: 'white',
                      py: 3,
                      px: 4,
                    }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                          {subtitle ? <Edit /> : <Add />}
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight={700}>
                            {subtitle}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {subtitle2}
                          </Typography>
                        </Box>
                      </Stack>
                    </DialogTitle>
                    
                    <DialogContent dividers sx={{ p: 0 }}>
                      <Box sx={{ p: 4 }}>
                        <Grid container spacing={3}>
                          
                          { children }
                      
                        </Grid>
                      </Box>
                    </DialogContent>
                    
                    <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                      <Button 
                        onClick={openDialog} 
                        startIcon={<Close />}
                        sx={{ borderRadius: 2, px: 3 }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        startIcon={<Save />} 
                        variant="contained" 
                        disabled={processing}
                        sx={{ 
                          borderRadius: 2, 
                          px: 3,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        {submit}
                      </Button>
                    </DialogActions>
                  </Dialog>
        
    )
}
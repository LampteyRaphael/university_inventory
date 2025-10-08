import { AddCircleOutline, Close, CloudUpload, Download, Inventory, TrendingUp } from "@mui/icons-material";
import { Avatar, Box, Button, Chip, Grid, Typography, alpha, useTheme } from "@mui/material";

export default function Header({ 
  onClick, 
  handleCreate, 
  handleImport, 
  handleExport, 
  label, 
  header_text, 
  body_text, 
  icon,
  stats,
  trend
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 3,
        background: `
          linear-gradient(135deg, 
            rgba(255,255,255,0.95) 0%, 
            rgba(248,250,255,0.98) 50%,
            rgba(255,255,255,0.90) 100%
          )
        `,
        boxShadow: `
          0 8px 32px rgba(0,0,0,0.08),
          0 2px 8px rgba(0,0,0,0.04),
          inset 0 1px 0 rgba(255,255,255,0.8)
        `,
        border: '1px solid rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px) saturate(180%)',
        position: 'relative',
        overflow: 'hidden',
        
        // Main gradient border
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          zIndex: 1,
        },
        
        // Animated accent border
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
          animation: 'shimmer 3s ease-in-out infinite',
          zIndex: 2,
        },
        
        // Decorative background elements
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.04) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.03) 0%, transparent 50%),
          linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)
        `,
        
        // Animations
        '@keyframes pulse': {
          '0%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      }}
    >
      {/* Floating background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.06) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite 1s',
        }}
      />

      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        {/* Left Section - Title and Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: `
                  linear-gradient(135deg, 
                    rgba(102, 126, 234, 0.9) 0%, 
                    rgba(118, 75, 162, 0.9) 50%, 
                    rgba(240, 147, 251, 0.9) 100%
                  )
                `,
                boxShadow: `
                  0 8px 32px rgba(102, 126, 234, 0.3),
                  0 4px 16px rgba(118, 75, 162, 0.2),
                  inset 0 1px 0 rgba(255,255,255,0.3)
                `,
                backdropFilter: 'blur(10px)',
                animation: 'float 4s ease-in-out infinite',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05) rotate(5deg)',
                  boxShadow: `
                    0 12px 40px rgba(102, 126, 234, 0.4),
                    0 6px 20px rgba(118, 75, 162, 0.3)
                  `,
                },
              }}
            >
              {icon}
            </Avatar>
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h4" 
                fontWeight={800}
                sx={{
                  background: `
                    linear-gradient(135deg, 
                      #2D3748 0%, 
                      #4A5568 30%, 
                      #667eea 70%, 
                      #764ba2 100%
                    )
                  `,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 4s ease infinite',
                  mb: 1,
                  '@keyframes gradientShift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                  },
                }}
              >
                {header_text}
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  fontWeight: 500,
                  mb: 2,
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    background: `
                      linear-gradient(135deg, 
                        #10b981 0%, 
                        #059669 100%
                      )
                    `,
                    animation: 'pulse 2s ease-in-out infinite',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)',
                  }} 
                />
                {body_text}
              </Typography>
              
              {onClick && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Chip
                    label={label}
                    size="medium"
                    sx={{ 
                      fontWeight: 700,
                      background: `
                        linear-gradient(135deg, 
                          #10b981 0%, 
                          #059669 50%, 
                          #047857 100%
                        )
                      `,
                      color: 'white',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                      },
                    }}
                  />
                  <Button
                    size="small"
                    onClick={onClick}
                    endIcon={<Close />}
                    sx={{ 
                      minWidth: 'auto', 
                      px: 2,
                      py: 0.8,
                      borderRadius: 2,
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: 'error.main',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        background: 'rgba(239, 68, 68, 0.15)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                      }
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Right Section - Buttons */}
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
                size="large"
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3.5,
                  py: 1.5,
                  background: `
                    linear-gradient(135deg, 
                      #667eea 0%, 
                      #764ba2 50%, 
                      #f093fb 100%
                    )
                  `,
                  boxShadow: `
                    0 8px 32px rgba(102, 126, 234, 0.3),
                    0 4px 16px rgba(118, 75, 162, 0.2)
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `
                      0 12px 40px rgba(102, 126, 234, 0.4),
                      0 6px 20px rgba(118, 75, 162, 0.3)
                    `,
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                New Item
              </Button>
            </Grid>
            
            <Grid>
              <Button
                size="large"
                startIcon={<CloudUpload />}
                component="label"
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  border: '2px solid',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: 'primary.main',
                  background: 'rgba(102, 126, 234, 0.05)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    color: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)'
                  },
                }}
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
                size="large"
                startIcon={<Download />}
                onClick={handleExport}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  border: '2px solid',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  color: 'success.main',
                  background: 'rgba(16, 185, 129, 0.05)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'success.main',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: 'success.main',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.15)'
                  },
                }}
              >
                Export
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
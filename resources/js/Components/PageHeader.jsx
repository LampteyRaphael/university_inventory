import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Grid,
  alpha,
} from '@mui/material';
import { Close as CloseIcon, TrendingUp } from '@mui/icons-material';

const PageHeader = ({
  title,
  subtitle,
  icon,
  actionButtons = [],
  searchText = '',
  onSearchClear,
  filteredCount,
  totalCount,
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  trend,
}) => {
  return (
    <Box
      sx={{
        mb: 4,
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        background: `
          radial-gradient(ellipse at top right, ${alpha('#667eea', 0.02)} 0%, transparent 60%),
          radial-gradient(ellipse at bottom left, ${alpha('#764ba2', 0.02)} 0%, transparent 60%),
          linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,255,0.98) 100%)
        `,
        boxShadow: `
          0 2px 4px -1px rgba(0,0,0,0.02),
          0 4px 8px -2px rgba(0,0,0,0.04),
          0 8px 16px -4px rgba(0,0,0,0.06)
        `,
        border: '1px solid',
        borderColor: alpha('#e2e8f0', 0.6),
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${alpha('#667eea', 0.2)} 50%, transparent 100%)`,
        }
      }}
    >
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        {/* Left Section - Title and Info */}
        <Grid size={{ xs: 12, md: actionButtons.length > 0 ? 7 : 12 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                background: gradient,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                borderRadius: 2,
                flexShrink: 0,
                '& > svg': {
                  fontSize: 28,
                }
              }}
            >
              {icon}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}> {/* minWidth: 0 prevents overflow */}
              {/* Title Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                <Typography 
                  variant="h5" 
                  fontWeight={800}
                  sx={{
                    color: 'text.primary',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                  }}
                >
                  {title}
                </Typography>
                
                {trend && (
                  <Chip
                    icon={<TrendingUp sx={{ fontSize: 14 }} />}
                    label={trend}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      background: `linear-gradient(135deg, ${alpha('#10b981', 0.9)} 0%, ${alpha('#059669', 0.9)} 100%)`,
                      color: 'white',
                      height: 24,
                      '& .MuiChip-icon': {
                        color: 'white !important',
                        fontSize: '14px !important'
                      }
                    }}
                  />
                )}
              </Box>
              
              {/* Subtitle */}
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  lineHeight: 1.5,
                  mb: 2,
                  wordBreak: 'break-word',
                }}
              >
                {subtitle}
              </Typography>
              
              {/* Stats and Search Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {/* Total Count */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" fontWeight={500} color="text.primary">
                    {totalCount} total items
                  </Typography>
                </Box>

                {/* Search Results */}
                {searchText && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`${filteredCount} results`}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        background: `linear-gradient(135deg, ${alpha('#667eea', 0.9)} 0%, ${alpha('#764ba2', 0.9)} 100%)`,
                        color: 'white',
                        height: 24,
                      }}
                    />
                    <Button
                      size="small"
                      onClick={onSearchClear}
                      startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                      sx={{
                        minWidth: 'auto',
                        px: 1,
                        py: 0.25,
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        fontWeight: 500,
                        borderRadius: 1,
                        backgroundColor: alpha('#64748b', 0.04),
                        '&:hover': {
                          color: 'error.main',
                          backgroundColor: alpha('#ef4444', 0.04),
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Clear
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right Section - Action Buttons */}
        {actionButtons.length > 0 && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                flexWrap: 'wrap',
              }}
            >
              {actionButtons.map((button, index) => (
                <Box
                  key={index}
                  sx={{
                    '& .MuiButton-root': {
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      px: 2,
                      py: 1,
                      minHeight: '40px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                      }
                    }
                  }}
                >
                  {button}
                </Box>
              ))}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default PageHeader;
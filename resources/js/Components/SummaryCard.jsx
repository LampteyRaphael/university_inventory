import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Stack,
  Box,
  alpha,
} from '@mui/material';
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

const SummaryCard = ({ 
  title, 
  value, 
  icon, 
  color = '#667eea', 
  subtitle, 
  trend, 
  percentage, 
  onClick 
}) => {
  return (
    <Card 
      onClick={onClick}
      sx={{
        borderRadius: 3,
        p: 2.5,
        background: `linear-gradient(135deg, ${alpha(color, 0.03)} 0%, ${alpha(color, 0.08)} 100%)`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        border: `1px solid ${alpha(color, 0.1)}`,
        backdropFilter: 'blur(10px)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.8)})`,
        },
        '&:hover': onClick ? {
          transform: 'translateY(-6px)',
          boxShadow: `0 12px 40px ${alpha(color, 0.15)}`,
          '&::before': {
            transform: 'scaleX(1)',
          },
          '& .summary-avatar': {
            transform: 'scale(1.1) rotate(5deg)',
            boxShadow: `0 8px 32px ${alpha(color, 0.4)}`,
          }
        } : {},
      }}
    >
      <CardContent sx={{ p: '0 !important' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight={600}
                sx={{
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                }}
              >
                {title}
              </Typography>
              
              {trend && (
                <Chip 
                  label={trend} 
                  size="small" 
                  color={percentage >= 0 ? 'success' : 'error'}
                  variant="filled"
                  sx={{ 
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                />
              )}
            </Stack>
            
            <Typography 
              variant="h3" 
              fontWeight={800}
              sx={{
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
                lineHeight: 1.1,
                filter: 'brightness(1.1)',
              }}
            >
              {value}
            </Typography>
            
            {subtitle && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: 'block',
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </Typography>
            )}
            
            {percentage !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5 }}>
                {percentage >= 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                )}
                <Typography 
                  variant="caption" 
                  fontWeight={700} 
                  color={percentage >= 0 ? '#10b981' : '#ef4444'}
                >
                  {percentage >= 0 ? '+' : ''}{percentage}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  from last period
                </Typography>
              </Stack>
            )}
          </Box>
          
          <Avatar 
            className="summary-avatar"
            sx={{ 
              bgcolor: alpha(color, 0.15), 
              color: color,
              width: 56,
              height: 56,
              borderRadius: 2.5,
              boxShadow: `0 4px 20px ${alpha(color, 0.2)}`,
              transition: 'all 0.3s ease',
            }}
          >
            {icon}
          </Avatar>
        </Stack>
        
        <Box 
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(color, 0.05)} 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
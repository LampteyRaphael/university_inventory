import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Stack,
  Box,
  alpha,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';

const SummaryCard = ({ 
  title, 
  value, 
  icon, 
  color = '#667eea', 
  subtitle, 
  trend, 
  percentage, 
  onClick,
  chartData = [],
  status = 'normal',
  infoTooltip,
  compact = false,
  progress, // Add progress prop
  showProgress = false, // Control when to show progress
  showWave = true, // Control when to show wave
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  // Animate value on mount
  useEffect(() => {
    if (typeof value === 'number') {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  // Generate mock chart data if not provided
  const generateChartData = () => {
    if (chartData.length > 0) return chartData;
    
    return Array.from({ length: 7 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: Math.random() * 100 + 50,
    }));
  };

  const chartDataPoints = generateChartData();
  const isPositive = percentage >= 0;
  const statusConfig = {
    normal: { color, icon: TrendingUpIcon },
    warning: { color: '#f59e0b', icon: TrendingUpIcon },
    critical: { color: '#ef4444', icon: TrendingDownIcon },
    success: { color: '#10b981', icon: TrendingUpIcon },
  }[status];

  const currentConfig = statusConfig || { color, icon: isPositive ? TrendingUpIcon : TrendingDownIcon };

  return (
    <Card 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: 4,
        p: compact ? 2 : 3,
        background: `
          linear-gradient(135deg, ${alpha(currentConfig.color, 0.03)} 0%, ${alpha(currentConfig.color, 0.08)} 100%),
          radial-gradient(circle at top right, ${alpha(currentConfig.color, 0.05)} 0%, transparent 50%),
          radial-gradient(circle at bottom left, ${alpha(currentConfig.color, 0.03)} 0%, transparent 50%)
        `,
        boxShadow: isHovered && onClick 
          ? `0 32px 64px -12px ${alpha(currentConfig.color, 0.25)}, 0 4px 24px -4px ${alpha(currentConfig.color, 0.1)}`
          : '0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 4px -1px rgba(0,0,0,0.04)',
        border: `1px solid ${alpha(currentConfig.color, 0.15)}`,
        backdropFilter: 'blur(20px)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered && onClick ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${currentConfig.color} 0%, ${alpha(currentConfig.color, 0.7)} 50%, ${currentConfig.color}00 100%)`,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0.8)',
          transformOrigin: 'left center',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(currentConfig.color, 0.08)} 0%, transparent 70%)`,
          animation: 'float 8s ease-in-out infinite',
          opacity: isHovered ? 0.8 : 0.4,
          transition: 'opacity 0.3s ease',
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: -20,
          left: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(currentConfig.color, 0.06)} 0%, transparent 70%)`,
          animation: 'float 6s ease-in-out infinite 2s',
          opacity: isHovered ? 0.6 : 0.3,
          transition: 'opacity 0.3s ease',
        }}
      />

      <CardContent sx={{ p: '0 !important', position: 'relative', zIndex: 2 }}>
        {/* Header Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: compact ? 1.5 : 2 }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={600}
                sx={{
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.8px',
                  opacity: 0.8,
                }}
              >
                {title}
              </Typography>
              
              {infoTooltip && (
                <Tooltip title={infoTooltip} arrow>
                  <InfoIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                </Tooltip>
              )}
            </Stack>
            
            {trend && (
              <Chip 
                label={trend} 
                size="small" 
                color={isPositive ? 'success' : 'error'}
                variant="filled"
                sx={{ 
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  boxShadow: `0 2px 8px ${alpha(isPositive ? '#10b981' : '#ef4444', 0.3)}`,
                }}
              />
            )}
          </Box>
          
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Main Value Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={2} sx={{ mb: compact ? 1.5 : 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant={compact ? "h4" : "h2"}
              fontWeight={800}
              sx={{
                background: `linear-gradient(135deg, ${currentConfig.color} 0%, ${alpha(currentConfig.color, 0.8)} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                mb: 0.5,
                filter: 'brightness(1.1)',
              }}
            >
              {typeof value === 'number' ? animatedValue.toLocaleString() : value}
            </Typography>
            
            {subtitle && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: 'block',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  opacity: 0.8,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          
          <Avatar 
            sx={{ 
              bgcolor: alpha(currentConfig.color, 0.15), 
              color: currentConfig.color,
              width: compact ? 48 : 56,
              height: compact ? 48 : 56,
              borderRadius: 3,
              boxShadow: `0 8px 32px ${alpha(currentConfig.color, 0.3)}`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'scale(1.1) rotate(8deg)' : 'scale(1) rotate(0deg)',
              '& > svg': {
                fontSize: compact ? 20 : 24,
              }
            }}
          >
            {icon}
          </Avatar>
        </Stack>

        {/* Wave Animation Section */}
        {!compact && showWave && (
          <Box sx={{ width: '100%', height: 60, mb: 2, position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  ${alpha(currentConfig.color, 0.1)} 2px,
                  ${alpha(currentConfig.color, 0.1)} 4px
                )`,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: `linear-gradient(90deg, ${alpha(currentConfig.color, 0.3)} 0%, ${alpha(currentConfig.color, 0.1)} 100%)`,
                maskImage: `url("data:image/svg+xml,%3Csvg width='100' height='40' viewBox='0 0 100 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q 25 10, 50 20 T 100 20 L 100 40 L 0 40 Z' fill='black'/%3E%3C/svg%3E")`,
                maskSize: '100% 100%',
                animation: 'wave 3s ease-in-out infinite',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60%',
                background: `linear-gradient(90deg, ${currentConfig.color} 0%, ${alpha(currentConfig.color, 0.6)} 100%)`,
                maskImage: `url("data:image/svg+xml,%3Csvg width='100' height='40' viewBox='0 0 100 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q 25 20, 50 30 T 100 30 L 100 40 L 0 40 Z' fill='black'/%3E%3C/svg%3E")`,
                maskSize: '100% 100%',
                animation: 'wave 4s ease-in-out infinite 0.5s',
              }}
            />
          </Box>
        )}

        {/* Progress Bar Section */}
        {!compact && showProgress && progress !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Utilization
              </Typography>
              <Typography variant="caption" fontWeight={700} color={currentConfig.color}>
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: alpha(currentConfig.color, 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${currentConfig.color} 0%, ${alpha(currentConfig.color, 0.8)} 100%)`,
                  transition: 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }
              }}
            />
          </Box>
        )}

        {/* Footer Section */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {percentage !== undefined && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: alpha(isPositive ? '#10b981' : '#ef4444', 0.1),
                  color: isPositive ? '#10b981' : '#ef4444',
                }}
              >
                {isPositive ? (
                  <TrendingUpIcon sx={{ fontSize: 14 }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 14 }} />
                )}
              </Box>
              <Typography 
                variant="caption" 
                fontWeight={700} 
                color={isPositive ? '#10b981' : '#ef4444'}
              >
                {isPositive ? '+' : ''}{percentage}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                vs last period
              </Typography>
            </Stack>
          )}
          
          {/* Status Indicator */}
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: currentConfig.color,
              boxShadow: `0 0 12px ${alpha(currentConfig.color, 0.5)}`,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </Stack>
      </CardContent>

      {/* Global animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-10px); }
        }
      `}</style>
    </Card>
  );
};

export default SummaryCard;

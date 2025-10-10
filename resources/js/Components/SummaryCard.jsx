import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
  LinearProgress,
  Skeleton,
  useTheme,
  Chip,
} from '@mui/material';
import { keyframes } from '@emotion/react';

// Animations (same as dashboard)
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

// Safe change prop check
const getChangeColor = (change) => {
  if (!change) return { bgcolor: 'grey.light', color: 'grey.dark' };
  
  const isPositive = change.toString().startsWith('+');
  return {
    bgcolor: isPositive ? 'success.light' : 'error.light',
    color: isPositive ? 'success.dark' : 'error.dark'
  };
};

const SummaryCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  change, 
  loading = false,
  dataType = 'inventory',
  animationDelay = '0s'
}) => {
  const theme = useTheme();
  const changeColors = getChangeColor(change);
  
  if (dataType === 'stockLevel') {
    // Status Card Design (Second Row) - Using the same pattern but with status card styling
    return (
      <Card
        sx={{
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.3s',
          animation: `${fadeIn} 0.6s ease-in`,
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: alpha(color, 0.1),
                color: color,
                mr: 2,
                animation: `${pulse} 2s infinite`,
              }}
            >
              {icon}
            </Box>
            <Box>
              {loading ? (
                <Skeleton variant="rectangular" width={60} height={32} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {value}
                </Typography>
              )}
              {loading ? (
                <Skeleton variant="text" width={80} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {title}
                </Typography>
              )}
            </Box>
          </Box>
          {loading ? (
            <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
          ) : (
            <LinearProgress
              variant="determinate"
              value={Math.min(Number(value) || 0, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                background: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
                },
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  // Metric Card Design (First Row) - Exact same pattern as MetricCard
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        animation: `${slideIn} 0.5s ease-in ${animationDelay}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)}, ${alpha(color, 0.2)})`,
        border: `1px solid ${alpha(color, 0.2)}`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 12px 20px -5px ${alpha(color, 0.3)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(color, 0.1),
            color: color,
          }}
        >
          {icon}
        </Box>
        {loading ? (
          <>
            <Skeleton variant="rectangular" width={100} height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={120} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width={60} height={24} />
          </>
        ) : (
          <>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            {change && (
              <Chip
                label={change}
                size="small"
                sx={{
                  bgcolor: changeColors.bgcolor,
                  color: changeColors.color,
                  fontWeight: 'bold',
                }}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
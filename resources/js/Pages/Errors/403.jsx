import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  useTheme
} from '@mui/material';
import {
  Security as SecurityIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link, usePage } from '@inertiajs/react';

export default function AccessDenied() {
  const theme = useTheme();
  const { auth } = usePage().props;

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            maxWidth: 500,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'error.light',
              color: 'error.main',
              mx: 'auto',
              mb: 3
            }}
          >
            <SecurityIcon sx={{ fontSize: 40 }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 2
            }}
          >
            403
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              mb: 2
            }}
          >
            Access Denied
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            You don't have permission to access this page. 
            {auth.user ? (
              <>
                <br />
                Your role: <strong>{auth.user.role || 'No role assigned'}</strong>
              </>
            ) : (
              ' Please contact your administrator for access.'
            )}
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href={window.history.length > 1 ? 'javascript:history.back()' : '/dashboard'}
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              size="large"
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Go Back
            </Button>

            <Button
              component={Link}
              href="/dashboard"
              variant="contained"
              startIcon={<HomeIcon />}
              size="large"
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${theme.palette.primary.main}40`
                },
                transition: 'all 0.3s ease'
              }}
            >
              Go to Dashboard
            </Button>
          </Box>

          {/* Additional Help */}
          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary">
              Need help? Contact your system administrator or IT support team.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
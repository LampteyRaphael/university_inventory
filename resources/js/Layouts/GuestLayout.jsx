import { Link, Head } from "@inertiajs/react";
import { 
  Button, 
  Typography, 
  Box, 
  Container, 
  Stack, 
  Card,
  AppBar,
  Toolbar,
  LinearProgress
} from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import InventoryIcon from "@mui/icons-material/Inventory";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useState, useEffect } from "react";



export default function GuestLayout({ children })  {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading for demonstration
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <>
      <Head title="University Inventory Management System" />
      
      {/* Loading Progress Bar */}
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 9999,
            height: 3,
            backgroundColor: 'transparent',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#1976d2',
            }
          }} 
        />
      )}
      
      {/* Animated background with particles */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        //   zIndex: -1,
          backgroundImage: "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.85) 0%, rgba(13, 71, 161, 0.9) 100%)',
          }
        }}
      >
        {/* Animated particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.5)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </Box>
      
      {/* Header/Navigation Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: 'text.primary',
          py: 1,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
            </motion.div>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Inventory System
            </Typography>
            
            
              <Stack direction="row" spacing={2}>
                <Button 
                  color="primary"
                  component={Link}
                  href="/login"
                  onClick={() => setLoading(true)}
                  startIcon={<LoginIcon />}
                >
                  Sign In
                </Button>
                <Button 
                  color="primary" 
                  variant="contained"
                  component={Link}
                  href="/register"
                  onClick={() => setLoading(true)}
                  startIcon={<PersonAddIcon />}
                >
                  Register
                </Button>
              </Stack>
        
          </Toolbar>
        </Container>
      </AppBar>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          py: 8,
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 4,
            }}
          >
            {/* Left side - Welcome text */}
            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h2"
                  fontWeight="bold"
                  color="white"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    mb: 3,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  University Inventory Management System
                </Typography>
                <Typography
                  variant="h5"
                  color="rgba(255, 255, 255, 0.9)"
                  paragraph
                  sx={{ mb: 4 }}
                >
                  Streamline your institution's asset tracking with our comprehensive inventory management solution designed for higher education.
                </Typography>
                
                <Stack 
                  direction={{ xs: "column", sm: "row" }} 
                  spacing={2}
                  sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    component={Link}
                    href={"/login"}
                    onClick={() => setLoading(true)}
                    startIcon={<InventoryIcon />}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      }
                    }}
                  >
                    {"Get Started"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    component={Link}
                    href="/features"
                    onClick={() => setLoading(true)}
                    sx={{ 
                      px: 4, 
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
              </motion.div>
            </Box>

            {/* Right side - Login card */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <Card
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    maxWidth: 400,
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                   {children}
                </Card>
              </motion.div>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features section */}
      <Box sx={{ py: 8, bgcolor: 'rgba(255, 255, 255, 0.95)', position: 'relative' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" textAlign="center" fontWeight="bold" color="primary" gutterBottom>
              System Features
            </Typography>
            <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
              Our comprehensive inventory management solution designed specifically for higher education institutions
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {[
                { title: 'Asset Tracking', description: 'Monitor equipment across departments and locations' },
                { title: 'Maintenance Scheduling', description: 'Plan and track regular maintenance activities' },
                { title: 'Reporting & Analytics', description: 'Generate detailed reports on asset utilization' },
                { title: 'Barcode Integration', description: 'Efficiently manage items with barcode scanning' },
                { title: 'User Management', description: 'Role-based access control for different staff levels' },
                { title: 'Purchase Order Tracking', description: 'Monitor orders from request to delivery' },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    sx={{ 
                      p: 3, 
                      width: { xs: '100%', sm: 280 }, 
                      textAlign: 'center',
                      borderRadius: 3,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <Box sx={{ width: 50, height: 50, bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                      <InventoryIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h6" gutterBottom>{feature.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{feature.description}</Typography>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" textAlign="center">
            © {new Date().getFullYear()} University Inventory Management System. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
}

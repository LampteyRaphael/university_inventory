// // import React, { useEffect, useState, useRef } from "react";
// // import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// // import {
// //   Box,
// //   Chip,
// //   Typography,
// //   TextField,
// //   Button,
// //   Stack,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   FormControl,
// //   InputLabel,
// //   Select,
// //   MenuItem,
// //   Alert,
// //   Card,
// //   CardContent,
// //   Grid,
// //   IconButton,
// //   Slide,
// //   Fade,
// //   Zoom,
// //   Tooltip,
// //   Avatar,
// //   LinearProgress,
// //   InputAdornment,
// //   FormHelperText,
// //   Switch,
// //   FormControlLabel,
// //   CircularProgress,
// //   alpha,
// // } from "@mui/material";
// // import { DataGrid } from "@mui/x-data-grid";
// // import * as XLSX from "xlsx";
// // import { keyframes } from "@emotion/react";
// // import moment from "moment";
// // import { useForm, router, usePage } from "@inertiajs/react";
// // import {
// //   UploadFile as UploadFileIcon,
// //   Add as AddIcon,
// //   Save as SaveIcon,
// //   Close as CloseIcon,
// //   Delete as DeleteIcon,
// //   Edit as EditIcon,
// //   Refresh as RefreshIcon,
// //   Inventory as InventoryIcon,
// //   Summarize as SummarizeIcon,
// //   Search as SearchIcon,
// //   Build as BuildIcon,
// //   Numbers as NumbersIcon,
// //   Home as HomeIcon,
// //   AddCircleOutline,
// //   CloudUpload,
// //   Download,
// //   School as SchoolIcon,
// //   Image as ImageIcon,
// //   AccountTree as AccountTreeIcon,
// // } from "@mui/icons-material";
// // import Notification from "@/Components/Notification";

// // // Animation keyframes
// // const fadeIn = keyframes`
// //   from { opacity: 0; transform: translateY(20px); }
// //   to { opacity: 1; transform: translateY(0); }
// // `;

// // const pulse = keyframes`
// //   0% { transform: scale(1); }
// //   50% { transform: scale(1.05); }
// //   100% { transform: scale(1); }
// // `;

// // export default function ItemCategories({ categories=[], auth, filters: initialFilters = {}, universities  }) {

// //   // Use Inertia's form handling with all fields from migration

// //   const handleRefresh = () => {
// //     router.reload({ preserveScroll: true });
// //   };

// //   useEffect(() => {
// //     if (flash?.success) {
// //       showAlert(flash.success, "success");
// //     }

// //     if (flash?.error) {
// //       showAlert(flash.error, "error");
// //     }
// //   }, [flash]);

// //   const handleCloseAlert = () => {
// //     setAlert((prev) => ({ ...prev, open: false }));
// //   };

// //   const SummaryCard = ({ title, value, icon, color = '#667eea', subtitle, trend, percentage, onClick }) => {
    
// //     return (
// //       <Card 
// //         onClick={onClick}
// //         sx={{
// //           borderRadius: 3,
// //           p: 2.5,
// //           background: `linear-gradient(135deg, ${alpha(color, 0.03)} 0%, ${alpha(color, 0.08)} 100%)`,
// //           boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
// //           border: `1px solid ${alpha(color, 0.1)}`,
// //           backdropFilter: 'blur(10px)',
// //           cursor: onClick ? 'pointer' : 'default',
// //           position: 'relative',
// //           overflow: 'hidden',
// //           transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
// //         '&::before': {
// //           content: '""',
// //           position: 'absolute',
// //           top: 0,
// //           left: 0,
// //           right: 0,
// //           height: 4,
// //           background: `linear-gradient(90deg, ${color}, ${color}80)`,
// //         },
          
// //           '&:hover': {
// //             transform: 'translateY(-6px)',
// //             boxShadow: `0 12px 40px ${alpha(color, 0.15)}`,
// //             '&::before': {
// //               transform: 'scaleX(1)',
// //             },
// //             '& .summary-avatar': {
// //               transform: 'scale(1.1) rotate(5deg)',
// //               boxShadow: `0 8px 32px ${alpha(color, 0.4)}`,
// //             }
// //           },
// //         }}
// //       >
// //         <CardContent sx={{ p: '0 !important' }}>
// //           <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
// //             <Box sx={{ flex: 1 }}>
// //               {/* Header with title and trend */}
// //               <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
// //                 <Typography 
// //                   variant="body2" 
// //                   color="text.secondary" 
// //                   fontWeight={600}
// //                   sx={{
// //                     textTransform: 'uppercase',
// //                     fontSize: '0.75rem',
// //                     letterSpacing: '0.5px',
// //                   }}
// //                 >
// //                   {title}
// //                 </Typography>
                
// //                 {trend && (
// //                   <Chip 
// //                     label={trend} 
// //                     size="small" 
// //                     color={percentage >= 0 ? 'success' : 'error'}
// //                     variant="filled"
// //                     sx={{ 
// //                       height: 20,
// //                       fontSize: '0.65rem',
// //                       fontWeight: 700,
// //                     }}
// //                   />
// //                 )}
// //               </Stack>
              
// //               {/* Main value */}
// //               <Typography 
// //                 variant="h3" 
// //                 fontWeight={800}
// //                 sx={{
// //                   background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
// //                   backgroundClip: 'text',
// //                   WebkitBackgroundClip: 'text',
// //                   WebkitTextFillColor: 'transparent',
// //                   mb: 0.5,
// //                   lineHeight: 1.1,
// //                   filter: 'brightness(1.1)',
// //                 }}
// //               >
// //                 {value}
// //               </Typography>
              
// //               {/* Subtitle */}
// //               {subtitle && (
// //                 <Typography 
// //                   variant="caption" 
// //                   color="text.secondary" 
// //                   sx={{ 
// //                     display: 'block',
// //                     fontWeight: 500,
// //                     lineHeight: 1.4,
// //                   }}
// //                 >
// //                   {subtitle}
// //                 </Typography>
// //               )}
              
// //               {/* Percentage change */}
// //               {percentage !== undefined && (
// //                 <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5 }}>
// //                   {percentage >= 0 ? (
// //                     <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
// //                   ) : (
// //                     <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />
// //                   )}
// //                   <Typography 
// //                     variant="caption" 
// //                     fontWeight={700} 
// //                     color={percentage >= 0 ? '#10b981' : '#ef4444'}
// //                   >
// //                     {percentage >= 0 ? '+' : ''}{percentage}%
// //                   </Typography>
// //                   <Typography variant="caption" color="text.secondary">
// //                     from last period
// //                   </Typography>
// //                 </Stack>
// //               )}
// //             </Box>
            
// //             {/* Icon */}
// //             <Avatar 
// //               className="summary-avatar"
// //               sx={{ 
// //                 bgcolor: alpha(color, 0.15), 
// //                 color: color,
// //                 width: 56,
// //                 height: 56,
// //                 borderRadius: 2.5,
// //                 boxShadow: `0 4px 20px ${alpha(color, 0.2)}`,
// //                 transition: 'all 0.3s ease',
// //               }}
// //             >
// //               {icon}
// //             </Avatar>
// //           </Stack>
          
// //           {/* Decorative elements */}
// //           <Box 
// //             sx={{
// //               position: 'absolute',
// //               top: -10,
// //               right: -10,
// //               width: 80,
// //               height: 80,
// //               borderRadius: '50%',
// //               background: `radial-gradient(circle, ${alpha(color, 0.05)} 0%, transparent 70%)`,
// //               zIndex: 0,
// //             }}
// //           />
// //         </CardContent>
// //       </Card>
// //     );
// //   };

// //   return (
// //     <AuthenticatedLayout 
// //       auth={auth} 
// //       title="Item Categories"
// //       breadcrumbs={[
// //         { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> },
// //         { label: 'Item Categories' },
// //       ]}
// //     >
// //       <Fade in timeout={500}>
// //         <Box>
// //           <Notification 
// //             open={alert.open} 
// //             severity={alert.severity} 
// //             message={alert.message}
// //             onClose={handleCloseAlert}
// //           />
          
// //           {/* Header Section */}
// //           <Box
// //     sx={{
// //       mb: 4,
// //       p: 3,
// //       borderRadius: 3,
// //       background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.98) 100%)',
// //       boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
// //       border: '1px solid rgba(255,255,255,0.8)',
// //       backdropFilter: 'blur(10px)',
// //       position: 'relative',
// //       overflow: 'hidden',
// //       '&::before': {
// //         content: '""',
// //         position: 'absolute',
// //         top: 0,
// //         left: 0,
// //         right: 0,
// //         height: '4px',
// //         background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
// //       }
// //     }}
// //   >
// //     <Grid container spacing={2} alignItems="center" justifyContent="space-between">
// //       {/* Left Section - Title and Info */}
// //       <Grid size={{ xs: 12, md: 6 }}>
// //         <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
// //           <Avatar
// //             sx={{
// //               bgcolor: 'primary.main',
// //               width: 56,
// //               height: 56,
// //               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
// //               boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
// //             }}
// //           >
// //             <InventoryIcon sx={{ fontSize: 28 }} />
// //           </Avatar>
          
// //           <Box>
// //             <Typography 
// //               variant="h4" 
// //               fontWeight={800}
// //               sx={{
// //                 background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
// //                 backgroundClip: 'text',
// //                 WebkitBackgroundClip: 'text',
// //                 WebkitTextFillColor: 'transparent',
// //                 mb: 0.5
// //               }}
// //             >
// //               Item Categories
// //             </Typography>
            
// //             <Typography 
// //               variant="body1" 
// //               color="text.secondary" 
// //               sx={{ 
// //                 display: 'flex',
// //                 alignItems: 'center',
// //                 gap: 1,
// //                 fontWeight: 500
// //               }}
// //             >
// //               <Box 
// //                 component="span" 
// //                 sx={{ 
// //                   width: 6, 
// //                   height: 6, 
// //                   borderRadius: '50%', 
// //                   bgcolor: 'success.main',
// //                   animation: 'pulse 2s infinite'
// //                 }} 
// //               />
// //               Manage and organize your inventory categories with nested tree structure
// //             </Typography>
            
// //             {searchText && (
// //               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
// //                 <Chip
// //                   label={`${filteredRows.length} of ${rows.length} categories`}
// //                   size="small"
// //                   sx={{ 
// //                     fontWeight: 600,
// //                     background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
// //                     color: 'white',
// //                     boxShadow: '0 2px 12px rgba(16, 185, 129, 0.3)',
// //                   }}
// //                 />
// //                 <Button
// //                   size="small"
// //                   onClick={() => setSearchText('')}
// //                   endIcon={<Close />}
// //                   sx={{ 
// //                     minWidth: 'auto', 
// //                     px: 1,
// //                     color: 'text.secondary',
// //                     '&:hover': { 
// //                       color: 'error.main',
// //                       backgroundColor: 'rgba(239, 68, 68, 0.04)'
// //                     }
// //                   }}
// //                 >
// //                   Clear
// //                 </Button>
// //               </Box>
// //             )}
// //           </Box>
// //         </Box>
// //       </Grid>

// //       {/* Right Section - Buttons */}
// //       <Grid size={{ xs: 12, md: "auto" }}>
// //         <Grid
// //           container
// //           spacing={1.5}
// //           alignItems="center"
// //           justifyContent={{ xs: "flex-start", md: "flex-end" }}
// //           wrap="wrap"
// //         >
// //           <Grid>
// //             <Button
// //               variant="contained"
// //               startIcon={<AddCircleOutline />}
// //               onClick={handleCreate}
// //               size="medium"
// //               sx={{
// //                 borderRadius: 2.5,
// //                 textTransform: "none",
// //                 fontWeight: 700,
// //                 px: 3,
// //                 py: 1,
// //                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
// //                 boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
// //                 '&:hover': {
// //                   boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
// //                   transform: 'translateY(-1px)',
// //                 },
// //                 transition: 'all 0.3s ease'
// //               }}
// //             >
// //               New Category
// //             </Button>
// //           </Grid>
          
// //           <Grid>
// //             <Button
// //               size="medium"
// //               startIcon={<CloudUpload />}
// //               component="label"
// //               variant="outlined"
// //               sx={{
// //                 borderRadius: 2.5,
// //                 textTransform: "none",
// //                 fontWeight: 600,
// //                 px: 2.5,
// //                 py: 1,
// //                 border: '2px solid',
// //                 borderColor: 'grey.200',
// //                 color: 'text.primary',
// //                 '&:hover': {
// //                   borderColor: 'primary.main',
// //                   backgroundColor: 'rgba(102, 126, 234, 0.04)',
// //                   color: 'primary.main',
// //                   transform: 'translateY(-1px)',
// //                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
// //                 },
// //                 transition: 'all 0.3s ease'
// //               }}
// //             >
// //               Import
// //               <input
// //                 hidden
// //                 accept=".xlsx,.xls,.csv"
// //                 type="file"
// //                 onChange={handleUpload}
// //               />
// //             </Button>
// //           </Grid>
          
// //           <Grid>
// //             <Button
// //               size="medium"
// //               startIcon={<Download />}
// //               onClick={handleExport}
// //               variant="outlined"
// //               sx={{
// //                 borderRadius: 2.5,
// //                 textTransform: "none",
// //                 fontWeight: 600,
// //                 px: 2.5,
// //                 py: 1,
// //                 border: '2px solid',
// //                 borderColor: 'grey.200',
// //                 color: 'text.primary',
// //                 '&:hover': {
// //                   borderColor: 'success.main',
// //                   backgroundColor: 'rgba(16, 185, 129, 0.04)',
// //                   color: 'success.main',
// //                   transform: 'translateY(-1px)',
// //                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
// //                 },
// //                 transition: 'all 0.3s ease'
// //               }}
// //             >
// //               Export
// //             </Button>
// //           </Grid>
// //         </Grid>
// //       </Grid>
// //     </Grid>
// //           </Box>
          
// //           {/* Summary Cards */}
// //           <Grid container spacing={2}  sx={{ mb: 3 }}>
// //             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
// //               <SummaryCard 
// //                 title="Total Categories" 
// //                 value={totalCategories} 
// //                 icon={<InventoryIcon />} 
// //                 color="#2196f3" 
// //               />
// //             </Grid>
// //             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
// //               <SummaryCard 
// //                 title="Active Categories" 
// //                 value={activeCategories} 
// //                 icon={<SummarizeIcon />} 
// //                 color="#4caf50" 
// //               />
// //             </Grid>
// //             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
// //               <SummaryCard 
// //                 title="Need Maintenance" 
// //                 value={categoriesRequiringMaintenance} 
// //                 icon={<BuildIcon />} 
// //                 color="#ff9800" 
// //               />
// //             </Grid>
// //             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
// //               <SummaryCard 
// //                 title="With Images" 
// //                 value={categoriesWithImages} 
// //                 icon={<ImageIcon />} 
// //                 color="#9c27b0" 
// //               />
// //             </Grid>
// //           </Grid>

// //           {/* Data Grid */}
// //           <Box sx={{
// //             height: "100%",
// //             width: "100%",
// //             backgroundColor: "background.paper",
// //             borderRadius: 3,
// //             overflow: 'hidden',
// //             boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
// //             border: '1px solid rgba(255,255,255,0.8)',
// //             background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
// //             backdropFilter: 'blur(10px)',
// //             position: 'relative',
// //             '&::before': {
// //               content: '""',
// //               position: 'absolute',
// //               top: 0,
// //               left: 0,
// //               right: 0,
// //               height: '4px',
// //               background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
// //               zIndex: 2
// //             }
// //           }}>
// //             {/* Custom Header */}
// //             <Box sx={{
// //               display: "flex",
// //               alignItems: "center",
// //               justifyContent: "space-between",
// //               p: 3,
// //               borderBottom: '1px solid rgba(0,0,0,0.06)',
// //               backgroundColor: 'rgba(255,255,255,0.8)',
// //               backdropFilter: 'blur(10px)',
// //             }}>
// //               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
// //                 <Avatar
// //                   sx={{
// //                     bgcolor: 'primary.main',
// //                     width: 48,
// //                     height: 48,
// //                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
// //                     boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
// //                   }}
// //                 >
// //                   <AccountTreeIcon sx={{ fontSize: 24 }} />
// //                 </Avatar>
// //                 <Box>
// //                   <Typography 
// //                     variant="h5" 
// //                     fontWeight={800}
// //                     sx={{
// //                       background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
// //                       backgroundClip: 'text',
// //                       WebkitBackgroundClip: 'text',
// //                       WebkitTextFillColor: 'transparent',
// //                       mb: 0.5
// //                     }}
// //                   >
// //                     Category
// //                   </Typography>
// //                   <Typography 
// //                     variant="body2" 
// //                     color="text.secondary"
// //                     sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
// //                   >
// //                     <Box 
// //                       component="span" 
// //                       sx={{ 
// //                         width: 6, 
// //                         height: 6, 
// //                         borderRadius: '50%', 
// //                         bgcolor: 'success.main',
// //                       }} 
// //                     />
// //                     {/* Hierarchical view of your inventory categories */}
// //                   </Typography>
// //                 </Box>
// //               </Box>
              
// //               <Stack direction="row" spacing={1.5} alignItems="center">
// //                 <TextField
// //                   placeholder="Search categories..."
// //                   variant="outlined"
// //                   size="small"
// //                   value={searchText}
// //                   onChange={(e) => setSearchText(e.target.value)}
// //                   InputProps={{
// //                     startAdornment: (
// //                       <InputAdornment position="start">
// //                         <SearchIcon fontSize="small" color="primary" />
// //                       </InputAdornment>
// //                     ),
// //                     endAdornment: searchText && (
// //                       <InputAdornment position="end">
// //                         <IconButton 
// //                           size="small" 
// //                           onClick={() => setSearchText('')}
// //                           sx={{ color: 'text.secondary' }}
// //                         >
// //                           <Close fontSize="small" />
// //                         </IconButton>
// //                       </InputAdornment>
// //                     ),
// //                   }}
// //                   sx={{ 
// //                     width: 280,
// //                     '& .MuiOutlinedInput-root': {
// //                       borderRadius: 2,
// //                       backgroundColor: 'rgba(255,255,255,0.8)',
// //                       '&:hover': {
// //                         backgroundColor: 'rgba(255,255,255,0.9)',
// //                       }
// //                     }
// //                   }}
// //                 />
                
// //                 <Tooltip title="Refresh Data">
// //                   <IconButton 
// //                     color="primary" 
// //                     size="medium"
// //                     onClick={handleRefresh}
// //                     sx={{
// //                       backgroundColor: 'rgba(102, 126, 234, 0.1)',
// //                       '&:hover': {
// //                         backgroundColor: 'rgba(102, 126, 234, 0.2)',
// //                         transform: 'rotate(45deg)',
// //                       },
// //                       transition: 'all 0.3s ease'
// //                     }}
// //                   >
// //                     <RefreshIcon fontSize="small" />
// //                   </IconButton>
// //                 </Tooltip>
                
// //                 <Button
// //                   variant="contained"
// //                   startIcon={<AddIcon />}
// //                   color="primary"
// //                   onClick={handleCreate}
// //                   size="medium"
// //                   sx={{
// //                     borderRadius: 2.5,
// //                     textTransform: 'none',
// //                     fontWeight: 700,
// //                     px: 2.5,
// //                     py: 1,
// //                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
// //                     boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
// //                     '&:hover': {
// //                       boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
// //                       transform: 'translateY(-1px)',
// //                     },
// //                     transition: 'all 0.3s ease'
// //                   }}
// //                 >
// //                   New Category
// //                 </Button>
                
// //                 <Button
// //                   variant="outlined"
// //                   startIcon={<SaveIcon />}
// //                   color="success"
// //                   onClick={handleExport}
// //                   size="medium"
// //                   sx={{
// //                     borderRadius: 2.5,
// //                     textTransform: 'none',
// //                     fontWeight: 600,
// //                     px: 2,
// //                     py: 1,
// //                     border: '2px solid',
// //                     borderColor: 'success.light',
// //                     color: 'success.main',
// //                     '&:hover': {
// //                       backgroundColor: 'rgba(16, 185, 129, 0.04)',
// //                       borderColor: 'success.main',
// //                       transform: 'translateY(-1px)',
// //                     },
// //                     transition: 'all 0.3s ease'
// //                   }}
// //                 >
// //                   Export
// //                 </Button>
                
// //                 <Button
// //                   variant="outlined"
// //                   component="label"
// //                   startIcon={<UploadFileIcon />}
// //                   color="secondary"
// //                   size="medium"
// //                   sx={{
// //                     borderRadius: 2.5,
// //                     textTransform: 'none',
// //                     fontWeight: 600,
// //                     px: 2,
// //                     py: 1,
// //                     border: '2px solid',
// //                     borderColor: 'secondary.light',
// //                     color: 'secondary.main',
// //                     '&:hover': {
// //                       backgroundColor: 'rgba(168, 85, 247, 0.04)',
// //                       borderColor: 'secondary.main',
// //                       transform: 'translateY(-1px)',
// //                     },
// //                     transition: 'all 0.3s ease'
// //                   }}
// //                 >
// //                   Import
// //                   <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleUpload} />
// //                 </Button>
// //               </Stack>
// //             </Box>
            
// //             {/* Data Grid */}
// //               <Box sx={{ height: 'calc(100% - 100px)', position: 'relative' }}>
// //                 <DataGrid
// //                   rows={filteredRows}
// //                   columns={columns}
// //                   pageSizeOptions={[5, 10, 20, 50, 100]}
// //                   initialState={{
// //                     pagination: { paginationModel: { page: 0, pageSize: 10 } },
// //                     sorting: { sortModel: [{ field: 'lft', sort: 'asc' }] }
// //                   }}
// //                   sx={{
// //                     border: 'none',
// //                     '& .MuiDataGrid-cell': {
// //                       borderBottom: '1px solid rgba(0,0,0,0.06)',
// //                       py: 1.5,
// //                       fontSize: '0.875rem',
// //                     },
// //                     '& .MuiDataGrid-cell:focus': {
// //                       outline: 'none',
// //                     },
// //                     '& .MuiDataGrid-row': {
// //                       transition: 'all 0.2s ease',
// //                       '&:hover': {
// //                         backgroundColor: 'rgba(102, 126, 234, 0.04)',
// //                         transform: 'translateX(2px)',
// //                       },
// //                       '&.Mui-selected': {
// //                         backgroundColor: 'rgba(102, 126, 234, 0.08)',
// //                         '&:hover': {
// //                           backgroundColor: 'rgba(102, 126, 234, 0.12)',
// //                         }
// //                       }
// //                     },
// //                     '& .MuiDataGrid-columnHeaders': {
// //                       backgroundColor: 'rgba(248, 250, 252, 0.8)',
// //                       borderBottom: '2px solid rgba(0,0,0,0.08)',
// //                       fontSize: '0.875rem',
// //                       fontWeight: 700,
// //                     },
// //                     '& .MuiDataGrid-toolbarContainer': {
// //                       p: 2,
// //                       borderBottom: '1px solid rgba(0,0,0,0.06)',
// //                       backgroundColor: 'rgba(255,255,255,0.5)',
// //                     },
// //                     '& .MuiDataGrid-footerContainer': {
// //                       borderTop: '1px solid rgba(0,0,0,0.06)',
// //                       backgroundColor: 'rgba(248, 250, 252, 0.8)',
// //                     },
// //                   }}
// //                   loading={loading} // We handle loading manually
// //                 />
                
// //                 {/* Custom Loading Overlay */}
// //                 {gridLoading && (
// //                   <Box sx={{
// //                     position: 'absolute',
// //                     top: 0,
// //                     left: 0,
// //                     right: 0,
// //                     bottom: 0,
// //                     display: 'flex',
// //                     alignItems: 'center',
// //                     justifyContent: 'center',
// //                     background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,255,0.95) 100%)',
// //                     backdropFilter: 'blur(4px)',
// //                     zIndex: 1,
// //                     borderRadius: '0 0 12px 12px',
// //                   }}>
// //                     <Box sx={{ textAlign: 'center' }}>
// //                       <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                         <CircularProgress 
// //                           size={60} 
// //                           thickness={4}
// //                           sx={{
// //                             color: 'primary.main',
// //                             background: 'conic-gradient(rgba(102, 126, 234, 0.2) 0%, transparent 50%)',
// //                             borderRadius: '50%',
// //                           }}
// //                         />
// //                         <AccountTreeIcon 
// //                           sx={{ 
// //                             position: 'absolute',
// //                             top: '50%',
// //                             left: '50%',
// //                             transform: 'translate(-50%, -50%)',
// //                             fontSize: 24,
// //                             color: 'primary.main',
// //                             opacity: 0.8
// //                           }} 
// //                         />
// //                       </Box>
// //                       <Typography variant="h6" fontWeight={600} sx={{ mt: 2, color: 'text.primary' }}>
// //                         Loading Category Tree
// //                       </Typography>
// //                       <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
// //                         Building hierarchical structure...
// //                       </Typography>
// //                     </Box>
// //                   </Box>
// //                 )}
// //               </Box>
// //           </Box>

          
//           {/* Delete Confirmation Dialog */}

// //         </Box>
// //       </Fade>
// //     </AuthenticatedLayout>
// //   );
// // }
// import React, { useEffect, useState, useRef } from "react";
// import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// import {
//   Box,
//   Grid,
//   Fade,
//   Button,
// } from "@mui/material";
// import { useForm, router, usePage } from "@inertiajs/react";
// import {
//   AddCircleOutline,
//   CloudUpload,
//   Download,
//   Inventory as InventoryIcon,
//   Summarize as SummarizeIcon,
//   Build as BuildIcon,
//   Image as ImageIcon,
//   Home,
// } from "@mui/icons-material";
// import moment from "moment";

// // Import reusable components
// import Notification from "@/Components/Notification";
// import PageHeader from "@/Components/PageHeader";
// import SummaryCard from "@/Components/SummaryCard";
// import EnhancedDataGrid from "@/Components/EnhancedDataGrid";
// import CategoryDialog from "./CategoryDialog"; // You'll need to create this
// import DeleteDialog from "./DeleteDialog"; // You'll need to create this

// export default function ItemCategories({ categories = [], auth, filters: initialFilters = {}, universities }) {
//   const [rows, setRows] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [openCreateDialog, setOpenCreateDialog] = useState(false);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [selectedItem, setSelectedItem] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [gridLoading, setGridLoading] = useState(true);
//   const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

//   // ... rest of your state and form logic remains the same

//     const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
//     name: "",
//     description: "",
//     category_code: "",
//     university_id: "",
//     parent_category_id: "",
//     warranty_period_days: 0,
//     depreciation_rate: 0,
//     depreciation_method: "",
//     requires_serial_number: false,
//     requires_maintenance: false,
//     maintenance_interval_days: "",
//     specification_template: "",
//     image_url: "",
//     lft: "",
//     rgt: "",
//     depth: 0,
//     is_active: true
//   });

//   const { flash } = usePage().props;
//   const searchInputRef = useRef("");
  
//   useEffect(() => {
//     setGridLoading(true);
//     // console.log(categories)
//     const timer = setTimeout(() => {
//       const formattedRows = categories?.map((item, index) => ({
//         id: item?.category_id ?? index + 1,
//         ...item,
//         university_id: item?.university_id ?? "",
//         lft: item?.lft ?? "",
//         rgt: item?.rgt ?? "",
//         depth: item?.depth ?? 0,
//         image_url: item?.image_url ?? "",
//         warranty_period_days: item?.warranty_period_days ?? 0,
//         depreciation_rate: item?.depreciation_rate ?? 0,
//         depreciation_method:item?.depreciation_method??'',
//         requires_serial_number: item?.requires_serial_number ?? false,
//         requires_maintenance: item?.requires_maintenance ?? false,
//         requirement:item??"",
//         parent_category_id:item?.parent_category_id??'',
//         is_active: item?.is_active ?? true,
//         university: item?.university?.name,
//         created_at: item?.created_at ? moment(item.created_at).format("Do MMM YYYY h:mm") : "",
//         updated_at: item?.updated_at ? moment(item.updated_at).format("Do MMM YYYY h:mm") : "",
//       }));
//       setRows(formattedRows || []);
//       setGridLoading(false);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [categories]);

//   // Calculate summary statistics
//   // const totalCategories = rows.length;
//   // const activeCategories = rows.filter(row => row.is_active).length;
//   // const categoriesRequiringMaintenance = rows.filter(row => row.requires_maintenance).length;
//   // const categoriesRequiringSerial = rows.filter(row => row.requires_serial_number).length;
//   // const categoriesWithImages = rows.filter(row => row.image_url).length;

//   const columns = [
//     { 
//       field: "category_code", 
//       headerName: "CODE", 
//       width: 90,
//       renderCell: (params) => (
//         <Typography variant="body2" fontWeight="600" fontFamily="monospace">
//           {params.row.category_id}
//         </Typography>
//       )
//     },
//     { 
//       field: "name", 
//       headerName: "CATEGORY", 
//       width: 180,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           {params.row.image_url && (
//             <Avatar 
//               src={params.row.image_url || ""} 
//               sx={{ width: 32, height: 32 }}
//               variant="rounded"
//             >
//               <InventoryIcon />
//             </Avatar>
//           )}
//           <Box>
//             <Typography variant="body2" fontWeight="bold" noWrap>
//               {params.value}
//             </Typography>
//             <Typography variant="caption" color="text.secondary" noWrap>
//               {params.row.parent_category_name || "—"}
//             </Typography>
//           </Box>
//         </Box>
//       )
//     },
//     {
//       field: "university",
//       headerName: "UNIVERSITY",
//       width: 250,
//       renderCell: (params) => (
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//           <SchoolIcon fontSize="small" color="action" />
//           <Typography variant="caption">
//             {params.row.university_name || "—"}
//           </Typography>
//         </Box>
//       )
//     },
//     {
//       field: "items_count",
//       headerName: "ITEMS",
//       width: 80,
//       renderCell: (params) => (
//         <Typography variant="body2" fontWeight="500" textAlign="center">
//           {params.row.items_count || 0}
//         </Typography>
//       )
//     },
//     {
//       field: "depth",
//       headerName: "DEPTH",
//       width: 80,
//       renderCell: (params) => (
//         <Chip 
//           label={params.row.depth || 0} 
//           size="small" 
//           color={params.row.depth === 0 ? "primary" : "default"}
//           variant={params.row.depth === 0 ? "filled" : "outlined"}
//         />
//       )
//     },
//     {
//       field: "tree_position",
//       headerName: "TREE POS",
//       width: 100,
//       renderCell: (params) => (
//         <Box>
//           <Typography variant="caption" display="block">
//             L: {params.row.lft || 0}
//           </Typography>
//           <Typography variant="caption" display="block">
//             R: {params.row.rgt || 0}
//           </Typography>
//         </Box>
//       )
//     },
// {
//   field: "specifications",
//   headerName: "SPECS",
//   width: 350,
//   renderCell: (params) => (
//         <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
//           {/* First row: Quantity left, Unit cost right */}
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
//             <Typography variant="body2" fontWeight="bold">
//              Warranty 🛡️{params.row.warranty_period_days || 0}d
//             </Typography>
//             <Typography variant="body2" fontWeight="bold">
//               Depreciation 📉 {params.row.depreciation_rate || 0}%
//             </Typography>
//           </Box>
    
//           {/* Second row: Total value aligned to the right */}
//           <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
//             <Typography variant="caption" color="text.secondary">
//              Method 📊 {params.row.depreciation_method === 'straight_line' ? 'Straight Line' : 'Reducing Balance'}
//             </Typography>
//           </Box>
//         </Box>
//   )
// },
//     {
//       field: "requirement",
//       headerName: "REQS",
//       width: 100,
//       renderCell: (params) => (
//         <Box>
//           {params.row.requires_serial_number && (
//             <Typography variant="caption" display="block">📋 Serial: ✅ </Typography>
//           )}
//           {params.row.requires_maintenance && (
//             <Typography variant="caption" display="block">🔧 Maint: ✅ </Typography>
//           )}
//           {params.row.requires_calibration && (
//             <Typography variant="caption" display="block">⚖️ Calib:✅ </Typography>
//           )}
//         </Box>
//       )
//     },
//     {
//       field: "maintenance",
//       headerName: "MAINT",
//       width: 80,
//       renderCell: (params) => (
//         params.row.requires_maintenance ? (
//           <Typography variant="caption">
//             {params.row.maintenance_interval_days}d
//           </Typography>
//         ) : (
//           <Typography variant="caption" color="text.secondary">-</Typography>
//         )
//       )
//     },
//     {
//       field: "image",
//       headerName: "IMAGE",
//       width: 80,
//       renderCell: (params) => (
//         params.row.image_url ? (
//           <Avatar 
//             src={params.row.image_url} 
//             sx={{ width: 32, height: 32 }}
//             variant="rounded"
//           >
//             <ImageIcon />
//           </Avatar>
//         ) : (
//           <Typography variant="caption" color="text.secondary">No Image</Typography>
//         )
//       )
//     },
//     {
//       field: "updated_at",
//       headerName: "UPDATED",
//       width: 180,
//     },
//     {
//       field: "status",
//       headerName: "STATUS",
//       width: 90,
//       renderCell: (params) => (
//         params.row.is_active ? (
//           <Chip label="ACTIVE" color="success" size="small" />
//         ) : (
//           <Chip label="INACTIVE" color="error" size="small" />
//         )
//       )
//     },
//     {
//       field: "created_at",
//       headerName: "CREATED",
//       width: 180
//     },
//     {
//       field: "actions",
//       headerName: "ACTIONS",
//       width: 100,
//       sortable: false,
//       renderCell: (params) => (
//         <Stack direction="row" spacing={0.5}>
//           <Tooltip title="Edit Category">
//             <IconButton onClick={() => handleEdit(params.row)} size="small" color="primary">
//               <EditIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Delete Category">
//             <IconButton onClick={() => handleDeleteClick(params.row)} size="small" color="error">
//               <DeleteIcon fontSize="small" />
//             </IconButton>
//           </Tooltip>
//         </Stack>
//       ),
//     },
//   ];

//   // const filteredRows = rows.filter((row) => {
//   //   return (
//   //     row.name?.toLowerCase().includes(searchText.toLowerCase()) ||
//   //     row.category_code?.toLowerCase().includes(searchText.toLowerCase()) ||
//   //     row.description?.toLowerCase().includes(searchText.toLowerCase()) ||
//   //     row.university_name?.toLowerCase().includes(searchText.toLowerCase())
//   //   );
//   // });

//   const handleExport = () => {
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet(filteredRows);
//     XLSX.utils.book_append_sheet(wb, ws, "Item Categories");
//     XLSX.writeFile(wb, `ItemCategories_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
    
//     showAlert("Categories data exported successfully!", "success");
//   };

//   const handleUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setGridLoading(true);
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const uploadedData = XLSX.utils.sheet_to_json(sheet);
        
//         showAlert(`${uploadedData.length} categories imported successfully!`, "success");
//       } catch (error) {
//         showAlert("Error importing file", "error");
//       } finally {
//         setGridLoading(false);
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   };

//   const showAlert = (message, severity = "success") => {
//     setAlert({ open: true, message, severity });
//     setTimeout(() => setAlert({ ...alert, open: false }), 5000);
//   };

//   const handleCreate = () => {
//     setSelectedItem("");
//     reset();
//     setData({
//       name: "",
//       description: "",
//       category_code: "",
//       university_id: "",
//       parent_category_id: "",
//       warranty_period_days: 0,
//       depreciation_rate: 0,
//       depreciation_method: "straight_line",
//       requires_serial_number: false,
//       requires_maintenance: false,
//       maintenance_interval_days: "",
//       specification_template: "",
//       image_url: "",
//       lft: "",
//       rgt: "",
//       depth: 0,
//       is_active: true
//     });
//     setOpenCreateDialog(true);
//   };

//   const handleEdit = (row) => {
//     setSelectedItem(row);
//     setData({
//       name: row.name || "",
//       description: row.description || "",
//       category_code: row.category_code || "",
//       university_id: row.university_id || "",
//       parent_category_id: row.parent_category_id || "",
//       warranty_period_days: row.warranty_period_days || 0,
//       depreciation_rate: row.depreciation_rate || 0,
//       depreciation_method: row.depreciation_method || "straight_line",
//       requires_serial_number: row.requires_serial_number || false,
//       requires_maintenance: row.requires_maintenance || false,
//       maintenance_interval_days: row.maintenance_interval_days || "",
//       specification_template: row.specification_template || "",
//       image_url: row.image_url || "",
//       lft: row.lft || "",
//       rgt: row.rgt || "",
//       depth: row.depth || 0,
//       is_active: row.is_active !== undefined ? row.is_active : true
//     });
//     setOpenCreateDialog(true);
//   };

//   const handleDeleteClick = (row) => {
//     setSelectedItem(row);
//     setOpenDeleteDialog(true);
//   };

//   const handleDeleteConfirm = () => {
//     if (!selectedItem) return;

//     destroy(route('item-categories.destroy', selectedItem.category_id), {
//       preserveScroll: true,
//       onSuccess: () => {
//         showAlert("Category deleted successfully!", "success");
//         setOpenDeleteDialog(false);
//       },
//       onError: () => {
//         showAlert("Error deleting category", "error");
//       }
//     });
//   };

//   const handleSubmit = () => {
//     if (selectedItem) {
//       // Update existing category
//       put(route('item-categories.update', selectedItem.category_id), {
//         preserveScroll: true,
//         onSuccess: () => {
//           showAlert("Category updated successfully!", "success");
//           setOpenCreateDialog(false);
//           reset();
//         },
//         onError: () => {
//           showAlert("Error updating category", "error");
//         }
//       });
//     } else {
//       // Create new category
//       post(route('item-categories.store'), {
//         preserveScroll: true,
//         onSuccess: () => {
//           showAlert("Category created successfully!", "success");
//           setOpenCreateDialog(false);
//           reset();
//         },
//         onError: () => {
//           showAlert("Error creating category", "error");
//         }
//       });
//     }
//   };


//   // Calculate summary statistics
//   const totalCategories = rows.length;
//   const activeCategories = rows.filter(row => row.is_active).length;
//   const categoriesRequiringMaintenance = rows.filter(row => row.requires_maintenance).length;
//   const categoriesRequiringSerial = rows.filter(row => row.requires_serial_number).length;
//   const categoriesWithImages = rows.filter(row => row.image_url).length;




//   const filteredRows = rows.filter((row) => {
//     return (
//       row.name?.toLowerCase().includes(searchText.toLowerCase()) ||
//       row.category_code?.toLowerCase().includes(searchText.toLowerCase()) ||
//       row.description?.toLowerCase().includes(searchText.toLowerCase()) ||
//       row.university_name?.toLowerCase().includes(searchText.toLowerCase())
//     );
//   });

//   // Create action buttons for header
//   const actionButtons = [
//     <Button
//       key="new-category"
//       variant="contained"
//       startIcon={<AddCircleOutline />}
//       onClick={handleCreate}
//       size="medium"
//       sx={{
//         borderRadius: 2.5,
//         textTransform: "none",
//         fontWeight: 700,
//         px: 3,
//         py: 1,
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
//         '&:hover': {
//           boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
//           transform: 'translateY(-1px)',
//         },
//         transition: 'all 0.3s ease'
//       }}
//     >
//       New Category
//     </Button>,
//     <Button
//       key="import"
//       size="medium"
//       startIcon={<CloudUpload />}
//       component="label"
//       variant="outlined"
//       sx={{
//         borderRadius: 2.5,
//         textTransform: "none",
//         fontWeight: 600,
//         px: 2.5,
//         py: 1,
//         border: '2px solid',
//         borderColor: 'grey.200',
//         color: 'text.primary',
//         '&:hover': {
//           borderColor: 'primary.main',
//           backgroundColor: 'rgba(102, 126, 234, 0.04)',
//           color: 'primary.main',
//           transform: 'translateY(-1px)',
//           boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
//         },
//         transition: 'all 0.3s ease'
//       }}
//     >
//       Import
//       <input
//         hidden
//         accept=".xlsx,.xls,.csv"
//         type="file"
//         onChange={handleUpload}
//       />
//     </Button>,
//     <Button
//       key="export"
//       size="medium"
//       startIcon={<Download />}
//       onClick={handleExport}
//       variant="outlined"
//       sx={{
//         borderRadius: 2.5,
//         textTransform: "none",
//         fontWeight: 600,
//         px: 2.5,
//         py: 1,
//         border: '2px solid',
//         borderColor: 'grey.200',
//         color: 'text.primary',
//         '&:hover': {
//           borderColor: 'success.main',
//           backgroundColor: 'rgba(16, 185, 129, 0.04)',
//           color: 'success.main',
//           transform: 'translateY(-1px)',
//           boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
//         },
//         transition: 'all 0.3s ease'
//       }}
//     >
//       Export
//     </Button>
//   ];

//   return (
//     <AuthenticatedLayout 
//       auth={auth} 
//       title="Item Categories"
//       breadcrumbs={[
//         { label: 'Dashboard', href: '/dashboard', icon: <Home sx={{ mr: 0.5, fontSize: 18 }} /> },
//         { label: 'Item Categories' },
//       ]}
//     >
//       <Fade in timeout={500}>
//         <Box>
//           <Notification 
//             open={alert.open} 
//             severity={alert.severity} 
//             message={alert.message}
//             onClose={handleCloseAlert}
//           />
          
//           {/* Header Section */}
//           <PageHeader
//             title="Item Categories"
//             subtitle="Manage and organize your inventory categories with nested tree structure"
//             icon={<InventoryIcon sx={{ fontSize: 28 }} />}
//             actionButtons={actionButtons}
//             searchText={searchText}
//             onSearchClear={() => setSearchText('')}
//             filteredCount={filteredRows.length}
//             totalCount={rows.length}
//           />
          
//           {/* Summary Cards */}
//           <Grid container spacing={2} sx={{ mb: 3 }}>
//             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//               <SummaryCard 
//                 title="Total Categories" 
//                 value={totalCategories} 
//                 icon={<InventoryIcon />} 
//                 color="#2196f3" 
//               />
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//               <SummaryCard 
//                 title="Active Categories" 
//                 value={activeCategories} 
//                 icon={<SummarizeIcon />} 
//                 color="#4caf50" 
//               />
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//               <SummaryCard 
//                 title="Need Maintenance" 
//                 value={categoriesRequiringMaintenance} 
//                 icon={<BuildIcon />} 
//                 color="#ff9800" 
//               />
//             </Grid>
//             <Grid size={{ xs: 12, sm: 6, md: 3 }}>
//               <SummaryCard 
//                 title="With Images" 
//                 value={categoriesWithImages} 
//                 icon={<ImageIcon />} 
//                 color="#9c27b0" 
//               />
//             </Grid>
//           </Grid>

//           {/* Data Grid */}
//           <EnhancedDataGrid
//             rows={filteredRows}
//             columns={columns}
//             loading={gridLoading}
//             searchText={searchText}
//             onSearchChange={setSearchText}
//             onSearchClear={() => setSearchText('')}
//             onAdd={handleCreate}
//             onExport={handleExport}
//             onImport={handleUpload}
//             onRefresh={handleRefresh}
//             title="Category Hierarchy"
//             subtitle="Hierarchical view of your inventory categories"
//             icon={<AccountTreeIcon />}
//             addButtonText="New Category"
//             pageSizeOptions={[5, 10, 20, 50, 100]}
//             initialState={{
//               pagination: { paginationModel: { page: 0, pageSize: 10 } },
//               sorting: { sortModel: [{ field: 'lft', sort: 'asc' }] }
//             }}
//           />

//           {/* Dialogs */}
//           <CategoryDialog
//             open={openCreateDialog}
//             onClose={() => !processing && setOpenCreateDialog(false)}
//             selectedItem={selectedItem}
//             data={data}
//             setData={setData}
//             errors={errors}
//             processing={processing}
//             universities={universities}
//             categories={rows}
//             onSubmit={handleSubmit}
//           />
          
//           <DeleteDialog
//             open={openDeleteDialog}
//             onClose={() => setOpenDeleteDialog(false)}
//             selectedItem={selectedItem}
//             onConfirm={handleDeleteConfirm}
//           />
//         </Box>
//       </Fade>
//     </AuthenticatedLayout>
//   );
// }
import React, { useEffect, useState, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  Box,
  Chip,
  Typography,
  Button,
  Stack,
  Grid,
  IconButton,
  Tooltip,
  Avatar,
  Fade,
  alpha,
} from "@mui/material";
import {
  UploadFile as UploadFileIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  Summarize as SummarizeIcon,
  Build as BuildIcon,
  Image as ImageIcon,
  School as SchoolIcon,
  AccountTree as AccountTreeIcon,
  Numbers as NumbersIcon,
  Home as HomeIcon,
  AddCircleOutline,
  CloudUpload,
  Download,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { keyframes } from "@emotion/react";
import moment from "moment";
import { useForm, router, usePage } from "@inertiajs/react";

// Import reusable components
import Notification from "@/Components/Notification";
import PageHeader from "@/Components/PageHeader";
import SummaryCard from "@/Components/SummaryCard";
import EnhancedDataGrid from "@/Components/EnhancedDataGrid";
import CategoryDialog from "@/Components/CategoryDialog";
import DeleteDialog from "@/Components/DeleteDialog";

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function ItemCategories({ categories = [], auth, filters: initialFilters = {}, universities }) {
  const [rows, setRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  
  // Use Inertia's form handling with all fields from migration
  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    name: "",
    description: "",
    category_code: "",
    university_id: "",
    parent_category_id: "",
    warranty_period_days: 0,
    depreciation_rate: 0,
    depreciation_method: "",
    requires_serial_number: false,
    requires_maintenance: false,
    maintenance_interval_days: "",
    specification_template: "",
    image_url: "",
    lft: "",
    rgt: "",
    depth: 0,
    is_active: true
  });

  const { flash } = usePage().props;
  const searchInputRef = useRef("");
  
  useEffect(() => {
    setGridLoading(true);
    const timer = setTimeout(() => {
      const formattedRows = categories?.map((item, index) => ({
        id: item?.category_id ?? index + 1,
        ...item,
        university_id: item?.university_id ?? "",
        lft: item?.lft ?? "",
        rgt: item?.rgt ?? "",
        depth: item?.depth ?? 0,
        image_url: item?.image_url ?? "",
        warranty_period_days: item?.warranty_period_days ?? 0,
        depreciation_rate: item?.depreciation_rate ?? 0,
        depreciation_method: item?.depreciation_method ?? '',
        requires_serial_number: item?.requires_serial_number ?? false,
        requires_maintenance: item?.requires_maintenance ?? false,
        requirement: item ?? "",
        parent_category_id: item?.parent_category_id ?? '',
        is_active: item?.is_active ?? true,
        university: item?.university?.name,
        created_at: item?.created_at ? moment(item.created_at).format("Do MMM YYYY h:mm") : "",
        updated_at: item?.updated_at ? moment(item.updated_at).format("Do MMM YYYY h:mm") : "",
      }));
      setRows(formattedRows || []);
      setGridLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [categories]);

  // Calculate summary statistics
  const totalCategories = rows.length;
  const activeCategories = rows.filter(row => row.is_active).length;
  const categoriesRequiringMaintenance = rows.filter(row => row.requires_maintenance).length;
  const categoriesRequiringSerial = rows.filter(row => row.requires_serial_number).length;
  const categoriesWithImages = rows.filter(row => row.image_url).length;

  const columns = [
    { 
      field: "category_code", 
      headerName: "CODE", 
      width: 90,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600" fontFamily="monospace">
          {params.row.category_id}
        </Typography>
      )
    },
    { 
      field: "name", 
      headerName: "CATEGORY", 
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.row.image_url && (
            <Avatar 
              src={params.row.image_url || ""} 
              sx={{ width: 32, height: 32 }}
              variant="rounded"
            >
              <InventoryIcon />
            </Avatar>
          )}
          <Box>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.parent_category_name || "—"}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: "university",
      headerName: "UNIVERSITY",
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SchoolIcon fontSize="small" color="action" />
          <Typography variant="caption">
            {params.row.university_name || "—"}
          </Typography>
        </Box>
      )
    },
    {
      field: "items_count",
      headerName: "ITEMS",
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="500" textAlign="center">
          {params.row.items_count || 0}
        </Typography>
      )
    },
    {
      field: "depth",
      headerName: "DEPTH",
      width: 80,
      renderCell: (params) => (
        <Chip 
          label={params.row.depth || 0} 
          size="small" 
          color={params.row.depth === 0 ? "primary" : "default"}
          variant={params.row.depth === 0 ? "filled" : "outlined"}
        />
      )
    },
    {
      field: "tree_position",
      headerName: "TREE POS",
      width: 100,
      renderCell: (params) => (
        <Box>
          <Typography variant="caption" display="block">
            L: {params.row.lft || 0}
          </Typography>
          <Typography variant="caption" display="block">
            R: {params.row.rgt || 0}
          </Typography>
        </Box>
      )
    },
    {
      field: "specifications",
      headerName: "SPECS",
      width: 350,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="body2" fontWeight="bold">
             Warranty 🛡️{params.row.warranty_period_days || 0}d
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Depreciation 📉 {params.row.depreciation_rate || 0}%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
            <Typography variant="caption" color="text.secondary">
             Method 📊 {params.row.depreciation_method === 'straight_line' ? 'Straight Line' : 'Reducing Balance'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: "requirement",
      headerName: "REQS",
      width: 100,
      renderCell: (params) => (
        <Box>
          {params.row.requires_serial_number && (
            <Typography variant="caption" display="block">📋 Serial: ✅ </Typography>
          )}
          {params.row.requires_maintenance && (
            <Typography variant="caption" display="block">🔧 Maint: ✅ </Typography>
          )}
          {params.row.requires_calibration && (
            <Typography variant="caption" display="block">⚖️ Calib:✅ </Typography>
          )}
        </Box>
      )
    },
    {
      field: "maintenance",
      headerName: "MAINT",
      width: 80,
      renderCell: (params) => (
        params.row.requires_maintenance ? (
          <Typography variant="caption">
            {params.row.maintenance_interval_days}d
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        )
      )
    },
    {
      field: "image",
      headerName: "IMAGE",
      width: 80,
      renderCell: (params) => (
        params.row.image_url ? (
          <Avatar 
            src={params.row.image_url} 
            sx={{ width: 32, height: 32 }}
            variant="rounded"
          >
            <ImageIcon />
          </Avatar>
        ) : (
          <Typography variant="caption" color="text.secondary">No Image</Typography>
        )
      )
    },
    {
      field: "updated_at",
      headerName: "UPDATED",
      width: 180,
    },
    {
      field: "status",
      headerName: "STATUS",
      width: 90,
      renderCell: (params) => (
        params.row.is_active ? (
          <Chip label="ACTIVE" color="success" size="small" />
        ) : (
          <Chip label="INACTIVE" color="error" size="small" />
        )
      )
    },
    {
      field: "created_at",
      headerName: "CREATED",
      width: 180
    },
    {
      field: "actions",
      headerName: "ACTIONS",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit Category">
            <IconButton onClick={() => handleEdit(params.row)} size="small" color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Category">
            <IconButton onClick={() => handleDeleteClick(params.row)} size="small" color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const filteredRows = rows.filter((row) => {
    return (
      row.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.category_code?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      row.university_name?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    XLSX.utils.book_append_sheet(wb, ws, "Item Categories");
    XLSX.writeFile(wb, `ItemCategories_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
    
    showAlert("Categories data exported successfully!", "success");
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setGridLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const uploadedData = XLSX.utils.sheet_to_json(sheet);
        
        showAlert(`${uploadedData.length} categories imported successfully!`, "success");
      } catch (error) {
        showAlert("Error importing file", "error");
      } finally {
        setGridLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert({ ...alert, open: false }), 5000);
  };

  const handleCreate = () => {
    setSelectedItem("");
    reset();
    setData({
      name: "",
      description: "",
      category_code: "",
      university_id: "",
      parent_category_id: "",
      warranty_period_days: 0,
      depreciation_rate: 0,
      depreciation_method: "straight_line",
      requires_serial_number: false,
      requires_maintenance: false,
      maintenance_interval_days: "",
      specification_template: "",
      image_url: "",
      lft: "",
      rgt: "",
      depth: 0,
      is_active: true
    });
    setOpenCreateDialog(true);
  };

  const handleEdit = (row) => {
    setSelectedItem(row);
    setData({
      name: row.name || "",
      description: row.description || "",
      category_code: row.category_code || "",
      university_id: row.university_id || "",
      parent_category_id: row.parent_category_id || "",
      warranty_period_days: row.warranty_period_days || 0,
      depreciation_rate: row.depreciation_rate || 0,
      depreciation_method: row.depreciation_method || "straight_line",
      requires_serial_number: row.requires_serial_number || false,
      requires_maintenance: row.requires_maintenance || false,
      maintenance_interval_days: row.maintenance_interval_days || "",
      specification_template: row.specification_template || "",
      image_url: row.image_url || "",
      lft: row.lft || "",
      rgt: row.rgt || "",
      depth: row.depth || 0,
      is_active: row.is_active !== undefined ? row.is_active : true
    });
    setOpenCreateDialog(true);
  };

  const handleDeleteClick = (row) => {
    setSelectedItem(row);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;

    destroy(route('item-categories.destroy', selectedItem.category_id), {
      preserveScroll: true,
      onSuccess: () => {
        showAlert("Category deleted successfully!", "success");
        setOpenDeleteDialog(false);
      },
      onError: () => {
        showAlert("Error deleting category", "error");
      }
    });
  };

  const handleSubmit = () => {
    if (selectedItem) {
      // Update existing category
      put(route('item-categories.update', selectedItem.category_id), {
        preserveScroll: true,
        onSuccess: () => {
          showAlert("Category updated successfully!", "success");
          setOpenCreateDialog(false);
          reset();
        },
        onError: () => {
          showAlert("Error updating category", "error");
        }
      });
    } else {
      // Create new category
      post(route('item-categories.store'), {
        preserveScroll: true,
        onSuccess: () => {
          showAlert("Category created successfully!", "success");
          setOpenCreateDialog(false);
          reset();
        },
        onError: () => {
          showAlert("Error creating category", "error");
        }
      });
    }
  };

  const handleRefresh = () => {
    router.reload({ preserveScroll: true });
  };

  useEffect(() => {
    if (flash?.success) {
      showAlert(flash.success, "success");
    }

    if (flash?.error) {
      showAlert(flash.error, "error");
    }
  }, [flash]);

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  // Create action buttons for header
  const actionButtons = [
    <Button
      key="new-category"
      variant="contained"
      startIcon={<AddCircleOutline />}
      onClick={handleCreate}
      size="medium"
      sx={{
        borderRadius: 2.5,
        textTransform: "none",
        fontWeight: 700,
        px: 3,
        py: 1,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
          transform: 'translateY(-1px)',
        },
        transition: 'all 0.3s ease'
      }}
    >
      New Category
    </Button>,
    <Button
      key="import"
      size="medium"
      startIcon={<CloudUpload />}
      component="label"
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        textTransform: "none",
        fontWeight: 600,
        px: 2.5,
        py: 1,
        border: '2px solid',
        borderColor: 'grey.200',
        color: 'text.primary',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'rgba(102, 126, 234, 0.04)',
          color: 'primary.main',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        transition: 'all 0.3s ease'
      }}
    >
      Import
      <input
        hidden
        accept=".xlsx,.xls,.csv"
        type="file"
        onChange={handleUpload}
      />
    </Button>,
    <Button
      key="export"
      size="medium"
      startIcon={<Download />}
      onClick={handleExport}
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        textTransform: "none",
        fontWeight: 600,
        px: 2.5,
        py: 1,
        border: '2px solid',
        borderColor: 'grey.200',
        color: 'text.primary',
        '&:hover': {
          borderColor: 'success.main',
          backgroundColor: 'rgba(16, 185, 129, 0.04)',
          color: 'success.main',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        transition: 'all 0.3s ease'
      }}
    >
      Export
    </Button>
  ];

  return (
    <AuthenticatedLayout 
      auth={auth} 
      title="Item Categories"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon sx={{ mr: 0.5, fontSize: 18 }} /> },
        { label: 'Item Categories' },
      ]}
    >
      <Fade in timeout={500}>
        <Box>
          <Notification 
            open={alert.open} 
            severity={alert.severity} 
            message={alert.message}
            onClose={handleCloseAlert}
          />
          
          {/* Header Section */}
          <PageHeader
            title="Item Categories"
            subtitle="Manage and organize your inventory categories with nested tree structure"
            icon={<InventoryIcon sx={{ fontSize: 28 }} />}
            actionButtons={actionButtons}
            searchText={searchText}
            onSearchClear={() => setSearchText('')}
            filteredCount={filteredRows.length}
            totalCount={rows.length}
          />
          
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Total Categories" 
                value={totalCategories} 
                icon={<InventoryIcon />} 
                color="#2196f3" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Active Categories" 
                value={activeCategories} 
                icon={<SummarizeIcon />} 
                color="#4caf50" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="Need Maintenance" 
                value={categoriesRequiringMaintenance} 
                icon={<BuildIcon />} 
                color="#ff9800" 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SummaryCard 
                title="With Images" 
                value={categoriesWithImages} 
                icon={<ImageIcon />} 
                color="#9c27b0" 
              />
            </Grid>
          </Grid>

          {/* Data Grid */}
          <EnhancedDataGrid
            rows={filteredRows}
            columns={columns}
            loading={gridLoading}
            searchText={searchText}
            onSearchChange={setSearchText}
            onSearchClear={() => setSearchText('')}
            onAdd={handleCreate}
            onExport={handleExport}
            onImport={handleUpload}
            onRefresh={handleRefresh}
            title="Category Hierarchy"
            subtitle="Hierarchical view of your inventory categories"
            icon={<AccountTreeIcon />}
            addButtonText="New Category"
            pageSizeOptions={[5, 10, 20, 50, 100]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
              sorting: { sortModel: [{ field: 'lft', sort: 'asc' }] }
            }}
          />

          {/* Dialogs */}
          <CategoryDialog
            open={openCreateDialog}
            onClose={() => setOpenCreateDialog(false)}
            selectedItem={selectedItem}
            data={data}
            setData={setData}
            errors={errors}
            processing={processing}
            universities={universities}
            categories={rows}
            onSubmit={handleSubmit}
          />
          
          <DeleteDialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            selectedItem={selectedItem}
            onConfirm={handleDeleteConfirm}
          />
        </Box>
      </Fade>
    </AuthenticatedLayout>
  );
}
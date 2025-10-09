// // import React from 'react';
// // import {
// //   Box,
// //   TextField,
// //   Button,
// //   IconButton,
// //   Avatar,
// //   Typography,
// //   Stack,
// //   Tooltip,
// //   CircularProgress,
// //   InputAdornment,
// // } from '@mui/material';
// // import {
// //   Add as AddIcon,
// //   Save as SaveIcon,
// //   UploadFile as UploadFileIcon,
// //   Refresh as RefreshIcon,
// //   Search as SearchIcon,
// //   Close as CloseIcon,
// //   AccountTree as AccountTreeIcon,
// // } from '@mui/icons-material';
// // import { DataGrid } from '@mui/x-data-grid';

// // const EnhancedDataGrid = ({
// //   rows = [],
// //   columns = [],
// //   loading = false,
// //   searchText = '',
// //   onSearchChange,
// //   onSearchClear,
// //   onAdd,
// //   onExport,
// //   onImport,
// //   onRefresh,
// //   title = "Data Grid",
// //   subtitle = "Manage your data",
// //   icon = <AccountTreeIcon />,
// //   addButtonText = "Add New",
// //   showHeader = true,
// //   ...dataGridProps
// // }) => {
// //   return (
// //     <Box sx={{
// //       height: "100%",
// //       width: "100%",
// //       backgroundColor: "background.paper",
// //       borderRadius: 3,
// //       overflow: 'hidden',
// //       boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
// //       border: '1px solid rgba(255,255,255,0.8)',
// //       background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
// //       backdropFilter: 'blur(10px)',
// //       position: 'relative',
// //       '&::before': {
// //         content: '""',
// //         position: 'absolute',
// //         top: 0,
// //         left: 0,
// //         right: 0,
// //         height: '4px',
// //         background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
// //         zIndex: 2
// //       }
// //     }}>
// //       {showHeader && (
// //         <Box sx={{
// //           display: "flex",
// //           alignItems: "center",
// //           justifyContent: "space-between",
// //           p: 3,
// //           borderBottom: '1px solid rgba(0,0,0,0.06)',
// //           backgroundColor: 'rgba(255,255,255,0.8)',
// //           backdropFilter: 'blur(10px)',
// //         }}>
// //           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
// //             <Avatar
// //               sx={{
// //                 bgcolor: 'primary.main',
// //                 width: 48,
// //                 height: 48,
// //                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
// //                 boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
// //               }}
// //             >
// //               {icon}
// //             </Avatar>
// //             <Box>
// //               <Typography 
// //                 variant="h5" 
// //                 fontWeight={800}
// //                 sx={{
// //                   background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
// //                   backgroundClip: 'text',
// //                   WebkitBackgroundClip: 'text',
// //                   WebkitTextFillColor: 'transparent',
// //                   mb: 0.5
// //                 }}
// //               >
// //                 {title}
// //               </Typography>
// //               <Typography 
// //                 variant="body2" 
// //                 color="text.secondary"
// //                 sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
// //               >
// //                 <Box 
// //                   component="span" 
// //                   sx={{ 
// //                     width: 6, 
// //                     height: 6, 
// //                     borderRadius: '50%', 
// //                     bgcolor: 'success.main',
// //                   }} 
// //                 />
// //                 {subtitle}
// //               </Typography>
// //             </Box>
// //           </Box>
          
// //           <Stack direction="row" spacing={1.5} alignItems="center">
// //             <TextField
// //               placeholder="Search..."
// //               variant="outlined"
// //               size="small"
// //               value={searchText}
// //               onChange={(e) => onSearchChange(e.target.value)}
// //               InputProps={{
// //                 startAdornment: (
// //                   <InputAdornment position="start">
// //                     <SearchIcon fontSize="small" color="primary" />
// //                   </InputAdornment>
// //                 ),
// //                 endAdornment: searchText && (
// //                   <InputAdornment position="end">
// //                     <IconButton 
// //                       size="small" 
// //                       onClick={onSearchClear}
// //                       sx={{ color: 'text.secondary' }}
// //                     >
// //                       <CloseIcon fontSize="small" />
// //                     </IconButton>
// //                   </InputAdornment>
// //                 ),
// //               }}
// //               sx={{ 
// //                 width: 280,
// //                 '& .MuiOutlinedInput-root': {
// //                   borderRadius: 2,
// //                   backgroundColor: 'rgba(255,255,255,0.8)',
// //                   '&:hover': {
// //                     backgroundColor: 'rgba(255,255,255,0.9)',
// //                   }
// //                 }
// //               }}
// //             />
            
// //             <Tooltip title="Refresh Data">
// //               <IconButton 
// //                 color="primary" 
// //                 size="medium"
// //                 onClick={onRefresh}
// //                 sx={{
// //                   backgroundColor: 'rgba(102, 126, 234, 0.1)',
// //                   '&:hover': {
// //                     backgroundColor: 'rgba(102, 126, 234, 0.2)',
// //                     transform: 'rotate(45deg)',
// //                   },
// //                   transition: 'all 0.3s ease'
// //                 }}
// //               >
// //                 <RefreshIcon fontSize="small" />
// //               </IconButton>
// //             </Tooltip>
            
// //             {onAdd && (
// //               <Button
// //                 variant="contained"
// //                 startIcon={<AddIcon />}
// //                 color="primary"
// //                 onClick={onAdd}
// //                 size="medium"
// //                 sx={{
// //                   borderRadius: 2.5,
// //                   textTransform: 'none',
// //                   fontWeight: 700,
// //                   px: 2.5,
// //                   py: 1,
// //                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
// //                   boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
// //                   '&:hover': {
// //                     boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
// //                     transform: 'translateY(-1px)',
// //                   },
// //                   transition: 'all 0.3s ease'
// //                 }}
// //               >
// //                 {addButtonText}
// //               </Button>
// //             )}
            
// //             {onExport && (
// //               <Button
// //                 variant="outlined"
// //                 startIcon={<SaveIcon />}
// //                 color="success"
// //                 onClick={onExport}
// //                 size="medium"
// //                 sx={{
// //                   borderRadius: 2.5,
// //                   textTransform: 'none',
// //                   fontWeight: 600,
// //                   px: 2,
// //                   py: 1,
// //                   border: '2px solid',
// //                   borderColor: 'success.light',
// //                   color: 'success.main',
// //                   '&:hover': {
// //                     backgroundColor: 'rgba(16, 185, 129, 0.04)',
// //                     borderColor: 'success.main',
// //                     transform: 'translateY(-1px)',
// //                   },
// //                   transition: 'all 0.3s ease'
// //                 }}
// //               >
// //                 Export
// //               </Button>
// //             )}
            
// //             {onImport && (
// //               <Button
// //                 variant="outlined"
// //                 component="label"
// //                 startIcon={<UploadFileIcon />}
// //                 color="secondary"
// //                 size="medium"
// //                 sx={{
// //                   borderRadius: 2.5,
// //                   textTransform: 'none',
// //                   fontWeight: 600,
// //                   px: 2,
// //                   py: 1,
// //                   border: '2px solid',
// //                   borderColor: 'secondary.light',
// //                   color: 'secondary.main',
// //                   '&:hover': {
// //                     backgroundColor: 'rgba(168, 85, 247, 0.04)',
// //                     borderColor: 'secondary.main',
// //                     transform: 'translateY(-1px)',
// //                   },
// //                   transition: 'all 0.3s ease'
// //                 }}
// //               >
// //                 Import
// //                 <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={onImport} />
// //               </Button>
// //             )}
// //           </Stack>
// //         </Box>
// //       )}
      
// //       <Box sx={{ height: showHeader ? 'calc(100% - 100px)' : '100%', position: 'relative' }}>
// //         <DataGrid
// //           rows={rows}
// //           columns={columns}
// //           sx={{
// //             border: 'none',
// //             '& .MuiDataGrid-cell': {
// //               borderBottom: '1px solid rgba(0,0,0,0.06)',
// //               py: 1.5,
// //               fontSize: '0.875rem',
// //             },
// //             '& .MuiDataGrid-cell:focus': {
// //               outline: 'none',
// //             },
// //             '& .MuiDataGrid-row': {
// //               transition: 'all 0.2s ease',
// //               '&:hover': {
// //                 backgroundColor: 'rgba(102, 126, 234, 0.04)',
// //                 transform: 'translateX(2px)',
// //               },
// //               '&.Mui-selected': {
// //                 backgroundColor: 'rgba(102, 126, 234, 0.08)',
// //                 '&:hover': {
// //                   backgroundColor: 'rgba(102, 126, 234, 0.12)',
// //                 }
// //               }
// //             },
// //             '& .MuiDataGrid-columnHeaders': {
// //               backgroundColor: 'rgba(248, 250, 252, 0.8)',
// //               borderBottom: '2px solid rgba(0,0,0,0.08)',
// //               fontSize: '0.875rem',
// //               fontWeight: 700,
// //             },
// //             '& .MuiDataGrid-toolbarContainer': {
// //               p: 2,
// //               borderBottom: '1px solid rgba(0,0,0,0.06)',
// //               backgroundColor: 'rgba(255,255,255,0.5)',
// //             },
// //             '& .MuiDataGrid-footerContainer': {
// //               borderTop: '1px solid rgba(0,0,0,0.06)',
// //               backgroundColor: 'rgba(248, 250, 252, 0.8)',
// //             },
// //           }}
// //           loading={false}
// //           {...dataGridProps}
// //         />
        
// //         {loading && (
// //           <Box sx={{
// //             position: 'absolute',
// //             top: 0,
// //             left: 0,
// //             right: 0,
// //             bottom: 0,
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'center',
// //             background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,255,0.95) 100%)',
// //             backdropFilter: 'blur(4px)',
// //             zIndex: 1,
// //             borderRadius: '0 0 12px 12px',
// //           }}>
// //             <Box sx={{ textAlign: 'center' }}>
// //               <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                 <CircularProgress 
// //                   size={60} 
// //                   thickness={4}
// //                   sx={{
// //                     color: 'primary.main',
// //                     background: 'conic-gradient(rgba(102, 126, 234, 0.2) 0%, transparent 50%)',
// //                     borderRadius: '50%',
// //                   }}
// //                 />
// //                 <AccountTreeIcon 
// //                   sx={{ 
// //                     position: 'absolute',
// //                     top: '50%',
// //                     left: '50%',
// //                     transform: 'translate(-50%, -50%)',
// //                     fontSize: 24,
// //                     color: 'primary.main',
// //                     opacity: 0.8
// //                   }} 
// //                 />
// //               </Box>
// //               <Typography variant="h6" fontWeight={600} sx={{ mt: 2, color: 'text.primary' }}>
// //                 Loading Data
// //               </Typography>
// //               <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
// //                 Please wait...
// //               </Typography>
// //             </Box>
// //           </Box>
// //         )}
// //       </Box>
// //     </Box>
// //   );
// // };

// // export default EnhancedDataGrid;
// import React, { useState } from 'react';
// import {
//   Box,
//   TextField,
//   Button,
//   IconButton,
//   Avatar,
//   Typography,
//   Stack,
//   Tooltip,
//   CircularProgress,
//   InputAdornment,
//   Chip,
//   alpha,
//   Fade,
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   Download as DownloadIcon,
//   UploadFile as UploadFileIcon,
//   Refresh as RefreshIcon,
//   Search as SearchIcon,
//   Close as CloseIcon,
//   FilterList as FilterIcon,
//   ViewModule as ViewModuleIcon,
//   ViewWeek as ViewWeekIcon,
//   Sort as SortIcon,
// } from '@mui/icons-material';
// import { DataGrid } from '@mui/x-data-grid';

// const EnhancedDataGrid = ({
//   rows = [],
//   columns = [],
//   loading = false,
//   searchText = '',
//   onSearchChange,
//   onSearchClear,
//   onAdd,
//   onExport,
//   onImport,
//   onRefresh,
//   title = "Data Grid",
//   subtitle = "Manage your data",
//   icon = <ViewModuleIcon />,
//   addButtonText = "Add New",
//   showHeader = true,
//   rowCount,
//   selectedCount = 0,
//   onBulkAction,
//   viewMode = 'table', // 'table' | 'card'
//   onViewModeChange,
//   ...dataGridProps
// }) => {
//   const [isSearchFocused, setIsSearchFocused] = useState(false);

//   return (
//     <Box sx={{
//       height: "100%",
//       width: "100%",
//       backgroundColor: "background.paper",
//       borderRadius: 4,
//       overflow: 'hidden',
//       boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
//       border: '1px solid',
//       borderColor: 'divider',
//       background: 'linear-gradient(135deg, #fdfcfc 0%, #f8fafc 100%)',
//       position: 'relative',
//       '&::before': {
//         content: '""',
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         height: '1px',
//         background: 'linear-gradient(90deg, transparent 0%, #667eea 50%, transparent 100%)',
//         zIndex: 2
//       }
//     }}>
//       {showHeader && (
//         <Box sx={{
//           p: 3,
//           borderBottom: '1px solid',
//           borderColor: 'divider',
//           backgroundColor: 'rgba(255,255,255,0.9)',
//           backdropFilter: 'blur(20px)',
//         }}>
//           {/* Top Header Section */}
//           <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
//             <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, flex: 1 }}>
//               <Box
//                 sx={{
//                   width: 52,
//                   height: 52,
//                   borderRadius: 2.5,
//                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
//                   position: 'relative',
//                   '&::after': {
//                     content: '""',
//                     position: 'absolute',
//                     top: 0,
//                     left: 0,
//                     right: 0,
//                     bottom: 0,
//                     background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
//                     borderRadius: 2.5,
//                   }
//                 }}
//               >
//                 <Box sx={{ color: 'white', zIndex: 1 }}>
//                   {icon}
//                 </Box>
//               </Box>
              
//               <Box sx={{ flex: 1 }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
//                   <Typography 
//                     variant="h5" 
//                     fontWeight={700}
//                     sx={{
//                       color: 'text.primary',
//                       letterSpacing: '-0.02em',
//                     }}
//                   >
//                     {title}
//                   </Typography>
                  
//                   {rowCount !== undefined && (
//                     <Chip
//                       label={`${rowCount} items`}
//                       size="small"
//                       variant="outlined"
//                       sx={{
//                         fontWeight: 600,
//                         fontSize: '0.75rem',
//                         borderColor: 'primary.200',
//                         color: 'primary.700',
//                         backgroundColor: 'primary.50',
//                       }}
//                     />
//                   )}
//                 </Box>
                
//                 <Typography 
//                   variant="body2" 
//                   color="text.secondary"
//                   sx={{ 
//                     lineHeight: 1.5,
//                     maxWidth: '480px',
//                   }}
//                 >
//                   {subtitle}
//                 </Typography>
//               </Box>
//             </Box>
            
//             {/* View Mode Toggle */}
//             {onViewModeChange && (
//               <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
//                 <Tooltip title="Table View">
//                   <IconButton 
//                     size="small" 
//                     onClick={() => onViewModeChange('table')}
//                     sx={{
//                       borderRadius: 0,
//                       backgroundColor: viewMode === 'table' ? 'primary.50' : 'transparent',
//                       color: viewMode === 'table' ? 'primary.main' : 'text.secondary',
//                       '&:hover': {
//                         backgroundColor: viewMode === 'table' ? 'primary.100' : 'grey.50',
//                       }
//                     }}
//                   >
//                     <ViewWeekIcon fontSize="small" />
//                   </IconButton>
//                 </Tooltip>
//                 <Tooltip title="Card View">
//                   <IconButton 
//                     size="small" 
//                     onClick={() => onViewModeChange('card')}
//                     sx={{
//                       borderRadius: 0,
//                       backgroundColor: viewMode === 'card' ? 'primary.50' : 'transparent',
//                       color: viewMode === 'card' ? 'primary.main' : 'text.secondary',
//                       '&:hover': {
//                         backgroundColor: viewMode === 'card' ? 'primary.100' : 'grey.50',
//                       }
//                     }}
//                   >
//                     <ViewModuleIcon fontSize="small" />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//             )}
//           </Box>

//           {/* Action Bar Section */}
//           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
//               {/* Search */}
//               <TextField
//                 placeholder="Search records..."
//                 variant="outlined"
//                 size="small"
//                 value={searchText}
//                 onChange={(e) => onSearchChange(e.target.value)}
//                 onFocus={() => setIsSearchFocused(true)}
//                 onBlur={() => setIsSearchFocused(false)}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <SearchIcon 
//                         fontSize="small" 
//                         sx={{ 
//                           color: isSearchFocused ? 'primary.main' : 'text.secondary',
//                           transition: 'color 0.2s ease'
//                         }} 
//                       />
//                     </InputAdornment>
//                   ),
//                   endAdornment: searchText && (
//                     <InputAdornment position="end">
//                       <IconButton 
//                         size="small" 
//                         onClick={onSearchClear}
//                         sx={{ 
//                           color: 'text.secondary',
//                           '&:hover': { color: 'error.main' }
//                         }}
//                       >
//                         <CloseIcon fontSize="small" />
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//                 sx={{ 
//                   width: 320,
//                   '& .MuiOutlinedInput-root': {
//                     borderRadius: 2,
//                     backgroundColor: 'background.paper',
//                     border: '1px solid',
//                     borderColor: isSearchFocused ? 'primary.main' : 'divider',
//                     transition: 'all 0.2s ease',
//                     '&:hover': {
//                       borderColor: 'primary.light',
//                     },
//                     '&.Mui-focused': {
//                       boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
//                     }
//                   }
//                 }}
//               />

//               {/* Selected Count */}
//               {selectedCount > 0 && (
//                 <Fade in>
//                   <Chip
//                     label={`${selectedCount} selected`}
//                     size="small"
//                     onDelete={onBulkAction}
//                     deleteIcon={<SortIcon />}
//                     sx={{
//                       fontWeight: 600,
//                       backgroundColor: 'primary.50',
//                       color: 'primary.700',
//                       border: '1px solid',
//                       borderColor: 'primary.200',
//                     }}
//                   />
//                 </Fade>
//               )}
//             </Box>

//             <Stack direction="row" spacing={1} alignItems="center">
//               {/* Action Buttons */}
//               <Tooltip title="Refresh">
//                 <IconButton 
//                   size="medium"
//                   onClick={onRefresh}
//                   sx={{
//                     color: 'text.secondary',
//                     backgroundColor: 'grey.50',
//                     '&:hover': {
//                       backgroundColor: 'grey.100',
//                       color: 'primary.main',
//                       transform: 'rotate(90deg)',
//                     },
//                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
//                   }}
//                 >
//                   <RefreshIcon fontSize="small" />
//                 </IconButton>
//               </Tooltip>

//               {onImport && (
//                 <Tooltip title="Import Data">
//                   <Button
//                     variant="outlined"
//                     component="label"
//                     startIcon={<UploadFileIcon />}
//                     size="medium"
//                     sx={{
//                       borderRadius: 2,
//                       textTransform: 'none',
//                       fontWeight: 600,
//                       px: 2,
//                       borderColor: 'divider',
//                       color: 'text.primary',
//                       backgroundColor: 'background.paper',
//                       '&:hover': {
//                         borderColor: 'primary.main',
//                         backgroundColor: 'primary.50',
//                         transform: 'translateY(-1px)',
//                       },
//                       transition: 'all 0.2s ease'
//                     }}
//                   >
//                     Import
//                     <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={onImport} />
//                   </Button>
//                 </Tooltip>
//               )}

//               {onExport && (
//                 <Tooltip title="Export Data">
//                   <Button
//                     variant="outlined"
//                     startIcon={<DownloadIcon />}
//                     size="medium"
//                     onClick={onExport}
//                     sx={{
//                       borderRadius: 2,
//                       textTransform: 'none',
//                       fontWeight: 600,
//                       px: 2,
//                       borderColor: 'divider',
//                       color: 'text.primary',
//                       backgroundColor: 'background.paper',
//                       '&:hover': {
//                         borderColor: 'success.main',
//                         backgroundColor: 'success.50',
//                         color: 'success.main',
//                         transform: 'translateY(-1px)',
//                       },
//                       transition: 'all 0.2s ease'
//                     }}
//                   >
//                     Export
//                   </Button>
//                 </Tooltip>
//               )}

//               {onAdd && (
//                 <Button
//                   variant="contained"
//                   startIcon={<AddIcon />}
//                   size="medium"
//                   onClick={onAdd}
//                   sx={{
//                     borderRadius: 2,
//                     textTransform: 'none',
//                     fontWeight: 700,
//                     px: 3,
//                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                     boxShadow: '0 2px 10px rgba(102, 126, 234, 0.3)',
//                     '&:hover': {
//                       boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
//                       transform: 'translateY(-2px)',
//                     },
//                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
//                   }}
//                 >
//                   {addButtonText}
//                 </Button>
//               )}
//             </Stack>
//           </Box>
//         </Box>
//       )}
      
//       {/* Data Grid Area */}
//       <Box sx={{ 
//         height: showHeader ? 'calc(100% - 180px)' : '100%', 
//         position: 'relative',
//         backgroundColor: 'background.paper',
//       }}>
//         <DataGrid
//           rows={rows}
//           columns={columns}
//           sx={{
//             border: 'none',
//             '& .MuiDataGrid-cell': {
//               borderBottom: '1px solid',
//               borderColor: 'divider',
//               py: 2,
//               fontSize: '0.875rem',
//               fontWeight: 400,
//             },
//             '& .MuiDataGrid-cell:focus': {
//               outline: 'none',
//             },
//             '& .MuiDataGrid-cell:focus-within': {
//               outline: 'none',
//             },
//             '& .MuiDataGrid-row': {
//               transition: 'all 0.2s ease',
//               '&:hover': {
//                 backgroundColor: 'grey.50',
//               },
//               '&.Mui-selected': {
//                 backgroundColor: 'primary.50',
//                 '&:hover': {
//                   backgroundColor: 'primary.100',
//                 }
//               }
//             },
//             '& .MuiDataGrid-columnHeaders': {
//               backgroundColor: 'grey.50',
//               borderBottom: '2px solid',
//               borderColor: 'divider',
//               fontSize: '0.875rem',
//               fontWeight: 600,
//               color: 'text.primary',
//             },
//             '& .MuiDataGrid-columnHeader:focus': {
//               outline: 'none',
//             },
//             '& .MuiDataGrid-columnHeader:focus-within': {
//               outline: 'none',
//             },
//             '& .MuiDataGrid-toolbarContainer': {
//               p: 2,
//               borderBottom: '1px solid',
//               borderColor: 'divider',
//               backgroundColor: 'grey.50',
//             },
//             '& .MuiDataGrid-footerContainer': {
//               borderTop: '1px solid',
//               borderColor: 'divider',
//               backgroundColor: 'grey.50',
//             },
//             '& .MuiDataGrid-virtualScroller': {
//               backgroundColor: 'background.paper',
//             },
//           }}
//           loading={false}
//           {...dataGridProps}
//         />
        
//         {loading && (
//           <Box sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: 'rgba(255,255,255,0.9)',
//             backdropFilter: 'blur(4px)',
//             zIndex: 1,
//           }}>
//             <Box sx={{ textAlign: 'center' }}>
//               <CircularProgress 
//                 size={48} 
//                 thickness={4}
//                 sx={{
//                   color: 'primary.main',
//                 }}
//               />
//               <Typography variant="body1" fontWeight={600} sx={{ mt: 2, color: 'text.primary' }}>
//                 Loading data...
//               </Typography>
//             </Box>
//           </Box>
//         )}

//         {!loading && rows.length === 0 && (
//           <Box sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             flexDirection: 'column',
//             gap: 2,
//           }}>
//             <Box
//               sx={{
//                 width: 80,
//                 height: 80,
//                 borderRadius: '50%',
//                 backgroundColor: 'grey.50',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: 'grey.400',
//               }}
//             >
//               <ViewModuleIcon sx={{ fontSize: 32 }} />
//             </Box>
//             <Box sx={{ textAlign: 'center' }}>
//               <Typography variant="h6" fontWeight={600} color="text.primary">
//                 No data available
//               </Typography>
//               <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//                 {searchText ? 'Try adjusting your search criteria' : 'Get started by adding your first item'}
//               </Typography>
//             </Box>
//             {onAdd && !searchText && (
//               <Button
//                 variant="contained"
//                 startIcon={<AddIcon />}
//                 onClick={onAdd}
//                 sx={{ mt: 1 }}
//               >
//                 {addButtonText}
//               </Button>
//             )}
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default EnhancedDataGrid;
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Stack,
  Tooltip,
  CircularProgress,
  InputAdornment,
  Chip,
  alpha,
  Fade,
  Breadcrumbs,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  UploadFile as UploadFileIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  ViewWeek as ViewWeekIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
  GridOn as GridOnIcon,
  TableRows as TableRowsIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const EnhancedDataGrid = ({
  rows = [],
  columns = [],
  loading = false,
  searchText = '',
  onSearchChange,
  onSearchClear,
  onAdd,
  onExport,
  onImport,
  onRefresh,
  title = "Data Grid",
  subtitle = "Manage your data",
  icon = <GridOnIcon />,
  addButtonText = "Add New",
  showHeader = true,
  rowCount,
  selectedCount = 0,
  onBulkAction,
  viewMode = 'table',
  onViewModeChange,
  breadcrumbs,
  filters = [],
  onFilterChange,
  ...dataGridProps
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);

  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchor(null);
  };

  return (
    <Box sx={{
      height: "100%",
      width: "100%",
      backgroundColor: "background.paper",
      borderRadius: 3,
      overflow: 'hidden',
      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px 0 rgba(0,0,0,0.04)',
      border: '1px solid',
      borderColor: 'divider',
      background: 'linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)',
      position: 'relative',
    }}>
      {showHeader && (
        <Box sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <Box sx={{ mb: 2 }}>
              <Breadcrumbs 
                separator="›" 
                aria-label="breadcrumb"
                sx={{
                  '& .MuiBreadcrumbs-separator': {
                    color: 'text.secondary',
                  }
                }}
              >
                {breadcrumbs}
              </Breadcrumbs>
            </Box>
          )}

          {/* Main Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, flex: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <Box sx={{ color: 'white' }}>
                  {React.cloneElement(icon, { fontSize: 'small' })}
                </Box>
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                  <Typography 
                    variant="h5" 
                    fontWeight={700}
                    sx={{
                      color: 'text.primary',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </Typography>
                  
                  {rowCount !== undefined && (
                    <Chip
                      label={`${rowCount} items`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderColor: 'primary.200',
                        color: 'primary.700',
                        backgroundColor: 'primary.50',
                      }}
                    />
                  )}
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    lineHeight: 1.5,
                  }}
                >
                  {subtitle}
                </Typography>
              </Box>
            </Box>
            
            {/* View Controls */}
            <Stack direction="row" spacing={1} alignItems="center">
              {onViewModeChange && (
                <Box sx={{ 
                  display: 'flex', 
                  border: '1px solid', 
                  borderColor: 'divider', 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  backgroundColor: 'background.paper',
                }}>
                  <Tooltip title="Table View">
                    <IconButton 
                      size="small" 
                      onClick={() => onViewModeChange('table')}
                      sx={{
                        borderRadius: 0,
                        backgroundColor: viewMode === 'table' ? 'primary.50' : 'transparent',
                        color: viewMode === 'table' ? 'primary.main' : 'text.secondary',
                        '&:hover': {
                          backgroundColor: viewMode === 'table' ? 'primary.100' : 'grey.50',
                        }
                      }}
                    >
                      <TableRowsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Grid View">
                    <IconButton 
                      size="small" 
                      onClick={() => onViewModeChange('grid')}
                      sx={{
                        borderRadius: 0,
                        backgroundColor: viewMode === 'grid' ? 'primary.50' : 'transparent',
                        color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
                        '&:hover': {
                          backgroundColor: viewMode === 'grid' ? 'primary.100' : 'grey.50',
                        }
                      }}
                    >
                      <ViewModuleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              <Tooltip title="More options">
                <IconButton 
                  size="small"
                  onClick={handleMoreMenuOpen}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'text.primary',
                      backgroundColor: 'grey.50',
                    }
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={moreMenuAnchor}
                open={Boolean(moreMenuAnchor)}
                onClose={handleMoreMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }
                }}
              >
                <MenuItem onClick={handleMoreMenuClose}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Grid Settings</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMoreMenuClose}>
                  <ListItemIcon>
                    <ArchiveIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Archive All</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleMoreMenuClose} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete All</ListItemText>
                </MenuItem>
              </Menu>
            </Stack>
          </Box>

          {/* Action Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
              {/* Search */}
              <TextField
                placeholder="Search records..."
                variant="outlined"
                size="small"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon 
                        fontSize="small" 
                        sx={{ 
                          color: isSearchFocused ? 'primary.main' : 'text.secondary',
                        }} 
                      />
                    </InputAdornment>
                  ),
                  endAdornment: searchText && (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={onSearchClear}
                        sx={{ 
                          color: 'text.secondary',
                          '&:hover': { color: 'error.main' }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  width: { xs: '100%', sm: 320 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: isSearchFocused ? 'primary.main' : 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.light',
                    },
                  }
                }}
              />

              {/* Filters */}
              {filters.length > 0 && (
                <Tooltip title="Filters">
                  <IconButton 
                    size="small"
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'grey.50',
                      }
                    }}
                  >
                    <FilterIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* Selected Count */}
              {selectedCount > 0 && (
                <Fade in>
                  <Chip
                    label={`${selectedCount} selected`}
                    size="small"
                    onDelete={onBulkAction}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: 'primary.50',
                      color: 'primary.700',
                      border: '1px solid',
                      borderColor: 'primary.200',
                    }}
                  />
                </Fade>
              )}
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              <Tooltip title="Refresh">
                <IconButton 
                  size="medium"
                  onClick={onRefresh}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'primary.50',
                      transform: 'rotate(90deg)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {onImport && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  size="medium"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.50',
                    },
                  }}
                >
                  Import
                  <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={onImport} />
                </Button>
              )}

              {onExport && (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  size="medium"
                  onClick={onExport}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'success.main',
                      backgroundColor: 'success.50',
                      color: 'success.main',
                    },
                  }}
                >
                  Export
                </Button>
              )}

              {onAdd && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="medium"
                  onClick={onAdd}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {addButtonText}
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      )}
      
      {/* Data Grid Area */}
      <Box sx={{ 
        height: showHeader ? 'calc(100% - 180px)' : '100%', 
        position: 'relative',
        backgroundColor: 'background.paper',
      }}>
        <DataGrid
          rows={rows}
          columns={columns}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 1.5,
              fontSize: '0.875rem',
              fontWeight: 400,
              '&:focus': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-row': {
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: 'grey.50',
              },
              '&.Mui-selected': {
                backgroundColor: 'primary.50',
                '&:hover': {
                  backgroundColor: 'primary.100',
                }
              }
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'grey.50',
              borderBottom: '2px solid',
              borderColor: 'divider',
              fontSize: '0.875rem',
              fontWeight: 600,
            },
            '& .MuiDataGrid-columnHeader': {
              '&:focus': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-toolbarContainer': {
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'grey.50',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'grey.50',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: 'background.paper',
            },
          }}
          loading={false}
          {...dataGridProps}
        />
        
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(4px)',
            zIndex: 1,
          }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress 
                size={48} 
                thickness={4}
                sx={{
                  color: 'primary.main',
                }}
              />
              <Typography variant="body1" fontWeight={600} color="text.primary">
                Loading data...
              </Typography>
            </Stack>
          </Box>
        )}

        {!loading && rows.length === 0 && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
            p: 3,
          }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'grey.400',
              }}
            >
              <GridOnIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
                No records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchText 
                  ? 'No results match your search criteria. Try adjusting your filters.' 
                  : 'Get started by adding your first record to the system.'
                }
              </Typography>
            </Box>
            {onAdd && !searchText && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAdd}
                sx={{ mt: 1 }}
              >
                {addButtonText}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EnhancedDataGrid;
// import React from 'react';
// import {
//   Box,
//   Typography,
//   Avatar,
//   Button,
//   Chip,
//   Grid,
//   IconButton,
// } from '@mui/material';
// import { Close as CloseIcon } from '@mui/icons-material';

// const PageHeader = ({
//   title,
//   subtitle,
//   icon,
//   actionButtons = [],
//   searchText = '',
//   onSearchClear,
//   filteredCount,
//   totalCount,
//   gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
// }) => {
//   return (
//     <Box
//       sx={{
//         mb: 4,
//         p: 3,
//         borderRadius: 3,
//         background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.98) 100%)',
//         boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
//         border: '1px solid rgba(255,255,255,0.8)',
//         backdropFilter: 'blur(10px)',
//         position: 'relative',
//         overflow: 'hidden',
//         '&::before': {
//           content: '""',
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           height: '4px',
//           background: gradient,
//         }
//       }}
//     >
//       <Grid container spacing={2} alignItems="center" justifyContent="space-between">
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
//             <Avatar
//               sx={{
//                 bgcolor: 'primary.main',
//                 width: 56,
//                 height: 56,
//                 background: gradient,
//                 boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
//               }}
//             >
//               {icon}
//             </Avatar>
            
//             <Box>
//               <Typography 
//                 variant="h4" 
//                 fontWeight={800}
//                 sx={{
//                   background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
//                   backgroundClip: 'text',
//                   WebkitBackgroundClip: 'text',
//                   WebkitTextFillColor: 'transparent',
//                   mb: 0.5
//                 }}
//               >
//                 {title}
//               </Typography>
              
//               <Typography 
//                 variant="body1" 
//                 color="text.secondary" 
//                 sx={{ 
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 1,
//                   fontWeight: 500
//                 }}
//               >
//                 <Box 
//                   component="span" 
//                   sx={{ 
//                     width: 6, 
//                     height: 6, 
//                     borderRadius: '50%', 
//                     bgcolor: 'success.main',
//                     animation: 'pulse 2s infinite'
//                   }} 
//                 />
//                 {subtitle}
//               </Typography>
              
//               {searchText && (
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
//                   <Chip
//                     label={`${filteredCount} of ${totalCount} items`}
//                     size="small"
//                     sx={{ 
//                       fontWeight: 600,
//                       background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
//                       color: 'white',
//                       boxShadow: '0 2px 12px rgba(16, 185, 129, 0.3)',
//                     }}
//                   />
//                   <Button
//                     size="small"
//                     onClick={onSearchClear}
//                     endIcon={<CloseIcon />}
//                     sx={{ 
//                       minWidth: 'auto', 
//                       px: 1,
//                       color: 'text.secondary',
//                       '&:hover': { 
//                         color: 'error.main',
//                         backgroundColor: 'rgba(239, 68, 68, 0.04)'
//                       }
//                     }}
//                   >
//                     Clear
//                   </Button>
//                 </Box>
//               )}
//             </Box>
//           </Box>
//         </Grid>

//         {actionButtons.length > 0 && (
//           <Grid size={{ xs: 12, md: "auto" }}>
//             <Grid
//               container
//               spacing={1.5}
//               alignItems="center"
//               justifyContent={{ xs: "flex-start", md: "flex-end" }}
//               wrap="wrap"
//             >
//               {actionButtons.map((button, index) => (
//                 <Grid key={index}>
//                   {button}
//                 </Grid>
//               ))}
//             </Grid>
//           </Grid>
//         )}
//       </Grid>
//     </Box>
//   );
// };

// export default PageHeader;
import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

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
}) => {
  return (
    <Box
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.98) 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: gradient,
        }
      }}
    >
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
                background: gradient,
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
              }}
            >
              {icon}
            </Avatar>
            
            <Box>
              <Typography 
                variant="h4" 
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}
              >
                {title}
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontWeight: 500
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main',
                    animation: 'pulse 2s infinite'
                  }} 
                />
                {subtitle}
              </Typography>
              
              {searchText && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                  <Chip
                    label={`${filteredCount} of ${totalCount} items`}
                    size="small"
                    sx={{ 
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      boxShadow: '0 2px 12px rgba(16, 185, 129, 0.3)',
                    }}
                  />
                  <Button
                    size="small"
                    onClick={onSearchClear}
                    endIcon={<CloseIcon />}
                    sx={{ 
                      minWidth: 'auto', 
                      px: 1,
                      color: 'text.secondary',
                      '&:hover': { 
                        color: 'error.main',
                        backgroundColor: 'rgba(239, 68, 68, 0.04)'
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

        {actionButtons.length > 0 && (
          <Grid size={{ xs: 12, md: "auto" }}>
            <Grid
              container
              spacing={1.5}
              alignItems="center"
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
              wrap="wrap"
            >
              {actionButtons.map((button, index) => (
                <Grid key={index}>
                  {button}
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default PageHeader;
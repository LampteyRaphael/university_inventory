// import { Alert, Snackbar } from "@mui/material";

// export default function Notification({ 
//   open, 
//   severity, 
//   message, 
//   onClose 
// }) {
//   return (
//     <Snackbar 
//       open={open} 
//       autoHideDuration={6000} 
//       onClose={onClose}
//       anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//     >
//       <Alert
//         onClose={onClose}
//         severity={severity}
//         variant="filled"
//         sx={{ width: '100%' }}
//       >
//         {message}
//       </Alert>
//     </Snackbar>
//   );
// }

import React from 'react';
import { Alert, Snackbar } from '@mui/material';

const Notification = ({ open, severity, message, onClose, autoHideDuration = 5000 }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
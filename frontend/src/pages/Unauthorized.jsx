import React from 'react';
import { Typography, Box } from '@mui/material';

const Unauthorized = () => {
  return (
    <Box sx={{ padding: '3rem', textAlign: 'center' }}>
      <Typography variant="h4">Unauthorized</Typography>
      <Typography variant="body1">
        You do not have permission to access this page.
      </Typography>
    </Box>
  );
};

export default Unauthorized;

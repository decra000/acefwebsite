import React from 'react'
import { Box,Typography } from '@mui/material'
import { green } from '@mui/material/colors';

const DasboardFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Box
      sx={{
        backgroundColor: 'white',
        color: green,
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" sx={{ marginTop: '1rem' }}>© {currentYear} ACEF. All rights reserved.</Typography>
    </Box>
  )
}

export default DasboardFooter
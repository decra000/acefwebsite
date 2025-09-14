import { Box, Typography, useTheme } from "@mui/material";
import React from "react";
import FlexBetween from "./FlexBetween";


const BoxHeader = ({ icon, title, subtitle, sideText }) => {
  const { palette } = useTheme();
  return (
    <FlexBetween color={palette.grey[700]} margin="1.5rem 1rem 0 1rem">
      <FlexBetween>        
        <Box width="100%">
          <FlexBetween>
            {icon}
            <Typography variant="body2" mb="-0.1rem">
              {title}
            </Typography>
          </FlexBetween>        
          <Typography variant="body1">{subtitle}</Typography>
        </Box>
      </FlexBetween>
      <Typography variant="body1" fontWeight="700" color={palette.secondary[500]}>
        {sideText}
      </Typography>
    </FlexBetween>
  );
};

export default BoxHeader;

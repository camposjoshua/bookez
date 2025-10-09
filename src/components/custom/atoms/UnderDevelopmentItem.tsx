import React from 'react';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { Box, Chip } from '@mui/material';

export const UnderDevelopmentItem = (props: {}) => {
  return (
    <Chip
      sx={{ p: 1 }}
      icon={<EngineeringIcon />}
      label="Currently in Development"
    />
  );
};

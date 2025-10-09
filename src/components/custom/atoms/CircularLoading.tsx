import * as React from 'react';
import Box from '@mui/material/Box';

export default function CircularLoading() {
  return (
    <Box
      style={{
        justifyContent: 'center',
        flex: 1,
        display: 'flex',
        paddingTop: 16,
      }}
    >
      <div className="loader"></div>
    </Box>
  );
}

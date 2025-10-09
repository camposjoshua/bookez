import { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import Skeleton from '@mui/material/Skeleton';
import './atoms.css';

export const EditableRow = (props: {
  label: string;
  value: string;
  isLoading: boolean;
  onClick: () => void;
}) => {
  const { label, value, isLoading, onClick } = props;
  const [showIcon, setShowIcon] = useState(false);

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      onMouseEnter={() => setShowIcon(true)}
      onMouseLeave={() => setShowIcon(false)}
    >
      <Typography variant="subtitle2" sx={{ color: 'GrayText' }}>
        {label}
      </Typography>
      {isLoading ? (
        <Skeleton variant="rounded" animation="wave" width={120} height={30} />
      ) : (
        <Box
          onClick={onClick}
          className="row-g1 border-round"
          sx={
            showIcon
              ? {
                  backgroundColor: 'whitesmoke',
                  cursor: 'pointer',
                }
              : {}
          }
        >
          <Typography variant="h6" sx={{ marginLeft: 1 }}>
            {value}
          </Typography>
          {showIcon && (
            <IconButton onClick={onClick} aria-label="edit" size="small">
              <EditNoteRoundedIcon fontSize="inherit" />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
};

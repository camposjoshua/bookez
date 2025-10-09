import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Alert,
  FormControl,
  Select,
  SelectChangeEvent,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import { UnderDevelopmentItem } from '../../atoms/UnderDevelopmentItem';

interface UpdateModalProps {
  open: boolean;
  handleClose: () => void;
  modalHeader: string;
  request?: 'success' | 'error' | null;
  updateUserType: number | undefined;
  checkUserType: (event: SelectChangeEvent<number | undefined>) => void;
  handleUpdate: (header: string) => void;
  isLoading: boolean;
  valid: boolean;
}

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export const UpdateModal: React.FC<UpdateModalProps> = ({
  open,
  handleClose,
  modalHeader,
  request,
  updateUserType,
  checkUserType,
  handleUpdate,
  isLoading,
  valid,
}) => {
  const renderFormField = () => {
    switch (modalHeader) {
      case 'User Type':
        return (
          <Box
            sx={{ marginTop: 2 }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Typography variant="subtitle2" sx={{ color: 'GrayText' }}>
              User Type:
            </Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <Select value={updateUserType} onChange={checkUserType}>
                <MenuItem value={1}>Admin</MenuItem>
                <MenuItem value={2}>HopeLiner</MenuItem>
                <MenuItem value={3}>Client</MenuItem>
                <MenuItem value={4}>Tester</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 'Name':
        return (
          <Box sx={{ mt: 2 }}>
            <UnderDevelopmentItem />
          </Box>
        );

      default:
        return <Typography sx={{ mt: 2 }}>No field available</Typography>;
    }
  };

  const getDescription = (modalHeader: string): string => {
    const descriptions: Record<string, string> = {
      Name: 'Update the First Name and Last Name in the database.',
      'User Type': 'Modify the user type by selecting a new role.',
      Email: 'Change the email associated with the user account.',
      Password: 'Reset the user’s password securely.',
    };

    return descriptions[modalHeader] || 'No description available.';
  };
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Box sx={{ padding: 1, backgroundColor: 'Highlight' }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {`Update ${modalHeader}`}
          </Typography>
        </Box>

        {request && (
          <Alert
            sx={{ marginTop: 2 }}
            severity={request}
          >{`Update ${request}`}</Alert>
        )}

        <Typography
          id="modal-modal-description"
          color="slategray"
          sx={{ mt: 2 }}
        >
          {getDescription(modalHeader)}
        </Typography>

        {renderFormField()}

        <Box
          sx={{
            justifyContent: 'space-between',
            display: 'flex',
            flex: 1,
            marginTop: 2,
          }}
        >
          <Button onClick={handleClose}>Close</Button>
          {isLoading ? (
            <Button
              variant="outlined"
              color="info"
              disabled
              endIcon={<CircularProgress size="20px" color="inherit" />}
            >
              Updating
            </Button>
          ) : (
            <Button
              onClick={() => handleUpdate(modalHeader)}
              variant="contained"
              disabled={!valid}
            >
              Update
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

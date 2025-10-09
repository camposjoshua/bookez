import { Alert, Snackbar } from '@mui/material';

export const SnackBar = (props: {
  state: boolean;
  message: string | null;
  type: 'success' | 'error' | null;
}) => {
  const { state, message, type } = props;
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={state}
      autoHideDuration={3000}
    >
      <Alert severity={type ?? 'info'}>{message}</Alert>
    </Snackbar>
  );
};

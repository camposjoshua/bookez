import { Box, Button, Typography } from '@mui/material';
import { UserProps } from '../../../../constants/types/interfaceProps';
import { getUserTypeString } from '../../../../services/user_service';
import { useAccounts } from '../../../../hooks/useAccounts';
import { useSessions } from '../../../../hooks/useSessions';
import { useEffect } from 'react';
import { SnackBar } from '../../atoms/SnackBar';

interface SessionDocumentsProps {
  selectedUser: UserProps | undefined;
}

export const UserProfileBox: React.FC<SessionDocumentsProps> = ({
  selectedUser,
}) => {
  const { updateUserWithCompany, fetchUserData, userData, isFetching, toast } =
    useAccounts(1);
  const { updateSessionsWithCompany } = useSessions(1);

  useEffect(() => {
    if (selectedUser?.email) {
      fetchUserData(selectedUser.email);
      console.log('render');
    }
  }, [selectedUser?.email, fetchUserData, toast.message]);

  return (
    <Box
      className="container"
      style={{
        padding: '12px 12px',
        margin: '12px 0',
        borderRadius: 8,
      }}
    >
      {isFetching ? (
        <Typography color="darkgray">Fetching User...</Typography>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {[
            {
              label: 'Full Name',
              value:
                `${userData?.fname ?? 'N/A'} ${userData?.lname ?? ''}`.trim(),
            },
            { label: 'Email', value: userData?.email ?? 'N/A' },
            { label: 'Company', value: userData?.company ?? 'N/A' },
            {
              label: 'User Type',
              value: getUserTypeString(userData?.user_type ?? 0),
            },
          ].map(({ label, value }, index) => (
            <li key={label} style={{ marginBottom: '8px' }}>
              <span>{label}:</span>{' '}
              <span style={{ fontWeight: 'bold', color: '#333' }}>
                {value || 'N/A'}
              </span>
            </li>
          ))}

          <li
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Box sx={{ alignSelf: 'flex-end', gap: 2, display: 'flex' }}>
              <Button
                variant="contained"
                color="inherit"
                size="small"
                onClick={() =>
                  userData?.email && updateUserWithCompany(userData.email)
                }
              >
                Sync Company
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  userData?.email && updateSessionsWithCompany(userData.email)
                }
              >
                Sync Session
              </Button>
            </Box>
          </li>
        </ul>
      )}

      <SnackBar
        state={toast.show}
        message={toast.message}
        type={toast.request}
      />
    </Box>
  );
};

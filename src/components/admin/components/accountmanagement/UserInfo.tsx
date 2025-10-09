import { Button, Typography } from '@mui/material';
import { getUserTypeString } from '../../../../services/user_service';
import { EditableRow } from '../../../custom/atoms/EditableRow';
import { UserProps } from '../../../../constants/types/interfaceProps';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../../../firebaseConfig';
import { useState } from 'react';

interface UserInfoProps {
  isBuffer: boolean;
  userData?: UserProps; // optional
  handleOpen: (type: 'Name' | 'User Type') => void; // accepts a string
}

export const UserInfo = ({ isBuffer, userData, handleOpen }: UserInfoProps) => {
  const [cooldown, setCooldown] = useState<{ [key: string]: boolean }>({});

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(FIREBASE_AUTH, email);
      alert('Password reset email sent successfully');
      setCooldown((prev) => ({ ...prev, [email]: true }));
      setTimeout(() => {
        setCooldown((prev) => ({ ...prev, [email]: false }));
      }, 300000); // 5 minutes cooldown
    } catch (error) {
      console.error('Error sending password reset email:', error);
      alert('Failed to send password reset email');
    }
  };

  return (
    <div
      className="container"
      style={{
        padding: '12px 12px',
        margin: '12px 0',
        borderRadius: 8,
      }}
    >
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        <li className="row-text-g1">
          <EditableRow
            label="Full Name:"
            isLoading={isBuffer}
            value={`${userData?.fname} ${userData?.lname}`}
            onClick={() => handleOpen('Name')}
          />
        </li>
        <li className="row-text-g1">
          <EditableRow
            label="Email:"
            isLoading={isBuffer}
            value={`${userData?.email}`}
            onClick={() => {}}
          />
        </li>
        <li className="row-text-g1">
          <EditableRow
            label="User type:"
            isLoading={isBuffer}
            value={`${getUserTypeString(userData?.user_type ?? 0)}`}
            onClick={() => handleOpen('User Type')}
          />
        </li>
      </ul>

      <Button
        onClick={() => handleResetPassword(userData?.email ?? '')}
        disabled={cooldown[userData?.email ?? '']}
      >
        Reset Password
      </Button>
      {cooldown[userData?.email ?? ''] && (
        <Typography variant="caption" color="error">
          You can resend the password reset link in 5 minutes.
        </Typography>
      )}
    </div>
  );
};

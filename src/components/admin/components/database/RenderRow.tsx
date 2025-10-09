import {
  Box,
  ButtonBase,
  Avatar,
  Chip,
  Typography,
  Divider,
} from '@mui/material';
import { UserProps } from '../../../../constants/types/interfaceProps';
import { formatFromFBTimestamp } from '../../../../services/date_services';
import { toSentenceCase } from '../../../../services/text_tools';

export const RenderRow = (props: { user: UserProps }) => {
  const { user } = props;
  return (
    <>
      <Box
        sx={{
          margin: 0,
          padding: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <ButtonBase onClick={() => console.log('sup')}>
          <Box className="row-g1">
            <Avatar
              alt="Avatar"
              sx={{
                width: 24,
                height: 24,
                fontSize: 10,
                backgroundColor: '#4bbeff',
              }}
            >
              {user?.fname?.[0]}
              {user?.lname?.[0]}
            </Avatar>
            <Box
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <p>
                {`${toSentenceCase(user.lname)}, ${toSentenceCase(user.fname)}`}
              </p>
            </Box>
            <Chip
              sx={{
                color: 'dimgray',
                fontSize: 10,
                height: 'auto',
              }}
              size="small"
              label={user.company ? `${user.company}` : `unsynced`}
            />
          </Box>
        </ButtonBase>
        <Box
          className="row-g1"
          style={{
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 10,
              color: 'dimgray',
            }}
          >
            Date Created:
          </Typography>
          <Chip
            sx={{ color: 'dimgray', fontSize: 10, height: 'auto' }}
            size="small"
            label={
              user.dateCreated && `${formatFromFBTimestamp(user?.dateCreated)}`
            }
          />
        </Box>
      </Box>
      <Divider />
    </>
  );
};

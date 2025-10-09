import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from '@mui/material';
import { UserProps } from '../../../../constants/types/interfaceProps';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const MonthlyUserSummary = ({ users }: { users: UserProps[] }) => {
  const monthlyGroups = Object.entries(
    users.reduce<Record<string, UserProps[]>>((acc, user) => {
      const date = user.dateCreated?.toDate?.() ?? new Date();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(user);
      return acc;
    }, {}),
  ).sort(([a], [b]) => b.localeCompare(a)); // descending

  let runningTotal = users.length;

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Monthly Breakdown
      </Typography>

      {/* Table Header */}
      <Box
        sx={{
          display: 'flex',
          fontWeight: 'bold',
          borderBottom: '1px solid #ccc',
          py: 1,
          px: 2,
        }}
      >
        <Box sx={{ flex: 2 }}>Month</Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}>
          User Registered (current month)
        </Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}>
          Running Total (Overall Registered Accounts)
        </Box>
      </Box>

      {/* Table Body */}
      {monthlyGroups.map(([monthKey, usersInMonth]) => {
        const count = usersInMonth.length;
        const displayTotal = runningTotal;
        runningTotal -= count;

        return (
          <Box
            key={monthKey}
            sx={{
              display: 'flex',
              borderBottom: '1px solid #eee',
              py: 1,
              px: 2,
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 2 }}>
              {new Date(`${monthKey}-01`).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>{count}</Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>{displayTotal}</Box>
          </Box>
        );
      })}
    </Box>
  );
};

export const UserAnalytics = (props: { data: UserProps[] }) => {
  const { data } = props;

  // Group users by company
  const groupedUsers: Record<string, UserProps[]> = {
    BDO: [],
    STRAIVE: [],
    ADAPTIVE: [],
    METR: [],
    UNSYNCED: [],
  };

  data.forEach((user) => {
    const company = user.company?.toUpperCase?.().trim();
    if (company === 'BDO') {
      groupedUsers.BDO.push(user);
    } else if (company === 'STRAIVE') {
      groupedUsers.STRAIVE.push(user);
    } else if (company === 'ADAPTIVE') {
      groupedUsers.ADAPTIVE.push(user);
    } else if (company === 'METR') {
      groupedUsers.METR.push(user);
    } else {
      groupedUsers.UNSYNCED.push(user);
    }
  });

  return (
    <section>
      <Typography variant="subtitle1">Users Data</Typography>
      <Typography variant="body2" gutterBottom>
        Registered Users: {data.length} as of{' '}
        {new Intl.DateTimeFormat('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        }).format(new Date())}
      </Typography>

      {Object.entries(groupedUsers).map(([company, users]) => (
        <Accordion key={company}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {company} (Total User: {users.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={1}>
              {/* {company === 'UNSYNCED' &&
                users.map((user) => (
                  <RenderRow key={user.user_id} user={user} />
                ))} */}
              <MonthlyUserSummary users={users} />
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </section>
  );
};

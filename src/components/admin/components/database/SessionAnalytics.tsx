import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from '@mui/material';
import { SessionProps } from '../../../../constants/types/interfaceProps';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const MonthlySessionSummary = ({ sessions }: { sessions: SessionProps[] }) => {
  const monthlyGroups = Object.entries(
    sessions.reduce<Record<string, SessionProps[]>>((acc, session) => {
      const date = session.date_created?.toDate?.() ?? new Date();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(session);
      return acc;
    }, {}),
  ).sort(([a], [b]) => b.localeCompare(a)); // descending

  let runningTotal = sessions.length;

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
        <Box sx={{ flex: 1, textAlign: 'right' }}>Session Count</Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}>Running Total</Box>
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

const SessionAnalytics = (props: { data: SessionProps[] }) => {
  const { data } = props;

  const groupedUsers: Record<string, SessionProps[]> = {
    BDO: [],
    STRAIVE: [],
    ADAPTIVE: [],
    METR: [],
    UNSYNCED: [],
  };

  data.forEach((session) => {
    const company = session.company?.toUpperCase?.().trim();
    if (company === 'BDO') {
      groupedUsers.BDO.push(session);
    } else if (company === 'STRAIVE') {
      groupedUsers.STRAIVE.push(session);
    } else if (company === 'ADAPTIVE') {
      groupedUsers.ADAPTIVE.push(session);
    } else if (company === 'METR') {
      groupedUsers.METR.push(session);
    } else {
      groupedUsers.UNSYNCED.push(session);
    }
  });

  return (
    <section>
      <Typography variant="subtitle1" marginTop={1}>
        Sessions Data
      </Typography>
      <Typography variant="body2" gutterBottom>
        Created Session: {data.length} as of{' '}
        {new Intl.DateTimeFormat('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        }).format(new Date())}
      </Typography>

      {Object.entries(groupedUsers).map(([company, sessions]) => (
        <Accordion key={company}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {company} (Total Sessions: {sessions.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={1}>
              {/* {company === 'UNSYNCED' &&
                users.map((user) => (
                  <RenderRow key={user.user_id} user={user} />
                ))} */}
              <MonthlySessionSummary sessions={sessions} />
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </section>
  );
};

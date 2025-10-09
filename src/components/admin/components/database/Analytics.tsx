import { useEffect } from 'react';
import { useAccounts } from '../../../../hooks/useAccounts';
import CircularLoading from '../../../custom/atoms/CircularLoading';
import {
  SessionProps,
  UserProps,
} from '../../../../constants/types/interfaceProps';
import {
  Box,
  ButtonBase,
  Avatar,
  Chip,
  Typography,
  Divider,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import { formatFromFBTimestamp } from '../../../../services/date_services';
import { toSentenceCase } from '../../../../services/text_tools';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSessions } from '../../../../hooks/useSessions';

type DateLikeUser = { dateCreated?: { toDate?: () => Date } };
type DateLikeSession = { date_created?: { toDate?: () => Date } };

interface CombinedProps {
  users: DateLikeUser[];
  sessions: DateLikeSession[];
  company: string;
}

interface CompanyAnalyticsProps {
  users: UserProps[];
  sessions: SessionProps[];
}

const groupByMonth = <T,>(
  items: T[],
  getDate: (item: T) => Date | null = () => null,
): Record<string, T[]> => {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const rawDate = getDate(item);
    const date =
      rawDate instanceof Date && !isNaN(rawDate.getTime())
        ? rawDate
        : new Date();

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!acc[key]) acc[key] = [];
    acc[key].push(item);

    return acc;
  }, {});
};

export const CombinedMonthlyBreakdown = ({
  users,
  sessions,
  company,
}: CombinedProps) => {
  const userGroups = groupByMonth(
    users,
    (u) => u.dateCreated?.toDate?.() ?? null,
  );
  const sessionGroups = groupByMonth(
    sessions,
    (s) => s.date_created?.toDate?.() ?? null,
  );

  const allMonths = new Set([
    ...Object.keys(userGroups),
    ...Object.keys(sessionGroups),
  ]);

  const sortedMonths = Array.from(allMonths).sort((a, b) => b.localeCompare(a));

  const totalUsers = users.length;
  const totalSessions = sessions.length;

  let runningUserTotal = totalUsers;
  let runningSessionTotal = totalSessions;

  return (
    <Box>
      <Typography variant="h6">{company} Monthly Breakdown</Typography>

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
        <Box sx={{ flex: 1, textAlign: 'right' }}>Sessions Created</Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}>Running Total (S)</Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}>User Registred</Box>
        <Box sx={{ flex: 1, textAlign: 'right' }}>Running Total (U)</Box>
      </Box>

      {/* Table Body */}
      {sortedMonths.map((monthKey) => {
        const sessionCount = sessionGroups[monthKey]?.length ?? 0;
        const userCount = userGroups[monthKey]?.length ?? 0;

        const displaySessionTotal = runningSessionTotal;
        const displayUserTotal = runningUserTotal;

        runningSessionTotal -= sessionCount;
        runningUserTotal -= userCount;

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
            <Box sx={{ flex: 1, textAlign: 'right' }}>{sessionCount}</Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              {displaySessionTotal}
            </Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>{userCount}</Box>
            <Box sx={{ flex: 1, textAlign: 'right' }}>{displayUserTotal}</Box>
          </Box>
        );
      })}
    </Box>
  );
};

export const CompanyAnalytics = ({
  users,
  sessions,
}: CompanyAnalyticsProps) => {
  const groupedUsers: Record<string, UserProps[]> = {
    BDO: [],
    STRAIVE: [],
    ADAPTIVE: [],
    METR: [],
    UNSYNCED: [],
  };

  const groupedSessions: Record<string, SessionProps[]> = {
    BDO: [],
    STRAIVE: [],
    ADAPTIVE: [],
    METR: [],
    UNSYNCED: [],
  };

  // Group users
  users.forEach((user) => {
    const company = user.company?.toUpperCase()?.trim() || 'UNSYNCED';
    if (groupedUsers[company]) {
      groupedUsers[company].push(user);
    } else {
      groupedUsers.UNSYNCED.push(user);
    }
  });

  // Group sessions
  sessions.forEach((session) => {
    const company = session.company?.toUpperCase()?.trim() || 'UNSYNCED';
    if (groupedSessions[company]) {
      groupedSessions[company].push(session);
    } else {
      groupedSessions.UNSYNCED.push(session);
    }
  });

  const companyKeys = Object.keys(groupedUsers); // same keys as groupedSessions

  return (
    <section>
      <Typography variant="subtitle1" gutterBottom>
        Company Analytics
        <Typography
          variant="caption"
          style={{ marginLeft: 8, color: 'GrayText' }}
        >
          *Please Sync on Sessions tab if the table has 0 data
        </Typography>
      </Typography>

      <Typography variant="body2" gutterBottom>
        Registered Users: {users.length} | Sessions: {sessions.length} as of{' '}
        {new Intl.DateTimeFormat('en-US', {
          dateStyle: 'long',
          timeStyle: 'short',
        }).format(new Date())}
      </Typography>

      {companyKeys.map((company) => (
        <Accordion key={company}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {company} (Users: {groupedUsers[company].length}, Sessions:{' '}
              {groupedSessions[company].length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexDirection="column" gap={2}>
              <CombinedMonthlyBreakdown
                company={company}
                users={groupedUsers[company]}
                sessions={groupedSessions[company]}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </section>
  );
};

export const AnalyticsTool = () => {
  const {
    users,
    isLoading: isUsersLoading,
    getAllLatestUsers,
  } = useAccounts(1000);
  const {
    sessions,
    isLoading: isSessionsLoading,
    getAllSessions,
  } = useSessions(10000);

  useEffect(() => {
    const unsubscribeUsers = getAllLatestUsers();
    const unsubscribeSessions = getAllSessions();
    return () => {
      unsubscribeUsers();
      unsubscribeSessions();
    };
  }, [getAllLatestUsers, getAllSessions]);

  const isLoading = isUsersLoading || isSessionsLoading;

  if (isLoading) {
    return (
      <Box className="default-container">
        <CircularLoading />
      </Box>
    );
  }

  return (
    <div className="default-container">
      <p style={{ marginBottom: 12 }}>Analytics</p>
      <CompanyAnalytics users={users} sessions={sessions} />
    </div>
  );
};

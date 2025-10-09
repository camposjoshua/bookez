import { Button } from '@mui/material';
import {
  SessionProps,
  UserProps,
} from '../../../../constants/types/interfaceProps';
import { useSessions } from '../../../../hooks/useSessions';
import { downloadCSV } from '../../../../services/csv_download';
import CircularLoading from '../../../custom/atoms/CircularLoading';
import { TableRow } from '../../../custom/molecules/sessionTracker/TableRow';
import { downloadExcel } from '../../../../services/xls_download';
import { formatFBTimestamp } from '../../../../services/date_services';

interface UserSessionProps {
  userData: UserProps;
}

const statusMap: Record<number, string> = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'Cancelled',
  3: 'Completed',
  4: 'No Show',
};

export const UserSession = ({ userData }: UserSessionProps) => {
  const { sessions, isLoading, getUserSessions } = useSessions(1000);

  const fetchSession = (email: string, type: 2 | 3) => {
    getUserSessions(email, type);
  };

  const downloadReport = () => {
    const simplified = sessions.map((session: SessionProps) => ({
      Status: statusMap[session.status],
      DateCreated: formatFBTimestamp(session.date_created.seconds),
      Schedule: formatFBTimestamp(session.date.seconds),
      Client: session.user_email,
      Company: session.company,
      Hopeliner: session.hopeliner_email,
    }));

    downloadExcel(simplified, `${userData.email}.xlsx`);
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
      {isLoading && <CircularLoading />}
      {userData.user_type !== 1 && (
        <button
          onClick={() =>
            fetchSession(userData.email, userData.user_type === 3 ? 3 : 2)
          }
        >
          Show Report
        </button>
      )}
      {sessions.length > 0 && (
        <Button onClick={() => downloadReport()}>Download Report</Button>
      )}

      {sessions.map((session: SessionProps, index: number) => {
        return (
          <>
            <TableRow
              key={session.id}
              data={session}
              index={index}
              onEmailClick={() => {}}
            />
          </>
        );
      })}
    </div>
  );
};

import { useEffect, useState } from 'react';
import './components.css';
import FolderIcon from '@mui/icons-material/Folder';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../../firebaseConfig';
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';
import { UserProps } from '../../../constants/types/interfaceProps';
import CircularLoading from '../../custom/atoms/CircularLoading';
import { TableRow } from '../../custom/molecules/sessionTracker/TableRow';
import { useSessions } from '../../../hooks/useSessions';
import { BreadCrumb } from '../../custom/molecules/sessionTracker/BreadCrumb';
import { getCurrentYearAndMonth } from '../../../services/date_services';
import { TableHeader } from '../../custom/molecules/sessionTracker/TableHeader';
import { MONTH_NAMES } from '../../../constants/enum/months';
import { UserProfileBox } from '../../custom/molecules/sessionTracker/UserProfileBox';
import { useSync } from '../../../hooks/useSync';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

function SessionTracker() {
  const { year: currentYear, month: currentMonth } = getCurrentYearAndMonth();
  const [queryLimit, setQueryLimit] = useState(10);
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProps | undefined>(
    undefined,
  );
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [isBuffer, setIsBuffer] = useState<boolean>(true);
  const [searchText, setSearchText] = useState('');
  const [labelMessage, setLabelMessage] = useState('Search Sessions');
  const {
    sessions,
    isLoading,
    getAllSessions,
    getSessions,
    getUserSessions,
    getSessionsByMonthYear,
    searchSessionsByEmail,
  } = useSessions(queryLimit);
  const { updateSessionGroup, isSyncing } = useSync();

  useEffect(() => {
    const unsubscribe = getAllSessions();
    return () => unsubscribe();
  }, [getAllSessions]);

  const handleSetLimit = (event: any) => {
    setQueryLimit(Number(event.target.value));
  };

  const fetchUserData = async (
    email: string,
  ): Promise<UserProps | undefined> => {
    try {
      const userQuery = query(
        collection(FIRESTORE_DB, 'User'),
        where('email', '==', email),
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        const user: UserProps = {
          dateCreated: userData.dateCreated,
          company: userData.company ?? '',
          email: userData.email ?? '',
          fname: userData.fname ?? '',
          img: userData.img ?? '',
          is_verified: userData.is_verified ?? false,
          lname: userData.lname ?? '',
          name: userData.name ?? '',
          token: userData.token ?? '',
          user_id: userDoc.id,
          user_type: userData.user_type ?? 0,
        };

        return user;
      } else {
        console.log('No user found with this email');
        return undefined;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return undefined;
    }
  };

  const handleEmailClick = async (user_email: string, user_type: 2 | 3) => {
    setSelectedName(user_email);
    getUserSessions(user_email, user_type);

    const userQuery: UserProps | undefined = await fetchUserData(user_email);
    setSelectedUser(userQuery);
  };

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setSelectedName(null);
    setSelectedTab(newValue);
    switch (newValue) {
      case 'All':
        getAllSessions();
        break;
      case 'No Show':
        getSessions(true, 4);
        break;
      case 'Completed':
        getSessions(true, 3);
        break;
      case 'Cancelled':
        getSessions(true, 2);
        break;
      case 'Confirmed':
        getSessions(true, 1);
        break;
      case 'Pending':
        getSessions(true, 0);
        break;
      default:
        break;
    }
  };

  const handleFilter = () => {
    getSessionsByMonthYear(year, month);
  };

  const handleSearch = async () => {
    if (searchText.length > 0) {
      if (searchText.includes('@')) {
        setLabelMessage('Search Sessions');
        performSearch(searchText);
      } else {
        setLabelMessage('Error - Please enter a valid email address');
      }
    } else {
      setLabelMessage('Search Sessions');
      getAllSessions();
    }
  };

  const performSearch = (email: string) => {
    searchSessionsByEmail(email);
  };

  useEffect(() => {
    setIsBuffer(true);

    const timer = setTimeout(() => {
      setIsBuffer(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedName]);

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 200, // Limit the height of the dropdown
      },
    },
  };

  return (
    <Box>
      <BreadCrumb
        icon={<FolderIcon color="info" className="mr-1" />}
        parent="Session Documents"
        selectedName={selectedName}
        onClick={() => {
          getAllSessions();
          setSelectedName(null);
          setSelectedTab('All');
        }}
      />

      {selectedName ? (
        <UserProfileBox selectedUser={selectedUser} />
      ) : (
        <>
          <Box>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="All" value="All" />
              <Tab label="No Show" value="No Show" />
              <Tab label="Completed" value="Completed" />
              <Tab label="Cancelled" value="Cancelled" />
              <Tab label="Confirmed" value="Confirmed" />
              <Tab label="Pending" value="Pending" />
            </Tabs>
          </Box>
          {selectedTab === 'All' && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box
                component="form"
                sx={{ display: 'flex', gap: 2, marginTop: 2, marginBottom: 2 }}
                noValidate
                autoComplete="off"
              >
                <TextField
                  error={!!labelMessage.includes('Error')}
                  id="outlined-textarea"
                  label={labelMessage}
                  placeholder="Email"
                  size="small"
                  sx={{ minWidth: '400px' }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Button
                  sx={{ alignSelf: 'baseline', display: 'flex' }}
                  variant="contained"
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl
                  variant="outlined"
                  style={{ minWidth: 100 }}
                  size="small"
                >
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    label="Month"
                    MenuProps={MenuProps}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {MONTH_NAMES.map((name, index) => (
                      <MenuItem key={name} value={index + 1}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  variant="outlined"
                  style={{ minWidth: 100 }}
                  size="small"
                >
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    label="Year"
                    MenuProps={MenuProps}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {[...Array(10)].map((_, index) => (
                      <MenuItem key={currentYear} value={currentYear - index}>
                        {currentYear - index}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  onClick={handleFilter}
                  variant="contained"
                  color="primary"
                >
                  Set Date
                </Button>
                <Button
                  onClick={() => updateSessionGroup(sessions)}
                  variant="outlined"
                  startIcon={
                    isSyncing ? (
                      <CircularProgress size={20} />
                    ) : (
                      <CloudSyncIcon />
                    )
                  }
                >
                  {isSyncing ? 'Syncing...' : 'Sync'}
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}

      <TableHeader />
      <div style={{ height: '300px', overflowY: 'scroll' }}>
        {isBuffer || isLoading ? (
          <CircularLoading />
        ) : (
          sessions.map((doc: any, index: number) => (
            <TableRow
              key={doc.id}
              data={doc}
              index={index}
              onEmailClick={handleEmailClick}
            />
          ))
        )}
      </div>

      {!selectedName && (
        <Box>
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ fontSize: 12, color: 'GrayText' }}>
                Current Entries:{' '}
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  {queryLimit}
                </span>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FormControl
                variant="outlined"
                style={{ minWidth: 120 }}
                size="small"
              >
                <InputLabel>Entries</InputLabel>
                <Select
                  value={queryLimit}
                  onChange={handleSetLimit}
                  label="Entries"
                  MenuProps={MenuProps}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </Box>
      )}
    </Box>
  );
}
export default SessionTracker;

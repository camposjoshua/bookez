import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  List,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { BreadCrumb } from '../../custom/molecules/sessionTracker/BreadCrumb';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useAccounts } from '../../../hooks/useAccounts';
import { UserProps } from '../../../constants/types/interfaceProps';
import { formatFromFBTimestamp } from '../../../services/date_services';
import { toSentenceCase } from '../../../services/text_tools';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { fetchUserData } from '../../../services/user_service';
import { UpdateModal } from '../../custom/molecules/accountManagement/UpdateModal';
import { useSync } from '../../../hooks/useSync';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import { UserInfo } from './accountmanagement/UserInfo';
import { UserSession } from './accountmanagement/UserSession';

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 200, // Limit the height of the dropdown
    },
  },
};

export const AccountManagement = () => {
  const [queryLimit, setQueryLimit] = useState<number>(10);
  const {
    users,
    isLoading,
    getAllUsers,
    getUsers,
    searchSpecificUser,
    updateUserByEmail,
    request,
    setRequest,
  } = useAccounts(queryLimit);
  const { updateUserGroup, isSyncing } = useSync();
  const [selectedTab, setSelectedTab] = useState<0 | 1 | 2 | 3 | 4 | null>(3);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserProps | undefined>(undefined);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [modalHeader, setModalHeader] = useState<'Name' | 'User Type'>('Name');
  const [updateUserType, setUpdateUserType] = useState<number | undefined>(
    undefined,
  );
  const [valid, setValid] = useState<boolean>(false);

  const handleOpen = (type: 'Name' | 'User Type') => {
    setModalHeader(type);
    setShowModal(true);
  };
  const handleClose = async () => {
    const user: UserProps | undefined = await fetchUserData(
      userData?.email as string,
    );
    setUserData(user);
    setShowModal(false);
    setRequest(null);
    setModalHeader('Name');
    setUpdateUserType(undefined);
  };

  const handleTabChange = (
    event: React.ChangeEvent<{}>,
    tab: 0 | 1 | 2 | 3 | 4 | null,
  ) => {
    setSelectedTab(tab);
    if (tab) {
      getUsers(true, tab);
    } else {
      getAllUsers();
    }
  };

  const checkUserType = (event: any) => {
    console.log(Number(event.target.value), userData?.user_type);
    if (Number(event.target.value) === userData?.user_type) {
      setValid(false);
      setUpdateUserType(Number(event.target.value));
    } else {
      setValid(true);
      setUpdateUserType(Number(event.target.value));
    }
  };

  const handleSetLimit = (event: any) => {
    setQueryLimit(Number(event.target.value));
  };

  const handleUserSelect = async (email: string) => {
    setSelectedUser(email);
    const user: UserProps | undefined = await fetchUserData(email);
    setUserData(user);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchText);
    performSearch(searchText);
  };

  const performSearch = (email: string) => {
    searchSpecificUser(email);
  };

  const handleUpdate = (key: 'Name' | 'User Type') => {
    console.log(key);
    if (key === 'User Type') {
      updateUserByEmail(
        userData?.email as string,
        `Update User type to ${updateUserType}`,
        {
          user_type: updateUserType,
        },
      );
    } else {
      console.log('NAME');
    }
  };

  useEffect(() => {
    const unsubscribe = getAllUsers();
    return () => unsubscribe();
  }, [getAllUsers]);

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <BreadCrumb
        icon={<AccountBoxIcon className="mr-1" color="info" />}
        parent={'Account Management'}
        selectedName={selectedUser}
        onClick={() => {
          setSelectedUser(null);
        }}
      />

      {selectedUser && userData ? (
        <>
          <UserInfo
            userData={userData}
            isBuffer={false}
            handleOpen={handleOpen}
          />
          <UserSession userData={userData} />
        </>
      ) : (
        <>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Client" value={3} />
            <Tab label="Admin" value={1} />
            <Tab label="Hopeliner" value={2} />
          </Tabs>

          {selectedTab === 3 && (
            <Box
              component="form"
              sx={{ display: 'flex', gap: 2, marginTop: 2, marginBottom: 2 }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="outlined-textarea"
                label="Search Client"
                placeholder="Email"
                size="small"
                sx={{ minWidth: '500px' }}
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
              <Button
                onClick={() => updateUserGroup(users)}
                variant="outlined"
                startIcon={
                  isSyncing ? <CircularProgress size={20} /> : <CloudSyncIcon />
                }
              >
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
            </Box>
          )}

          <List
            sx={{
              width: '100%',
              bgcolor: 'background.paper',
              height: '350px',
              overflow: 'scroll',
            }}
          >
            {users.map((user: UserProps) => {
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
                    <ButtonBase onClick={() => handleUserSelect(user.email)}>
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
                      <Chip
                        icon={<VisibilityIcon scale={5} />}
                        sx={{ height: 'auto', fontSize: 10 }}
                        size="small"
                        onClick={() => handleUserSelect(user.email)}
                        label="view"
                      />
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
                          user.dateCreated &&
                          `${formatFromFBTimestamp(user?.dateCreated)}`
                        }
                      />
                    </Box>
                  </Box>
                  <Divider />
                </>
              );
            })}
          </List>
          <div style={{}}>
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
                    {users.length}
                  </span>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel>Entries</InputLabel>
                  <Select
                    value={queryLimit}
                    onChange={handleSetLimit}
                    label="Entries"
                    MenuProps={MenuProps}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={250}>250</MenuItem>
                    <MenuItem value={500}>500</MenuItem>
                    <MenuItem value={1000}>1000</MenuItem>
                    <MenuItem value={2000}>2000</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
        </>
      )}

      <UpdateModal
        open={showModal}
        request={request}
        handleClose={handleClose}
        modalHeader={modalHeader}
        updateUserType={updateUserType}
        checkUserType={checkUserType}
        handleUpdate={() => handleUpdate(modalHeader)}
        isLoading={isLoading}
        valid={valid}
      />
    </Box>
  );
};

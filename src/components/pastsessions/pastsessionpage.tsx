/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import './pastsessionpage.css';
import { jwtDecode } from 'jwt-decode';
import { FIRESTORE_DB } from '../../firebaseConfig';
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { getHopeLinerAccess } from '../../services/user_service';
import { FBTimestamp, getDateStatus } from '../../services/date_services';
import { Chip, Stack } from '@mui/material';
import { StatusChip } from '../custom/molecules/sessionTracker/StatusChip';

type FireBaseUser = {
  uid?: string;
  email?: string;
};

function PastSessionPage(
  props: Readonly<{
    id_token: any;
    user: FireBaseUser;
    handleNav?: any;
    userType: any;
    view: any;
  }>,
) {
  const { userType, user: currentUser, handleNav } = props;
  const [creds, setCreds] = React.useState<any>([]);

  const [pastSessions, setPastSessions] = React.useState<any>([]);
  const [thisMonth, setThisMonth] = React.useState<any>([]);
  const [thisWeek, setThisWeek] = React.useState<any>([]);
  const [today, setToday] = React.useState<any>([]);
  const [nextMonth, setNextMonth] = React.useState<any>([]);
  const [isMobile, setMobileUse] = React.useState(false);

  const [isDonePHQ, setDonePHQ] = React.useState<boolean>(true);
  const [isDoneGAD, setDoneGAD] = React.useState<boolean>(true);
  const [isDoneDSM, setDoneDSM] = React.useState<boolean>(true);
  const [isLoading, setLoading] = React.useState<boolean>(true);

  const checkQuestionnaire = async (data: any) => {
    const bookingsRef = collection(FIRESTORE_DB, 'Questionnaire');

    const types = ['PHQ-9', 'GAD-7', 'DSM-5'];

    const querySnapshot = await getDocs(
      query(
        bookingsRef,
        where('respondent_id', '==', data.uid),
        where('type', 'in', types),
      ),
    );

    const documents = await querySnapshot.docs.map((doc) => doc.data());

    const PHQ = await documents.filter((doc) => doc.type === 'PHQ-9');
    const GAD = await documents.filter((doc) => doc.type === 'GAD-7');
    const DSM = await documents.filter((doc) => doc.type === 'DSM-5');

    if (PHQ.length === 0) {
      setLoading(false);
      setDonePHQ(false);
    }
    if (GAD.length === 0) {
      setLoading(false);
      setDoneGAD(false);
    }
    if (DSM.length === 0) {
      setLoading(false);
      setDoneDSM(false);
    } else {
      setLoading(false);
    }
  };

  const fetchSessionList = (user: any) => {
    let sessionListQuery;

    switch (userType) {
      case 1: {
        const accessID = getHopeLinerAccess(user.uid);
        sessionListQuery = query(
          collection(FIRESTORE_DB, 'Session'),
          where('hopeliner_id', '==', accessID),
          where('status', '!=', 5),
          orderBy('date_created', 'desc'),
          limit(100),
        );
        break;
      }
      case 2:
        sessionListQuery = query(
          collection(FIRESTORE_DB, 'Session'),
          where('hopeliner_id', '==', user.uid),
        );
        break;
      case 3:
        sessionListQuery = query(
          collection(FIRESTORE_DB, 'Session'),
          where('user_id', '==', user.uid),
        );
        break;
      default:
        sessionListQuery = query(collection(FIRESTORE_DB, 'Session'));
        break;
    }
    checkQuestionnaire(user);

    const subscriber = onSnapshot(sessionListQuery, {
      next: (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredSession = filterSessions(list);

        setPastSessions(
          filteredSession.filter((item: any) => getDateStatus(item) === 'past'),
        );
        setToday(
          filteredSession.filter(
            (item: any) => getDateStatus(item) === 'today',
          ),
        );
        setThisWeek(
          filteredSession.filter(
            (item: any) => getDateStatus(item) === 'this week',
          ),
        );
        setThisMonth(
          filteredSession.filter(
            (item: any) => getDateStatus(item) === 'this month',
          ),
        );
        setNextMonth(
          filteredSession.filter(
            (item: any) => getDateStatus(item) === 'next month',
          ),
        );
      },
      error: (error) => {
        console.error('Error fetching sessions:', error);
      },
    });

    return () => subscriber();
  };

  React.useEffect(() => {
    if (props.id_token) {
      setCreds(jwtDecode(props.id_token));
    }
    if (currentUser) {
      fetchSessionList(currentUser);
    }
    if (props.view) {
      setMobileUse(props.view);
    }
  }, [props]);

  function filterSessions(arr: any) {
    const currentTime = Date.now();
    return arr.filter((session: any) => {
      return (
        session.status !== 5 &&
        (session.status === 2 ||
          session.status === 3 ||
          session.status === 4 ||
          session.status === 6 ||
          session.status === 1 ||
          session.status === 0 ||
          session.time_end < currentTime)
      );
    });
  }

  const ScheduleCard = (item: any) => {
    const data = item.item;
    return (
      <div
        className="schedule-card"
        onClick={() => handleNav(data.id, 'session')}
      >
        {userType == 3 && (
          <>
            <div
              className={
                isMobile ? 'schedule-card-img' : 'desktop-schedule-card-img'
              }
            >
              <img
                className={isMobile ? 'card-img' : 'desktop-card-img'}
                src={data.hopeliner_img}
              />
            </div>
            <div
              className={
                isMobile
                  ? 'schedule-card-details'
                  : 'desktop-schedule-card-details'
              }
            >
              <div
                className={
                  isMobile
                    ? 'schedule-card-header'
                    : 'desktop-schedule-card-header'
                }
              >
                Meeting with {data.hopeliner_name}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <div
                  className={
                    isMobile
                      ? 'schedule-card-subheader'
                      : 'desktop-schedule-card-subheader'
                  }
                  style={{ marginRight: 10 }}
                >
                  {FBTimestamp(data.date.seconds, 'complete')}
                </div>
                <div className="h-stack">
                  <AccessTimeFilledIcon
                    color="primary"
                    sx={{ height: 13, width: 13 }}
                  />
                  <div
                    className={
                      isMobile
                        ? 'schedule-card-subheader'
                        : 'desktop-schedule-card-subheader'
                    }
                    style={{ marginLeft: 3 }}
                  >
                    {data.type}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {(userType === 1 || userType === 2) && (
          <>
            <div
              className={
                isMobile ? 'schedule-card-img' : 'desktop-schedule-card-img'
              }
            >
              <img
                className={isMobile ? 'card-img' : 'desktop-card-img'}
                src={data.user_img}
              />
            </div>
            <div
              className={
                isMobile
                  ? 'schedule-card-details'
                  : 'desktop-schedule-card-details'
              }
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems={'center'}
                marginBottom={1}
              >
                <div
                  className={
                    isMobile
                      ? 'schedule-card-header'
                      : 'desktop-schedule-card-header'
                  }
                >
                  Meeting with {data.user_name}
                </div>
              </Stack>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <div
                  className={
                    isMobile
                      ? 'schedule-card-subheader'
                      : 'desktop-schedule-card-subheader'
                  }
                >
                  {StatusChip(data.status)}{' '}
                  <Chip
                    label={FBTimestamp(data.date.seconds, 'complete')}
                    color={'default'}
                    size="small"
                    sx={{ fontSize: 9 }}
                  />{' '}
                  <Chip
                    label={data.type}
                    color={'default'}
                    size="small"
                    sx={{ fontSize: 9 }}
                  />
                </div>
                <div
                  className={
                    isMobile
                      ? 'schedule-card-subheader'
                      : 'desktop-schedule-card-subheader'
                  }
                  style={{ marginLeft: 6 }}
                ></div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {isMobile && (
        <>
          <div
            className="container"
            style={{ paddingTop: 15, paddingBottom: 15, marginBottom: 0 }}
          >
            <div className="home-header">
              {creds && (
                <section
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <div
                    className="header-container h-stack"
                    style={{ justifyContent: 'space-between', width: '100%' }}
                  >
                    <h1 className="greetings">{`Session History`}</h1>
                    <ChecklistIcon />
                    {/* <h4 style={{color: "grey"}}>How are you?</h4> */}
                  </div>
                </section>
              )}
            </div>
          </div>

          <div
            className="container"
            style={{ paddingTop: 15, paddingBottom: 15 }}
          >
            {pastSessions.length == 0 ? (
              <div style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}>
                You currently dont have any past sessions yet.
              </div>
            ) : (
              <div style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}>
                Here is a list of your past sessions:
              </div>
            )}

            {pastSessions && (
              <div className="home-body">
                {pastSessions.length > 0 && (
                  <div>
                    {pastSessions
                      .sort((a: any, b: any) => b.time_start - a.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <ScheduleCard item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
      {!isMobile && (
        <>
          {pastSessions.length == 0 ? (
            <div style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}>
              You currently dont have any past sessions yet.
            </div>
          ) : (
            <div style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}>
              Session List
            </div>
          )}
          <div>
            {today.length > 0 && (
              <div className="home-body">
                <div
                  style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}
                >
                  Today
                </div>
                {today.length > 0 && (
                  <div>
                    {today
                      .sort((a: any, b: any) => b.time_start - a.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <ScheduleCard item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            {thisWeek.length > 0 && (
              <div className="home-body">
                <div
                  style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}
                >
                  This week
                </div>
                {thisWeek.length > 0 && (
                  <div>
                    {thisWeek
                      .sort((a: any, b: any) => b.time_start - a.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <ScheduleCard item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
            {thisMonth.length > 0 && (
              <div className="home-body">
                <div
                  style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}
                >
                  Upcoming this month
                </div>
                {thisMonth.length > 0 && (
                  <div>
                    {thisMonth
                      .sort((a: any, b: any) => b.time_start - a.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <ScheduleCard item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {nextMonth.length > 0 && (
              <div className="home-body">
                <div
                  style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}
                >
                  Next Month
                </div>
                {nextMonth.length > 0 && (
                  <div>
                    {nextMonth
                      .sort((a: any, b: any) => b.time_start - a.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <ScheduleCard item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {pastSessions && (
              <div className="home-body">
                <div
                  style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}
                >
                  Here is a list of your past sessions:
                </div>
                {pastSessions.length > 0 && (
                  <div>
                    {pastSessions
                      .sort((a: any, b: any) => b.time_start - a.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <ScheduleCard item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
export default PastSessionPage;

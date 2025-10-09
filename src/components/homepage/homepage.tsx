import React, { useEffect } from 'react';
// import { useMediaQuery } from 'react-responsive'
import './homepage.css';
import { jwtDecode } from 'jwt-decode';
import { FIRESTORE_DB } from '../../firebaseConfig';
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import AdminControlPage from '../admin/adminFunctions';
import UserPage from './components/UserPage';

function HomePage(props: {
  id_token: any;
  user: any;
  handleNav?: any;
  userType: any;
  view: any;
  isBooked: any;
}) {
  const currentUser = props.user;
  const handleNav = props.handleNav;
  // const [currentUser, setCurrentUser ] = React.useState<User | null>(null)
  const [creds, setCreds] = React.useState<any>([]);

  const [today, setToday] = React.useState<any>([]);
  const [tom, setTom] = React.useState<any>([]);
  const [thisWeek, setThisWeek] = React.useState<any>([]);
  const [nextWeek, setNextWeek] = React.useState<any>([]);
  const [thisMonth, setThisMonth] = React.useState<any>([]);
  const [nextMonth, setNextMonth] = React.useState<any>([]);
  const [userType, setUserType] = React.useState<any>('');
  const [isMobile, setMobileUse] = React.useState(false);

  const [isDonePHQ, setDonePHQ] = React.useState<boolean>(true);
  const [isDoneGAD, setDoneGAD] = React.useState<boolean>(true);
  const [isDoneDSM, setDoneDSM] = React.useState<boolean>(true);
  const [isLoading, setLoading] = React.useState<boolean>(true);

  const [userSessions, setSessionList] = React.useState<any[]>([]);
  const [userData, setUserData] = React.useState<any>([]);

  const formatDate = (selectedDate: number) => {
    const date = new Date(selectedDate * 1000);
    // Array of month names
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    // Get the month name from the array
    const monthName = months[date.getMonth()];
    // Format the date as Month day, year hours:minutes AM/PM
    const formattedDate = `${monthName} ${date.getDate()}, ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
    return formattedDate;
  };

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
    // console.log(documents, "DOCU")

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

  const loadData = (user: any) => {
    const SessionListQuery =
      userType === 2
        ? query(
            collection(FIRESTORE_DB, 'Session'),
            where('hopeliner_id', '==', user.uid),
          )
        : query(
            collection(FIRESTORE_DB, 'Session'),
            where('user_id', '==', user.uid),
          );
    checkQuestionnaire(user);
    const subscriber = onSnapshot(SessionListQuery, {
      next: (snapshot) => {
        const list: any[] = [];

        getDocs(SessionListQuery)
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              list.push({
                id: doc.id,
                ...doc.data(),
              });
            });
            setSessionList(list);
          })
          .catch((error) => {
            console.error('Error getting documents: ', error);
          });
      },
    });

    return () => subscriber;
  };

  React.useEffect(() => {
    if (userData.length != 0) {
      // console.log('isverified',userData.isVerified)
      setUserType(userData.user_type);
      if (!userData.isVerified) {
        // console.log('not verified')
      }
    }
  }, [userData]);

  const loadUserData = async (user: any) => {
    try {
      // Create a query to filter documents based on the user_id field
      const q = query(
        collection(FIRESTORE_DB, 'User'),
        where('user_id', '==', user.uid),
      );

      // Get the documents that match the query
      const querySnapshot = await getDocs(q);
      // Check if any documents were found
      if (!querySnapshot.empty) {
        // If documents were found, return the first one (assuming user_id is unique)
        setUserData(querySnapshot.docs[0].data());
        return querySnapshot.docs[0].data();
      } else {
        // If no documents were found, return null or handle the case accordingly
        return null;
      }
    } catch (error) {
      console.error('Error retrieving user document:', error);
      return null;
    }
  };

  function formatDateStatus(arr: any) {
    const dateInMilliseconds = arr.time_start;
    const currentDate = new Date();
    const inputDate = new Date(dateInMilliseconds);

    // Calculate today's date (without time)
    const todayDate = new Date(currentDate);
    todayDate.setHours(0, 0, 0, 0);

    // Calculate tomorrow's date
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(todayDate.getDate() + 1);

    // Calculate the start of the current week (Sunday)
    const currentWeekStart = new Date(currentDate);
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    // Calculate the end of the current week (Saturday)
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
    currentWeekEnd.setHours(23, 59, 59, 999);

    // Calculate the start of next week (Sunday)
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(currentWeekStart.getDate() + 7);

    // Calculate the start of next month
    const nextMonthStart = new Date(currentDate);
    nextMonthStart.setDate(1);
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

    // Calculate the end of this month
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    endOfMonth.setHours(23, 59, 59, 999);

    // Check if the input date is today
    if (inputDate.toDateString() === todayDate.toDateString()) {
      // Set state for today
      setToday((prevItems: any) => [...prevItems, arr]);
      props.isBooked(true);
      return 'today';
    }

    // Check if the input date is in the past
    if (inputDate < currentDate) {
      return 'past';
    }

    // Check if the input date is tomorrow
    if (inputDate.toDateString() === tomorrowDate.toDateString()) {
      setTom((prevItems: any) => [...prevItems, arr]);
      props.isBooked(true);
      return 'tomorrow';
    }

    // Check if the input date is within the current week
    if (inputDate >= currentWeekStart && inputDate <= currentWeekEnd) {
      setThisWeek((prevItems: any) => [...prevItems, arr]);
      props.isBooked(true);
      return 'this week';
    }

    // Check if the input date is within the next week
    if (
      inputDate >= nextWeekStart &&
      inputDate <= new Date(currentWeekEnd.getTime() + 7 * 24 * 60 * 60 * 1000)
    ) {
      setNextWeek((prevItems: any) => [...prevItems, arr]);
      props.isBooked(true);
      return 'next week';
    }

    // Check if the input date is within this month
    if (inputDate >= currentDate && inputDate <= endOfMonth) {
      setThisMonth((prevItems: any) => [...prevItems, arr]);
      props.isBooked(true);
      return 'this month';
    }

    // Check if the input date is within the next month
    if (inputDate >= nextMonthStart) {
      setNextMonth((prevItems: any) => [...prevItems, arr]);
      props.isBooked(true);
      return 'next month';
    }

    // If the input date is beyond the next month
    return 'future';
  }

  React.useEffect(() => {
    if (props.id_token) {
      // console.log(jwtDecode(props.id_token))
      setCreds(jwtDecode(props.id_token));
    }
    if (props.user) {
      loadUserData(currentUser);
    }
    if (props.view) {
      setMobileUse(props.view);
    }
  }, [props]);

  React.useEffect(() => {
    loopSession(filterSessions(userSessions));
    if (userSessions.length != 0) {
      // console.log('BOOKED', userSessions)
    }
  }, [userSessions]);

  React.useEffect(() => {
    if (currentUser) {
      loadData(currentUser);
      //loadQuestionnare()
    }
    props.userType(userType);
  }, [userType]);

  const loopSession = (arr: any) => {
    // Filter out objects with status equal to 5
    const filteredArr = arr.filter((item: any) => item.status !== 5);

    for (let index = 0; index < filteredArr.length; index++) {
      // Invoke formatDateStatus and capture its return value
      const status = formatDateStatus(filteredArr[index]);
      // // console.log(status);

      if (index + 1 === filteredArr.length) {
        // console.log('last', index + 1, filteredArr.length);

        // Update state variables with filtered arrays
        if (today) {
          setToday((prev: any) => retainUniqueObjects(prev || []));
        }
        if (tom) {
          setTom((prev: any) => retainUniqueObjects(prev || []));
        }
        if (thisWeek) {
          setThisWeek((prev: any) => retainUniqueObjects(prev || []));
        }
        if (nextWeek) {
          setNextWeek((prev: any) => retainUniqueObjects(prev || []));
        }
        if (nextMonth) {
          setNextMonth((prev: any) => retainUniqueObjects(prev || []));
        }
        if (thisMonth) {
          setThisMonth((prev: any) => retainUniqueObjects(prev || []));
        }
      }
    }
  };

  // only get upcoming sessions. removes past sessions or cancelled sessions.
  function filterSessions(arr: any) {
    const currentTime = Date.now();
    return arr.filter((session: any) => {
      return (
        session.status !== 2 &&
        session.status !== 3 &&
        session.status !== 4 &&
        session.time_end > currentTime
      );
    });
  }

  function retainUniqueObjects(arr: any) {
    // Create a new array to store unique objects
    const uniqueArray: any = [];

    // Iterate over each object in the input array
    arr.forEach((obj: any) => {
      // Check if the object already exists in the unique array
      const index = uniqueArray.findIndex((item: any) => isEqual(item, obj));

      // If the object doesn't exist in the unique array, add it
      if (index === -1) {
        uniqueArray.push(obj);
      }
    });

    return uniqueArray;
  }

  // Helper function to check if two objects are equal
  function isEqual(obj1: any, obj2: any) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  const Schedule_Card = (item: any) => {
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
                Schedule with {data.hopeliner_name}
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
                  {formatDate(data.date.seconds)}
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
        {userType == 2 && (
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
              <div
                className={
                  isMobile
                    ? 'schedule-card-header'
                    : 'desktop-schedule-card-header'
                }
              >
                Schedule with {data.user_name}
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
                >
                  {formatDate(data.date.seconds)}
                </div>
                <div
                  className={
                    isMobile
                      ? 'schedule-card-subheader'
                      : 'desktop-schedule-card-subheader'
                  }
                  style={{ marginLeft: 6 }}
                >
                  Duration: {data.type}
                </div>
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
                  <div className="header-container">
                    <h1 className="greetings">{`Hello ${creds.given_name}`}</h1>
                    <h4 style={{ color: 'grey' }}>How are you?</h4>
                  </div>
                  <div className="pic-container">
                    <img className="user-pic" src={creds.picture} />
                  </div>
                </section>
              )}
            </div>

            {userType === 3 && (
              <section>
                <div style={{ paddingTop: 24, marginBottom: 12 }}>
                  {isDoneDSM && isDoneGAD && isDonePHQ ? (
                    <p style={{ color: 'grey', fontSize: 13 }}>
                      {`Thank you for answering.`}
                    </p>
                  ) : (
                    <>
                      <p
                        style={{
                          color: 'grey',
                          fontSize: 13,
                          marginBottom: 6,
                          lineHeight: 1.5,
                        }}
                      >
                        {`The first step to solving any problem is to RECOGNIZE that there is one.`}
                      </p>
                      <p
                        style={{
                          color: 'grey',
                          fontSize: 13,
                          marginBottom: 6,
                          lineHeight: 1.5,
                        }}
                      >
                        {`Take a quick mental health assessment and get your results instantly!`}
                      </p>
                    </>
                  )}
                </div>

                <div
                  style={{ marginBottom: 5 }}
                  className="button-19"
                  onClick={() => handleNav('', 'questionnaire')}
                >
                  {isDoneDSM && isDoneGAD && isDonePHQ
                    ? 'See Result'
                    : `Take Assessment`}
                </div>
              </section>
            )}
          </div>

          <div
            className="container"
            style={{ paddingTop: 15, paddingBottom: 15 }}
          >
            {today.length == 0 &&
            tom.length == 0 &&
            thisWeek.length == 0 &&
            nextWeek.length == 0 &&
            thisMonth.length == 0 &&
            nextMonth.length == 0 ? (
              <>
                {userData.user_type === 3 && (
                  <div style={{ fontSize: 15, fontWeight: '700' }}>
                    Looks like you haven't booked anything yet! Head over to the
                    booking tab if you'd like to schedule one now.
                  </div>
                )}
                {userData.user_type === 2 && (
                  <div
                    style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}
                  >
                    You dont have any booked schedule at the moment.
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 15, fontWeight: '700', paddingTop: 20 }}>
                Here is a list of your schedule:
              </div>
            )}

            {userSessions && (
              <div className="home-body">
                {today.length > 0 && (
                  <div>
                    <h5>Today</h5>
                    {today
                      .sort((a: any, b: any) => a.time_start - b.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <Schedule_Card item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
                {tom.length > 0 && (
                  <div>
                    <h5>Tomorrow</h5>
                    {tom
                      .sort((a: any, b: any) => a.time_start - b.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <Schedule_Card item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
                {thisWeek.length > 0 && (
                  <div>
                    <h5>This week</h5>
                    {thisWeek
                      .sort((a: any, b: any) => a.time_start - b.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <Schedule_Card item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
                {nextWeek.length > 0 && (
                  <div>
                    <h5>Next week</h5>
                    {nextWeek
                      .sort((a: any, b: any) => a.time_start - b.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <Schedule_Card item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
                {thisMonth.length > 0 && (
                  <div>
                    <h5>This month</h5>
                    {thisMonth
                      .sort((a: any, b: any) => a.time_start - b.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <Schedule_Card item={item} />
                          </div>
                        );
                      })}
                  </div>
                )}
                {nextMonth.length > 0 && (
                  <div>
                    <h5>Next month</h5>
                    {nextMonth
                      .sort((a: any, b: any) => a.time_start - b.time_start)
                      .map((item: any) => {
                        return (
                          <div key={item.id}>
                            <Schedule_Card item={item} />
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
          {userType === 3 && (
            <section
              id="assessment-container"
              style={{
                backgroundColor: 'white',
                paddingLeft: 24,
                paddingRight: 24,
                borderRadius: 20,
                marginBottom: 24,
              }}
            >
              <div style={{ paddingTop: 24, marginBottom: 12 }}>
                <p style={{ color: 'grey', fontSize: 13 }}>
                  {isDoneDSM && isDoneGAD && isDonePHQ
                    ? `Thank you for answering.`
                    : `The first step to solving any problem is to RECOGNIZE that there is one. Take a quick mental health assessment and get your results instantly!`}
                </p>
              </div>

              <div
                aria-hidden="true"
                style={{ marginBottom: 24 }}
                className="button-19"
                onClick={() => handleNav('', 'questionnaire')}
              >
                {isDoneDSM && isDoneGAD && isDonePHQ
                  ? 'See Result'
                  : `Take Assessment`}
              </div>
            </section>
          )}

          {userType !== 1 && (
            <section id="schedule-container">
              {today.length == 0 &&
              tom.length == 0 &&
              thisWeek.length == 0 &&
              nextWeek.length == 0 &&
              thisMonth.length == 0 &&
              nextMonth.length == 0 ? (
                <>
                  {userData.user_type === 3 && (
                    <div style={{ fontSize: 15, fontWeight: '700' }}>
                      Looks like you haven't booked anything yet! Head over to
                      the booking tab if you'd like to schedule one now.
                    </div>
                  )}
                  {userData.user_type === 2 && (
                    <div style={{ fontSize: 15, fontWeight: '700' }}>
                      You dont have any booked schedule at the moment.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 15, fontWeight: '700' }}>
                    Here is a list of your schedule:
                  </div>
                  <div>
                    {userSessions && (
                      <div className="home-body">
                        {today.length > 0 && (
                          <div>
                            <h5>Today</h5>
                            {today
                              .sort(
                                (a: any, b: any) => a.time_start - b.time_start,
                              )
                              .map((item: any) => {
                                return (
                                  <div key={item.id}>
                                    <Schedule_Card item={item} />
                                  </div>
                                );
                              })}
                          </div>
                        )}
                        {tom.length > 0 && (
                          <div>
                            <h5>Tomorrow</h5>
                            {tom
                              .sort(
                                (a: any, b: any) => a.time_start - b.time_start,
                              )
                              .map((item: any) => {
                                return (
                                  <div key={item.id}>
                                    <Schedule_Card item={item} />
                                  </div>
                                );
                              })}
                          </div>
                        )}
                        {thisWeek.length > 0 && (
                          <div>
                            <h5>This week</h5>
                            {thisWeek
                              .sort(
                                (a: any, b: any) => a.time_start - b.time_start,
                              )
                              .map((item: any) => {
                                return (
                                  <div key={item.id}>
                                    <Schedule_Card item={item} />
                                  </div>
                                );
                              })}
                          </div>
                        )}
                        {nextWeek.length > 0 && (
                          <div>
                            <h5>Next week</h5>
                            {nextWeek
                              .sort(
                                (a: any, b: any) => a.time_start - b.time_start,
                              )
                              .map((item: any) => {
                                return (
                                  <div key={item.id}>
                                    <Schedule_Card item={item} />
                                  </div>
                                );
                              })}
                          </div>
                        )}
                        {thisMonth.length > 0 && (
                          <div>
                            <h5>This month</h5>
                            {thisMonth
                              .sort(
                                (a: any, b: any) => a.time_start - b.time_start,
                              )
                              .map((item: any) => {
                                return (
                                  <div key={item.id}>
                                    <Schedule_Card item={item} />
                                  </div>
                                );
                              })}
                          </div>
                        )}
                        {nextMonth.length > 0 && (
                          <div>
                            <h5>Next month</h5>
                            {nextMonth
                              .sort(
                                (a: any, b: any) => a.time_start - b.time_start,
                              )
                              .map((item: any) => {
                                return (
                                  <div key={item.id}>
                                    <Schedule_Card item={item} />
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
            </section>
          )}

          {userType === 1 && (
            <section id="admin-tools-container">
              <AdminControlPage view={false} />
            </section>
          )}
        </>
      )}
    </>
  );
}
export default HomePage;

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import Swal from 'sweetalert2';
// import { useMediaQuery } from 'react-responsive'
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../../firebaseConfig';
import { addDoc, collection, query, where } from '@firebase/firestore';
import { getDocs, onSnapshot } from 'firebase/firestore';
import './bookingcomponent.css';
import { User } from 'firebase/auth';
import Button from '@mui/material/Button';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { DateCalendar, TimePicker } from '@mui/x-date-pickers';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import axios from 'axios';
import { formatGmeetDate } from '../../../services/date_services';
import { SessionProps } from '../../../constants/types/interfaceProps';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

function OptionTime(props: {
  code: any;
  creds: any;
  isDone: any;
  view: any;
  goBack: any;
}) {
  const r_token = props.code;
  const auth = FIREBASE_AUTH;
  const [isMobile, setMobileUse] = React.useState(false);

  const [isFetching, setFetching] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);

  const [showDate, setShowDate] = useState(true);
  const [showTime, setShowTime] = useState(false);

  const [maxBookingDate, setMaxBookingDate] = React.useState(
    dayjs().add(30, 'day').set('hour', 8).set('minute', 0),
  );
  const [minBookingDate, setMinBookingDate] = React.useState(
    dayjs()
      .add(1, 'day')
      .set('hour', 8)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0),
  );
  const [minTime, setMinTime] = React.useState(28800);
  const [maxTime, setMaxTime] = React.useState(82800);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [error, setError] = React.useState(false);
  const [response, setResponse] = React.useState('');
  const [successState, setSuccessState] = React.useState(true);

  const [hopeLinerList, setList] = React.useState<any[]>([]);
  const [selectedDate, setDate] = React.useState<any>(minBookingDate);
  const [isTouched, setTouched] = React.useState(false);
  const [time, setTime] = React.useState(selectedDate);
  // const [user_id, setUser_id] = React.useState<string | null>(null);
  // const [hopeliner_id, setHopeliner_id] = React.useState<string | null>(null);
  const [hopelinerParams, setHopelinerParams] = React.useState<any>({});
  const [selectableHL, setSelectableHL] = React.useState<any>([]);
  const [isSelectingHL, setSelectingHL] = React.useState(false);
  const [contactReason, setContactReason] = React.useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(NaN);
  const [userSessions, setSessionList] = React.useState<any[]>([]);
  const [duration, setDuration] = React.useState<number>(30);
  const [dateVisible, setDateVisible] = React.useState<boolean>(false);

  const [timeTable, setTimeTable] = React.useState<any[]>([]);
  const [amCounter, setAmCounter] = React.useState<any[]>([]);
  const [pmCounter, setPmCounter] = React.useState<any[]>([]);
  const [isSelectingTime, setSelectingTime] = React.useState(false);
  const [selectedDuration, setSelectedDuration] = React.useState('minutes');

  const currentUser: User | null = FIREBASE_AUTH.currentUser;
  // console.log('current user', currentUser)
  const userinfo: any = props.creds;

  const fetch_sessions = (user: any) => {
    const SessionListQuery = query(
      collection(FIRESTORE_DB, 'Session'),
      where('user_id', '==', user.uid),
    );

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

  const onChangeDuration = async (minutes: number) => {
    // console.log('minutes',minutes)
    setError(false);
    setErrorMessage('');
    const minTimestamp = 8 * 3600 + 0 * 60 + 0;
    const maxTimestamp = 23 * 3600 + minutes * 60 + 40;

    setMinTime(minTimestamp);
    setMaxTime(maxTimestamp);
  };

  const durationSelect = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: number,
  ) => {
    // console.log('newAlignment',newAlignment)
    setDuration(newAlignment);
    onChangeDuration(newAlignment);
  };

  const convertToSeconds = (time: Date) => {
    const startOfDay = dayjs(time).startOf('day');
    // Calculate the difference in seconds
    const totalSeconds = dayjs(time).diff(startOfDay, 'second');

    return totalSeconds;
  };

  const handleError = (error: any) => {
    const limit = duration === 0 ? '1 hour' : '30 mins';

    if (error === 'limit') {
      setErrorMessage(`Session needs to be booked ${limit} before 12 midnight`);
    }

    if (error === 'minTime') {
      setErrorMessage(`Booking Session starts at 8:00 AM`);
    }
  };

  const checkTimeSchedule = async (date: any) => {
    const selectedDate = convertToSeconds(date);

    if (selectedDate > maxTime) {
      setError(true);
      // console.log(selectedDate, ">", maxTime)
      handleError('limit');
    }
    if (selectedDate < minTime) {
      setError(true);
      handleError('minTime');
    }

    if (selectedDate >= minTime && selectedDate <= maxTime) {
      setError(false);
      setErrorMessage(' ');
      // console.log("right time")
    }
  };

  const handleDone = () => {
    props.isDone(true);
  };

  const setGoogleMeeting = async (payload: any) => {
    const code = r_token;
    // console.log(code)

    // console.log('timestart',formatGmeetDate(payload.time_start))
    // console.log('timeend' ,formatGmeetDate(payload.time_end))

    const attendeesEmails = [
      { email: hopelinerParams.hl_email },
      { email: userinfo.email },
    ];
    const event = {
      summary: 'this is a test meeting for silver lining app', // short desc
      location: 'Virtual / Google Meet',
      description: 'Silver lining hopeliner call', // title of meeting
      start: {
        dateTime: formatGmeetDate(payload.time_start),
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: formatGmeetDate(payload.time_end),
        timeZone: 'Asia/Manila',
      },
      attendees: attendeesEmails,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
      conferenceData: {
        createRequest: {
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
          requestId: 'coding-calendar-demo',
        },
      },
    };

    await axios
      .post(
        'https://us-central1-silverlining-ec543.cloudfunctions.net/api/api/set-meeting',
        { code, event },
      )
      .then((res) => {
        const meetLink = { gmeetlink: res.data.data.hangoutLink };
        addSession({ ...payload, ...meetLink });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        });
        // console.log('failed gmeets',error.message)
      });
  };

  const addSession = async (payload: SessionProps) => {
    setLoading(true);
    try {
      const doc = await addDoc(collection(FIRESTORE_DB, 'Session'), payload);
      // console.log("Document written with ID: ", doc.id);
      Swal.fire({
        icon: 'success',
        title: 'Booked Session',
        text: `Schedule at ${payload.date}`,
      });

      setResponse(`Successfully Booked Session at ${payload.date}`);
      setLoading(false);
      handleDone();
      setSelectingHL(false);
      return true;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
      setLoading(false);
      setResponse(`Failed to Book`);
      // console.log(error)
    }
  };

  const handleSelectHopeliner = async () => {
    const time = selectedDate.set('second', 0);
    const fbDate = time.toDate();

    const selectedTime = fbDate.getTime();
    const endTime = selectedTime + 60 * 60 * 1000;
    const buffer = selectedTime + 30 * 60 * 1000;
    const time_start = fbDate.getTime();
    const time_end = duration === 0 ? endTime : buffer;

    // {handleSubmit(hopelinerParams.hl_name, hopelinerParams.hl_id, hopelinerParams.hl_img)}
    getCollidingSessions(time_start, time_end)
      .then((sessions) => {
        // console.log('Colliding sessions:', (sessions));
        // console.log('NEW LIST',filterHopelinersBySession(hopeLinerList,sessions))
        setSelectableHL(filterHopelinersBySession(hopeLinerList, sessions));
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleSubmit = async (hl_name: any, hl_id: any, hl_img: any) => {
    const time = selectedDate.set('second', 0);
    const fbDate = time.toDate();

    const selectedTime = fbDate.getTime();
    const endTime = selectedTime + 60 * 60 * 1000;
    const buffer = selectedTime + 30 * 60 * 1000;
    const dateStamp = new Date(
      fbDate.getFullYear(),
      fbDate.getMonth(),
      fbDate.getDate(),
      0,
      0,
      0,
    );
    const meetLink = { gmeetlink: '' };
    // // console.log(fbDate, "fbDate")

    // // console.log(dateStamp, "dateStamp")
    // // console.log(dateStamp.getTime(), "dateStamp in Seconds")
    // // console.log(fbDate.getTime(), "FB Start Time")
    // // console.log(buffer, "FB Buffer Time")
    // // console.log(endTime, "FB End Time")

    // const gDate = formatGmeetDate((selectedTime*1000))
    // // console.log(gDate, "to gmeet")

    const payload: SessionProps = {
      date: fbDate,
      date_stamp: dateStamp.getTime(),
      time_start: fbDate.getTime(),
      time_end: selectedDuration == 'hour' ? endTime : buffer,
      buffer: buffer,
      type: selectedDuration == 'hour' ? 'hour' : 'half-hour',
      status: 0,
      user_id: currentUser?.uid,
      hopeliner_id: hl_id,
      contact_reason: null,
      date_created: new Date(),
      hopeliner_img: hl_img,
      hopeliner_name: hl_name,
      hopeliner_email: hopelinerParams.hl_email,
      user_img: userinfo.picture,
      user_name: userinfo.name,
      user_email: userinfo.email,
    };

    addSession({ ...payload, ...meetLink });
  };

  // REMOVES HOPELINER IN THE LIST WITH COLLIDING SCHEDULE
  function filterHopelinersBySession(hopelinerList: any, sessions: any) {
    // console.log('sessions',sessions)
    // Remove sessions where the status is equal to 3
    const filteredSessions = sessions.filter(
      (session: any) => session.status !== 2,
    );

    // Extract all hopeliner_ids from filtered sessions array
    const sessionHopelinerIds = filteredSessions.flatMap(
      (session: any) => session.hopeliner_id,
    );

    // Filter hopelinerList to remove hopeliners with matching user_id
    const filteredHopelinerList = hopelinerList.filter(
      (hopeliner: any) => !sessionHopelinerIds.includes(hopeliner.user_id),
    );

    return filteredHopelinerList;
  }

  // LISTS ALL SCHEDULE THAT COLLIDES BASED ON THE INPUT TIME
  async function getCollidingSessions(
    time_start: any,
    time_end: any,
    buffer: number = 30 * 60 * 1000,
  ) {
    try {
      // Adjust time_start and time_end by adding and subtracting the buffer, respectively
      const adjustedStartTime = time_start - buffer;
      const adjustedEndTime = time_end + buffer;

      // Fetch all sessions that start before the adjusted time_end
      const startQuery = query(
        collection(FIRESTORE_DB, 'Session'),
        where('time_start', '<', adjustedEndTime),
      );

      // Fetch all sessions that end after the adjusted time_start
      const endQuery = query(
        collection(FIRESTORE_DB, 'Session'),
        where('time_end', '>', adjustedStartTime),
      );

      // Get the documents that match the queries
      const startSnapshot = await getDocs(startQuery);
      const endSnapshot = await getDocs(endQuery);

      // Filter sessions that have both start and end times overlapping
      const collidingSessions = startSnapshot.docs.filter((doc) => {
        const sessionEndTime = doc.data().time_end;
        return endSnapshot.docs.some(
          (endDoc) =>
            endDoc.id === doc.id && endDoc.data().time_start < sessionEndTime,
        );
      });

      // Convert collidingSessions to an array of session objects
      const sessions = collidingSessions.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return sessions;
    } catch (error) {
      console.error('Error fetching colliding sessions:', error);
      throw error;
    }
  }

  function generateTimeSlots(date: any) {
    const timeSlots = [];
    const startTime = new Date(date);
    startTime.setHours(8, 0, 0, 0); // Set start time to 8:00 am

    const endTime = new Date(date);
    endTime.setHours(23, 59, 59, 999); // Set end time to 11:59:59.999 pm of the same day

    // Loop from start time to end time, incrementing by 30 minutes
    let currentTime = new Date(startTime);
    while (currentTime <= endTime) {
      const timestring = currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const timemilisec = currentTime.getTime();
      const isDisabled = false;

      timeSlots.push({ timestring, timemilisec, isDisabled });

      // Increment currentTime by 30 minutes
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return timeSlots;
  }

  function updateTimetable(timetable: any) {
    // Get current timestamp
    const currentTime = new Date().getTime();

    // Calculate end time of 24 hours from current time
    const endOf24Hours = currentTime + 24 * 60 * 60 * 1000;

    // Loop through each object in the timetable
    timetable.forEach((time: any) => {
      // Check if the object's time is within the 24-hour span from the current time
      if (time.timemilisec >= currentTime && time.timemilisec <= endOf24Hours) {
        time.isDisabled = true; // Set isDisabled to true
      }
      if (selectedDuration == 'hour' && time.timestring == '11:30 PM') {
        time.isDisabled = true; // Set isDisabled to true
      }
    });

    // // Loop through each session
    // sessions.forEach((session: any) => {
    //   // Calculate the end time based on the duration
    //   let endTime: any;
    //   let startTime = session.time_start;
    //   let buffer = 0; // Initialize buffer
    //   // console.log('sessions',session)
    //   if (duration === 'minutes') {
    //     endTime = startTime + 30 * 60 * 1000; // Add 30 minutes
    //     buffer = 30 * 60 * 1000; // Set buffer to 30 minutes in milliseconds
    //   } else if (duration === 'hour') {
    //     endTime = startTime + 60 * 60 * 1000; // Add 1 hour
    //     buffer = 60 * 60 * 1000; // Set buffer to 1 hour in milliseconds
    //   } else {
    //     throw new Error('Invalid duration specified. Please provide "minutes" or "hour".');
    //   }

    //   // Add buffer to the start time
    //   startTime -= buffer;

    //   // Check for collisions with timetable and update isDisabled accordingly
    //   timetable.forEach((time: any) => {
    //     if (duration === 'hour' && session.type == 'half-hour') {
    //       if (time.timemilisec >= startTime && time.timemilisec < endTime) {
    //         time.isDisabled = true;
    //       }
    //     } else if (duration === 'hour' && session.type == 'hour') {
    //       if (time.timemilisec >= startTime && time.timemilisec <= endTime) {
    //         time.isDisabled = true;
    //       }
    //     } else if(duration === 'minutes' && session.type == 'half-hour'){
    //       if (time.timemilisec >= startTime && (time.timemilisec - 30 * 60 * 1000) < endTime) {
    //         time.isDisabled = true;
    //       }
    //     } else if(duration === 'minutes' && session.type == 'hour'){
    //       if (time.timemilisec >= startTime && (time.timemilisec - 30 * 60 * 1000) <= endTime) {
    //         time.isDisabled = true;
    //       }
    //     }

    //   });
    // });

    return timetable;
  }

  const fetch_hopeliners = async () => {
    const hopeLinerListQuery = query(
      collection(FIRESTORE_DB, 'User'),
      where('user_type', '==', 2),
    );

    const subscriber = onSnapshot(hopeLinerListQuery, {
      next: (snapshot) => {
        const list: any[] = [];

        getDocs(hopeLinerListQuery)
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              list.push({
                id: doc.id,
                ...doc.data(),
              });
            });
            setList(list);
          })
          .catch((error) => {
            console.error('Error getting documents: ', error);
          });
      },
    });

    return () => subscriber;
  };

  function handleDateAnimation() {
    if (!dateVisible) {
      setDateVisible(true);
      setTimeout(() => {
        setShowDate(!showDate);
      }, 100);
    } else {
      setShowDate(!showDate);
      setTimeout(() => {
        setDateVisible(false);
      }, 1000);
    }
  }

  React.useEffect(() => {
    setMobileUse(props.view);
    fetch_hopeliners();
    fetch_sessions(currentUser);
    setErrorMessage('Please select a date and time.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {}, [currentUser]);

  React.useEffect(() => {
    // console.log('sessions',(userSessions))
  }, [userSessions]);

  React.useEffect(() => {
    // console.log('SELECTABLE', selectableHL)
    if (selectableHL.length > 0) {
      setSelectingHL(true);
    } else {
      setError(true);
      setErrorMessage(
        'There is no available Hopeliner on your preferred time. Please select a different schedule.',
      );
    }
  }, [selectableHL]);

  const shouldDisableDate = (date: Dayjs) => {
    // Convert selected date to Dayjs
    const selectedDate = dayjs(date).startOf('day'); // Set time to 00:00:00

    // Get tomorrow's date
    const tomorrowDate = dayjs().add(1, 'day').startOf('day');

    // // Check if the selected date matches any session start date
    // const isSessionDate = userSessions.some(session => {
    //   // Convert session start date to Dayjs
    //   const sessionStartDate = dayjs(session.time_start).startOf('day'); // Set time to 00:00:00
    //   // Check if the selected date matches the session start date
    //   return selectedDate.isSame(sessionStartDate);
    // });

    // Check if the selected date is a weekend (Saturday or Sunday)
    const isWeekend = selectedDate.day() === 0;

    // Disable the date if it's a session date, a weekend
    return isWeekend;
  };

  React.useEffect(() => {
    // console.log('hl list',(hopeLinerList))
  }, [hopeLinerList]);

  React.useEffect(() => {
    checkTimeSchedule(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, duration, maxTime]);

  return (
    <>
      {!isSelectingHL && (
        <div className={isMobile ? 'container' : 'desktop-container-option'}>
          {/* <div className={isMobile? 'container' : 'desktop-container-option'}>
        <div style={{display:'flex', alignItems:'center'}} onClick={() => {props.goBack('selection')}}><ArrowBackIosNewIcon />Go back to preference selection</div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar 
            disablePast
            shouldDisableDate={shouldDisableDate}
            minDate={minBookingDate}
            maxDate={maxBookingDate}
            value={isTouched? selectedDate : null} 
            onChange={(newValue) => {setDate(newValue); setTouched(true)}} 
            />
        </LocalizationProvider>
        <div className='time-container'>
          <div style={{width: "50%"}}>
            <p className='label'>Select Time: </p>
          </div>
          <div style={{width: "50%", justifyContent:'flex-end', display:'flex'}}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                value={selectedDate}
                minutesStep={30}
                slotProps={{ textField: { size: 'small' } }}
                maxTime={duration === 30 ? dayjs().set('hour', 23).set('minute', 59) : dayjs().set('hour', 23)}
                minTime={dayjs().set('hour', 7).set('minute', 59)}
                onChange={(newValue: any) => {setDate(newValue); // console.log('newval',newValue)}} />
            </LocalizationProvider>
          </div>
        </div>

        <div className='summary-container'>
          <div className='selected-container'>
            <p className='label'>Selected date: </p>
            <p className='selected-date'>{isTouched? (selectedDate.format('MMM DD, YYYY hh:mm A')): ''}</p>
          </div>

          <div className='section-container'>
            <p className='label'>Select duration: </p>
            <div className='duration-container'>
              <ToggleButtonGroup
                color="primary"
                value={duration}
                exclusive
                sx={{backgroundColor: "white", color: "GrayText", height: 35}}
                onChange={durationSelect}
                aria-label="Platform"
              >
                <ToggleButton value={30}>30 minutes</ToggleButton>
                <ToggleButton value={0}>1 hour</ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>

          <div style={{justifyContent: "center", display: "flex", marginBottom: 5}}>
            <Button 
              variant='contained' 
              disabled={error || !isTouched} 
              onClick={() => {
                handleSelectHopeliner()
              }}
              >Select Hopeliner</Button>
          </div>

          {error ? 
          <div style={{display: "flex", justifyContent: "center"}}>
            <p style={{fontSize: 12, marginBottom: 3}} className='label'>{errorMessage}</p>
          </div>
          :
          <></>
          }
          {!isTouched ? 
          <div style={{display: "flex", justifyContent: "center"}}>
            <p style={{fontSize: 12, marginBottom: 3}} className='label'>Please select a date in the calendar above</p>
          </div>
          :
          <></>
          }
        </div>
      </div> */}

          {!isSelectingTime && (
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center' }}
                onClick={() => {
                  props.goBack('selection');
                }}
              >
                <ArrowBackIosNewIcon />
                Go back to preference selection
              </div>
              <div className="booking-option-instruction">
                Please select a date in the calendar
              </div>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  disablePast
                  shouldDisableDate={shouldDisableDate}
                  minDate={minBookingDate}
                  maxDate={maxBookingDate}
                  value={isTouched ? selectedDate : null}
                  onChange={(newValue) => {
                    setDate(newValue);
                    setTouched(true);
                  }}
                />
              </LocalizationProvider>
              <div className="booking-option-instruction">
                Please select your session duration
              </div>
              <div className="booking-option-container">
                <div
                  style={{ width: '40%', justifyContent: 'center' }}
                  className={
                    selectedDuration == 'minutes'
                      ? 'hopeliner-card selected-hopeliner'
                      : 'hopeliner-card'
                  }
                  onClick={() => setSelectedDuration('minutes')}
                >
                  30 minutes
                </div>
                <div
                  style={{ width: '40%', justifyContent: 'center' }}
                  className={
                    selectedDuration == 'hour'
                      ? 'hopeliner-card selected-hopeliner'
                      : 'hopeliner-card'
                  }
                  onClick={() => setSelectedDuration('hour')}
                >
                  1 hour
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 20,
                  flexDirection: 'column',
                  textAlign: 'center',
                }}
              >
                <Button
                  variant="contained"
                  disabled={!isTouched}
                  onClick={() => {
                    // // console.log('updated',selectedDate.$d,updateTimetable(generateTimeSlots(selectedDate.$d),sessions,selectedDuration))
                    setTimeTable(
                      updateTimetable(generateTimeSlots(selectedDate.$d)),
                    );
                    setSelectingTime(true);
                    setAmCounter([]);
                    setPmCounter([]);
                  }}
                >
                  Confirm Date
                </Button>
                {/* {!isTouched && <p style={{fontSize: 12, marginBottom: 3}} className='label'>Please select a date</p>} */}
              </div>
            </div>
          )}
          {isSelectingTime && (
            <>
              <div
                style={{ display: 'flex', alignItems: 'center' }}
                onClick={() => {
                  setSelectingTime(false);
                }}
              >
                <ArrowBackIosNewIcon />
                Go back to date selection
              </div>
              <p style={{ marginTop: 12, display: 'block' }}>AM</p>
              {amCounter.length == 0 && (
                <div className="empty-slot-holder">no time slot available</div>
              )}
              <div className="time-table-container">
                {timeTable.map((time: any, index: any) => {
                  if (index <= 7 && !time.isDisabled) {
                    time.isDisabled
                      ? console.info()
                      : amCounter.push(time.isDisabled);
                    return (
                      <div key={index}>
                        <div
                          className={
                            time.isDisabled
                              ? 'time-chip disabled hide'
                              : selectedIndex == index
                                ? 'time-chip selected-hopeliner'
                                : 'time-chip'
                          }
                          onClick={() => {
                            // console.log(time, dayjs(time.timemilisec))
                            setSelectedIndex(index);
                            setDate(dayjs(time.timemilisec));
                          }}
                          key={index}
                        >
                          <div>{time.timestring}</div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
              <p>PM</p>
              {pmCounter.length == 0 && (
                <div className="empty-slot-holder">no time slot available</div>
              )}
              <div className="time-table-container">
                {timeTable.map((time: any, index: any) => {
                  if (index >= 8 && time.isDisabled == false) {
                    time.isDisabled
                      ? console.info()
                      : pmCounter.push(time.isDisabled);
                    return (
                      <div key={index}>
                        <div
                          className={
                            time.isDisabled
                              ? 'time-chip disabled hide'
                              : selectedIndex == index
                                ? 'time-chip selected-hopeliner'
                                : 'time-chip'
                          }
                          onClick={() => {
                            // console.log(time, dayjs(time.timemilisec))
                            setSelectedIndex(index);
                            setDate(dayjs(time.timemilisec));
                          }}
                          key={index}
                        >
                          <div>{time.timestring}</div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 20,
                  flexDirection: 'column',
                  textAlign: 'center',
                }}
              >
                <Button
                  variant="contained"
                  disabled={selectedIndex == null}
                  onClick={() => {
                    // console.log('updated',selectedDate.$d,updateTimetable(generateTimeSlots(selectedDate.$d)))
                    // handleSubmit(hopelinerParams.hl_name, hopelinerParams.hl_id, hopelinerParams.hl_img)
                    handleSelectHopeliner();
                  }}
                >
                  Confirm Time
                </Button>
                {/* {!isTouched && <p style={{fontSize: 12, marginBottom: 3}} className='label'>Please select a date</p>} */}
              </div>
            </>
          )}
        </div>
      )}

      {isSelectingHL && (
        <>
          <div className={isMobile ? 'container' : 'desktop-container-option'}>
            {/* <div className={isMobile ? 'booking-back-button': 'desktop-booking-back-button'}>
            <Button onClick={()=> setSelectingHL(false)}
            variant={isMobile? 'outlined':'text'} startIcon={<ArrowBackIosNewIcon />}>
              Go back to date selection
            </Button>
          </div> */}
            <div
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={() => {
                setSelectingTime(true);
                setSelectingHL(false);
              }}
            >
              <ArrowBackIosNewIcon />
              Go back to time selection
            </div>

            <p
              style={{
                fontSize: 12,
                marginBottom: 3,
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 10,
                paddingBottom: 10,
              }}
              className="label"
            >
              Select your desired Hopeliner
            </p>
            <div style={{ width: '80%' }}>
              {selectableHL.map((liner: any, index: any) => {
                return (
                  <div
                    onClick={() => {
                      // console.log(liner)
                      setHopelinerParams({
                        hl_name: `${liner.fname} ${liner.lname[0]}.`,
                        hl_img: liner.img,
                        hl_id: liner.user_id,
                        hl_email: liner.email,
                      });
                      setSelectedIndex(index);
                    }}
                    key={liner.user_id}
                  >
                    <div
                      className={
                        selectedIndex == index
                          ? 'hopeliner-card selected-hopeliner'
                          : 'hopeliner-card'
                      }
                    >
                      <img className="card-img" src={liner.img} />
                      <div className="card-details">
                        <div className="schedule-card-header">{`${liner.fname} ${liner.lname[0]}.`}</div>
                        {/* <div className='schedule-card-subheader'>{liner.email}</div> */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                justifyContent: 'center',
                display: 'flex',
                paddingTop: 35,
              }}
            >
              <Button
                variant="contained"
                disabled={error}
                onClick={() => {
                  handleSubmit(
                    hopelinerParams.hl_name,
                    hopelinerParams.hl_id,
                    hopelinerParams.hl_img,
                  );
                  setLoading(true);
                }}
              >
                Book Schedule
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
export default OptionTime;

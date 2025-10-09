/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState } from 'react';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../../firebaseConfig';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {
  query,
  collection,
  where,
  onSnapshot,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import Button from '@mui/material/Button';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { formatGmeetDate } from '../../../services/date_services';
import axios from 'axios';
import Swal from 'sweetalert2';
import { SessionProps } from '../../../constants/types/interfaceProps';
import { User } from 'firebase/auth';

function OptionHL(
  props: Readonly<{
    userType: any;
    code: any;
    creds: any;
    isDone: any;
    view: any;
    goBack: any;
  }>,
) {
  const currentUser: User | null = FIREBASE_AUTH.currentUser;
  const userinfo: any = props.creds;
  const r_token = props.code;
  const auth = FIREBASE_AUTH;
  const [maxBookingDate, setMaxBookingDate] = React.useState(
    dayjs().add(120, 'day').set('hour', 8).set('minute', 0),
  );
  const [minBookingDate, setMinBookingDate] = React.useState(
    dayjs()
      .add(1, 'day')
      .set('hour', 8)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0),
  );
  const [selectedDate, setDate] = React.useState<any>(minBookingDate);
  const [hopeLinerList, setList] = React.useState<any[]>([]);
  const [isSelectingHL, setSelectingHL] = React.useState(true);
  const [isSelectingTime, setSelectingTime] = React.useState(false);
  const [isMobile, setMobileUse] = React.useState(false);
  const [hopelinerParams, setHopelinerParams] = React.useState<any>({});
  const [timeslot, setTimeslot] = React.useState<any>({});
  const [isTouched, setTouched] = React.useState(false);
  const [selectedDuration, setSelectedDuration] = React.useState('minutes');
  const [response, setResponse] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);
  const [sessions, setSessionList] = React.useState<any[]>([]);
  const [timeTable, setTimeTable] = React.useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<any>(null);
  const [amCounter, setAmCounter] = React.useState<any[]>([]);
  const [pmCounter, setPmCounter] = React.useState<any[]>([]);

  const [incrementValue, setIncrementValue] = React.useState(1); // State to store the increment value
  const [startHour, setStartHour] = React.useState(1); // State to store the increment value
  const [startMinute, setStartMinute] = React.useState(1); // State to store the increment value
  const [endMinute, setEndMinute] = React.useState(1); // State to store the increment value
  const [endHour, setEndHour] = React.useState(1); // State to store the increment value
  const [currentDate, setCurrentDate] = React.useState(dayjs()); // State to store the current date

  const handleInputChange = (event: any) => {
    setIncrementValue(parseInt(event.target.value)); // Update the increment value when input changes
  };

  const handleStartHourChange = (event: any) => {
    setStartHour(parseInt(event.target.value)); // Update the increment value when input changes
  };

  const handleStartMinuteChange = (event: any) => {
    setStartMinute(parseInt(event.target.value)); // Update the increment value when input changes
  };

  const handleEndMinuteChange = (event: any) => {
    setEndMinute(parseInt(event.target.value)); // Update the increment value when input changes
  };

  const handleEndHourChange = (event: any) => {
    setEndHour(parseInt(event.target.value)); // Update the increment value when input changes
  };

  const incrementDate = () => {
    // setCurrentDate((prevDate) => prevDate.add(incrementValue, 'day')); // Increment the date
    console.log(incrementValue);
  };

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
  };
  const shouldDisableDate = (date: Dayjs) => {
    // Convert selected date to Dayjs
    const selectedDate = dayjs(date).startOf('day'); // Set time to 00:00:00

    // // Get tomorrow's date
    // const tomorrowDate = dayjs().add(1, 'day').startOf('day');

    // // Check if the selected date matches any session start date
    // const isSessionDate = userSessions.some(session => {
    //   // Convert session start date to Dayjs
    //   const sessionStartDate = dayjs(session.time_start).startOf('day'); // Set time to 00:00:00
    //   // Check if the selected date matches the session start date
    //   return selectedDate.isSame(sessionStartDate);
    // });

    // Check if the selected date is a weekend (Saturday or Sunday)
    const isWeekend = selectedDate.day() === 0;

    // Disable the date if it's a session date, a weekend, or tomorrow's date
    // return isSessionDate || isWeekend || selectedDate.isSame(tomorrowDate);
    return isWeekend;
  };

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

  const handleDone = () => {
    props.isDone(true);
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
      hopeliner_email: hopelinerParams.hl_email,
      contact_reason: null,
      date_created: new Date(),
      hopeliner_img: hl_img,
      hopeliner_name: hl_name,
      user_img: userinfo.picture,
      user_name: userinfo.name,
      user_email: userinfo.email,
    };

    addSession({ ...payload, ...meetLink });
  };

  const handleSubmitLeave = async (
    hl_name: any,
    hl_id: any,
    hl_img: any,
    iteration: any,
  ) => {
    for (let index = 0; index < iteration; index++) {
      const fbDate = selectedDate.add(index, 'day').startOf('day').toDate(); // Set selectedDate to 12:00 AM

      const selectedTime = selectedDate
        .add(index, 'day')
        .clone()
        .startOf('day')
        .add(startHour, 'hours')
        .add(startMinute, 'minutes')
        .toDate()
        .getTime(); // add any time you want
      // const selectedTime = fbDate.getTime();
      // const endTime = (selectedDate.add(index, 'day')).endOf('day').toDate().getTime(); // Set endTime to 11:59 PM
      const endTime = selectedDate
        .add(index, 'day')
        .clone()
        .startOf('day')
        .add(endHour, 'hours')
        .add(endMinute, 'minutes')
        .toDate()
        .getTime(); // add any time you want
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

      const payload: SessionProps = {
        date: fbDate,
        time_start: selectedTime,
        time_end: endTime,

        date_created: new Date(),
        date_stamp: dateStamp.getTime(),
        buffer: buffer,
        type: 'off',
        status: 5,
        user_id: currentUser?.uid,
        hopeliner_id: hl_id,
        hopeliner_email: hopelinerParams.hl_email,
        contact_reason: null,

        hopeliner_img: hl_img,
        hopeliner_name: hl_name,
        user_img: userinfo.picture,
        user_name: userinfo.name,
        user_email: userinfo.email,
      };
      console.log(payload);
      const doc = await addDoc(collection(FIRESTORE_DB, 'Session'), payload);
      console.log('Document written with ID: ', doc.id);
    }

    // console.log(selectedDate.add(1, 'day'))
    // addSession({...payload, ...meetLink})
  };

  const loadHLSessions = (id: any) => {
    const SessionListQuery = query(
      collection(FIRESTORE_DB, 'Session'),
      where('hopeliner_id', '==', id),
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

  // function updateTimetable(timetable: any, sessions: any, duration: any) {
  //   // Get current timestamp
  //   const currentTime = new Date().getTime();

  //   // Calculate end time of 24 hours from current time
  //   const endOf24Hours = currentTime + 24 * 60 * 60 * 1000;

  //   // Loop through each object in the timetable
  //   timetable.forEach((time: any) => {
  //     // Check if the object's time is within the 24-hour span from the current time
  //     if (time.timemilisec >= currentTime && time.timemilisec <= endOf24Hours) {
  //       time.isDisabled = true; // Set isDisabled to true
  //     }
  //     if(selectedDuration == 'hour' && time.timestring == "11:30 PM"){
  //       time.isDisabled = true; // Set isDisabled to true
  //     }
  //   });

  //   // Loop through each session
  //   sessions.forEach((session: any) => {
  //     // Calculate the end time based on the duration
  //     let endTime: any;
  //     let startTime = session.time_start;
  //     let buffer = 0; // Initialize buffer
  //     // console.log('sessions',session)
  //     if (duration === 'minutes') {
  //       endTime = startTime + 30 * 60 * 1000; // Add 30 minutes
  //       buffer = 30 * 60 * 1000; // Set buffer to 30 minutes in milliseconds
  //     } else if (duration === 'hour') {
  //       endTime = startTime + 60 * 60 * 1000; // Add 1 hour
  //       buffer = 60 * 60 * 1000; // Set buffer to 1 hour in milliseconds
  //     } else {
  //       throw new Error('Invalid duration specified. Please provide "minutes" or "hour".');
  //     }

  //     // Add buffer to the start time
  //     startTime -= buffer;

  //     // Check for collisions with timetable and update isDisabled accordingly
  //     timetable.forEach((time: any) => {
  //       if (duration === 'hour' && session.type == 'half-hour') {
  //         if (time.timemilisec >= startTime && time.timemilisec < endTime) {
  //           time.isDisabled = true;
  //         }
  //       } else if (duration === 'hour' && session.type == 'hour') {
  //         if (time.timemilisec >= startTime && time.timemilisec <= endTime) {
  //           time.isDisabled = true;
  //         }
  //       } else if(duration === 'minutes' && session.type == 'half-hour'){
  //         if (time.timemilisec >= startTime && (time.timemilisec - 30 * 60 * 1000) < endTime) {
  //           time.isDisabled = true;
  //         }
  //       } else if(duration === 'minutes' && session.type == 'hour'){
  //         if (time.timemilisec >= startTime && (time.timemilisec - 30 * 60 * 1000) <= endTime) {
  //           time.isDisabled = true;
  //         }
  //       }

  //     });
  //   });

  //   return timetable;
  // }

  // function updateTimetable(timetable: any, sessions: any, duration: any) {
  //   // Filter sessions to remove objects with status equal to 2
  //   const filteredSessions = sessions.filter((session: any) => session.status !== 2);

  //   // Get current timestamp
  //   const currentTime = new Date().getTime();

  //   // Calculate end time of 24 hours from current time
  //   const endOf24Hours = currentTime + 24 * 60 * 60 * 1000;

  //   // Loop through each object in the timetable
  //   timetable.forEach((time: any) => {
  //     // Check if the object's time is within the 24-hour span from the current time
  //     if (time.timemilisec >= currentTime && time.timemilisec <= endOf24Hours) {
  //       time.isDisabled = true; // Set isDisabled to true
  //     }
  //     if (selectedDuration == 'hour' && time.timestring == "11:30 PM") {
  //       time.isDisabled = true; // Set isDisabled to true
  //     }
  //   });

  //   // Loop through each filtered session
  //   filteredSessions.forEach((session: any) => {
  //     // Calculate the end time based on the duration
  //     let endTime: any;
  //     let startTime = session.time_start;
  //     let buffer = 0; // Initialize buffer
  //     // console.log('sessions',session)
  //     if (duration === 'minutes') {
  //       endTime = startTime + 30 * 60 * 1000; // Add 30 minutes
  //       buffer = 30 * 60 * 1000; // Set buffer to 30 minutes in milliseconds
  //     } else if (duration === 'hour') {
  //       endTime = startTime + 60 * 60 * 1000; // Add 1 hour
  //       buffer = 60 * 60 * 1000; // Set buffer to 1 hour in milliseconds
  //     } else {
  //       throw new Error('Invalid duration specified. Please provide "minutes" or "hour".');
  //     }

  //     // Add buffer to the start time
  //     startTime -= buffer;

  //     // Check for collisions with timetable and update isDisabled accordingly
  //     timetable.forEach((time: any) => {
  //       if (duration === 'hour' && session.type == 'half-hour') {
  //         if (time.timemilisec >= startTime && time.timemilisec < endTime) {
  //           time.isDisabled = true;
  //         }
  //       } else if (duration === 'hour' && session.type == 'hour') {
  //         if (time.timemilisec >= startTime && time.timemilisec <= endTime) {
  //           time.isDisabled = true;
  //         }
  //       } else if (duration === 'minutes' && session.type == 'half-hour') {
  //         if (time.timemilisec >= startTime && (time.timemilisec - 30 * 60 * 1000) < endTime) {
  //           time.isDisabled = true;
  //         }
  //       } else if (duration === 'minutes' && session.type == 'hour') {
  //         if (time.timemilisec >= startTime && (time.timemilisec - 30 * 60 * 1000) <= endTime) {
  //           time.isDisabled = true;
  //         }
  //       }
  //     });
  //   });

  //   return timetable;
  // }

  function updateTimetable(timetable: any, sessions: any, duration: any) {
    // Filter sessions to remove objects with status equal to 2
    const filteredSessions = sessions.filter(
      (session: any) => session.status !== 2,
    );

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

    // Loop through each filtered session
    filteredSessions.forEach((session: any) => {
      // Calculate the end time based on the duration
      let endTime: any;
      let startTime = session.time_start;
      let buffer = 0; // Initialize buffer

      if (duration === 'minutes') {
        endTime = startTime + 30 * 60 * 1000; // Add 30 minutes
        buffer = 30 * 60 * 1000; // Set buffer to 30 minutes in milliseconds
      } else if (duration === 'hour') {
        endTime = startTime + 60 * 60 * 1000; // Add 1 hour
        buffer = 60 * 60 * 1000; // Set buffer to 1 hour in milliseconds
      } else {
        throw new Error(
          'Invalid duration specified. Please provide "minutes" or "hour".',
        );
      }

      // Add buffer to the start time
      startTime -= buffer;

      // Check for collisions with timetable and update isDisabled accordingly
      timetable.forEach((time: any) => {
        if (session.type === 'off') {
          // console.log(session.time_start, time.timemilisec, session.time_end)
          if (
            session.time_start < time.timemilisec &&
            session.time_end > time.timemilisec
          ) {
            time.isDisabled = true;
          }
        } else if (duration === 'hour' && session.type == 'half-hour') {
          if (time.timemilisec >= startTime && time.timemilisec < endTime) {
            time.isDisabled = true;
          }
        } else if (duration === 'hour' && session.type == 'hour') {
          if (time.timemilisec >= startTime && time.timemilisec <= endTime) {
            time.isDisabled = true;
          }
        } else if (duration === 'minutes' && session.type == 'half-hour') {
          if (
            time.timemilisec >= startTime &&
            time.timemilisec - 30 * 60 * 1000 < endTime
          ) {
            time.isDisabled = true;
          }
        } else if (duration === 'minutes' && session.type == 'hour') {
          if (
            time.timemilisec >= startTime &&
            time.timemilisec - 30 * 60 * 1000 <= endTime
          ) {
            time.isDisabled = true;
          }
        }
      });
    });

    return timetable;
  }

  React.useEffect(() => {
    // console.log('hl list',(hopeLinerList))
  }, [hopeLinerList]);

  React.useEffect(() => {
    // console.log('hl sessions',(sessions))
  }, [sessions]);

  React.useEffect(() => {
    fetch_hopeliners();
    setMobileUse(props.view);
    // console.log('minbook',minBookingDate)
  }, []);

  return (
    <>
      {isSelectingHL && (
        <div className={isMobile ? 'container' : 'desktop-container-option'}>
          <div
            aria-hidden="true"
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => {
              props.goBack('selection');
            }}
          >
            <ArrowBackIosNewIcon />
            Go back to preference selection
          </div>

          <div style={{ width: '80%' }}>
            {hopeLinerList.map((liner: any, index: any) => {
              return (
                <div
                  onClick={() => {
                    // console.log(liner)
                    setSelectingHL(false);
                    setHopelinerParams({
                      hl_name: `${liner.fname} ${liner.lname[0]}`,
                      hl_img: liner.img,
                      hl_id: liner.user_id,
                      hl_email: liner.email,
                    });
                    loadHLSessions(liner.user_id);
                  }}
                  key={liner.user_id}
                >
                  <div className={'hopeliner-card'}>
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
            Choose your desired Hopeliner
          </p>
        </div>
      )}
      {!isSelectingHL && (
        <div className={isMobile ? 'container' : 'desktop-container-option'}>
          <div>
            {!isSelectingTime && (
              <div>
                <div
                  aria-hidden="true"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelectingHL(true);
                    setSelectingTime(false);
                  }}
                >
                  <ArrowBackIosNewIcon />
                  Go back to Hopeliner selection
                </div>

                <>
                  <div className={'hopeliner-card selected-hopeliner'}>
                    <img className="card-img" src={hopelinerParams.hl_img} />
                    <div className="card-details">
                      <div className="schedule-card-header">{`${hopelinerParams.hl_name}.`}</div>
                      <div className="schedule-card-subheader">
                        selected Hopeliner
                      </div>
                    </div>
                  </div>
                </>

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
                        updateTimetable(
                          generateTimeSlots(selectedDate.$d),
                          sessions,
                          selectedDuration,
                        ),
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

                {props.userType === 1 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: 20,
                      flexDirection: 'column',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <p>Current Date: {selectedDate.format('YYYY-MM-DD')}</p>
                      <label>
                        Increment by:
                        <input
                          type="number"
                          value={incrementValue}
                          onChange={handleInputChange}
                        />
                      </label>
                      <button onClick={incrementDate}>Increment</button>
                    </div>
                    <div>
                      <label>
                        start hour
                        <input
                          type="number"
                          value={startHour}
                          onChange={handleStartHourChange}
                        />
                      </label>
                      <button onClick={incrementDate}>Increment</button>
                    </div>
                    <div>
                      <label>
                        start minutes
                        <input
                          type="number"
                          value={startMinute}
                          onChange={handleStartMinuteChange}
                        />
                      </label>
                      <button onClick={incrementDate}>Increment</button>
                    </div>
                    <div>
                      <label>
                        end hour
                        <input
                          type="number"
                          value={endHour}
                          onChange={handleEndHourChange}
                        />
                      </label>
                      <button onClick={incrementDate}>Increment</button>
                    </div>
                    <div>
                      <label>
                        end minutes
                        <input
                          type="number"
                          value={endMinute}
                          onChange={handleEndMinuteChange}
                        />
                      </label>
                      <button onClick={incrementDate}>Increment</button>
                    </div>
                    <Button
                      variant="contained"
                      disabled={!isTouched}
                      onClick={() => {
                        handleSubmitLeave(
                          hopelinerParams.hl_name,
                          hopelinerParams.hl_id,
                          hopelinerParams.hl_img,
                          incrementValue,
                        );
                      }}
                    >
                      Submit Leave
                    </Button>
                  </div>
                )}
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
                  <div className="empty-slot-holder">
                    no time slot available
                  </div>
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
                    // return (
                    //   <div>
                    //     <div
                    //       className={time.isDisabled ? 'hopeliner-card disabled' : (selectedIndex == index? 'hopeliner-card selected-hopeliner' : 'hopeliner-card')}
                    //       onClick={() => {
                    //       // console.log(time, dayjs(time.timemilisec))
                    //       setSelectedIndex(index)
                    //       setDate(dayjs(time.timemilisec))
                    //     }}
                    //     key={index}>
                    //       <div>{time.timestring}</div>
                    //     </div>
                    //   </div>
                    // )
                  })}
                </div>
                <p>PM</p>
                {pmCounter.length == 0 && (
                  <div className="empty-slot-holder">
                    no time slot available
                  </div>
                )}
                <div className="time-table-container">
                  {timeTable.map((time: any, index: any) => {
                    // console.log(timeTable, "TIMET")
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
                    // return (
                    //   <div>
                    //     <div
                    //       className={time.isDisabled ? 'hopeliner-card disabled' : (selectedIndex == index? 'hopeliner-card selected-hopeliner' : 'hopeliner-card')}
                    //       onClick={() => {
                    //       // console.log(time, dayjs(time.timemilisec))
                    //       setSelectedIndex(index)
                    //       setDate(dayjs(time.timemilisec))
                    //     }}
                    //     key={index}>
                    //       <div>{time.timestring}</div>
                    //     </div>
                    //   </div>
                    // )
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
                      // console.log('updated',selectedDate.$d,updateTimetable(generateTimeSlots(selectedDate.$d),sessions,selectedDuration))
                      handleSubmit(
                        hopelinerParams.hl_name,
                        hopelinerParams.hl_id,
                        hopelinerParams.hl_img,
                      );
                    }}
                  >
                    Book Schedule
                  </Button>
                  {/* {!isTouched && <p style={{fontSize: 12, marginBottom: 3}} className='label'>Please select a date</p>} */}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
export default OptionHL;

import React from 'react';
import {
  query,
  collection,
  where,
  onSnapshot,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import {
  LeaveRequestProps,
  SessionProps,
} from '../../../constants/types/interfaceProps';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../../firebaseConfig';
import { User } from 'firebase/auth';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Button from '@mui/material/Button';
import PostAddIcon from '@mui/icons-material/PostAdd';
import Swal from 'sweetalert2';

function SubmitLeave(props: {}) {
  const currentUser: User | null = FIREBASE_AUTH.currentUser;

  const [minBookingDate, setMinBookingDate] = React.useState(
    dayjs()
      .add(1, 'day')
      .set('hour', 8)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0),
  );
  const [selectedDate, setDate] = React.useState<any>(minBookingDate);
  const [isTouched, setTouched] = React.useState(false);

  const [incrementValue, setIncrementValue] = React.useState(1); // State to store the increment value
  const [startHour, setStartHour] = React.useState(1); // State to store the increment value
  const [startMinute, setStartMinute] = React.useState(1); // State to store the increment value
  const [endMinute, setEndMinute] = React.useState(59); // State to store the increment value
  const [endHour, setEndHour] = React.useState(23); // State to store the increment value

  const shouldDisableDate = (date: Dayjs) => {
    const selectedDate = dayjs(date).startOf('day'); // Set time to 00:00:00
    const isWeekend = selectedDate.day() === 0;
    return isWeekend;
  };

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

  const handleSubmitLeave = async (iteration: number) => {
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

      const payload: LeaveRequestProps = {
        date: fbDate,
        time_start: selectedTime,
        time_end: endTime,

        date_created: new Date(),
        date_stamp: dateStamp.getTime(),
        buffer: buffer,
        type: 'off',
        status: 5,
        user_id: currentUser?.uid,
        hopeliner_id: currentUser?.uid,
        hopeliner_email: currentUser?.email as string,
        contact_reason: null,

        hopeliner_img: currentUser?.photoURL as string,
        hopeliner_name: currentUser?.displayName as string,
        user_img: currentUser?.photoURL as string,
        user_name: currentUser?.displayName,
        user_email: currentUser?.email as string,
        leave_status: 3,
        archive: false,
      };
      console.log(payload);

      try {
        const doc = await addDoc(
          collection(FIRESTORE_DB, 'leave_requests'),
          payload,
        );
        console.log('Document written with ID: ', doc.id);

        Swal.fire({
          title: 'Leave Filed!',
          text: `Please inform admin for approval`,
          icon: 'success',
        });
      } catch {
        Swal.fire({
          title: 'Action Failed',
          text: 'Contact Admin',
          icon: 'error',
        });
      }
    }

    // console.log(selectedDate.add(1, 'day'))
    // addSession({...payload, ...meetLink})
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 20,
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            marginTop: 8,
            marginBottom: 8,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <PostAddIcon color="info" />
          <div>Submit Leave</div>
        </div>
        <div
          style={{
            display: 'flex',
            marginBottom: 50,
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}
        >
          <section>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                disablePast
                shouldDisableDate={shouldDisableDate}
                minDate={minBookingDate}
                value={isTouched ? selectedDate : null}
                onChange={(newValue) => {
                  setDate(newValue);
                  setTouched(true);
                }}
              />
            </LocalizationProvider>
          </section>
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 24,
              backgroundColor: 'white',
              borderRadius: 4,
              marginLeft: 24,
            }}
          >
            <div style={{ display: 'flex', marginBottom: 24 }}>
              Please select a date in the calendar
            </div>
            <div>
              <p style={{ fontSize: 11 }}>Date Selected:</p>
              <div
                style={{
                  marginTop: 8,
                  marginBottom: 24,
                  backgroundColor: 'whitesmoke',
                  paddingTop: 2,
                  paddingBottom: 2,
                  borderRadius: 4,
                }}
              >
                {selectedDate.format('MM-DD-YYYY')}
              </div>
              {/* <label>
            Increment by:
            <input
              type="number"
              value={incrementValue}
              onChange={handleInputChange}
            />
          </label>
          <button onClick={incrementDate}>Increment</button> */}
            </div>
            {/* <div>
          <label>
            start hour
            <input
              type="number"
              value={startHour}
              onChange={handleStartHourChange}
            />
          </label>
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
        </div> */}
            <Button
              variant="contained"
              disabled={!isTouched}
              onClick={() => {
                // // console.log('updated',selectedDate.$d,updateTimetable(generateTimeSlots(selectedDate.$d),sessions,selectedDuration))
                handleSubmitLeave(incrementValue);
              }}
            >
              Submit Leave
            </Button>
          </section>
        </div>

        {/* {!isTouched && <p style={{fontSize: 12, marginBottom: 3}} className='label'>Please select a date</p>} */}
      </div>
    </div>
  );
}
export default SubmitLeave;

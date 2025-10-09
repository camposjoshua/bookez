import dayjs, { Dayjs } from 'dayjs';
import { Timestamp } from 'firebase/firestore';

export function formatGmeetDate(inputDate: number) {
  // Parse the input date string
  const date = new Date(inputDate);

  // Get the components of the date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Get the time zone offset
  // const offsetHours = Math.floor(date.getTimezoneOffset() / 60);
  // const offsetMinutes = Math.abs(date.getTimezoneOffset() % 60);
  // const offsetSign = offsetHours >= 0 ? '+' : '-';
  // const offsetHoursString = String(Math.abs(offsetHours)).padStart(2, '0');
  // const offsetMinutesString = String(offsetMinutes).padStart(2, '0');

  // Localized to PH timeZone

  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;

  return formattedDate;
}

export const formatDate = (selectedDate: number) => {
  const date = new Date(selectedDate);
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

export const shouldDisableDate = (date: Dayjs) => {
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

export const formatFBTimestamp = (selectedDate: number) => {
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
  const formattedDate = `${monthName}  ${date.getDate()} , ${date.getFullYear()}`;
  // const formattedDate = `${monthName} ${date.getDate()} ${date.getFullYear()}, ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
  return formattedDate;
};

export const FBTimestamp = (
  selectedDate: number,
  type: 'short' | 'complete',
) => {
  const date = new Date(selectedDate * 1000);
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
  const monthName = months[date.getMonth()];
  const short = `${monthName}  ${date.getDate()} , ${date.getFullYear()}`;
  const complete = `${monthName} ${date.getDate()} ${date.getFullYear()}, ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;

  if (type === 'short') return short;
  if (type === 'complete') return complete;
};

export const getCurrentYearAndMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() returns 0-indexed month
  return { year, month };
};

export const formatFromFBTimestamp = (timestamp: Timestamp): string => {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
  );
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const getDateStatus = (arr: any): string => {
  const dateInMilliseconds = arr.time_start;
  const currentDate = new Date();
  const inputDate = new Date(dateInMilliseconds);

  const todayDate = new Date(currentDate);
  todayDate.setHours(0, 0, 0, 0);

  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);

  const currentWeekStart = new Date(currentDate);
  currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
  currentWeekStart.setHours(0, 0, 0, 0);

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
  currentWeekEnd.setHours(23, 59, 59, 999);

  const nextWeekStart = new Date(currentWeekStart);
  nextWeekStart.setDate(currentWeekStart.getDate() + 7);

  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
  endOfMonth.setHours(23, 59, 59, 999);

  const nextMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1,
  );

  const nextMonthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 2,
    0,
  );
  nextMonthEnd.setHours(23, 59, 59, 999);

  const startOfToday = new Date(currentDate);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(currentDate);
  endOfToday.setHours(23, 59, 59, 999);

  const endOfNext7Days = new Date(startOfToday);
  endOfNext7Days.setDate(startOfToday.getDate() + 6);
  endOfNext7Days.setHours(23, 59, 59, 999);

  if (inputDate < currentDate) {
    return 'past';
  }

  if (inputDate >= startOfToday && inputDate <= endOfToday) {
    return 'today';
  }

  if (inputDate >= startOfToday && inputDate <= endOfNext7Days) {
    return 'this week';
  }

  if (
    inputDate >= nextWeekStart &&
    inputDate <= new Date(currentWeekEnd.getTime() + 7 * 24 * 60 * 60 * 1000)
  ) {
    return 'next week';
  }

  if (inputDate >= currentDate && inputDate <= endOfMonth) {
    return 'this month';
  }

  if (inputDate >= nextMonthStart) {
    return 'next month';
  }

  return 'future';
};

/* eslint-disable @typescript-eslint/no-unused-vars */

import './booking.css';
import OptionHL from './components/Option_HL';
import OptionTime from './components/Option_time';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

function BookingPage(
  props: Readonly<{
    userInfo: any;
    code: any;
    creds: any;
    isDone: any;
    view: any;
  }>,
) {
  const r_token = props.code;
  const isMobile = props.view;
  const { userType } = props.userInfo;
  const [opt, setOpt] = useState<any>('selection');

  const userinfo: any = jwtDecode(props.creds);

  const handleGoBack = (data: any) => {
    // console.log(data)
    setOpt(data);
  };

  const handleDone = (data: any) => {
    // console.log('data',data)
    if (data == true) {
      props.isDone(true);
    }
  };

  useEffect(() => {
    // console.log('rerender')
  }, [opt]);

  useEffect(() => {
    setOpt('selection');
  }, []);

  return (
    <>
      {opt == 'selection' && (
        <div className="container">
          Choose your Preference:
          <div
            className="option-container"
            onClick={() => {
              setOpt('time');
            }}
          >
            <div>Select preferred time</div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 10,
              }}
            >
              <p style={{ fontSize: 12, marginBottom: 3 }} className="label">
                Select a time that works best for you, then choose an available
                hopeliner for your selected time slot.
              </p>
            </div>
          </div>
          <div
            className="option-container"
            onClick={() => {
              setOpt('hopeliner');
            }}
          >
            <div>Select preferred hopeliner</div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: 10,
              }}
            >
              <p style={{ fontSize: 12, marginBottom: 3 }} className="label">
                Choose your preferred hopeliner and select a suitable time from
                their available slots.
              </p>
            </div>
          </div>
        </div>
      )}
      {opt == 'hopeliner' && (
        <OptionHL
          userType={userType}
          code={r_token}
          creds={userinfo}
          isDone={handleDone}
          view={isMobile}
          goBack={handleGoBack}
        />
      )}
      {opt == 'time' && (
        <OptionTime
          code={r_token}
          creds={userinfo}
          isDone={handleDone}
          view={isMobile}
          goBack={handleGoBack}
        />
      )}
    </>
  );
}
export default BookingPage;

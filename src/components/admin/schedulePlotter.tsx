/* eslint-disable @typescript-eslint/no-unused-vars */

import '../bookingpage/booking.css';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { SchedulePlotter } from './components/SchedulePlotter';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function SchedulePlotterPage(
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
    if (data === true) {
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
      {opt === 'selection' && (
        <div
          className="container"
          style={{
            display: 'flex',
            paddingTop: 10,
            paddingLeft: 10,
            borderRadius: 10,
            flexDirection: 'column',
          }}
        >
          <div style={{ marginTop: 10, marginBottom: 10 }}>Select Option:</div>
          <div
            className="option-container"
            aria-hidden="true"
            onClick={() => {
              setOpt('hopeliner');
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AccountCircleIcon sx={{ marginRight: 1 }} />
              <div>Select preferred hopeliner</div>
            </div>
            <div style={{ display: 'flex', marginTop: 16 }}>
              <p style={{ fontSize: 12, marginBottom: 3 }} className="label">
                Plot Hopeliner schedule
              </p>
            </div>
          </div>
        </div>
      )}
      {opt === 'hopeliner' && (
        <SchedulePlotter
          userType={userType}
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
export default SchedulePlotterPage;

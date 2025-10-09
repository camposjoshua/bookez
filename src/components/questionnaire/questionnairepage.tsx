/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
// import { useMediaQuery } from 'react-responsive'
import './questionnaire.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuestionnaireComponent from './questionnaire';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { formatDate, formatGmeetDate } from '../../services/date_services';

function QuestionnairePage(props: {
  handleUser?: any;
  handleCode?: any;
  handleTokens?: any;
  handleNavigation?: any;
  view: any;
}) {
  const isMobile = props.view;

  const { handleUser } = props;
  const { handleCode } = props;
  const { handleTokens } = props;

  const [isDonePHQ, setDonePHQ] = React.useState<boolean>(true);
  const [isDoneGAD, setDoneGAD] = React.useState<boolean>(true);
  const [isDoneDSM, setDoneDSM] = React.useState<boolean>(true);
  const [isLoading, setLoading] = React.useState<boolean>(true);

  const [dataPHQ, setdataPHQ] = React.useState<any>();
  const [dataGAD, setdataGAD] = React.useState<any>();
  const [dataDSM, setdataDSM] = React.useState<any>();

  const [severityDSM, setSeverityDSM] = React.useState<any>([]);
  const [severityPHQ, setSeverityPHQ] = React.useState<any>();
  const [severityGAD, setSeverityGAD] = React.useState<any>();

  const getSeverity = (level: number) => {
    switch (level) {
      case 0:
        return 'None';
      case 1:
        return 'Slight';
      case 2:
        return 'Mild';
      case 3:
        return 'Moderate';
      case 4:
        return 'Severe';
      default:
        return 'Unknown';
    }
  };

  const Domain_Name = [
    'I. Depression:',
    'II. Anger:',
    'III. Mania:',
    'IV. Anxiety:',
    'V. Somatic Symptoms:',
    'VI. Suicidal Ideation:',
    'VII. Psychosis:',
    'VIII. Sleep Problems:',
    'IX. Memory:',
    'X. Repetitive Thoughts and Behaviors:',
    'XI. Dissociation:',
    'XII. Personality Functionin:',
    'XIII. Substance Use:',
  ];

  const PHQ_scoring = (score: number) => {
    if (score >= 0 && score <= 4) {
      setSeverityPHQ('Minimal depression or none');
      // setResultStatus("Monitor; may not require treatment");
    }
    if (score >= 5 && score <= 9) {
      setSeverityPHQ('Mild depression');
      // setResultStatus("Use clinical judgment (symptom duration, functional impairment) to determine necessity of treatment");
    }
    if (score >= 10 && score <= 14) {
      setSeverityPHQ('Moderate depression');
      // setResultStatus("Use clinical judgment (symptom duration, functional impairment) to determine necessity of treatment");
    }
    if (score >= 15 && score <= 19) {
      setSeverityPHQ('Moderately severe depression');
      // setResultStatus("Warrants active treatment with psychotherapy, medications, or combination");
    }
    if (score >= 20 && score <= 27) {
      setSeverityPHQ('Severe depression');
      // setResultStatus("Warrants active treatment with psychotherapy, medications, or combination");
    }

    if (Number.isNaN(score)) {
      setSeverityPHQ('Minimal depression or none');
      // setResultStatus("Monitor; may not require treatment");
    }
  };

  const GAD_scoring = (score: number) => {
    if (score <= 4) {
      setSeverityGAD('No anxiety disorder');
      // setResultStatus("");
    }
    if (score >= 5 && score <= 9) {
      setSeverityGAD('Mild anxiety disorder.');
      // setResultStatus("Monitor; may not require treatment");
    }
    if (score >= 10 && score <= 14) {
      setSeverityGAD('Moderate anxiety disorder.');
      // setResultStatus("Monitor; may not require treatment");
    }
    if (score >= 15) {
      setSeverityGAD('Severe anxiety disorder.');
      // setResultStatus("");
    }
    if (Number.isNaN(score)) {
      setSeverityGAD('No anxiety disorder');
      // setResultStatus("");
    }
  };

  const DSM_scoring = async (Arr: any) => {
    if (!Array.isArray(Arr)) {
      return;
    }
    const D_I = [Arr[0], Arr[1]].map(Number).sort((a, b) => b - a);
    const D_II = [Arr[2]];
    const D_III = [Arr[3], Arr[4]].map(Number).sort((a, b) => b - a);
    const D_IV = [Arr[5], Arr[6], Arr[7]].map(Number).sort((a, b) => b - a);
    const D_V = [Arr[8], Arr[9]].map(Number).sort((a, b) => b - a);
    const D_VI = [Arr[10]];
    const D_VII = [Arr[11], Arr[12]].map(Number).sort((a, b) => b - a);
    const D_VIII = [Arr[13]];
    const D_IX = [Arr[14]];
    const D_X = [Arr[15], Arr[16]].map(Number).sort((a, b) => b - a);
    const D_XI = [Arr[17]];
    const D_XII = [Arr[18], Arr[19]].map(Number).sort((a, b) => b - a);
    const D_XIII = [Arr[20], Arr[22]].map(Number).sort((a, b) => b - a);

    // console.log("Domain II: " , D_II[0], `${getSeverity(D_II[0])}`)
    // console.log("Domain III: " , D_III[0], `${getSeverity(D_III[0])}`)
    // console.log("Domain IV: " , D_IV[0], `${getSeverity(D_IV[0])}`)
    // console.log("Domain V: " , D_V[0], `${getSeverity(D_V[0])}`)
    // console.log("Domain VI: " , D_VI[0], `${getSeverity(D_VI[0])}`)
    // console.log("Domain VII: " , D_VII[0], `${getSeverity(D_VI[0])}`)
    // console.log("Domain VIII: " , D_VIII[0], `${getSeverity(D_VIII[0])}`)
    // console.log("Domain IX: " , D_IX[0], `${getSeverity(D_IX[0])}`)
    // console.log("Domain X: " , D_X[0], `${getSeverity(D_X[0])}`)
    // console.log("Domain XI: " , D_XI[0], `${getSeverity(D_XI[0])}`)
    // console.log("Domain XII: " , D_XII[0], `${getSeverity(D_XII[0])}`)
    // console.log("Domain XIII: " , D_XIII[0], `${getSeverity(D_XIII[0])}`)

    const userResult = [
      D_I[0],
      D_II[0],
      D_III[0],
      D_IV[0],
      D_V[0],
      D_VI[0],
      D_VII[0],
      D_VIII[0],
      D_IX[0],
      D_X[0],
      D_XI[0],
      D_XII[0],
      D_XIII[0],
    ];
    setSeverityDSM(userResult);
  };

  const checkQuestionnaire = async (data: any) => {
    const bookingsRef = collection(FIRESTORE_DB, 'Questionnaire');

    const types = ['PHQ-9', 'GAD-7', 'DSM-5'];

    const querySnapshot = await getDocs(
      query(
        bookingsRef,
        where('respondent_id', '==', data.user_id),
        where('type', 'in', types),
        where('status', '==', 1),
      ),
    );

    const documents = await querySnapshot.docs.map((doc) => doc.data());
    const documentsWID = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
    // console.log(documents, "DOCU")

    const PHQ = await documents.filter((doc) => doc.type === 'PHQ-9');
    const GAD = await documents.filter((doc) => doc.type === 'GAD-7');
    const DSM = await documents.filter((doc) => doc.type === 'DSM-5');
    const PHQID = await documentsWID.filter((doc) => doc.data.type === 'PHQ-9');
    const GADID = await documentsWID.filter((doc) => doc.data.type === 'GAD-7');
    const DSMID = await documentsWID.filter((doc) => doc.data.type === 'DSM-5');

    // const PHQ = await getDocs(q1);
    // const GAD = await getDocs(q2);
    // const DSM = await getDocs(q3);
    // console.log("PHQ", PHQ, 'ID',PHQID[0].id)
    // console.log("GAD", GAD, 'ID',GADID[0].id)
    // console.log("DSM", DSM, 'ID',DSMID[0].id)

    setdataDSM(DSM[0]);
    setdataPHQ(PHQ[0]);
    setdataGAD(GAD[0]);

    GAD_scoring(GAD[0]?.respondent_score);
    PHQ_scoring(PHQ[0]?.respondent_score);
    DSM_scoring(DSM[0]?.respondent_answers);

    if (PHQ.length != 0) {
      if (PHQ[0].valid_until <= new Date().getTime()) {
        // console.log('invalid')
        const docRef = doc(FIRESTORE_DB, 'Questionnaire', PHQID[0].id);
        await updateDoc(docRef, {
          status: 0,
        });
        setLoading(false);
        setDonePHQ(false);
      }
    } else if (PHQ.length === 0) {
      setLoading(false);
      setDonePHQ(false);
    }
    if (GAD.length != 0) {
      if (GAD[0].valid_until <= new Date().getTime()) {
        // console.log('invalid')
        const docRef = doc(FIRESTORE_DB, 'Questionnaire', GADID[0].id);
        await updateDoc(docRef, {
          status: 0,
        });
        setLoading(false);
        setDoneGAD(false);
      }
    } else if (GAD.length === 0) {
      setLoading(false);
      setDoneGAD(false);
    }
    if (DSM.length != 0) {
      if (DSM[0].valid_until <= new Date().getTime()) {
        // console.log('invalid')
        const docRef = doc(FIRESTORE_DB, 'Questionnaire', DSMID[0].id);
        await updateDoc(docRef, {
          status: 0,
        });
        setLoading(false);
        setDoneDSM(false);
      }
    } else if (DSM.length === 0) {
      setLoading(false);
      setDoneDSM(false);
    } else {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkQuestionnaire({
      user_id: handleUser.uid,
    });
    // console.log(handleUser, "USER HAndle")
  }, []);

  return (
    <>
      {isMobile && (
        // <div className='container'>
        // <p>Logged in</p>
        // <button onClick={logout}>Log out</button>
        // </div>
        <div style={{ paddingTop: '15%' }}>
          <div className="desktop-logout-container">
            {!isDoneDSM && !isDoneGAD && !isDonePHQ && (
              <section
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div className="session-message">
                  Please make sure to take all three assessments and don't
                  worry, all of these will just take a total of 10 minutes
                </div>
              </section>
            )}

            <div className="container">
              <div className="result-section">
                <div className="result-card-header">PHQ-9</div>
                {isDonePHQ ? (
                  <div className="result-card">
                    <p>Results</p>
                    <p>Score: {dataPHQ?.respondent_score}</p>
                    <p
                      style={{
                        marginTop: 16,
                        marginBottom: 8,
                        fontWeight: 'bolder',
                      }}
                    >
                      {severityPHQ}
                    </p>
                  </div>
                ) : (
                  <>
                    <QuestionnaireComponent
                      type={'PHQ-9'}
                      info={handleUser}
                      sessionId={null}
                    />
                  </>
                )}
              </div>

              <div className="result-section">
                <div className="result-card-header">GAD-7</div>
                {isDoneGAD ? (
                  <div className="result-card">
                    <p>Results</p>
                    <p>Score: {dataGAD?.respondent_score}</p>
                    <p
                      style={{
                        marginTop: 16,
                        marginBottom: 8,
                        fontWeight: 'bolder',
                      }}
                    >
                      {severityGAD}
                    </p>
                  </div>
                ) : (
                  <>
                    <QuestionnaireComponent
                      type={'GAD-7'}
                      info={handleUser}
                      sessionId={null}
                    />
                  </>
                )}
              </div>

              <div className="result-section">
                <div className="result-card-header">DSM-5</div>
                {isDoneDSM ? (
                  <div className="result-card">
                    {Array.isArray(severityDSM) ? (
                      severityDSM.map((i: any, index: number) => {
                        return (
                          <div
                            key={index}
                            style={{ display: 'flex', marginBottom: 8 }}
                          >
                            <p>
                              {`${Domain_Name[index]} `}
                              <span
                                style={{ fontWeight: '700', fontSize: 13 }}
                              >{` ${i} (${getSeverity(i)})`}</span>
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <></>
                    )}
                  </div>
                ) : (
                  <>
                    <QuestionnaireComponent
                      type={'DSM-5'}
                      info={handleUser}
                      sessionId={null}
                    />
                  </>
                )}
              </div>
            </div>

            {/* <div onClick={() => {}} className='confirm-button'>
          <CheckCircleIcon className='confirm-icon'/>
          Confirm
        </div> */}
          </div>
        </div>
      )}
      {!isMobile && (
        <div className="desktop-logout-container">
          <div
            style={{ marginBottom: 10 }}
            className="profile-confirmation-message"
          >
            Assessment Page
          </div>
          <div style={{}}>
            <div className="desktop-logout-container">
              {!isDoneDSM && !isDoneGAD && !isDonePHQ && (
                <section
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <div className="session-message">
                    Please make sure to take all three assessments and don't
                    worry, all of these will just take a total of 10 minutes.
                  </div>
                </section>
              )}

              <div className="container" style={{ paddingTop: 24 }}>
                <div className="result-section">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 24,
                    }}
                  >
                    <p style={{ textAlign: 'center' }}>
                      NOTE: if any of your result show MODERATE or higher,
                      please consider booking a session so you can speak with a
                      Hopeliner
                    </p>
                  </div>
                  <div className="result-card-header">PHQ-9</div>
                  {isDonePHQ ? (
                    <div className="result-card">
                      <p>Results</p>
                      <p>Score: {dataPHQ?.respondent_score}</p>
                      <p
                        style={{
                          marginTop: 16,
                          marginBottom: 8,
                          fontWeight: 'bolder',
                        }}
                      >
                        {severityPHQ}
                      </p>
                      <div
                        className="h-stack"
                        style={{ justifyContent: 'flex-end', marginTop: 24 }}
                      >
                        <p className="small-text" style={{ marginRight: 6 }}>
                          Date answered:{' '}
                        </p>
                        <p className="small-text">
                          {dataPHQ ? formatDate(dataPHQ?.date_created) : ''}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <QuestionnaireComponent
                        type={'PHQ-9'}
                        info={handleUser}
                        sessionId={null}
                      />
                    </>
                  )}
                </div>

                <div className="result-section">
                  <div className="result-card-header">GAD-7</div>
                  {isDoneGAD ? (
                    <div className="result-card">
                      <p>Results</p>
                      <p>Score: {dataGAD?.respondent_score}</p>
                      <p
                        style={{
                          marginTop: 16,
                          marginBottom: 8,
                          fontWeight: 'bolder',
                        }}
                      >
                        {severityGAD}
                      </p>
                      <div
                        className="h-stack"
                        style={{ justifyContent: 'flex-end', marginTop: 24 }}
                      >
                        <p className="small-text" style={{ marginRight: 6 }}>
                          Date answered:{' '}
                        </p>
                        <p className="small-text">
                          {dataGAD ? formatDate(dataGAD?.date_created) : ''}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <QuestionnaireComponent
                        type={'GAD-7'}
                        info={handleUser}
                        sessionId={null}
                      />
                    </>
                  )}
                </div>

                <div className="result-section">
                  <div className="result-card-header">DSM-5</div>
                  {isDoneDSM ? (
                    <div className="result-card">
                      {Array.isArray(severityDSM) ? (
                        severityDSM.map((i: any, index: number) => {
                          return (
                            <div
                              key={index}
                              style={{ display: 'flex', marginBottom: 8 }}
                            >
                              <p>
                                {`${Domain_Name[index]} `}
                                <span
                                  style={{ fontWeight: '700', fontSize: 13 }}
                                >{` ${i} (${getSeverity(i)})`}</span>
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <></>
                      )}
                      <div
                        className="h-stack"
                        style={{ justifyContent: 'flex-end', marginTop: 24 }}
                      >
                        <p className="small-text" style={{ marginRight: 6 }}>
                          Date answered:{' '}
                        </p>
                        <p className="small-text">
                          {dataDSM ? formatDate(dataDSM?.date_created) : ''}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <QuestionnaireComponent
                        type={'DSM-5'}
                        info={handleUser}
                        sessionId={null}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* <div onClick={() => {}} className='confirm-button'>
          <CheckCircleIcon className='confirm-icon'/>
          Confirm
        </div> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default QuestionnairePage;

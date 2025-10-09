/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { FIRESTORE_DB } from '../../firebaseConfig';
import Divider from '@mui/material/Divider';
import './session.css';
import {
  DocumentData,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { SessionProps } from '../../constants/types/interfaceProps';
import QuestionnaireComponent from '../questionnaire/questionnaire';
import { Button, CircularProgress, TextField } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import axios from 'axios';
import Swal from 'sweetalert2';
import { formatGmeetDate } from '../../services/date_services';
import Enum from '../../constants/Enum';
import SearchQuestionnaire from '../admin/components/SearchQuestionnaire';
import { handleCopy } from '../../services/text_tools';
import TextCopyButton from '../custom/atoms/TextCopyButton';
import GetAssessments from './components/GetAssessment';
import { getCompany } from '../../services/company_service';

function SessionPage(props: {
  handleUser?: any;
  userInfo?: any;
  handleCode?: any;
  handleTokens?: any;
  sessionID: string;
  handleNavigation?: any;
  userType: any;
  view: any;
  code: any;
  goBack: any;
}) {
  const r_token = props.code;
  const [isMobile, setMobileUse] = React.useState(false);
  const [sessionData, setSessionData] = React.useState<SessionProps | null>();
  const [inProgress, setInProgress] = React.useState(false);
  const [isDonePHQ, setDonePHQ] = React.useState<boolean>(true);
  const [isDoneGAD, setDoneGAD] = React.useState<boolean>(true);
  const [isDoneDSM, setDoneDSM] = React.useState<boolean>(true);
  const [isDonePSQ, setDonePSQ] = React.useState<boolean>(false);
  const [isLoading, setLoading] = React.useState<boolean>(true);
  const [isFetching, setFetching] = React.useState(false);
  const [gmeetLink, setGmeetLink] = React.useState('');

  const [companyName, setCompanyName] = React.useState<string | null>(null);
  const [dataPHQ, setdataPHQ] = React.useState<any>();
  const [dataGAD, setdataGAD] = React.useState<any>();
  const [dataDSM, setdataDSM] = React.useState<any>();

  const [severityDSM, setSeverityDSM] = React.useState<any>([]);
  const [severityPHQ, setSeverityPHQ] = React.useState<any>();
  const [severityGAD, setSeverityGAD] = React.useState<any>();

  const [resultPHQ, setResultPHQ] = React.useState<any>();
  const [resultGAD, setResultGAD] = React.useState<any>();

  const [questionPHQ, setQuestionPHQ] = React.useState<any>([]);
  const [questionGAD, setQuestionGAD] = React.useState<any>([]);
  const [questionDSM, setQuestionDSM] = React.useState<any>([]);

  const [showPHQ, setShowPHQ] = React.useState<any>(false);
  const [showGAD, setShowGAD] = React.useState<any>(false);
  const [showDSM, setShowDSM] = React.useState<any>(false);

  const [showInput, setShowInput] = React.useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = React.useState('');

  const getQuestionsInAscendingOrder = async (type: any) => {
    const q = query(
      collection(FIRESTORE_DB, 'Questions'),
      where('type', '==', type),
    );

    try {
      const querySnapshot = await getDocs(q);
      const questions: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        questions.push(doc.data());
      });

      const sortedQuestions = questions.sort((a, b) => a.id - b.id);
      // console.log('Questions in ascending order:', sortedQuestions);
      if (type === 'PHQ-9') {
        setQuestionPHQ(sortedQuestions);
        return sortedQuestions;
      }
      if (type === 'GAD-7') {
        setQuestionGAD(sortedQuestions);
        return sortedQuestions;
      }
      if (type === 'DSM-5') {
        setQuestionDSM(sortedQuestions);
        return sortedQuestions;
      }
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  };

  const getSessionDetails = async (
    collectionName: string,
    documentId: string,
  ) => {
    const docRef = doc(FIRESTORE_DB, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    getQuestionsInAscendingOrder('PHQ-9');
    getQuestionsInAscendingOrder('GAD-7');
    getQuestionsInAscendingOrder('DSM-5');

    if (docSnap.exists()) {
      // console.log('exist', documentId)
      const data: any = docSnap.data();
      setSessionData(data);
      setSessionNotes(data.session_notes);
      checkQuestionnaire(data);
      console.log('breakpoint data: ', data);
    } else {
      // console.log('Document does not exist');
      console.log('ELSE');
      return null;
    }
  };

  const updateSessionNotes = async () => {
    try {
      const docRef = doc(FIRESTORE_DB, 'Session', props.sessionID);
      await updateDoc(docRef, {
        session_notes: sessionNotes,
      });
      // console.log("Session notes updated successfully!");
    } catch (error) {
      console.error('Error updating session notes: ', error);
    }
  };

  const handleSessionNotesChange = (event: any) => {
    setSessionNotes(event.target.value);
  };

  const ClickableDiv = ({ link, children }: any) => {
    const handleClick = () => {
      if (link !== '') {
        // Open a new tab with the provided link
        window.open(link, '_blank');
      } else {
        setFetching(true);
        // console.log('no link')
        setGoogleMeeting(gmeetLink);
      }
    };

    return (
      <div
        style={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={handleClick}
      >
        {children}
      </div>
    );
  };

  // const checkQuestionnaire = async (data: any) => {
  // 	const bookingsRef = collection(FIRESTORE_DB, 'Questionnaire');

  // 	const types = ['PHQ-9', 'GAD-7', 'DSM-5'];

  // 	const querySnapshot = await getDocs(
  // 		query(bookingsRef, where('respondent_id', '==', data.user_id), where('type', 'in', types))
  // 	);

  // 	const querySurvey = await getDocs(
  // 		query(bookingsRef, where('respondent_id', '==', data.user_id),where('session_id', '==', props.sessionID ), where('type', '==', 'PSQ'))
  // 	);

  // 	const documents = await querySnapshot.docs.map(doc => doc.data());
  // 	// console.log(documents, "DOCU")

  // 	const survey = await querySurvey.docs.map(doc => doc.data());
  // 	// console.log(survey, "Survey")

  // 	const PHQ = await documents.filter(doc => doc.type === 'PHQ-9');
  // 	const GAD = await documents.filter(doc => doc.type === 'GAD-7');
  // 	const DSM = await documents.filter(doc => doc.type === 'DSM-5');
  // 	const PSQ = await survey.filter(doc => doc.type === 'PSQ');

  // 	// const PHQ = await getDocs(q1);
  // 	// const GAD = await getDocs(q2);
  // 	// const DSM = await getDocs(q3);
  // 	// console.log("PHQ", PHQ)
  // 	// console.log("GAD", GAD)
  // 	// console.log("DSM", DSM)

  // 	setdataDSM(DSM[0])
  // 	setdataPHQ(PHQ[0])
  // 	setdataGAD(GAD[0])

  // 	GAD_scoring(GAD[0]?.respondent_score)
  // 	PHQ_scoring(PHQ[0]?.respondent_score)
  // 	DSM_scoring(DSM[0]?.respondent_answers)

  // 	if (PHQ.length === 0){
  // 		setLoading(false)
  // 		setDonePHQ(false)
  // 	}
  // 	if (GAD.length === 0){
  // 		setLoading(false)
  // 		setDoneGAD(false)
  // 	}
  // 	if (DSM.length === 0){
  // 		setLoading(false)
  // 		setDoneDSM(false)
  // 	}

  // 	if (PSQ.length === 0){
  // 		setLoading(false)
  // 		setDonePSQ(false)
  // 	}

  // 	else{
  // 		setLoading(false)
  // 	}
  // }

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

    const querySurvey = await getDocs(
      query(
        bookingsRef,
        where('respondent_id', '==', data.user_id),
        where('session_id', '==', props.sessionID),
        where('type', '==', 'PSQ'),
      ),
    );

    const documents = await querySnapshot.docs.map((doc) => doc.data());
    const documentsWID = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
    // console.log(documents, "DOCU")

    const survey = await querySurvey.docs.map((doc) => doc.data());
    // console.log(survey, "Survey")

    const PSQ = await survey.filter((doc) => doc.type === 'PSQ');
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

    console.log('GAD_scoring: ', GAD[0]?.respondent_score);
    console.log('PHQ_scoring: ', PHQ[0]?.respondent_score);
    console.log('DSM_scoring: ', DSM[0]?.respondent_answers);

    if (PHQ.length !== 0) {
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
    if (GAD.length !== 0) {
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
    if (DSM.length !== 0) {
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
    }

    if (PSQ.length === 0) {
      setLoading(false);
      setDonePSQ(false);
    } else if (PSQ.length !== 0) {
      setDonePSQ(true);
      setLoading(false);
    } else {
      console.log('checkQuestionnaire ELSE ');
      setLoading(false);
    }
  };

  const formatDate = (selectedDate: any) => {
    const tempDate = selectedDate * 1000;
    const date = new Date(tempDate);
    // console.log(selectedDate, "this", date)
    // Array of month names
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    // Get the month name from the array
    const monthName = months[date.getMonth()];
    // Format the date as Month day, year hours:minutes AM/PM
    const formattedDate = `${monthName} ${date.getDate()}, ${date.getFullYear()} ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
    return formattedDate;
  };

  const { handleUser, userInfo } = props;
  const { handleCode } = props;
  const { handleTokens } = props;

  const handleResult = (score: number, type: string, answerArr: any) => {
    if (type === 'PHQ-9') {
      PHQ_scoring(score);
    }
    if (type === 'GAD-7') {
      GAD_scoring(score);
    }
    if (type === 'DSM-5') {
      DSM_scoring(answerArr);
    }
  };

  const PHQ_scoring = (score: number) => {
    if (score >= 0 && score <= 4) {
      setSeverityPHQ('Minimal depression or none');
      setResultPHQ('Monitor; may not require treatment');
    }
    if (score >= 5 && score <= 9) {
      setSeverityPHQ('Mild depression');
      setResultPHQ('Watchful waiting; repeat PHQ-9 at follow-up');
    }
    if (score >= 10 && score <= 14) {
      setSeverityPHQ('Moderate depression');
      setResultPHQ(
        'Treatment Plan, considering counseling, follow-up and/or pharmacotherapy',
      );
    }
    if (score >= 15 && score <= 19) {
      setSeverityPHQ('Moderately severe depression');
      setResultPHQ(
        'Active Treatment with pharmacotherapy and/or psychotherapy',
      );
    }
    if (score >= 20 && score <= 27) {
      setSeverityPHQ('Severe depression');
      setResultPHQ(
        'Immediate initiation of pharmacotherapyand, if severe impairement or poor response to therapy, expeditaed referral to a mental health specialist for psychotherapy and/or collaborative management',
      );
    }

    if (Number.isNaN(score)) {
      setSeverityPHQ('Minimal depression or none');
      // setResultStatus("Monitor; may not require treatment");
    }
  };

  const GAD_scoring = (score: number) => {
    if (score <= 4) {
      setSeverityGAD('No anxiety disorder');
      setResultGAD('');
    }
    if (score >= 5 && score <= 9) {
      setSeverityGAD('Mild anxiety disorder.');
      setResultGAD(
        'Provide general feedback, repeat GAD-7 at follow-up, consider adjusting treatment plan if not improving in last 4 weeks',
      );
    }
    if (score >= 10 && score <= 14) {
      setSeverityGAD('Moderate anxiety disorder.');
      setResultGAD(
        'Further evaluation recomended; For active treatment plans consider adjustment; For text therapy clients monitor for synchronous therapy',
      );
    }
    if (score >= 15) {
      setSeverityGAD('Severe anxiety disorder.');
      setResultGAD(
        'Adjust treatment plan; focused assessment of safety plan and pharmacotherapy evaluation/re-evaluation; if emergent need then consider referral to higher level of care; Client is not a good candidate for text therapy/asyynchronous',
      );
    }
    if (Number.isNaN(score)) {
      setSeverityGAD('No anxiety disorder');
      setResultGAD('');
    }
  };

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

  const Domain_Name = Enum.domain;

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

  const handleViewAnswer = async (type: any) => {
    // const question = await getQuestionsInAscendingOrder(type)
    // // console.log(question)
    // console.log(dataPHQ.respondent_answers)
    // console.log(dataGAD.respondent_answers)
    // console.log(dataDSM.respondent_answers)
  };

  const handleNotes = (action: string) => {
    if (action === 'show') {
      setShowInput(true);
      // console.log("Show Input")
    }
    if (action === 'hide') {
      setShowInput(false);
      // console.log("Hide Input")
    }
    if (action === 'submit') {
      // console.log("Submit Input")
      updateSession('notes');
      // console.log(sessionNotes)
    }
  };

  const setGoogleMeeting = async (link: string) => {
    const code = r_token;

    const attendeesEmails = [
      { email: 'hello@teamradixhr.com' },
      { email: 'hopeliner.stehphen@gmail.com' },
    ];

    const event = {
      summary: 'Scheduled Call with a hopeliner from Silver Lining', // short desc
      location: 'Virtual / Google Meet',
      description: `Silver lining hopeliner call with ${sessionData?.hopeliner_email} & ${sessionData?.user_email}`, // title of meeting
      start: {
        dateTime: formatGmeetDate(sessionData?.time_start as number),
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: formatGmeetDate(sessionData?.time_end as number),
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

    if (link) {
      try {
        await updateSession('meetlink', link);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Gmeet link was successfully updated.',
        });
        return;
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        });
        return;
      } finally {
        setFetching(false);
      }
    } else {
      setFetching(false);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No Gmeet link provided.',
      });
      return;
    }

    await axios
      .post(
        'https://us-central1-silverlining-ec543.cloudfunctions.net/api/api/set-meeting',
        { code, event },
      )
      .then((res) => {
        // const meetLink = {gmeetlink: res.data.data.hangoutLink}
        // addSession({...payload, ...meetLink})
        updateSession('meetlink', res.data.data.hangoutLink);
      })
      .catch((error) => {
        setFetching(false);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        });
        console.log('failed gmeets', error.message);
      });
  };

  const updateSession = async (action: 'notes' | 'meetlink', link?: string) => {
    if (action === 'notes') {
      updateSessionNotes();
    }
    if (action === 'meetlink') {
      try {
        const docRef = doc(FIRESTORE_DB, 'Session', props.sessionID);
        await updateDoc(docRef, {
          gmeetlink: link,
          status: 1,
        });
        // console.log("Session notes updated successfully!");
        getSessionDetails('Session', props.sessionID);
        setFetching(false);
        Swal.fire({
          icon: 'success',
          title: 'Booked Session',
          text: `Your Google meet link is ${link}`,
        });
      } catch (error) {
        console.error('Error updating session notes: ', error);
        setFetching(false);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        });
      }
    }
  };

  const cancelBooking = async () => {
    try {
      const docRef = doc(FIRESTORE_DB, 'Session', props.sessionID);
      await updateDoc(docRef, {
        status: 2,
      });
      props.goBack(true);
      Swal.fire({
        icon: 'success',
        title: 'Cancel Session',
        text: `Booking Cancelled`,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
    }
  };

  const clientNoShow = async () => {
    try {
      const docRef = doc(FIRESTORE_DB, 'Session', props.sessionID);
      await updateDoc(docRef, {
        status: 4,
      });
      props.goBack(true);
      Swal.fire({
        icon: 'success',
        title: 'Report Submitted',
        text: `Client tagged as no show`,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
    }
  };

  const completeSession = async () => {
    try {
      const docRef = doc(FIRESTORE_DB, 'Session', props.sessionID);
      await updateDoc(docRef, {
        status: 3,
      });
      props.goBack(true);
      Swal.fire({
        icon: 'success',
        title: 'Complete Session',
        text: `Session Completed!`,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
    }
  };

  const timeChecker = () => {
    if (sessionData) {
      if (sessionData?.time_start <= Date.now()) {
        setInProgress(true);
      }
    }
  };

  const handleConfirmation = async (
    action: 'cancel' | 'complete' | 'noShow',
  ) => {
    if (action === 'cancel') {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Cancel booking!',
      }).then((result) => {
        if (result.isConfirmed) {
          cancelBooking();
        }
      });
    }
    if (action === 'complete') {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Session is Done!',
      }).then((result) => {
        if (result.isConfirmed) {
          completeSession();
        }
      });
    }
    if (action === 'noShow') {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Client did not attend!',
      }).then((result) => {
        if (result.isConfirmed) {
          clientNoShow();
        }
      });
    }
  };

  const CancelButton = () => {
    if (sessionData?.status === 2) {
      return <></>;
    }
    if (sessionData?.status === 3) {
      return <></>;
    }
    if (sessionData && sessionData?.time_end <= Date.now()) {
      return <></>;
    }
    if (sessionData?.gmeetlink !== '') {
      return <></>;
    } else {
      return (
        <div
          style={
            props.userType === 3
              ? { width: '90%', marginLeft: '5%' }
              : { display: 'none' }
          }
        >
          <div
            className="button-19 btn-close"
            style={{ marginBottom: 4 }}
            onClick={() => {
              handleConfirmation('cancel');
            }}
          >
            <p
              style={{
                color: 'white',
                fontWeight: 'bolder',
                marginLeft: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {' '}
              <CancelIcon sx={{ color: 'white', marginRight: 1 }} />
              Cancel Booking
            </p>
          </div>
        </div>
      );
    }
  };

  React.useEffect(() => {
    timeChecker();
    const fetchCompany = async () => {
      const company = await getCompany(sessionData?.user_email ?? '');
      setCompanyName(company);
    };

    fetchCompany();
  }, [sessionData]);

  React.useEffect(() => {
    if (props.view) {
      setMobileUse(props.view);
    }
  }, [props]);

  React.useEffect(() => {
    getSessionDetails('Session', props.sessionID);
  }, []);

  return (
    <div className="Screen">
      <div style={{ marginTop: 24, marginBottom: 5 }}>
        <p style={{ fontSize: 20 }}>Session</p>
      </div>

      <div className="mobile-screen">
        {props.userType === 2 || props.userType === 1 ? (
          <div className="container header-hl-view">
            <div className="header-info-hl">
              <div style={{}}>
                <div
                  className="info-title-container"
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <p className="info-title">Client's Information</p>
                </div>
                <div
                  className="h-stack-sb"
                  style={{
                    alignItems: 'center',
                    marginTop: 8,
                    marginBottom: 8,
                  }}
                >
                  <p className="label-m">UID:</p>
                  <TextCopyButton text={sessionData?.user_id as string} />
                </div>
                <div
                  className="h-stack-sb"
                  style={{
                    alignItems: 'center',
                    marginTop: 8,
                    marginBottom: 8,
                  }}
                >
                  <p className="label-m">Email:</p>
                  <TextCopyButton text={sessionData?.user_email as string} />
                </div>

                <Divider
                  variant="fullWidth"
                  sx={{ marginTop: 2, marginBottom: 1 }}
                />
                <p className="label-m">Name:</p>
                <p className={isMobile ? 'info-value-m' : 'info-value'}>
                  {props.userType === 2 || props.userType === 1
                    ? sessionData?.user_name
                    : sessionData?.hopeliner_name}
                </p>

                <div className="h-stack-sb my-1">
                  <div className="h-stack-f-1">
                    <p className="label-m mr-1">Company:</p>
                    <p className={isMobile ? 'info-value-m' : 'info-value'}>
                      {companyName}
                    </p>
                  </div>
                  <div className="h-stack-f-1">
                    <p className="label-m mr-1">Age:</p>
                    <p
                      className={isMobile ? 'info-value-m' : 'info-value'}
                    >{`TBD`}</p>
                  </div>
                </div>

                <div className="h-stack-sb my-1">
                  <div className="h-stack-f-1">
                    <p className="label-m mr-1">Designation:</p>
                    <p
                      className={isMobile ? 'info-value-m' : 'info-value'}
                    >{`TBD`}</p>
                  </div>
                  <div className="h-stack-f-1">
                    <p className="label-m mr-1">Gender:</p>
                    <p
                      className={isMobile ? 'info-value-m' : 'info-value'}
                    >{`TBD`}</p>
                  </div>
                </div>

                <div className="h-stack-sb my-1">
                  <div className="h-stack-f-1">
                    <p className="label-m mr-1">Session Schedule:</p>
                    <p className={isMobile ? 'info-value-m' : 'info-value'}>
                      {formatDate(sessionData?.date.seconds)}
                    </p>
                  </div>
                  <div className="h-stack-f-1">
                    <p className="label-m mr-1">Duration:</p>
                    <p className={isMobile ? 'info-value-m' : 'info-value'}>
                      {sessionData?.type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="display-img-container">
              <img
                src={
                  props.userType === 2 || props.userType === 1
                    ? sessionData?.user_img
                    : sessionData?.hopeliner_img
                }
                alt="hopeliner IMG"
                className="display-picture"
              />
              <div>
                <p>Assessment:</p>
                <div
                  className={
                    isDonePHQ ? 'chip-assessment-done' : 'chip-assessment'
                  }
                >
                  <p>PHQ-9</p>
                  {isDonePHQ ? (
                    <CheckCircleIcon sx={{ height: 14 }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ height: 14 }} />
                  )}
                </div>
                <div
                  className={
                    isDoneGAD ? 'chip-assessment-done' : 'chip-assessment'
                  }
                >
                  <p>GAD-7</p>
                  {isDoneGAD ? (
                    <CheckCircleIcon sx={{ height: 14 }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ height: 14 }} />
                  )}
                </div>
                <div
                  className={
                    isDoneDSM ? 'chip-assessment-done' : 'chip-assessment'
                  }
                >
                  <p>DSM-5</p>
                  {isDoneDSM ? (
                    <CheckCircleIcon sx={{ height: 14 }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ height: 14 }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container header-client-view">
            <div className="header-info">
              <img
                src={
                  props.userType === 2
                    ? sessionData?.user_img
                    : sessionData?.hopeliner_img
                }
                alt="hopeliner IMG"
                className="display-picture"
              />
              <div style={{ marginLeft: 5 }}>
                <p
                  style={
                    isMobile
                      ? { fontSize: 18, fontWeight: 700 }
                      : { fontSize: 18, fontWeight: 700 }
                  }
                >
                  {props.userType === 2
                    ? sessionData?.user_name
                    : sessionData?.hopeliner_name}
                </p>
                {sessionData?.status === 1 && (
                  <p
                    style={
                      isMobile
                        ? { marginBottom: 10, marginTop: 5, fontSize: 12 }
                        : { marginBottom: 5, marginTop: 5, fontSize: 13 }
                    }
                  >
                    Hi, I'm looking forward to our session.
                  </p>
                )}
                {sessionData?.status === 3 && (
                  <p
                    style={
                      isMobile
                        ? { marginBottom: 10, marginTop: 5, fontSize: 12 }
                        : { marginBottom: 5, marginTop: 5, fontSize: 13 }
                    }
                  >
                    Thank you for attending. Please send us a feedback.
                  </p>
                )}
                <div>
                  <p
                    style={
                      isMobile
                        ? { fontSize: 14 }
                        : { fontSize: 12, color: 'gray', marginTop: 10 }
                    }
                  >
                    {formatDate(sessionData?.date.seconds)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {sessionData && sessionData?.time_end <= Date.now() && (
          <div className="session-status-card">
            This is past the scheduled session
          </div>
        )}

        {sessionData?.status === 2 && (
          <div className="session-status-card">
            {props.userType === 3
              ? 'You have cancelled this session'
              : 'Client cancelled the session'}
          </div>
        )}

        {sessionData?.status === 3 && (
          <div className="session-status-card">This session is done</div>
        )}

        {sessionData?.status === 4 && (
          <div
            className="session-status-card"
            style={
              props.userType !== 2 ? { display: 'none' } : { display: 'flex' }
            }
          >
            Client did not show
          </div>
        )}

        {props.userType === 2 || props.userType === 1 ? (
          <div className="toolbox-container">
            {sessionData &&
              (sessionData?.status === 1 || sessionData?.status === 0) &&
              sessionData?.time_end >= Date.now() && (
                <div
                  className="tool-container"
                  style={{
                    width: '90%',
                    paddingLeft: '5%',
                  }}
                >
                  <TextField
                    style={{ flex: 1, width: '100%' }}
                    id="outlined-helperText"
                    size="small"
                    label="Google Meet Link"
                    value={gmeetLink}
                    onChange={(e) => setGmeetLink(e.target.value)}
                    helperText="Enter your meeting link here"
                  />
                  <ClickableDiv link={sessionData?.gmeetlink as string}>
                    <div
                      className="button-19 btn-success"
                      style={{ marginBottom: 4 }}
                    >
                      <p
                        style={{
                          color: 'white',
                          fontWeight: 'bolder',
                          marginLeft: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {' '}
                        <GoogleIcon sx={{ color: 'white', marginRight: 1 }} />
                        {sessionData?.gmeetlink !== ''
                          ? 'Open Google Meet'
                          : 'Create Gmeet Link'}{' '}
                        <CircularProgress
                          sx={
                            isFetching
                              ? { marginLeft: 10, display: 'flex' }
                              : { display: 'none' }
                          }
                        />
                      </p>
                    </div>
                  </ClickableDiv>
                  <div
                    className="label"
                    style={{ fontSize: 13, marginBottom: 8, marginTop: 8 }}
                  >
                    {sessionData?.gmeetlink !== '' ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p style={{ marginRight: 10 }}>Meeting Link:</p>
                        <TextCopyButton
                          text={
                            sessionData?.gmeetlink !== ''
                              ? `${sessionData?.gmeetlink}`
                              : 'Click to generate Google meet link. This would be shared with the client'
                          }
                        />
                      </div>
                    ) : (
                      <p style={{ marginRight: 10 }}>
                        Click to generate Google meet link. This would be shared
                        with the client
                      </p>
                    )}
                  </div>
                </div>
              )}

            <div className="container toolbox">
              <div>
                <p style={{ paddingBottom: 12 }}>Tools</p>
              </div>
              <div
                className="h-stack"
                style={{ flex: 'flex', flexDirection: 'column' }}
              >
                <div className="tool-container">
                  {!showInput ? (
                    <>
                      <div
                        className="label"
                        style={{ fontSize: 13, marginBottom: 8 }}
                      >
                        Session Notes:
                      </div>
                      <textarea
                        readOnly
                        disabled
                        contentEditable={false}
                        value={sessionNotes}
                        className=""
                        style={{
                          marginBottom: 24,
                          backgroundColor: 'white',
                          padding: 10,
                          borderRadius: 10,
                          width: '90%',
                          minHeight: 200,
                        }}
                      ></textarea>
                    </>
                  ) : (
                    <>
                      <div
                        className="label"
                        style={{ fontSize: 13, marginBottom: 8 }}
                      >
                        Session Notes:
                      </div>
                      <textarea
                        className="text-input-hl"
                        value={sessionNotes}
                        onChange={handleSessionNotesChange}
                      />
                    </>
                  )}
                  <div
                    className="label"
                    style={{ fontSize: 11, marginBottom: 8 }}
                  >
                    This notes is for hopliner view only.
                  </div>
                  <div className="h-stack">
                    <div
                      className="button-19"
                      style={{ marginBottom: 4 }}
                      onClick={() => handleNotes(showInput ? 'submit' : 'show')}
                    >
                      {showInput ? 'Submit' : 'Add Session Notes'}
                    </div>
                    {showInput && (
                      <div
                        className="button-19 btn-close"
                        style={{ marginBottom: 4, marginLeft: 10 }}
                        onClick={() => handleNotes('hide')}
                      >
                        Close
                      </div>
                    )}
                  </div>
                </div>

                {sessionData?.status === 1 && (
                  <>
                    <div className="tool-container">
                      <div
                        className="label"
                        style={{ fontSize: 11, marginBottom: 8 }}
                      >
                        Select if the client did not attend the meeting
                      </div>
                      <div
                        onClick={() => {
                          handleConfirmation('noShow');
                        }}
                        className={
                          inProgress ? 'button-19' : 'button-19 btn-disabled'
                        }
                        style={{ marginBottom: 4 }}
                      >
                        Client No Show
                      </div>
                    </div>
                    <div>
                      <div
                        className="label"
                        style={{ fontSize: 11, marginBottom: 8 }}
                      >
                        Click this button to confirm a successful session. This
                        would prompt the client to answer a post session survey
                      </div>
                      <div
                        className={
                          inProgress ? 'button-19' : 'button-19 btn-disabled'
                        }
                        style={{ marginBottom: 4 }}
                        onClick={() => {
                          handleConfirmation('complete');
                        }}
                      >
                        <p
                          style={{
                            color: 'white',
                            fontWeight: 'bolder',
                            marginLeft: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {' '}
                          <CheckCircleIcon
                            sx={{ color: 'white', marginRight: 1 }}
                          />
                          Complete Session
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="tool-container"
            style={{ width: '90%', paddingLeft: '5%' }}
          >
            {sessionData &&
              (sessionData?.status === 1 || sessionData?.status === 0) &&
              sessionData?.time_end >= Date.now() && (
                <>
                  {sessionData?.gmeetlink !== '' && (
                    <ClickableDiv link={sessionData?.gmeetlink as string}>
                      <div
                        className="button-19 btn-success"
                        style={{ marginBottom: 4 }}
                      >
                        <p
                          style={{
                            color: 'white',
                            fontWeight: 'bolder',
                            marginLeft: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {' '}
                          <GoogleIcon sx={{ color: 'white', marginRight: 1 }} />
                          Open Google Meet
                        </p>
                      </div>
                    </ClickableDiv>
                  )}
                  {sessionData?.gmeetlink === '' && (
                    <>
                      <div>
                        <div
                          className="button-19 btn-disabled"
                          style={{ marginBottom: 4 }}
                        >
                          <p
                            style={{
                              color: 'white',
                              fontWeight: 'bolder',
                              marginLeft: 10,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {' '}
                            <GoogleIcon
                              sx={{ color: 'white', marginRight: 1 }}
                            />
                            Waiting for Google Meet Link
                          </p>
                        </div>
                      </div>
                      <div
                        className="label"
                        style={{ fontSize: 13, marginBottom: 8 }}
                      >
                        Google meet link will appear before your scheduled
                        session time.
                      </div>
                    </>
                  )}

                  <div>
                    <div
                      className="button-19 btn-close"
                      style={{ marginTop: 8 }}
                      onClick={() => {
                        handleConfirmation('cancel');
                      }}
                    >
                      <p
                        style={{
                          color: 'white',
                          fontWeight: 'bolder',
                          marginLeft: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {' '}
                        <CancelIcon sx={{ color: 'white', marginRight: 1 }} />
                        Cancel Booking
                      </p>
                    </div>
                  </div>
                </>
              )}
            {sessionData?.status === 3 && (
              <div>
                {isDonePSQ ? (
                  <>
                    <div className="empty-place-holder">
                      Thank you for your Feedback!
                    </div>
                  </>
                ) : (
                  <QuestionnaireComponent
                    type={'PSQ'}
                    info={userInfo}
                    sessionId={props.sessionID}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div style={{ marginLeft: '45%', marginTop: 24 }}>
            <p>Loading</p>
          </div>
        ) : (
          <div className="container">
            {props.userType !== 2 && (
              <>
                {!isDoneDSM && !isDoneGAD && !isDonePHQ && (
                  <div className="session-message">
                    Thanks for booking a session and please accomplish these 3
                    assessments ahead of your schedule session so your Hopeliner
                    can understand you better. All of these will take just 10
                    minutes total.
                  </div>
                )}
              </>
            )}
            <div className="result-section">
              <div className="result-card-header">PHQ-9</div>
              {isDonePHQ ? (
                <div className="result-card">
                  <div className="result-title-container">
                    <div>
                      <p className="label-m">Results</p>
                      <p
                        style={{
                          marginTop: 0,
                          marginBottom: 8,
                          fontWeight: 'bolder',
                        }}
                      >
                        {severityPHQ}
                      </p>
                    </div>
                    <div>
                      <div className="score-circle">
                        {dataPHQ?.respondent_score}
                      </div>
                      <p className="label-m">Score</p>
                    </div>
                  </div>

                  {props.userType === 2 && (
                    <>
                      <div style={{ marginTop: 8 }}>
                        <p>{resultPHQ}</p>
                      </div>
                      {showPHQ ? (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            marginTop: 24,
                          }}
                        >
                          <Button onClick={() => setShowPHQ(false)}>
                            Hide Answers
                          </Button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: 24,
                          }}
                        >
                          <Button onClick={() => setShowPHQ(true)}>
                            View Answers
                          </Button>
                        </div>
                      )}

                      {showPHQ && (
                        <>
                          {dataPHQ.respondent_answers.map(
                            (i: any, index: number) => {
                              return (
                                <div
                                  key={questionPHQ[index]?.question}
                                  className="questions-li"
                                >
                                  <p
                                    className="label-m"
                                    style={{ width: '80%' }}
                                  >
                                    {questionPHQ[index]?.question}
                                  </p>
                                  <p>{i}</p>
                                </div>
                              );
                            },
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <>
                  {props.userType === 2 ? (
                    <div
                      style={
                        isMobile
                          ? { fontSize: 14 }
                          : { fontSize: 12, color: 'gray', marginTop: 10 }
                      }
                    >
                      Client has not answered yet
                    </div>
                  ) : (
                    <QuestionnaireComponent
                      type={'PHQ-9'}
                      info={userInfo}
                      sessionId={props.sessionID}
                    />
                  )}
                </>
              )}
            </div>
            <div className="result-section">
              <div className="result-card-header">GAD-7</div>
              {isDoneGAD ? (
                <div className="result-card">
                  <div className="result-title-container">
                    <div>
                      <p className="label-m">Results</p>
                      <p
                        style={{
                          marginTop: 0,
                          marginBottom: 8,
                          fontWeight: 'bolder',
                        }}
                      >
                        {severityGAD}
                      </p>
                    </div>
                    <div>
                      <div className="score-circle">
                        {dataGAD?.respondent_score}
                      </div>
                      <p className="label-m">Score</p>
                    </div>
                  </div>

                  {props.userType === 2 && (
                    <>
                      <div style={{ marginTop: 8 }}>
                        <p>{resultGAD}</p>
                      </div>
                      {showGAD ? (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            marginTop: 24,
                          }}
                        >
                          <Button onClick={() => setShowGAD(false)}>
                            Hide Answers
                          </Button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: 24,
                          }}
                        >
                          <Button onClick={() => setShowGAD(true)}>
                            View Answers
                          </Button>
                        </div>
                      )}

                      {showGAD && (
                        <>
                          {dataGAD.respondent_answers.map(
                            (i: any, index: number) => {
                              return (
                                <div
                                  key={questionGAD[index]?.question}
                                  className="questions-li"
                                >
                                  <p
                                    className="label-m"
                                    style={{ width: '80%' }}
                                  >
                                    {questionGAD[index]?.question}
                                  </p>
                                  <p>{i}</p>
                                </div>
                              );
                            },
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <>
                  {props.userType === 2 ? (
                    <div
                      style={
                        isMobile
                          ? { fontSize: 14 }
                          : { fontSize: 12, color: 'gray', marginTop: 10 }
                      }
                    >
                      Client has not answered yet.
                    </div>
                  ) : (
                    <QuestionnaireComponent
                      type={'GAD-7'}
                      info={userInfo}
                      sessionId={props.sessionID}
                    />
                  )}
                </>
              )}
            </div>
            <div className="result-section">
              <div className="result-card-header">DSM-5</div>
              {isDoneDSM ? (
                <section className="result-card">
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
                  {props.userType === 2 && (
                    <>
                      {showDSM ? (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            marginTop: 24,
                          }}
                        >
                          <Button onClick={() => setShowDSM(false)}>
                            Hide Answers
                          </Button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: 24,
                          }}
                        >
                          <Button onClick={() => setShowDSM(true)}>
                            View Answers
                          </Button>
                        </div>
                      )}
                      {showDSM && (
                        <>
                          {dataDSM.respondent_answers.map(
                            (i: any, index: number) => {
                              return (
                                <div className="questions-li">
                                  <p className="label-m">{index + 1}.</p>
                                  <p
                                    className="label-m"
                                    style={{ width: '80%' }}
                                  >
                                    {questionDSM[index]?.question}
                                  </p>
                                  <p>{i}</p>
                                </div>
                              );
                            },
                          )}
                        </>
                      )}
                    </>
                  )}
                </section>
              ) : (
                <>
                  {props.userType === 2 ? (
                    <div
                      style={
                        isMobile
                          ? { fontSize: 14 }
                          : { fontSize: 12, color: 'gray', marginTop: 10 }
                      }
                    >
                      Client has not answered yet.
                    </div>
                  ) : (
                    <QuestionnaireComponent
                      type={'DSM-5'}
                      info={userInfo}
                      sessionId={props.sessionID}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {props.userType === 2 && (
          <section>
            <SearchQuestionnaire info={undefined} type={'PSQ'} />
            <GetAssessments
              user_id={sessionData?.user_id as string}
              session_id={props.sessionID}
            />
          </section>
        )}
      </div>
    </div>
  );
}
export default SessionPage;

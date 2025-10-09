/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
// import { useMediaQuery } from 'react-responsive'
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebaseConfig";

import "../../questionnaire/questionnaire.css";
import {
  DocumentData,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  QuestionnaireProps,
  SessionProps,
} from "../../../constants/types/interfaceProps";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
} from "@mui/material";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { blue } from "@mui/material/colors";
import Enum from "../../../constants/Enum";
import QuestionnaireComponent from "../../questionnaire/questionnaire";

function SearchQuestionnaire(props: {
  info: any;
  sessionId?: string | null | undefined;
  type: string;
}) {
  const { info, type } = props;
  const isMobile = false;

  const [isDonePHQ, setDonePHQ] = React.useState<boolean>(true);
  const [isDoneGAD, setDoneGAD] = React.useState<boolean>(true);
  const [isDoneDSM, setDoneDSM] = React.useState<boolean>(true);
  const [isDonePSQ, setDonePSQ] = React.useState<boolean>(false);
  const [sessionID, setSessionID] = React.useState("");

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

  const [isLoading, setLoading] = React.useState<boolean>(true);

  const getQuestionsInAscendingOrder = async (type: any) => {
    const q = query(
      collection(FIRESTORE_DB, "Questions"),
      where("type", "==", type)
    );

    try {
      const querySnapshot = await getDocs(q);
      const questions: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        questions.push(doc.data());
      });

      const sortedQuestions = questions.sort((a, b) => a.id - b.id);
      // console.log('Questions in ascending order:', sortedQuestions);
      if (type === "PHQ-9") {
        setQuestionPHQ(sortedQuestions);
        return sortedQuestions;
      }
      if (type === "GAD-7") {
        setQuestionGAD(sortedQuestions);
        return sortedQuestions;
      }
      if (type === "DSM-5") {
        setQuestionDSM(sortedQuestions);
        return sortedQuestions;
      }
    } catch (error) {
      console.error("Error getting documents:", error);
      return [];
    }
  };

  const checkQuestionnaire = async (data: any) => {
    const bookingsRef = collection(FIRESTORE_DB, "Questionnaire");

    const types = ["PHQ-9", "GAD-7", "DSM-5"];

    const querySnapshot = await getDocs(
      query(
        bookingsRef,
        where("respondent_id", "==", data.user_id),
        where("type", "in", types),
        where("status", "==", 1)
      )
    );

    console.log(querySnapshot, "Dev querySnapshot");

    const querySurvey = await getDocs(
      query(
        bookingsRef,
        where("respondent_id", "==", data.user_id),
        where("session_id", "==", data.sessionID),
        where("type", "==", "PSQ")
      )
    );

    const documents = await querySnapshot.docs.map((doc) => doc.data());
    const documentsWID = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));
    // console.log(documents, "DOCU")

    console.log(documents, "Dev documents");
    console.log(documentsWID, "Dev documentsWID");

    const survey = await querySurvey.docs.map((doc) => doc.data());
    // console.log(survey, "Survey")

    const PSQ = await survey.filter((doc) => doc.type === "PSQ");
    const PHQ = await documents.filter((doc) => doc.type === "PHQ-9");
    const GAD = await documents.filter((doc) => doc.type === "GAD-7");
    const DSM = await documents.filter((doc) => doc.type === "DSM-5");

    const PHQID = await documentsWID.filter((doc) => doc.data.type === "PHQ-9");
    const GADID = await documentsWID.filter((doc) => doc.data.type === "GAD-7");
    const DSMID = await documentsWID.filter((doc) => doc.data.type === "DSM-5");

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
        const docRef = doc(FIRESTORE_DB, "Questionnaire", PHQID[0].id);
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
        const docRef = doc(FIRESTORE_DB, "Questionnaire", GADID[0].id);
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
        const docRef = doc(FIRESTORE_DB, "Questionnaire", DSMID[0].id);
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
    } else if (PSQ.length != 0) {
      setDonePSQ(true);
    } else {
      setLoading(false);
    }
  };

  const PHQ_scoring = (score: number) => {
    if (score >= 0 && score <= 4) {
      setSeverityPHQ("Minimal depression or none");
      setResultPHQ("Monitor; may not require treatment");
    }
    if (score >= 5 && score <= 9) {
      setSeverityPHQ("Mild depression");
      setResultPHQ("Watchful waiting; repeat PHQ-9 at follow-up");
    }
    if (score >= 10 && score <= 14) {
      setSeverityPHQ("Moderate depression");
      setResultPHQ(
        "Treatment Plan, considering counseling, follow-up and/or pharmacotherapy"
      );
    }
    if (score >= 15 && score <= 19) {
      setSeverityPHQ("Moderately severe depression");
      setResultPHQ(
        "Active Treatment with pharmacotherapy and/or psychotherapy"
      );
    }
    if (score >= 20 && score <= 27) {
      setSeverityPHQ("Severe depression");
      setResultPHQ(
        "Immediate initiation of pharmacotherapyand, if severe impairement or poor response to therapy, expeditaed referral to a mental health specialist for psychotherapy and/or collaborative management"
      );
    }

    if (Number.isNaN(score)) {
      setSeverityPHQ("Minimal depression or none");
      // setResultStatus("Monitor; may not require treatment");
    }
  };

  const GAD_scoring = (score: number) => {
    if (score <= 4) {
      setSeverityGAD("No anxiety disorder");
      setResultGAD("");
    }
    if (score >= 5 && score <= 9) {
      setSeverityGAD("Mild anxiety disorder.");
      setResultGAD(
        "Provide general feedback, repeat GAD-7 at follow-up, consider adjusting treatment plan if not improving in last 4 weeks"
      );
    }
    if (score >= 10 && score <= 14) {
      setSeverityGAD("Moderate anxiety disorder.");
      setResultGAD(
        "Further evaluation recomended; For active treatment plans consider adjustment; For text therapy clients monitor for synchronous therapy"
      );
    }
    if (score >= 15) {
      setSeverityGAD("Severe anxiety disorder.");
      setResultGAD(
        "Adjust treatment plan; focused assessment of safety plan and pharmacotherapy evaluation/re-evaluation; if emergent need then consider referral to higher level of care; Client is not a good candidate for text therapy/asyynchronous"
      );
    }
    if (Number.isNaN(score)) {
      setSeverityGAD("No anxiety disorder");
      setResultGAD("");
    }
  };

  const getSeverity = (level: number) => {
    switch (level) {
      case 0:
        return "None";
      case 1:
        return "Slight";
      case 2:
        return "Mild";
      case 3:
        return "Moderate";
      case 4:
        return "Severe";
      default:
        return "Unknown";
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

  const [text, setText] = React.useState("");

  const handleChange = (event: any) => {
    setText(event.target.value);
  };

  React.useEffect(() => {
    getQuestionsInAscendingOrder("PHQ-9");
    getQuestionsInAscendingOrder("GAD-7");
    getQuestionsInAscendingOrder("DSM-5");
  }, []);

  return (
    <div>
      <p>Search Questionnaire:</p>
      <div>
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Enter text..."
        />

        <button
          onClick={() => checkQuestionnaire({ user_id: text, sessionID: "" })}
        >
          click me: {text}
        </button>
      </div>

      {text ? (
        <div style={{ marginTop: 48 }}>
          <div className="container">
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
                          fontWeight: "bolder",
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

                  {true && (
                    <>
                      <div style={{ marginTop: 8 }}>
                        <p>{resultPHQ}</p>
                      </div>
                      {showPHQ ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
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
                            display: "flex",
                            justifyContent: "flex-end",
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
                                <div className="questions-li">
                                  <p
                                    className="label-m"
                                    style={{ width: "80%" }}
                                  >
                                    {questionPHQ[index]?.question}
                                  </p>
                                  <p>{i}</p>
                                </div>
                              );
                            }
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <>
                  {true ? (
                    <div
                      style={
                        isMobile
                          ? { fontSize: 14 }
                          : { fontSize: 12, color: "gray", marginTop: 10 }
                      }
                    >
                      Client has not answered yet
                    </div>
                  ) : (
                    <QuestionnaireComponent
                      type={"PHQ-9"}
                      info={{ uid: "123" }}
                      sessionId={sessionID}
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
                          fontWeight: "bolder",
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

                  {true && (
                    <>
                      <div style={{ marginTop: 8 }}>
                        <p>{resultGAD}</p>
                      </div>
                      {showGAD ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
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
                            display: "flex",
                            justifyContent: "flex-end",
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
                                <div className="questions-li">
                                  <p
                                    className="label-m"
                                    style={{ width: "80%" }}
                                  >
                                    {questionGAD[index]?.question}
                                  </p>
                                  <p>{i}</p>
                                </div>
                              );
                            }
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <>
                  {true ? (
                    <div
                      style={
                        isMobile
                          ? { fontSize: 14 }
                          : { fontSize: 12, color: "gray", marginTop: 10 }
                      }
                    >
                      Client has not answered yet.
                    </div>
                  ) : (
                    <QuestionnaireComponent
                      type={"GAD-7"}
                      info={{ uid: "123" }}
                      sessionId={sessionID}
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
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          <p>
                            {`${Domain_Name[index]} `}
                            <span
                              style={{ fontWeight: "700", fontSize: 13 }}
                            >{` ${i} (${getSeverity(i)})`}</span>
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <></>
                  )}
                  {true && (
                    <>
                      {showDSM ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
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
                            display: "flex",
                            justifyContent: "flex-end",
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
                                    style={{ width: "80%" }}
                                  >
                                    {questionDSM[index]?.question}
                                  </p>
                                  <p>{i}</p>
                                </div>
                              );
                            }
                          )}
                        </>
                      )}
                    </>
                  )}
                </section>
              ) : (
                <>
                  {true ? (
                    <div
                      style={
                        isMobile
                          ? { fontSize: 14 }
                          : { fontSize: 12, color: "gray", marginTop: 10 }
                      }
                    >
                      Client has not answered yet.
                    </div>
                  ) : (
                    <QuestionnaireComponent
                      type={"DSM-5"}
                      info={{ uid: "123" }}
                      sessionId={sessionID}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
export default SearchQuestionnaire;

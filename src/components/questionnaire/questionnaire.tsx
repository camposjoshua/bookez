/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
// import { useMediaQuery } from 'react-responsive'
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../firebaseConfig";

import "./questionnaire.css";
import {
  DocumentData,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  QuestionnaireProps,
  SessionProps,
} from "../../constants/types/interfaceProps";
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

function QuestionnaireComponent(props: {
  info: any;
  sessionId?: string | null | undefined;
  type: string;
}) {
  //   const isDesktopOrLaptop = useMediaQuery({
  //     query: '(min-width: 1224px)'
  //   })
  //   const isBigScreen = useMediaQuery({ query: '(min-width: 1824px)' })
  //   const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
  //   const isPortrait = useMediaQuery({ query: '(orientation: portrait)' })
  //   const isRetina = useMediaQuery({ query: '(min-resolution: 2dppx)' })
  const { info, type } = props;

  const [showResult, setShowResult] = useState<boolean>(false);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [resultStatus, setResultStatus] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [questions, setQuestions] = useState<any>([]);
  const [questionType, setQuestionType] = useState<string>(type);
  const [respondentScore, setRespondentScore] = useState<number | null>(null);
  const [severityDSM, setSeverityDSM] = useState<any>([]);

  const getQuestionsInAscendingOrder = async () => {
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
      setQuestions(sortedQuestions);
    } catch (error) {
      console.error("Error getting documents:", error);
    }
  };

  function addTwoWeeks(dateInMillis: any) {
    // Convert milliseconds to date object
    const date = new Date(dateInMillis);
    // Add 2 weeks (14 days) to the date
    date.setDate(date.getDate() + 14);
    // Set hours, minutes, seconds, and milliseconds to midnight
    date.setHours(0, 0, 0, 0);
    // Return the new date in milliseconds
    return date.getTime();
  }

  const submitQuestionnaire = async (
    totalScore: number,
    respondent_answers: any[]
  ) => {
    const payload: QuestionnaireProps = {
      respondent_answers: respondent_answers,
      hopeliner_id: "",
      respondent_id: info?.uid,
      respondent_score: totalScore,
      session_id: props.sessionId as string,
      date_created: new Date().getTime(),
      valid_until: addTwoWeeks(new Date().getTime()),
      type: type,
      status: 1,
    };

    try {
      const docRef = await addDoc(
        collection(FIRESTORE_DB, "Questionnaire"),
        payload
      );
      // console.log('Document added with ID:', docRef.id);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState(new Array(questions.length).fill(0));
  const [storedAnswer, saveAnswer] = useState(
    new Array(questions.length).fill(0)
  );

  const handleAnswer = (choiceIndex: number) => {
    // console.log(currentQuestionIndex, "<", questions.length)
    const newScores = [...scores];
    const storeAnswer = [...storedAnswer];
    if (choiceIndex || choiceIndex === 0) {
      // console.log(choiceIndex, "chhoice")
      newScores[currentQuestionIndex] = choiceIndex;
      storeAnswer[currentQuestionIndex] = choiceIndex;
    }
    // console.log("Q",currentQuestionIndex , "A:", choiceIndex)
    setScores(newScores);
    saveAnswer(storeAnswer);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz is finished, calculate total score
      setShowQuiz(false);
      setShowResult(true);
      // console.log(storedAnswer, "stored Answer")
      // console.log(newScores, "newScores")

      const totalScore = newScores.reduce((acc, score) => acc + score, 0);
      handleResult(totalScore, questionType, newScores);
      setRespondentScore(totalScore);
      // console.log('Total score:', totalScore);

      // Submit to FireBase
      submitQuestionnaire(totalScore, newScores);
    }
  };

  const handleResult = (score: number, type: string, answerArr: any) => {
    if (type === "PHQ-9") {
      PHQ_scoring(score);
    }
    if (type === "GAD-7") {
      GAD_scoring(score);
    }
    if (type === "DSM-5") {
      DSM_scoring(answerArr);
    }
  };

  const PHQ_scoring = (score: number) => {
    if (score >= 0 && score <= 4) {
      setSeverity("Minimal depression or none");
      setResultStatus("Monitor; may not require treatment");
    }
    if (score >= 5 && score <= 9) {
      setSeverity("Mild depression");
      setResultStatus(
        "Use clinical judgment (symptom duration, functional impairment) to determine necessity of treatment"
      );
    }
    if (score >= 10 && score <= 14) {
      setSeverity("Moderate depression");
      setResultStatus(
        "Use clinical judgment (symptom duration, functional impairment) to determine necessity of treatment"
      );
    }
    if (score >= 15 && score <= 19) {
      setSeverity("Moderately severe depression");
      setResultStatus(
        "Warrants active treatment with psychotherapy, medications, or combination"
      );
    }
    if (score >= 20 && score <= 27) {
      setSeverity("Severe depression");
      setResultStatus(
        "Warrants active treatment with psychotherapy, medications, or combination"
      );
    }

    if (Number.isNaN(score)) {
      setSeverity("Minimal depression or none");
      setResultStatus("Monitor; may not require treatment");
    }
  };

  const GAD_scoring = (score: number) => {
    if (score <= 4) {
      setSeverity("No anxiety disorder");
      setResultStatus("");
    }
    if (score >= 5 && score <= 9) {
      setSeverity("Mild anxiety disorder.");
      setResultStatus("Monitor; may not require treatment");
    }
    if (score >= 10 && score <= 14) {
      setSeverity("Moderate anxiety disorder.");
      setResultStatus("Monitor; may not require treatment");
    }
    if (score >= 15) {
      setSeverity("Severe anxiety disorder.");
      setResultStatus("");
    }
    if (Number.isNaN(score)) {
      setSeverity("No anxiety disorder");
      setResultStatus("");
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

  const Domain_Name = [
    "I. Depression:",
    "II. Anger:",
    "III. Mania:",
    "IV. Anxiety:",
    "V. Somatic Symptoms:",
    "VI. Suicidal Ideation:",
    "VII. Psychosis:",
    "VIII. Sleep Problems:",
    "IX. Memory:",
    "X. Repetitive Thoughts and Behaviors:",
    "XI. Dissociation:",
    "XII. Personality Functionin:",
    "XIII. Substance Use:",
  ];

  const DSM_scoring = async (Arr: any) => {
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

  const addQuestionToCollection = async () => {
    const newQuestion = {
      id: 23,
      type: "DSM-5",
      question: `Using any of the following medicines ON YOUR OWN, that is, without a
			doctor’s prescription, in greater amounts or longer than prescribed [e.g.,
			painkillers (like Vicodin), stimulants (like Ritalin or Adderall), sedatives or
			tranquilizers (like sleeping pills or Valium), or drugs like marijuana, cocaine
			or crack, club drugs (like ecstasy), hallucinogens (like LSD), heroin,
			inhalants or solvents (like glue), or methamphetamine (like speed)]?`,
      choices: [
        "Not at all",
        "Rare, less than a day or two",
        "Several Days",
        "More than half the days",
        "Nearly every day",
      ],
    };

    try {
      const docRef = await addDoc(
        collection(FIRESTORE_DB, "Questions"),
        newQuestion
      );
      // console.log('Document added with ID:', docRef.id);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

  React.useEffect(() => {
    getQuestionsInAscendingOrder();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "scroll",
      }}
    >
      {/* <button onClick={() => addQuestionToCollection()}> Add Question Set</button> */}
      <div>
        {!showQuiz && !showResult && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="button-19" onClick={() => setShowQuiz(true)}>
              {type === "PSQ" ? "Submit Feedback" : "Answer Questionnaire"}
            </div>
            {/* <button title='Start Quiz' onClick={() => setShowQuiz(true)}>Start Quiz</button> */}
          </div>
        )}

        {showQuiz && (
          <div
            style={{
              backgroundColor: "white",
              paddingRight: 10,
              paddingLeft: 10,
              paddingTop: 10,
              paddingBottom: 10,
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <h3 style={{ marginTop: 6, marginBottom: 6 }}>
                Question {currentQuestionIndex + 1}
              </h3>
              <p style={{ marginLeft: 10 }}>{`(${type})`}</p>
            </div>
            <p style={{ marginBottom: 16 }}>
              {questions[currentQuestionIndex].question}
            </p>
            <div>
              {questions[currentQuestionIndex].choices.map(
                (choice: any, index: number) => (
                  <div key={index} style={{ marginTop: 10, marginBottom: 10 }}>
                    <Button
                      size="small"
                      onClick={() => handleAnswer(index)}
                      variant="outlined"
                    >
                      {choice}
                    </Button>
                    {/* <button  onClick={() => handleAnswer(index)}></button> */}
                  </div>
                )
              )}
            </div>
          </div>
        )}
        {showResult && (
          <div
            style={{
              backgroundColor: "white",
              paddingRight: 10,
              paddingLeft: 10,
              paddingTop: 10,
              paddingBottom: 10,
              borderRadius: 10,
            }}
          >
            <h1 style={{ fontSize: 20 }}>{questionType} Finished!</h1>
            {questionType !== "DSM-5" && (
              <p>
                Total score: {scores.reduce((acc, score) => acc + score, 0)}
              </p>
            )}
            <div style={{ marginTop: 24 }}>
              {questionType === "DSM-5" ? (
                <>
                  {severityDSM.map((i: any, index: number) => {
                    return (
                      <div style={{ display: "flex", marginBottom: 8 }}>
                        <p>
                          {`${Domain_Name[index]} `}
                          <span
                            style={{ fontWeight: "700", fontSize: 13 }}
                          >{` ${i} (${getSeverity(i)})`}</span>
                        </p>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p style={{ fontWeight: "700", marginBottom: 6 }}>{severity}</p>
              )}
              {/* <p style={{fontSize: 13}}>{resultStatus}</p> */}
            </div>
          </div>
        )}

        {/* <button onClick={() => addQuestionToCollection()}> Add Question Set</button> */}
      </div>
    </div>
  );
}
export default QuestionnaireComponent;

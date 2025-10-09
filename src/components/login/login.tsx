import React, { useState } from "react";
import "./login.css";
// import { useMediaQuery } from 'react-responsive'
import {
  FIRESTORE_DB,
  FIREBASE_AUTH,
  FIREBASE_ENV,
} from "../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { addDoc, collection } from "@firebase/firestore";
import Button from "@mui/material/Button";
import GoogleIcon from "@mui/icons-material/Google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Box, Divider, InputAdornment, TextField } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import AccountBoxIcon from "@mui/icons-material/AccountBox";

function Login(props: {
  handleUser?: any;
  handleCode?: any;
  handleTokens?: any;
  isAdmin?: boolean;
}) {
  const navigate = useNavigate();
  const { handleUser } = props;
  const { handleCode } = props;
  const { handleTokens } = props;

  const logo = require("../../assets/SL-logo.png");
  const auth = FIREBASE_AUTH;
  const [isLoading, setLoading] = useState(false);
  const [isAuth, setAuth] = useState(false);

  const [userData, setUserData] = useState<any>([]);
  const [codeData, setCodeData] = useState<any>([]);
  const [tokenData, setTokenData] = useState<any>([]);
  const [isVerified, setVerified] = useState<any>(undefined);
  //PHASE 2
  const [emailVerified, setEmailVerified] = useState<any>(undefined);
  const [isLoggedIn, setLoggedIn] = useState<any>(false);
  const [showRegister, setRegister] = useState<any>(false);
  const [isHopeLiner, setIsHopeLiner] = useState<any>(false);
  const [showRegErr, setRegErr] = useState<any>("");
  const [showInputKeyField, setShowInputKey] = useState<any>(false);
  const [accessCode, setAccessCode] = useState<any>("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [emailErr, setEmailErr] = useState(false);
  const [firstNameErr, setFirstNameErr] = useState(false);
  const [lastNameErr, setLastNameErr] = useState(false);
  const [passwordErr, setPasswordErr] = useState(false);
  const [password2Err, setPassword2Err] = useState(false);

  const handleEmailChange = (event: any) => {
    setEmail(event.target.value);
    setEmailErr(false);
    // console.log(event.target.value)
  };

  const handleFirstNameChange = (event: any) => {
    setFirstName(event.target.value);
    setFirstNameErr(false);
  };

  const handleLastNameChange = (event: any) => {
    setLastName(event.target.value);
    setLastNameErr(false);
  };

  const handlePasswordChange = (event: any) => {
    setPassword(event.target.value);
    setPasswordErr(false);
    setPassword2Err(false);
  };

  const handlePassword2Change = (event: any) => {
    setPassword2(event.target.value);
    setPassword2Err(false);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const validateAccount = async (
    email: any,
    id: any,
    name: any,
    pic: any,
    given_name: any,
    family_name: any,
    code: any,
    token: any
  ) => {
    // signup the account
    try {
      const response: any = await createUserWithEmailAndPassword(
        auth,
        email,
        id
      );
      // console.log(response, "Response")
      const generate = await generateStreamToken(
        response.user.uid,
        email,
        name,
        pic,
        given_name,
        family_name
      );
      setUserData(response.user);
      // handleUser(response.user)
    } catch (error) {
      // console.log(error)
      // login the account if the email exists in db
      if (
        error == "FirebaseError: Firebase: Error (auth/email-already-in-use)."
      ) {
        handleLogin(email, id, code, token);
        // setLoading(false)
        // setLoading(false)
      }
    } finally {
      // setLoading(false)
      // setLoading(false)
    }
  };

  const registerAccount = async (
    email: any,
    password: any,
    given_name: any,
    family_name: any
  ) => {
    try {
      const response: any = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // .then(
      // 	async (userCred) => {
      // 		const user = userCred.user;

      // 		await sendEmailVerification(user)
      // 		console.log("success")
      // 		return userCred
      // 	}
      // )

      const generate = await generateStreamToken(
        response.user.uid,
        email,
        given_name + " " + family_name,
        "https://firebasestorage.googleapis.com/v0/b/silverlining-ec543.appspot.com/o/default-dp.png?alt=media&token=70c13b77-cf78-4e2b-a73a-33d7ebe5ac50",
        given_name,
        family_name
      );
      setUserData(response.user);
      generateTokenID(family_name, given_name, email, response.user);
      // handleUser(response.user)
    } catch (error) {
      // console.log(error)
      // login the account if the email exists in db
      setLoading(false);
      if (
        error ==
        "FirebaseError: Firebase: Password should be at least 6 characters (auth/weak-password)."
      ) {
        setLoading(false);
        setPasswordErr(true);
        setRegErr("Password should be at least 6 characters");
        // console.log("Password should be at least 6 characters")
      }
      if (
        error == "FirebaseError: Firebase: Error (auth/email-already-in-use)."
      ) {
        setLoading(false);
        setEmailErr(true);
        setRegErr("Email already in use");
        // console.log("email already in use")
      }
    } finally {
      // setLoading(false)
      // setLoading(false)
    }
  };

  // old code for google login.
  const handleLogin = async (email: any, id: any, code: any, token: any) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, id);
      // handleUser(response.user)
      setUserData(response.user);
      loadUserData(response.user, code, token, email);
    } catch (error: any) {
      // console.log(error)
      alert("Sign In Failed" + error.message);
    } finally {
      // setLoading(false)
      // setLoading(false)
      setAuth(true);
    }
  };

  const handleClientLogin = async (email: any, password: any) => {
    setLoading(true);
    console.log("from APP v0.1.0", FIREBASE_ENV);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      // handleUser(response.user)

      // if (response.user.emailVerified != true){
      // 	console.log("not yet verified")
      // 	setEmailVerified(false)
      // }else{
      // 	setEmailVerified(true)
      // 	console.log("email verified")
      // }

      setUserData(response.user);
      // loadUserData(response.user, code, token, email)
      loadClientData(response.user, email);
    } catch (error: any) {
      // console.log(error)
      alert("Sign In Failed" + error.message);
      console.log("Error", error);
      setLoading(false);
    } finally {
      // setLoading(false)
      // setLoading(false)
      setAuth(true);
    }
  };

  const checkMasterList = async (
    email: any,
    password: any,
    given_name: any,
    family_name: any
  ) => {
    setLoading(true);
    if (password === password2) {
      try {
        // Create a query to filter documents based on the user_id field
        const q1 = query(
          collection(FIRESTORE_DB, "Client"),
          where("email", "==", email)
        );

        // Get the documents that match the query
        const emailSnapshot = await getDocs(q1);
        // Check if any documents were found
        if (!emailSnapshot.empty) {
          // If documents were found, return the first one (assuming user_id is unique)
          const creds = emailSnapshot.docs[0].data();
          //   console.log('CREDS:',creds)
          if (creds.email == email) {
            registerAccount(email, password, given_name, family_name);
            setCodeData("clientlogin");
          }
          return emailSnapshot.docs[0].data();
        } else {
          // If no documents were found, return null or handle the case accordingly
          setVerified(false);
          setLoggedIn(true);
          setLoading(false);
          return null;
        }
      } catch (error) {
        console.error("Error retrieving user document:", error);
        setLoading(false);
        return null;
      }
    } else {
      // console.log('password does not match')
      setRegErr("Password does not match");
      setPassword2Err(true);
      setLoading(false);
    }
  };

  const loadClientData = async (user: any, email: any) => {
    try {
      // Create a query to filter documents based on the user_id field
      const q = query(
        collection(FIRESTORE_DB, "User"),
        where("user_id", "==", user.uid)
      );

      // Get the documents that match the query
      const querySnapshot = await getDocs(q);
      // Check if any documents were found
      if (!querySnapshot.empty) {
        // If documents were found, return the first one (assuming user_id is unique)
        // console.log(querySnapshot.docs[0].data());
        const creds: any = querySnapshot.docs[0].data();
        generateTokenID(creds.lname, creds.fname, creds.email, user);
        return querySnapshot.docs[0].data();
      } else {
        // If no documents were found, return null or handle the case accordingly
        setVerified(false);
        setLoggedIn(true);
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error("Error retrieving user document:", error);
      setLoading(false);
      return null;
    }
  };

  // old function. used for google login
  const loadUserData = async (user: any, code: any, token: any, email: any) => {
    try {
      // Create a query to filter documents based on the user_id field
      const q1 = query(
        collection(FIRESTORE_DB, "Client"),
        where("email", "==", email)
      );

      // Get the documents that match the query
      const emailSnapshot = await getDocs(q1);
      // Check if any documents were found
      if (!emailSnapshot.empty) {
        // If documents were found, return the first one (assuming user_id is unique)
        checkVerification(
          emailSnapshot.docs[0].data(),
          user,
          code,
          token,
          email
        );
        return emailSnapshot.docs[0].data();
      } else {
        // If no documents were found, return null or handle the case accordingly
        setVerified(false);
        setLoggedIn(true);
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error("Error retrieving user document:", error);
      return null;
    }
  };

  React.useEffect(() => {
    // console.log('token',tokenData)
  }, [tokenData]);
  React.useEffect(() => {
    // console.log('code',codeData)
  }, [codeData]);
  React.useEffect(() => {
    // console.log('user',userData)
  }, [userData]);

  const checkVerification = (
    data: any,
    user: any,
    code: any,
    token: any,
    email: any
  ) => {
    if (!data.email === email) {
      setVerified(false);
      setLoggedIn(true);
      setLoading(false);
      // console.log("USER not VERIFIED")
    } else if (data.email === email) {
      // console.log('code,token,user',code, token, user)
      handleCode(code);
      handleTokens(token);
      handleUser(user);
      setLoading(false);
      navigate("/");
      // console.log("USER VERIFIED")
    }
  };

  const generateStreamToken = async (
    uid: string,
    email: any,
    name: any,
    pic: any,
    given_name: any,
    family_name: any
  ) => {
    try {
      const doc = await addDoc(collection(FIRESTORE_DB, "User"), {
        email: email,
        token: uid,
        user_id: uid,
        name: name,
        dateCreated: new Date(),
        user_type: 3,
        img: pic,
        fname: given_name,
        lname: family_name,
        is_verified: false,
      });

      setVerified(false);
      setLoggedIn(true);
      return true;
    } catch (error) {
      // console.log(error)
    }
  };

  //
  const generateTokenID = (fname: any, g_name: any, email: any, user: any) => {
    const creds = {
      picture:
        "https://firebasestorage.googleapis.com/v0/b/silverlining-ec543.appspot.com/o/default-dp.png?alt=media&token=70c13b77-cf78-4e2b-a73a-33d7ebe5ac50",
      family_name: fname,
      given_name: g_name,
      email: email,
      name: g_name + " " + fname,
    };
    const secret = "SECRETJWT"; // Replace this with your actual secret key
    const encodedPayload = btoa(JSON.stringify(creds)); // Encode payload as Base64
    const encodedHeader = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })); // Encode header as Base64
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`); // Create signature (insecure example)
    const jwtToken = `${encodedHeader}.${encodedPayload}.${signature}`; // Combine header, payload, and signature
    setTokenData({ id_token: jwtToken, type: "client" });
    handleCode("client-login");
    handleTokens({ id_token: jwtToken, type: "client" });
    handleUser(user);
    setLoading(false);
  };

  // const verifyAccess = (code: any) => {
  // 	if(code == 'Access123!'){
  // 		handleCode(codeData);
  // 		handleTokens(tokenData);
  // 		handleUser(userData)
  // 	} else {
  // 		setWrong(true)
  // 	}
  // }

  React.useEffect(() => {
    setLoggedIn(false);
    setCodeData([]);
    setTokenData([]);
    setUserData([]);
  }, []);

  React.useEffect(() => {
    // auth.onAuthStateChanged((userCred => {
    // }))
  });

  return (
    <>
      {!isLoggedIn && !props.isAdmin && (
        <div className="login-container">
          <div className="login-component">
            <img
              className="login-logo"
              src={logo}
              style={showRegister ? { display: "none" } : { display: "flex" }}
              alt="Silver Lining Hopeline"
            />

            {!isHopeLiner && !showRegister && !showInputKeyField && (
              <div>
                <div
                  style={{ marginBottom: 12 }}
                  className={
                    emailErr ? "input-variant-1 input-error" : "input-variant-1"
                  }
                >
                  <EmailIcon sx={{ color: "grey", height: 20 }} />
                  <input
                    type="email"
                    id="email"
                    placeholder="Registered email"
                    style={{ outline: "none", border: "none", width: "100%" }}
                    onSelect={() => console.log("selected")}
                    value={email}
                    onChange={handleEmailChange}
                    required
                  />
                </div>

                <div style={{ marginBottom: 24 }} className="input-variant-1">
                  <LockIcon sx={{ color: "grey", height: 20 }} />
                  <input
                    type="password"
                    id="password"
                    placeholder="Password"
                    style={{ outline: "none", border: "none" }}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: 24,
                    alignItems: "center",
                  }}
                >
                  <p className="small-text">
                    By Signing in you agree to Silver Lining
                  </p>
                  <a
                    className="link"
                    href="http://silverlininghopeline.com/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </div>

                {isLoading ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div className="loader"></div>
                    <div className="label" style={{ marginTop: 10 }}>
                      Logging In...
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-container">
                      <Button
                        sx={{ mb: 1, color: "white" }}
                        onClick={() => {
                          handleClientLogin(email, password);
                        }}
                        className="button-19"
                      >
                        Sign in
                      </Button>
                    </div>

                    <Divider sx={{ my: 1 }}>
                      <p className="small-text">Don't have an account?</p>{" "}
                    </Divider>

                    {/* <div style={{ display: "flex", flexDirection:"row", marginBottom: 24, alignItems: "center"}}>
									<p className='small-text'>Do not have account?</p>
									<p className='link' onClick={() => setRegister(true)}>Register</p>
								</div> */}

                    <div className="form-container">
                      <Button
                        sx={{
                          mt: 1,
                          backgroundColor: "white",
                          borderRadius: 4,
                        }}
                        onClick={() => setRegister(true)}
                      >
                        Register
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
            {showRegister && (
              <div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: 24,
                    alignItems: "center",
                  }}
                >
                  <p className="small-text">Already have an account?</p>
                  <Button className="" onClick={() => setRegister(false)}>
                    Back to Login
                  </Button>
                </div>

                <Divider sx={{ mb: 1 }}>
                  <p className="small-text">Account Information</p>
                </Divider>
                <label className="small-text" htmlFor="firstName">
                  First Name:
                </label>
                <div
                  className={
                    firstNameErr
                      ? "input-variant-1 input-error"
                      : "input-variant-1"
                  }
                >
                  <AccountBoxIcon sx={{ color: "grey", height: 20 }} />
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    placeholder="First name"
                    style={{ outline: "none", border: "none" }}
                    onChange={handleFirstNameChange}
                    required
                  />
                </div>
                <label className="small-text" htmlFor="lastName">
                  Last Name:
                </label>
                <div
                  className={
                    lastNameErr
                      ? "input-variant-1 input-error"
                      : "input-variant-1"
                  }
                >
                  <AccountBoxIcon sx={{ color: "grey", height: 20 }} />
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    placeholder="Last name"
                    style={{ outline: "none", border: "none" }}
                    onChange={handleLastNameChange}
                    required
                  />
                </div>

                <Divider sx={{ mt: 3, mb: 1 }}>
                  <p className="small-text">Credentials</p>
                </Divider>

                <label className="small-text" htmlFor="email">
                  Email:
                </label>
                <div
                  className={
                    emailErr ? "input-variant-1 input-error" : "input-variant-1"
                  }
                >
                  <EmailIcon sx={{ color: "grey", height: 20 }} />
                  <input
                    type="email"
                    id="email"
                    placeholder="Email"
                    value={email}
                    style={{ outline: "none", border: "none" }}
                    onChange={handleEmailChange}
                    required
                  />
                </div>

                <label className="small-text" htmlFor="password1">
                  Password:
                </label>
                <div
                  className={
                    passwordErr
                      ? "input-variant-1 input-error"
                      : "input-variant-1"
                  }
                >
                  <LockIcon sx={{ color: "grey", height: 20 }} />
                  <input
                    type="password"
                    id="password1"
                    placeholder="Password"
                    value={password}
                    style={{ outline: "none", border: "none" }}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <label className="small-text" htmlFor="password2">
                  Confirm Password:
                </label>
                <div
                  className={
                    password2Err
                      ? "input-variant-1 input-error"
                      : "input-variant-1"
                  }
                >
                  <LockIcon sx={{ color: "grey", height: 20 }} />
                  <input
                    type="password"
                    id="password2"
                    placeholder="Confirm password"
                    value={password2}
                    style={{ outline: "none", border: "none" }}
                    onChange={handlePassword2Change}
                    required
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: 24,
                    marginTop: 24,
                    alignItems: "center",
                  }}
                >
                  <p className="small-text">
                    By Signing in you agree to Silver Lining
                  </p>
                  <a
                    className="link"
                    href="http://silverlininghopeline.com/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </div>

                {isLoading ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div className="loader"></div>
                    <div className="label" style={{ marginTop: 10 }}>
                      Registering...
                    </div>
                  </div>
                ) : (
                  <>
                    {showRegErr && (
                      <div
                        style={{
                          marginBottom: 8,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <div>{showRegErr}</div>
                      </div>
                    )}
                    <div className="form-container">
                      <Button
                        sx={{ color: "white" }}
                        onClick={() => {
                          if (email === "") {
                            setEmailErr(true);
                          }
                          if (lastName === "") {
                            setLastNameErr(true);
                          }
                          if (firstName === "") {
                            setFirstNameErr(true);
                          }
                          if (password === "") {
                            setPasswordErr(true);
                          }
                          if (
                            firstName &&
                            lastName &&
                            email &&
                            password &&
                            password2
                          ) {
                            checkMasterList(
                              email,
                              password,
                              firstName,
                              lastName
                            );
                          } else {
                            setRegErr("Please fill up all fields");
                          }
                        }}
                        className="button-19"
                      >
                        Register
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ position: "absolute", bottom: 10 }}>
              <p style={{ fontSize: 8 }} className="small-text">
                1.0.0 Beta {FIREBASE_ENV}
              </p>
            </div>
          </div>
        </div>
      )}
      {!isLoggedIn && props.isAdmin && (
        <div className="login-container">
          <div className="login-component">
            <img className="login-logo" src={logo} />

            {isLoading ? (
              <>
                <div className="loader"></div>
                <div className="label" style={{ marginTop: 10 }}>
                  Logging In...
                </div>
              </>
            ) : (
              <div className="form-container">
                <Button sx={{ mt: 1 }} variant="contained">
                  <GoogleIcon sx={{ marginRight: 1 }} /> Sign in with Google
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {!isVerified && isLoggedIn && (
        <div className="login-container">
          <div className="login-component" style={{ paddingBottom: 30 }}>
            <div className="login-title-text">
              <p style={{ textAlign: "center", fontSize: 20 }}>
                Email is not Authorized
              </p>
            </div>
            <div
              className="login-subtitle-text"
              style={{ marginTop: 12, marginBottom: 0 }}
            >
              <p style={{ textAlign: "center" }}>
                Please check if you are using the correct email.
              </p>
            </div>
            <div className="login-subtitle-text" style={{ marginTop: 12 }}>
              <p style={{ textAlign: "center", color: "#25b09b" }}>{email}</p>
            </div>

            <div className="button-19" onClick={refreshPage}>
              Sign in again
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Login;

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./components/login/login";
import Policy from "./components/privacypolicy/privacy-policy";
import BookingPage from "./components/bookingpage/booking";
import PostAddIcon from "@mui/icons-material/PostAdd";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LogoutIcon from "@mui/icons-material/Logout";
import ProfilePage from "./components/profilepage/profilepage";
import HomePage from "./components/homepage/homepage";
import SessionPage from "./components/sessionpage/session";
import { jwtDecode } from "jwt-decode";
import QuestionnairePage from "./components/questionnaire/questionnairepage";
import ChecklistIcon from "@mui/icons-material/Checklist";
import PastSessionPage from "./components/pastsessions/pastsessionpage";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import HopelinerToolsPage from "./components/admin/hopelinerTools";
import SchedulePlotterPage from "./components/admin/schedulePlotter";

function App() {
  const [tab, setTab] = React.useState("home");
  const [user, setUser] = React.useState<any>(null);
  const [code, setCode] = React.useState(null);
  const [token, setToken] = React.useState<any>([]);
  const [screenParams, setScreenParams] = React.useState<any>(null);
  const [userType, setUserType] = React.useState<any>("");
  const [isMobile, setMobileUse] = React.useState(false);
  const [creds, setCreds] = React.useState<any>([]);
  const [isBooked, setBooked] = React.useState(false);

  const handleUser = (user: any) => {
    setTab("home");
    setUser(user);
    const user_str = JSON.stringify(user);
    if (user) {
      sessionStorage.setItem("UC", encryptString(user_str, 4)); // login creds
    } else {
      sessionStorage.removeItem("UC");
    }
  };

  const handleCode = (code: any) => {
    setCode(code);
    if (code) {
      sessionStorage.setItem("GC", encryptString(code, 3)); // login creds
    } else {
      sessionStorage.removeItem("GC");
    }
  };

  const handleTokens = (token: any) => {
    const tok_str = JSON.stringify(token);
    setToken(token);
    if (token) {
      setCreds(jwtDecode(token.id_token));
      sessionStorage.setItem("token", encryptString(tok_str, 25)); // login creds
    } else {
      sessionStorage.removeItem("token");
    }
  };

  function encryptString(text: any, shift: any) {
    return text
      .split("")
      .map((char: any) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        return char;
      })
      .join("");
  }

  // Function to decrypt a string encrypted using Caesar Cipher
  function decryptString(text: any, shift: any) {
    return encryptString(text, 26 - shift);
  }

  const BG = () => {
    return (
      <div className="gradient-bg">
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="goo">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="10"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div className="gradients-container">
          <div className="g1"></div>
          <div className="g2"></div>
          <div className="g3"></div>
          <div className="g4"></div>
          <div className="g5"></div>
          <div className="g6"></div>
          <div className="g7"></div>
          <div className="interactive"></div>
        </div>
      </div>
    );
  };

  function checkMobileResolution() {
    // Get the screen width
    const screenWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    // Define the threshold for considering it as a mobile resolution
    const mobileThreshold = 768; // Adjust as needed

    // Check if the screen width is below the threshold
    if (screenWidth < mobileThreshold) {
      // console.log('Mobile resolution detected.');
      setMobileUse(true);
    } else {
      // console.log('Not in mobile resolution.');
      setMobileUse(false);
    }
  }

  React.useEffect(() => {
    window.addEventListener("resize", checkMobileResolution);
    return () => {
      window.removeEventListener("resize", checkMobileResolution);
    };
  }, []);

  React.useEffect(() => {
    // console.log('rerender')
  }, [isBooked]);

  React.useEffect(() => {
    const GCVal: any = sessionStorage.getItem("GC");
    if (GCVal) {
      setCode(decryptString(GCVal, 3));
    }
    const UCVal: any = sessionStorage.getItem("UC");
    if (UCVal) {
      setUser(JSON.parse(decryptString(UCVal, 4)));
    }
    const tokenVal: any = sessionStorage.getItem("token");
    if (tokenVal) {
      setToken(JSON.parse(decryptString(tokenVal, 25)));
      setCreds(jwtDecode(JSON.parse(decryptString(tokenVal, 25)).id_token));
    }
    checkMobileResolution();

    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css?family=Montserrat";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    // Disable scrolling when the component mounts
    document.body.style.overflowX = "hidden";
    // Re-enable scrolling when the component unmounts
    return () => {
      // Clean up: Remove the link when the component unmounts
      document.head.removeChild(link);
      document.body.style.overflowX = "unset";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user && !code) {
    return (
      <Router>
        <div className="App">
          <BG />

          {/* Define your routes here */}
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <BG />
                  <Login
                    handleUser={handleUser}
                    handleCode={handleCode}
                    handleTokens={handleTokens}
                  />
                </>
              }
            />
            <Route path="/privacy-policy" element={<Policy />} />
            <Route
              path="/admin-ec543"
              element={
                <>
                  <BG />
                  <Login
                    isAdmin={true}
                    handleUser={handleUser}
                    handleCode={handleCode}
                    handleTokens={handleTokens}
                  />
                </>
              }
            />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </Router>
    );
  }

  const navigation = (screenId: string, screen: string) => {
    setScreenParams(screenId);
    setTab(screen);
  };

  const handleDone = (data: any) => {
    if (data === true) {
      setTab("home");
    }
  };

  const handleGoBack = () => {
    setBooked(false);
    setTab("home");
  };

  const handleUserType = (data: any) => {
    if (data) {
      setUserType(data);
    }
  };

  const handleBooked = (data: any) => {
    if (data) {
      setBooked(data);
      // console.log('BOOKED',data)
    }
  };

  const TabView = () => {
    if (tab === "booking") {
      return (
        <BookingPage
          userInfo={{ userType: userType }}
          code={token.refresh_token}
          creds={token.id_token}
          isDone={handleDone}
          view={isMobile}
        />
      );
    }
    if (tab === "home") {
      return (
        <>
          {token && (
            <HomePage
              id_token={token.id_token}
              user={user}
              handleNav={navigation}
              userType={handleUserType}
              view={isMobile}
              isBooked={handleBooked}
            />
          )}
          {!token && <div>Loading pls wait</div>}
        </>
      );
    }
    if (tab === "profile") {
      return (
        <ProfilePage
          handleUser={handleUser}
          handleCode={handleCode}
          handleTokens={handleTokens}
          view={isMobile}
        />
      );
    }

    if (tab === "session") {
      return (
        <SessionPage
          handleUser={handleUser}
          userInfo={user}
          handleCode={handleCode}
          handleTokens={handleTokens}
          userType={userType}
          sessionID={screenParams}
          view={isMobile}
          code={token.refresh_token}
          goBack={handleGoBack}
        />
      );
    }

    if (tab === "schedulePlotter") {
      return (
        <SchedulePlotterPage
          userInfo={{ userType: userType }}
          code={token.refresh_token}
          creds={token.id_token}
          isDone={handleDone}
          view={isMobile}
        />
      );
    }

    if (tab === "past") {
      return (
        <>
          {token && (
            <PastSessionPage
              id_token={token.id_token}
              user={user}
              handleNav={navigation}
              userType={userType}
              view={isMobile}
            />
          )}
          {!token && <div>Loading pls wait</div>}
        </>
      );
    }

    if (tab === "hopelinerTools") {
      return (
        <>
          {token && (
            <HopelinerToolsPage
              id_token={token.id_token}
              user={user}
              handleNav={navigation}
              userType={handleUserType}
              view={isMobile}
            />
          )}
          {!token && <div>Loading pls wait</div>}
        </>
      );
    }

    if (tab === "questionnaire") {
      return (
        <QuestionnairePage
          handleUser={user}
          handleCode={handleCode}
          handleTokens={handleTokens}
          view={isMobile}
        />
      );
    }

    return (
      <>
        {token && (
          <HomePage
            id_token={token.id_token}
            user={user}
            handleNav={navigation}
            userType={handleUserType}
            view={isMobile}
            isBooked={handleBooked}
          />
        )}
        {!token && <div>Loading pls wait</div>}
      </>
    );
  };

  const BottomTab = () => {
    if (userType !== "") {
      const seeButton = userType !== 2 ? (isBooked ? false : true) : false;
      return (
        <div className="bottom-tab-nav">
          <button
            onClick={() => setTab("home")}
            className={
              tab === "home"
                ? "bottom-tab-buttons selected"
                : "bottom-tab-buttons"
            }
          >
            <FormatListBulletedIcon />
            Sessions
          </button>
          <button
            onClick={() => setTab("past")}
            className={
              tab === "past"
                ? "bottom-tab-buttons selected"
                : "bottom-tab-buttons"
            }
          >
            <ChecklistIcon />
            Past Sessions
          </button>
          {seeButton && (
            <button
              onClick={() => setTab("booking")}
              className={
                tab === "booking"
                  ? "bottom-tab-buttons selected"
                  : "bottom-tab-buttons"
              }
            >
              <PostAddIcon />
              Booking
            </button>
          )}
          <button
            onClick={() => setTab("profile")}
            className={
              tab === "profile"
                ? "bottom-tab-buttons selected"
                : "bottom-tab-buttons"
            }
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      );
    } else {
      return <></>;
    }
  };

  const SidePanel = () => {
    if (userType !== "") {
      const seeButton = userType !== 2 ? (isBooked ? false : true) : false;
      // const seeButton = true
      return (
        <div className="side-nav">
          <div className="profile-view">
            {creds && (
              <div className="profile-view-container">
                <div className="home-pic-container">
                  <img className="user-pic" src={creds.picture} alt="" />
                </div>
                <div className="details-container">
                  <div className="profile-header">{creds.name}</div>
                  <div className="profile-sub-header">{creds.email}</div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setTab("home")}
            className={
              tab === "home"
                ? "side-panel-buttons side-panel-selected"
                : "side-panel-buttons"
            }
          >
            <FormatListBulletedIcon />
            <div className="panel-option-text">
              {userType === 1 ? "Dashboard" : "Session list"}
            </div>
          </button>
          <button
            onClick={() => setTab("past")}
            className={
              tab === "past"
                ? "side-panel-buttons side-panel-selected"
                : "side-panel-buttons"
            }
          >
            <ChecklistIcon />
            <div className="panel-option-text">Past Sessions</div>
          </button>
          {userType === 2 && (
            <button
              onClick={() => setTab("hopelinerTools")}
              className={
                tab === "hopelinerTools"
                  ? "side-panel-buttons side-panel-selected"
                  : "side-panel-buttons"
              }
            >
              <HomeRepairServiceIcon />
              <div className="panel-option-text">Hopeliner Tools</div>
            </button>
          )}
          {seeButton && (
            <button
              onClick={() => setTab("booking")}
              className={
                tab === "booking"
                  ? "side-panel-buttons side-panel-selected"
                  : "side-panel-buttons"
              }
            >
              <PostAddIcon />
              <div className="panel-option-text">Book a Schedule</div>
            </button>
          )}
          {userType === 1 && (
            <button
              onClick={() => setTab("schedulePlotter")}
              className={
                tab === "schedulePlotter"
                  ? "side-panel-buttons side-panel-selected"
                  : "side-panel-buttons"
              }
            >
              <PostAddIcon />
              <div className="panel-option-text">Schedule Plotter</div>
            </button>
          )}
          <button
            onClick={() => setTab("profile")}
            className={
              tab === "profile"
                ? "side-panel-buttons side-panel-selected"
                : "side-panel-buttons"
            }
          >
            <LogoutIcon />
            <div className="panel-option-text">Logout</div>
          </button>
        </div>
      );
    } else {
      return <></>;
    }
  };

  return (
    <Router>
      <div className="App">
        <BG />

        {/* Define your routes here */}
        <Routes>
          <Route
            path="/"
            element={
              <>
                {isMobile && (
                  <>
                    <TabView />
                    <BottomTab />
                  </>
                )}
                {!isMobile && (
                  <div className="desktop-view">
                    <div className="desktop-view-side-panel">
                      <SidePanel />
                    </div>
                    <div className="desktop-view-body">
                      <TabView />
                    </div>
                  </div>
                )}
              </>
            }
          />
          <Route path="/privacy-policy" element={<Policy />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}
export default App;

import React from "react";
// import { useMediaQuery } from 'react-responsive'
import { FIREBASE_AUTH } from "../../firebaseConfig";
import "./profilepage.css";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FmdBadIcon from "@mui/icons-material/FmdBad";

function ProfilePage(props: {
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

  const logout = async () => {
    // console.log('logout')
    handleCode(null);
    handleTokens(null);
    FIREBASE_AUTH.signOut()
      .then(() => {
        // console.log("signout success")
        handleUser(null);
      })
      .catch((error: any) => {
        // console.log(error)
      });
  };

  return (
    <>
      {isMobile && (
        // <div className='container'>

        // <p>Logged in</p>
        // <button onClick={logout}>Log out</button>

        // </div>
        <div style={{ paddingTop: "15%" }}>
          <div className="desktop-logout-container">
            <div className="profile-confirmation-message">
              <FmdBadIcon />
              Are you sure you want to logout?
            </div>
            <div onClick={logout} className="confirm-button">
              <CheckCircleIcon className="confirm-icon" />
              Confirm
            </div>
          </div>
        </div>
      )}
      {!isMobile && (
        <div className="desktop-logout-container">
          <div className="profile-confirmation-message">
            <FmdBadIcon />
            Are you sure you want to logout?
          </div>
          <div onClick={logout} className="confirm-button">
            <CheckCircleIcon className="confirm-icon" />
            Confirm
          </div>
        </div>
      )}
    </>
  );
}
export default ProfilePage;

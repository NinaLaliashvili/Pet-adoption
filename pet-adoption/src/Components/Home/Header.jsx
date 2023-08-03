import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./home.css";
import { LogoutModal } from "./LogoutModal";

export const Header = ({ isLoggedIn, handleLogout, setShowModal }) => {
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");

    setUserFirstName(firstName);
    setUserLastName(lastName);
  }, [localStorage.getItem("firstName"), localStorage.getItem("lastName")]);

  return (
    <div className="header">
      {isLoggedIn ? (
        <React.Fragment>
          <h1 className="welcome-heading-loggedin">
            Welcome, {userFirstName} {userLastName}!
          </h1>
          <button
            className="logout-button"
            onClick={() => setShowLogoutModal(true)}
          >
            Logout
          </button>
          {showLogoutModal && (
            <LogoutModal
              handleLogout={handleLogout}
              setShowModal={setShowLogoutModal}
            />
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="login-text-welcome">
            <div className="buttoncontainer">
              <button
                className="login-button"
                onClick={() => setShowModal((prev) => !prev)}
              >
                Login
              </button>
            </div>
            <h1 className="welcome-heading">
              Welcome to our Magical Pet Adoption Wonderland!
            </h1>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

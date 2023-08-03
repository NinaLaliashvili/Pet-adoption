import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./home.css";
import { Header } from "./Header";
import { BodyHome } from "./BodyHome";
import { useContext } from "react";
import { useEffect } from "react";
import { LoginContext } from "../../Context/LoginContext";
import { useRef } from "react";
import { Footer } from "../Footer/Footer";

export const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fromSavePet } = location.state || { fromSavePet: false };
  const [showLoginPrompt, setShowLoginPrompt] = useState(fromSavePet);

  const { setLoginStatus } = useContext(LoginContext);
  const [showModal, setShowModal] = useState(false);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const myRef = useRef(null);

  useEffect(() => {
    if (fromSavePet) {
      const timer = setTimeout(() => {
        setShowLoginPrompt(false);
      }, 4000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [fromSavePet]);

  useEffect(() => {
    if (isLoggedIn) {
      const lastLocation = localStorage.getItem("lastLocation");
      if (lastLocation) {
        navigate(lastLocation);
        localStorage.removeItem("lastLocation");
      }
    }
  }, [isLoggedIn, navigate]);

  const handleClose = () => {
    setShowModal(false);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    setShowModal(false);
    navigate("/");
    setLoginStatus(false);
  };

  return (
    <div className="home-view" key={isLoggedIn}>
      {showLoginPrompt && (
        <p>If you want to save this pet, please log in first.</p>
      )}
      <Header
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        setShowModal={setShowModal}
      />

      <BodyHome
        ref={myRef}
        isLoggedIn={isLoggedIn}
        showModal={showModal}
        handleClose={handleClose}
      />
      <Footer />
    </div>
  );
};

export default Home;

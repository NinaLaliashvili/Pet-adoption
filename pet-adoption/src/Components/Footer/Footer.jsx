import React from "react";
import "./footer.css";
import fbLogo from "./Logo/fb.png";
import inLogo from "./Logo/insta.svg";
import whLogo from "./Logo/what.png";
import gitLogo from "./Logo/github.png";
import linkLogo from "./Logo/linkedin.png";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3 className="h3footer">© 2023 - ITC </h3>
        <br />
        <h4 className="h4footer"> - Pet Adoption Project</h4>
        <p className="pfooter">
          <Link className="pfooter" to="/contact">
            {" "}
            Contact us!
          </Link>
        </p>
        <ul className="social-linksfooter">
          <li className="li-dot">
            <a
              className="afooter"
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="logofooter" src={fbLogo} alt="facebook-logo" />
            </a>
          </li>
          <li className="li-dot">
            <a
              className="afooter"
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="logofooter" src={inLogo} alt="instagram-logo" />
            </a>
          </li>
          <li className="li-dot">
            <a
              className="afooter"
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="logofooter" src={whLogo} alt="whatsupp-logo" />
            </a>
          </li>
          <li className="li-dot">
            <a
              className="afooter"
              href="https://github.com/NinaLaliashvili"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="logofooter" src={gitLogo} alt="github-logo" />
            </a>
          </li>
          <li className="li-dot">
            <a
              className="afooter"
              href="https://www.linkedin.com/in/nini-laliashvili-08a97b223/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="logofooter" src={linkLogo} alt="whatsupp-logo" />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

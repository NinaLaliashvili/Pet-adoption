import React, { forwardRef } from "react";
import { Link, Outlet } from "react-router-dom";
import "./home.css";
import cat from "./images/cat.jpeg";
import petsssImage from "./images/petsss.jpeg";
import hands from "./images/hands.jpeg";
import { useRef } from "react";
import dog from "./images/dog.png";
import pets from "./images/pets.png";
import bone from "./images/bone.png";

export const BodyHome = forwardRef(
  ({ isLoggedIn, showModal, handleClose }, ref) => {
    const myRef = useRef(null);
    return (
      <div className="card">
        <div
          className="arrow arrow-bottom"
          onClick={() => myRef.current.scrollIntoView({ behavior: "smooth" })}
        >
          <span></span>
        </div>
        <div className="photo-section" ref={myRef}>
          <p className="welcome-text" ref={ref}>
            Welcome to our extraordinary pet adoption service, where joy and
            love converge to help you find the perfect furry companion! 🐶🐱
            Whether you seek a playful pup for daily adventures or a snuggly cat
            for lazy afternoons, our dedicated team is committed to matching you
            with your purr-fect match! 🏠❤️
          </p>
          <img className="pet-image" src={petsssImage} alt="Pet" />
        </div>
        <div className="photo-section">
          <img className="pet-image" src={hands} alt="Pet" />
          <p className="welcome-text2" ref={ref}>
            Our passionate team of pet matchmakers possesses an uncanny ability
            to find the ideal companion for your soul. They understand the
            unique bond between humans and animals, ensuring a magical
            connection between you and your new friend. If you have any
            questions, don't be shy, <Link to="/contact">contact us!</Link>!
            🌈🌠
          </p>
        </div>
        <div className="photo-section">
          <p className="welcome-text" ref={ref}>
            So step into our extraordinary realm of pet adoptions, where hearts
            are forever touched by the magic of unconditional love. Let us
            sprinkle joy and companionship into your life as we help you find
            your perfect match. Get ready to embark on a whimsical adventure
            filled with endless cuddles and unforgettable memories! 🌟🏠❤️
          </p>
          <img className="pet-image" src={cat} alt="Pet" />
        </div>
        <div className="commercial-section">
          <div className="commercial-item">
            <img className="logooo" src={dog} alt="Logo 1" />
            <p className="commercial-text">
              Adopt the pet of your dreams and embark on a journey filled with
              joy, love, and endless companionship!
            </p>
          </div>
          <div className="commercial-item">
            <img className="logooo" src={pets} alt="Logo 2" />
            <p className="commercial-text">
              Join our mission in creating happy and loving homes for our furry
              friends! Your perfect match is waiting.
            </p>
          </div>
          <div className="commercial-item">
            <img className="logooo" src={bone} alt="Logo 3" />
            <p className="commercial-text">
              Love,sweet,laughter,and a lifetime of memories await you. Adopt
              today and make a forever friend!Save pets!
            </p>
          </div>
        </div>
        {!isLoggedIn && showModal && (
          <>
            <div className="backdrop" onClick={handleClose} />
            <div className="modal">
              <p className="h1-sign-login">Join us and adopt a pet today!</p>
              <div className="modal-links">
                <Link to="/login" className="modal-link">
                  Log In
                </Link>

                <Link to="/signup" className="modal-link">
                  Sign Up
                </Link>
              </div>
              <Outlet />
              <button className="close-button" onClick={handleClose}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
);

export default BodyHome;

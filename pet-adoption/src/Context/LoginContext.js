import React, { createContext, useState, useEffect } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const setLoginStatus = (loginStatus, userId, token) => {
    localStorage.setItem("isLoggedIn", loginStatus);
    localStorage.setItem("userId", userId);
    localStorage.setItem("token", token);
    setIsLoggedIn(loginStatus);
    setUserId(userId);
    setToken(token);
  };

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    setUserId(localStorage.getItem("userId"));
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <LoginContext.Provider
      value={{ isLoggedIn, setLoginStatus, userId, token }}
    >
      {children}
    </LoginContext.Provider>
  );
};

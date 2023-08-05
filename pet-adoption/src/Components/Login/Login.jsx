import "./login.css";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { LoginContext } from "../../Context/LoginContext";
export function Login() {
  const location = useLocation();
  const { fromSavePet } = location.state || { fromSavePet: false };

  const navigate = useNavigate();
  const { isLoggedIn, userId, setLoginStatus } = useContext(LoginContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:3070/login", {
        email,
        password,
      });
      console.log(response.data);
      if (response.data) {
        const { user, token } = response.data;
        const userId = user._id;

        console.log(token);
        //update context and local storage
        setLoginStatus(true, userId, token);

        navigate("/");
      } else {
        setLoginStatus(false, null, null);
        setLoginError("Invalid email or password!");
      }
    } catch (error) {
      console.error("Error details:", error.response);
      console.error("Failed to fetch users", error);
      setLoginStatus(false, null, null);
      setLoginError("Invalid email or password!");
    }
  };

  return (
    <div className="login-form-container">
      {fromSavePet && <p>If you want to save this pet, please log in first.</p>}
      <form className="loginform" onSubmit={handleSubmit}>
        <h2 className="loginh2">Login</h2>
        <input
          className="inputlogin"
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="inputlogin"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {loginError && <p className="error">{loginError}</p>}
        <button className="login-btn" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;

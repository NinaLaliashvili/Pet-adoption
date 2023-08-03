import { useState } from "react";
import "./signup.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const SignUp = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [errorField, setErrorField] = useState("");

  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const { email, password, confirmPassword, firstName, lastName, phone } =
    formState;

  const handleInputChange = (event) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
    setErrorMessage("");
    setErrorField("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    for (let key in formState) {
      if (formState[key] === "") {
        setErrorMessage(
          `Please fill in the ${key
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} field.`
        );
        setErrorField(key);
        return;
      }
    }

    // Check if password is between 6 and 30 characters, and includes at least one digit and one uppercase letter.
    if (!/^(?=.*\d)(?=.*[A-Z]).{6,30}$/.test(password)) {
      setErrorMessage(
        "Password must be between 6-30 characters, include at least one digit and one uppercase letter!"
      );
      setErrorField("password");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setErrorField("confirmPassword");
      return;
    }

    // Check if phone number contains only digits.
    if (!/^\d+$/.test(phone)) {
      setErrorMessage("Phone number should only contain digits!");
      setErrorField("phone");
      return;
    }

    try {
      const users = await axios.get("http://localhost:3070/users");

      const isEmailExists = users.data.some((user) => user.email === email);
      const isPhoneExists = users.data.some((user) => user.phone === phone);

      if (isEmailExists) {
        setErrorMessage("This email is already in use!");
        setErrorField("email");
        return;
      }

      if (isPhoneExists) {
        setErrorMessage("This phone number is already in use!");
        setErrorField("phone");
        return;
      }

      const response = await axios.post(
        "http://localhost:3070/signup",
        formState
      );

      localStorage.setItem("userId", response.data.id);
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign up", error);
      setErrorMessage("Failed to sign up");
    }
  };

  return (
    <div className="container">
      <form className="formsignup" onSubmit={handleSubmit}>
        <input
          className={`inputsignup ${errorField === "email" ? "error" : ""}`}
          type="email"
          name="email"
          value={email}
          onChange={handleInputChange}
          placeholder="Email"
        />
        <input
          className={`inputsignup ${errorField === "password" ? "error" : ""}`}
          type="password"
          name="password"
          value={password}
          onChange={handleInputChange}
          placeholder="Password"
        />
        <input
          className={`inputsignup ${
            errorField === "confirmPassword" ? "error" : ""
          }`}
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm Password"
        />
        <input
          className={`inputsignup ${errorField === "firstName" ? "error" : ""}`}
          type="text"
          name="firstName"
          value={firstName}
          onChange={handleInputChange}
          placeholder="First Name"
        />
        <input
          className={`inputsignup ${errorField === "lastName" ? "error" : ""}`}
          type="text"
          name="lastName"
          value={lastName}
          onChange={handleInputChange}
          placeholder="Last Name"
        />
        <input
          className={`inputsignup ${errorField === "phone" ? "error" : ""}`}
          type="tel"
          name="phone"
          value={phone}
          onChange={handleInputChange}
          placeholder="Phone Number"
        />
        <p className="error-message">{errorMessage}</p>
        <button className="btn-signup" type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
};

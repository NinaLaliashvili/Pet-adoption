import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { LoginContext } from "../Context/LoginContext";
import "./view.css";

export const ProfileSettingsView = () => {
  const { isLoggedIn } = useContext(LoginContext);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const apiUrl = `http://localhost:3070/user/${userId}`;
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .get(apiUrl, config)
      .then((response) => {
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
        setEmail(response.data.email);
        setPhoneNumber(response.data.phone);
        setBio(response.data.bio);
      })
      .catch((error) => {
        setError("Failed to load user information.");
        console.error(error);
      });
  }, [userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    //if password is between 6 and 30 characters, and includes at least one digit and one uppercase letter.
    if (password && !/^(?=.*\d)(?=.*[A-Z]).{6,30}$/.test(password)) {
      setError(
        "Password must be between 6-30 characters, include at least one digit and one uppercase letter!"
      );
      return;
    }

    //if phone number contains only digits.
    if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
      setError("Phone number should only contain digits!");
      return;
    }
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const users = await axios.get("http://localhost:3070/users");
    const isEmailExists = users.data.some(
      (user) => user.email === email && user._id !== userId
    );
    const isPhoneExists = users.data.some(
      (user) => user.phone === phoneNumber && user._id !== userId
    );

    if (email && isEmailExists) {
      setError("This email is already in use!");
      return;
    }

    if (phoneNumber && isPhoneExists) {
      setError("This phone number is already in use!");
      return;
    }

    const updatedUser = {
      firstName,
      lastName,
      email,
      phone: phoneNumber,
      bio,
    };

    if (password) {
      updatedUser.password = password;
    }

    axios
      .put(`http://localhost:3070/user/${userId}`, updatedUser, config)
      .then((response) => {
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
        setEmail(response.data.email);
        setPhoneNumber(response.data.phone);
        setBio(response.data.bio);

        //updated first name and last name in local storage
        localStorage.setItem("firstName", response.data.firstName);
        localStorage.setItem("lastName", response.data.lastName);

        setSuccess("Profile updated successfully!");
        setError(null);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error(error);
        if (error.response && error.response.status === 403) {
          setError("You don't have permission to update this profile.");
        } else {
          setError("Failed to update profile.");
        }
      });
  };
  useEffect(() => {
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
  }, [firstName, lastName]);

  const handleUpdateClick = () => {
    setIsEditing(true);
    setSuccess(null);
    setError(null);
  };

  return isLoggedIn ? (
    isEditing ? (
      <div className="profile-settings-container">
        <h1 className="h-set">Update Your Profile</h1>
        <form className="form-settings" onSubmit={handleSubmit}>
          <input
            className="input-settings"
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className="input-settings"
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            className="input-settings"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input-settings"
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            className="input-settings"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <textarea
            className="text-settings"
            placeholder="Short Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
          <button className="btn-update" type="submit">
            Save
          </button>
        </form>
      </div>
    ) : (
      <div className="profile-card">
        <h1>Your Profile</h1>
        <div className="profile-detail">
          <h3>First Name</h3>
          <p>{firstName}</p>
        </div>
        <div className="profile-detail">
          <h3>Last Name</h3>
          <p>{lastName}</p>
        </div>
        <div className="profile-detail">
          <h3>Email</h3>
          <p>{email}</p>
        </div>
        <div className="profile-detail">
          <h3>Phone Number</h3>
          <p>{phoneNumber}</p>
        </div>
        <div className="profile-detail">
          <h3>Bio</h3>
          <p>{bio}</p>
        </div>
        <button className="btn-update" onClick={handleUpdateClick}>
          Update Profile
        </button>
      </div>
    )
  ) : (
    <p className="error-setting">You need to log in to access this page.</p>
  );
};

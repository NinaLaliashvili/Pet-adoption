import React, { useState, useEffect } from "react";
import axios from "axios";
import "./usersview.css";
import { Link } from "react-router-dom";

export const UsersViewAdmin = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3070/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users: ", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter((user) =>
    (user.firstName + " " + user.lastName)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-admin-box">
      <div className="search-bar">
        <input
          className="search-bar "
          type="text"
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <h2 className="users-admin-h2">Users:</h2>
      <div className="users-section">
        {filteredUsers.map((user) => (
          <div className="users-admin-div3" key={user._id}>
            <Link className="text-decoration" to={`/admin/users/${user._id}`}>
              <p className="users-admin-p">
                {user.firstName} {user.lastName}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

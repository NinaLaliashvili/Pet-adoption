import React from "react";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import "./adminview.css";

export const AdminView = () => {
  return (
    <div className="admin-container">
      <h1 className="h1-admin">Admin</h1>
      <div className="admin-box">
        <Link className="link-admin" to="users">
          Users
        </Link>
        <Link className="link-admin" to="pets">
          Pets
        </Link>
        <Link className="link-admin" to="add-pet">
          Add Pet
        </Link>
      </div>
      <Outlet />

      <p className="description">
        Here you can <span className="spanadmin">Update</span>{" "}
        <span className="spanadmin">/ Add </span> pet's details and{" "}
        <span className="spanadmin">Control</span> user's information!
      </p>
    </div>
  );
};

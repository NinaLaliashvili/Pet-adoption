import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { LoginContext } from "../Context/LoginContext";
import { Link } from "react-router-dom";

export const MyPetsView = () => {
  const { userId, token } = useContext(LoginContext);
  const [myPets, setMyPets] = useState([]);

  useEffect(() => {
    const fetchMyPets = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3070/user/${userId}/pets`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMyPets(response.data);
      } catch (error) {
        console.error("Failed to fetch pets: ", error);
      }
    };

    if (userId) {
      fetchMyPets();
    }
  }, [userId, token]);

  if (myPets.length === 0) {
    return (
      <p className="p-none">You haven't adopted or fostered any pets yet.</p>
    );
  }

  return (
    <>
      <h1 className="h-seet">My Pets:</h1>
      <div className="my-pets-box">
        {myPets.length === 0 ? (
          <p className="p-none">
            You haven't adopted or fostered any pets yet.
          </p>
        ) : (
          myPets.map((pet) => (
            <div className="my-pets-p" key={pet._id}>
              <h2 className="h-seet">{pet.name}</h2>
              <img
                className="p-imagee"
                src={
                  pet.imagePath
                    ? `http://localhost:3070/${pet.imagePath}`
                    : pet.imageUrl
                }
                alt="Pet"
              />
              <p className="h-seet">Status: {pet.adoptionStatus}</p>
              <Link className="seedetails" to={`/mypets/${pet._id}`}>
                See details
              </Link>
            </div>
          ))
        )}
      </div>
    </>
  );
};

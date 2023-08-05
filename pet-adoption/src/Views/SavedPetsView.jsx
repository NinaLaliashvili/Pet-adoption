import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { LoginContext } from "../Context/LoginContext";
import { Link } from "react-router-dom";

export const SavedPetsView = () => {
  const { userId, token } = useContext(LoginContext);
  const [savedPets, setSavedPets] = useState(() => {
    const localSavedPets = localStorage.getItem("savedPets");
    return localSavedPets ? JSON.parse(localSavedPets) : [];
  });

  useEffect(() => {
    const fetchSavedPets = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3070/user/${userId}/savedPets`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSavedPets(response.data);
        localStorage.setItem("savedPets", JSON.stringify(response.data));
      } catch (error) {
        console.error("Failed to fetch saved pets: ", error);
      }
    };

    if (userId && token) {
      fetchSavedPets();
    }
  }, [userId, token]);

  const handleUnsave = async (petId) => {
    try {
      await axios.delete(`http://localhost:3070/pet/${petId}/save`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSavedPets((oldPets) => oldPets.filter((pet) => pet._id !== petId));
    } catch (error) {
      console.error("Failed to unsave pet: ", error);
    }
  };

  if (savedPets.length === 0) {
    return <p className="p-none">You haven't saved any pets yet.</p>;
  }

  return (
    <>
      <h1 className="h-seet">Saved Pets</h1>
      <div className="my-pets-box">
        {savedPets.map((pet) => (
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
            <Link className="seedetails" to={`/mypets/${pet._id}`}>
              See details
            </Link>
            <button
              className="button-details"
              onClick={() => handleUnsave(pet._id)}
            >
              Unsave
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

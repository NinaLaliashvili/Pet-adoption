import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BounceLoader } from "react-spinners";
import { LoginContext } from "../../../Context/LoginContext";

export const UserDetailsViewAdmin = () => {
  const { userId, token } = useContext(LoginContext);
  const params = useParams();
  console.log("Params from URL:", params);
  const { id } = params;
  console.log("ID from URL:", id);
  const [user, setUser] = useState(null);
  const [ownedPets, setOwnedPets] = useState([]);
  const [fosteredPets, setFosteredPets] = useState([]);
  const [savedPets, setSavedPets] = useState([]);

  useEffect(() => {
    fetchUserAndPets();
  }, [id]);

  const fetchUserAndPets = async () => {
    try {
      const userResponse = await axios.get(`http://localhost:3070/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(userResponse.data);

      const ownedPetsResponse = await axios.get(
        `http://localhost:3070/user/${id}/pets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOwnedPets(ownedPetsResponse.data);
      console.log("Owned Pets Response:", ownedPetsResponse.data);

      const savedPetsResponse = await axios.get(
        `http://localhost:3070/user/${id}/savedPets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSavedPets(savedPetsResponse.data);
    } catch (error) {
      console.error("Failed to fetch user: ", error);
    }
  };

  if (!user) {
    return (
      <div className="spinner-container">
        <BounceLoader color={"#123abc"} size={60} />
      </div>
    );
  }

  return (
    <div className="form-container1">
      <h1 className="form-title1">User Details:</h1>
      <div className="form-group1">
        <h2>
          {user.firstName} {user.lastName}
        </h2>
        <p>Email: {user.email}</p>
        <p>Phone Number: {user.phone}</p>
        <p>Bio: {user.bio}</p>

        <h1 className="h-seet">Owned Pets:</h1>
        <div className="my-pets-box">
          {ownedPets.length === 0 ? (
            <div className="form-group11">
              <p className="p-none">
                The user hasn't adopted or fostered any pets yet.
              </p>
            </div>
          ) : (
            ownedPets.map((pet) => (
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
              </div>
            ))
          )}
        </div>

        <h1 className="h-seet">Saved Pets</h1>
        <div className="my-pets-box">
          {savedPets.length === 0 ? (
            <div className="form-group11">
              <p className="p-none">The user hasn't saved any pets yet.</p>
            </div>
          ) : (
            savedPets.map((pet) => (
              <div className="my-pets-p" key={pet._id}>
                <h2 className="h-seet">Type: {pet.type}</h2>
                <h2 className="h-seet">Name:{pet.name}</h2>
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

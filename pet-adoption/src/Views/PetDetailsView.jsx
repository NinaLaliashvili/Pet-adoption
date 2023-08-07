import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { LoginContext } from "../Context/LoginContext";
import { BounceLoader } from "react-spinners";
import "./view.css";

export const PetDetailsView = () => {
  const { isLoggedIn, userId, token } = useContext(LoginContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [petDetails, setPetDetails] = useState(null);
  const [pets, setPets] = useState(() => {
    const localPets = localStorage.getItem("pets");
    return localPets ? JSON.parse(localPets) : [];
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(
    () => {
      const fetchPetDetails = async () => {
        try {
          const response = await axios.get(`http://localhost:3070/pet/${id}`);

          setPetDetails(response.data);
          setIsSaved(response.data.savedBy === userId);
        } catch (error) {
          console.error("Failed to fetch pet details: ", error);
        }
      };

      fetchPetDetails();
    },
    [id],
    [userId]
  );

  if (!petDetails) {
    return (
      <div className="spinner-container">
        <BounceLoader color={"#123abc"} size={60} />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await axios.post(
        `http://localhost:3070/pet/${id}/save`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          pet._id === id
            ? {
                ...pet,
                savedBy: Array.isArray(pet.savedByUsers)
                  ? [...pet.savedByUsers, userId]
                  : [userId],
              }
            : pet
        );
        localStorage.setItem("pets", JSON.stringify(updatedPets));
        return updatedPets;
      });
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to save pet: ", error);
    }
    setPetDetails({
      ...petDetails,
      savedBy: Array.isArray(petDetails.savedByUsers)
        ? [...petDetails.savedByUsers, userId]
        : [userId],
    });
  };

  const handleUnsave = async () => {
    try {
      await axios.delete(`http://localhost:3070/pet/${id}/save`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          pet._id === id
            ? {
                ...pet,
                savedBy: Array.isArray(pet.savedByUsers)
                  ? pet.savedByUsers.filter((id) => id !== userId)
                  : [],
              }
            : pet
        );
        localStorage.setItem("pets", JSON.stringify(updatedPets));
        return updatedPets;
      });
      setIsSaved(false);
    } catch (error) {
      console.error("Failed to unsave pet: ", error);
    }
    setPetDetails({
      ...petDetails,
      savedBy: Array.isArray(petDetails.savedByUsers)
        ? petDetails.savedByUsers.filter((id) => id !== userId)
        : [],
    });
  };

  const handleAdopt = async () => {
    try {
      await axios.post(
        `http://localhost:3070/pet/${id}/adopt`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          pet._id === id
            ? {
                ...pet,
                adoptionStatus: "Adopted",
                ownerId: userId,
              }
            : pet
        );
        localStorage.setItem("pets", JSON.stringify(updatedPets));
        return updatedPets;
      });
    } catch (error) {
      console.error("Failed to adopt pet: ", error);
    }
    setPetDetails({
      ...petDetails,
      adoptionStatus: "Adopted",
      ownerId: userId,
    });
  };

  const handleFoster = async () => {
    try {
      await axios.post(
        `http://localhost:3070/pet/${id}/adopt`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          pet._id === id
            ? {
                ...pet,
                adoptionStatus: "Fostered",
                ownerId: userId,
              }
            : pet
        );
        localStorage.setItem("pets", JSON.stringify(updatedPets));
        return updatedPets;
      });
    } catch (error) {
      console.error("Failed to foster pet: ", error);
    }
    setPetDetails({
      ...petDetails,
      adoptionStatus: "Fostered",
      ownerId: userId,
    });
  };

  const handleReturn = async () => {
    try {
      await axios.post(
        `http://localhost:3070/pet/${id}/return`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          pet._id === id
            ? {
                ...pet,
                adoptionStatus: "Available",
                ownerId: null,
              }
            : pet
        );
        localStorage.setItem("pets", JSON.stringify(updatedPets));
        return updatedPets;
      });
    } catch (error) {
      console.error("Failed to return pet: ", error);
    }
    setPetDetails({
      ...petDetails,
      adoptionStatus: "Available",
      ownerId: null,
    });
  };

  return (
    <div className="comt-p-div">
      <div className="details-container">
        <h1 className="p-name">{petDetails.name}</h1>
        <img
          className="p-image"
          src={
            petDetails.imagePath
              ? `http://localhost:3070/${petDetails.imagePath}`
              : petDetails.imageUrl
          }
          alt="Pet"
        />
        <p className="p-desc">Status: {petDetails.adoptionStatus}</p>
        <p className="p-desc">Type: {petDetails.type}</p>
        <p className="p-desc">Breed: {petDetails.breed}</p>
        <p className="p-desc">Age: {petDetails.age}</p>
        <p className="p-desc">Color: {petDetails.color}</p>
        <p className="p-desc">Weight: {petDetails.weight}</p>
        <p className="p-desc">Height: {petDetails.height}</p>
        <p className="p-desc">Hypoallergenic: {petDetails.hypoallergenic}</p>
        <p className="p-desc">
          Dietary restrictions: {petDetails.dietaryRestrictions}
        </p>
        <div>
          {isSaved ? (
            <button className="button-details" onClick={handleUnsave}>
              Unsave
            </button>
          ) : (
            isLoggedIn && (
              <button className="button-details" onClick={handleSave}>
                Save the pet
              </button>
            )
          )}
        </div>
        {isLoggedIn &&
        petDetails.ownerId === userId &&
        (petDetails.adoptionStatus === "Adopted" ||
          petDetails.adoptionStatus === "Fostered") ? (
          <button className="button-details" onClick={handleReturn}>
            Return Pet
          </button>
        ) : (
          isLoggedIn &&
          petDetails.adoptionStatus === "Available" && (
            <>
              <button className="button-details" onClick={handleAdopt}>
                Adopt
              </button>
              <button className="button-details" onClick={handleFoster}>
                Foster
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
};

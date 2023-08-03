import React, { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { LoginContext } from "../Context/LoginContext";
import "./view.css";
import { BounceLoader } from "react-spinners";

export const AllPetsView = () => {
  const { isLoggedIn, userId, token } = useContext(LoginContext);
  const [pets, setPets] = useState(() => {
    const localPets = localStorage.getItem("pets");
    return localPets ? JSON.parse(localPets) : [];
  });
  const [search, setSearch] = useState("");

  const fetchPets = async () => {
    setTimeout(async () => {
      try {
        const response = await axios.get(`http://localhost:3070/pet`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const newPets = response.data;

        if (isLoggedIn) {
          const userResponse = await axios.get(
            `http://localhost:3070/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const savedPets = userResponse.data.savedPets;

          newPets.forEach((pet) => {
            pet.savedBy = pet.savedByUsers || [];
            if (savedPets.includes(pet.id)) {
              if (!pet.savedBy.includes(userId)) {
                pet.savedBy.push(userId);
              }
            }
          });
        }

        setPets(newPets);
        localStorage.setItem("pets", JSON.stringify(newPets));
      } catch (error) {
        console.error("Failed to fetch pets: ", error);
      }
    }, 500);
  };

  useEffect(() => {
    const fetchUserAndPets = async () => {
      try {
        await fetchPets();
        if (isLoggedIn) {
          await fetchUser();
        }
      } catch (error) {
        console.error("Failed to fetch user and pets: ", error);
      }
    };

    fetchUserAndPets();
  }, [isLoggedIn]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`http://localhost:3070/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const savedPets = response.data.savedPets;
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          savedPets.includes(pet.id)
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
    } catch (error) {
      console.error("Failed to fetch user: ", error);
    }
  };

  const handleSave = async (petId) => {
    try {
      await axios.post(
        `http://localhost:3070/pet/${petId}/save`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          pet.id === petId
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
    } catch (error) {
      console.error("Failed to save pet: ", error);
    }
  };

  const handleUnsave = async (petId) => {
    try {
      await axios.delete(`http://localhost:3070/pet/${petId}/save`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          pet.id === petId
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
    } catch (error) {
      console.error("Failed to unsave pet: ", error);
    }
  };

  const handleAdopt = async (petId) => {
    try {
      await axios.post(
        `http://localhost:3070/pet/${petId}/adopt`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          pet.id === petId
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
  };

  const handleFoster = async (petId) => {
    try {
      await axios.post(
        `http://localhost:3070/pet/${petId}/adopt`,
        { isFostering: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          pet.id === petId
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
  };

  const handleReturn = async (petId) => {
    try {
      await axios.post(
        `http://localhost:3070/pet/${petId}/return`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPets((oldPets) => {
        const updatedPets = oldPets.map((pet) =>
          pet.id === petId
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
  };

  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(search.toLowerCase()) ||
      pet.type.toLowerCase().includes(search.toLowerCase()) ||
      pet.id.toString().includes(search)
  );

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  return (
    <>
      <h1 className="allpetsh1">Our Lovely Pets</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, type or id"
          value={search}
          onChange={handleSearch}
        />
      </div>
      <div className="all-pets-container">
        {filteredPets.map((pet) => (
          <div className="pet-card" key={pet.id}>
            <img
              className="pet-image"
              src={
                pet.imagePath
                  ? `http://localhost:3070/${pet.imagePath}`
                  : pet.imageUrl
              }
              alt="Pet"
            />
            <div className="pet-details">
              <h2>{pet.name}</h2>
              <p>Type: {pet.type}</p>
              <p>Breed: {pet.breed}</p>
              <p>Age: {pet.age}</p>
              <p>Status: {pet.adoptionStatus}</p>
              <p>Height: {pet.height}</p>
              <p>Weight: {pet.weight}</p>
              <p>Color: {pet.color}</p>
              <p>Hypoallergenic: {pet.hypoallergenic}</p>
              <p>Dietary Restrictions: {pet.dietaryRestrictions}</p>
              {isLoggedIn && (
                <>
                  <button className="button-details">
                    <Link className="button-details1" to={`/mypets/${pet.id}`}>
                      View Details
                    </Link>
                  </button>
                  {pet.adoptionStatus === "Adopted" ||
                  pet.adoptionStatus === "Fostered" ? (
                    <>
                      <button
                        onClick={() => handleReturn(pet.id)}
                        className="button-details"
                      >
                        Return Pet
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAdopt(pet.id)}
                        className="button-details"
                      >
                        Adopt
                      </button>
                      <button
                        onClick={() => handleFoster(pet.id)}
                        className="button-details"
                      >
                        Foster
                      </button>
                    </>
                  )}

                  {pet.savedBy && pet.savedBy.includes(userId) ? (
                    <button
                      className="button-details"
                      onClick={() => handleUnsave(pet.id)}
                    >
                      Unsave
                    </button>
                  ) : (
                    <button
                      className="button-details"
                      onClick={() => handleSave(pet.id)}
                    >
                      Save for Later
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {filteredPets.length === 0 && (
          <BounceLoader className="allpetsbounce" color={"#123abc"} size={60} />
        )}
      </div>
    </>
  );
};

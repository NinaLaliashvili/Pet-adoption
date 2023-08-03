import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./petsviewadmin.css";
import { BounceLoader } from "react-spinners";

export const PetsViewAdmin = () => {
  const [pets, setPets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3070/pet`);
      setPets(response.data);
    } catch (error) {
      console.error("Failed to fetch pets: ", error);
    }
    setLoading(false);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const filteredPets = pets.filter(
    (pet) =>
      (pet.name && pet.name.toLowerCase().includes(search.toLowerCase())) ||
      (pet.type && pet.type.toLowerCase().includes(search.toLowerCase())) ||
      pet.id.toString().includes(search)
  );

  return (
    <div className="users-admin-box">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, id or type"
          value={search}
          onChange={handleSearch}
        />
      </div>
      <h2 className="users-admin-h2">Pets:</h2>
      <div className="users-section">
        {filteredPets.map((pet) => (
          <div className="users-admin-div3 div4" key={pet.id}>
            <div className="img-flex">
              <img
                className="admin-img"
                src={
                  pet.imagePath
                    ? `http://localhost:3070/${pet.imagePath}`
                    : pet.imageUrl
                }
                alt="Pet"
              />
            </div>
            <div className="admin-flex">
              <p className="users-admin-p">ID:{pet.id}</p>
              <p className="users-admin-p">Name:{pet.name}</p>
              <p className="users-admin-p">Type:{pet.type}</p>
              <Link className="link-style" to={`/admin/edit-pet/${pet.id}`}>
                Edit
              </Link>
            </div>
          </div>
        ))}
        {loading && (
          <BounceLoader className="allpetsbounce" color={"#123abc"} size={60} />
        )}
      </div>
    </div>
  );
};

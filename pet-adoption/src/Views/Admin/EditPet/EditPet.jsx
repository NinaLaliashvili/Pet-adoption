import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BounceLoader } from "react-spinners";
import "./editpet.css";

const initialPetState = {
  type: "",
  name: "",
  breed: "",
  age: "",
  adoptionStatus: "",
  color: "",
  weight: "",
  height: "",
  hypoallergenic: "",
  dietaryRestrictions: "",
};

export const EditPet = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [img, setImg] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchPet();
  }, []);

  const fetchPet = async () => {
    try {
      const response = await axios.get(`http://localhost:3070/pet/${id}`);
      console.log("Fetched pet: ", response.data);
      setPet(response.data);
    } catch (error) {
      console.error("Failed to fetch pet: ", error);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImg(file);
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPet({
      ...pet,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    if (img) {
      formData.append("image", img);
    }

    for (let key in pet) {
      formData.append(key, pet[key]);
    }

    try {
      await axios.put(`http://localhost:3070/pet/${id}`, formData);
      setSuccessMessage("Pet updated successfully!");
      setPet(initialPetState);
    } catch (error) {
      console.error("Failed to update pet: ", error);
    }
  };

  if (!pet) {
    return (
      <div className="spinner-container">
        <BounceLoader color={"#123abc"} size={60} />
      </div>
    );
  }

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>
          Pet's Type:
          <input
            type="text"
            name="type"
            value={pet.type}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Pet's Name:
          <input
            type="text"
            name="name"
            value={pet.name}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Pet's Breed:
          <input
            type="text"
            name="breed"
            value={pet.breed}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Pet's Age:
          <input
            type="text"
            name="age"
            value={pet.age}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Pet's Status:
          <input
            type="text"
            name="adoptionStatus"
            value={pet.adoptionStatus}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Pet's Color:
          <input
            type="text"
            name="color"
            value={pet.color}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Pet's Weight:
          <input
            type="text"
            name="weight"
            value={pet.weight}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Pet's Height:
          <input
            type="text"
            name="height"
            value={pet.height}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Hypoallergenic:
          <input
            type="text"
            name="hypoallergenic"
            value={pet.hypoallergenic}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          dietary Restrictions:
          <input
            type="text"
            name="dietaryRestrictions"
            value={pet.dietaryRestrictions}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div className="form-group">
        <label>
          Pet's Image:
          <input type="file" name="image" onChange={handleImageChange} />
        </label>
      </div>
      {successMessage && <p className="success-messsage">{successMessage}</p>}
      <div className="form-group">
        <button className="submit-btn" type="submit">
          Update
        </button>
      </div>
    </form>
  );
};

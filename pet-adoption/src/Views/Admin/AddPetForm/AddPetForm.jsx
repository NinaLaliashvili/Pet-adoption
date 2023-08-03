import React, { useState } from "react";
import axios from "axios";
import "./addpetform.css";

export const AddPetForm = () => {
  const initialPetState = {
    type: "",
    name: "",
    adoptionStatus: "",
    weight: "",
    height: "",
    color: "",
    age: "",
    breed: "",
    hypoallergenic: "",
    dietaryRestrictions: "",
  };

  const [img, setImg] = useState(null);
  const [pet, setPet] = useState(initialPetState);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPet((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("type", pet.type);
    formData.append("name", pet.name);
    formData.append("adoptionStatus", pet.adoptionStatus);
    formData.append("weight", pet.weight);
    formData.append("height", pet.height);
    formData.append("image", img);
    formData.append("color", pet.color);
    formData.append("age", pet.age);
    formData.append("breed", pet.breed);
    formData.append("hypoallergenic", pet.hypoallergenic);
    formData.append("dietaryRestrictions", pet.dietaryRestrictions);

    try {
      const response = await axios.post("http://localhost:3070/pet", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setPet(initialPetState);
      setImg(null);
      setSuccessMessage("Pet added successfully!");
    } catch (error) {
      console.error("Failed to add pet: ", error);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImg(file);
  };
  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Pet's Type:</label>
          <input
            type="text"
            name="type"
            value={pet.type}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Pet's Name:</label>
          <input
            type="text"
            name="name"
            value={pet.name}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>
            Pet's Breed:
            <input
              type="text"
              name="breed"
              value={pet.breed}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Pet's Image:
            <input type="file" name="image" onChange={handleImageChange} />
          </label>
        </div>
        {successMessage && (
          <div className="success-messsage">{successMessage}</div>
        )}
        <button className="submit-btn" type="submit">
          Add
        </button>
      </form>
    </div>
  );
};

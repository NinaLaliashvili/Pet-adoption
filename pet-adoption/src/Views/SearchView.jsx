import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./view.css";

export const SearchView = () => {
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [isAdvancedSearch, setAdvancedSearch] = useState(false);
  const [results, setResults] = useState([]);

  const toggleSearch = () => {
    setAdvancedSearch(!isAdvancedSearch);
  };

  const handleSearch = async (searchParams) => {
    setSearchAttempted(true);
    setResults([]);
    try {
      //to build the query string from the searchParams object
      const queryParams = new URLSearchParams(searchParams).toString();

      const response = await axios.get(
        `http://localhost:3070/pet?${queryParams}`
      );

      //removed client-side filtering
      setResults(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="search-view">
      <h1 className="searchyourpet">Search Your Pet</h1>
      <button onClick={toggleSearch} className="search-toggle">
        {isAdvancedSearch ? "Basic Search" : "Advanced Search"}
      </button>
      {isAdvancedSearch ? (
        <AdvancedSearch onSearch={handleSearch} />
      ) : (
        <BasicSearch onSearch={handleSearch} />
      )}
      <div className="results-container">
        {results.length > 0
          ? results.map((result) => (
              <div key={result._id} className="animal-card">
                <h2 className="h-set2 ">Type:{result.type}</h2>
                <h2 className="h-set2 ">Name: {result.name}</h2>
                <img
                  className="animal-image"
                  src={
                    result.imagePath
                      ? `http://localhost:3070/${
                          result.imagePath.startsWith("/")
                            ? result.imagePath.slice(1)
                            : result.imagePath
                        }`
                      : result.imageUrl
                  }
                  alt="Pet"
                />
                <Link to={`/mypets/${result._id}`}>
                  <button className="see-more-button">See more</button>
                </Link>
              </div>
            ))
          : searchAttempted && <p>There are no pets of this type available.</p>}
      </div>
    </div>
  );
};

const BasicSearch = ({ onSearch }) => {
  const handleFormSubmit = (event) => {
    event.preventDefault();
    const animalType = event.target.elements.animalType.value;
    onSearch({ type: animalType });
  };

  return (
    <form onSubmit={handleFormSubmit} className="basic-search-form">
      <label>
        Type of Animal:
        <input type="text" name="animalType" className="search-input" />
      </label>
      <button type="submit" className="search-button">
        Search
      </button>
    </form>
  );
};

const AdvancedSearch = ({ onSearch }) => {
  const handleFormSubmit = (event) => {
    event.preventDefault();
    let searchParams = {};

    const animalType = event.target.elements.animalType.value;
    if (animalType) {
      searchParams.type = animalType;
    }

    const status = event.target.elements.adoptionStatus.value;
    if (status) {
      searchParams.adoptionStatus = status;
    }

    const minHeight = event.target.elements.height.value;
    if (minHeight) {
      searchParams.minHeight = Number(minHeight);
    }

    const maxHeight = event.target.elements.heightMax.value;
    if (maxHeight) {
      searchParams.maxHeight = Number(maxHeight);
    }

    const weight = event.target.elements.weight.value;
    if (weight) {
      searchParams.weight = Number(weight);
    }

    const name = event.target.elements.name.value;
    if (name) {
      searchParams.name = name;
    }

    onSearch(searchParams);
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="advanced-search-form">
        <label>
          Type of Animal:
          <input type="text" name="animalType" className="search-input" />
        </label>
        <label>
          Adoption Status:
          <select name="adoptionStatus" className="search-input">
            <option value="">Any</option>
            <option value="Available">Available</option>
            <option value="Adopted">Adopted</option>
          </select>
        </label>
        <label>
          Min Height (CM):
          <input type="number" name="height" className="search-input" />
        </label>
        <label>
          Max Height (CM):
          <input type="number" name="heightMax" className="search-input" />
        </label>
        <label>
          Weight:
          <input type="number" name="weight" className="search-input" />
        </label>
        <label>
          Name:
          <input type="text" name="name" className="search-input" />
        </label>
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </>
  );
};

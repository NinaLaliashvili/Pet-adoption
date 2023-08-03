import React, { useState } from "react";
import { MyPetsView } from "./MyPetsView";
import { SavedPetsView } from "./SavedPetsView";

export const PetsView = () => {
  const [isViewingSavedPets, setIsViewingSavedPets] = useState(false);

  const toggleView = () => {
    setIsViewingSavedPets(!isViewingSavedPets);
  };

  return (
    <div>
      <button className="switch" onClick={toggleView}>
        {isViewingSavedPets ? "My Pets" : "Saved Pets"}
      </button>

      {isViewingSavedPets ? <SavedPetsView /> : <MyPetsView />}
    </div>
  );
};

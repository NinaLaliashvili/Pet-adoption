import React, { createContext, useState } from "react";

export const SavedPetsContext = createContext();

export const SavedPetsProvider = ({ children }) => {
  const [savedPets, setSavedPets] = useState(() => {
    const localSavedPets = localStorage.getItem("savedPets");
    return localSavedPets ? JSON.parse(localSavedPets) : [];
  });

  return (
    <SavedPetsContext.Provider value={{ savedPets, setSavedPets }}>
      {children}
    </SavedPetsContext.Provider>
  );
};

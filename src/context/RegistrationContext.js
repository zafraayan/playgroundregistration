import React, { createContext, useState } from "react";

export const RegistrationContext = createContext();

export const RegistrationProvider = ({ children }) => {
  const [regArray, setRegArray] = useState([]);

  // Used to tell Monitoring to fetch the API again
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshRegistrations = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <RegistrationContext.Provider
      value={{
        regArray,
        setRegArray,
        refreshKey,
        refreshRegistrations,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

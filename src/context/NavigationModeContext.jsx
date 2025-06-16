import React, { createContext, useContext, useState } from "react";
export const NavigationModeContext = createContext();
export const useNavigationMode = () => useContext(NavigationModeContext);

export const NavigationModeProvider = ({ children }) => {
  const [mode, setMode] = useState("address");
  return (
    <NavigationModeContext.Provider value={{ mode, setMode }}>
      {children}
    </NavigationModeContext.Provider>
  );
};

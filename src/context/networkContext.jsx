import React, { createContext, useContext, useEffect, useState } from "react";
import * as Network from "expo-network";

const NetworkContext = createContext({ isConnected: true });

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let interval = setInterval(async () => {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected && state.isInternetReachable !== false);
    }, 2000); // vérifie toutes les 2 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};

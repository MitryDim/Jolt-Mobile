import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
export const NavigationModeContext = createContext();
export const useNavigationMode = () => useContext(NavigationModeContext);

export const NavigationModeProvider = ({ children }) => {
  const fetchWithAuth = useFetchWithAuth();
  const [mode, setMode] = useState("address");
  const [favoritesAddresses, setFavorites] = useState([]);
  // Fetch favoris avec gestion du cache local
  const fetchFavorites = async () => {
    try {
      const { data, error, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/favorite-addresses`,
        { method: "GET" },
        { protected: true }
      );

      if (error || status === 0) {
        // Erreur réseau ou status 0 : récupère depuis le cache local
        const cached = await AsyncStorage.getItem("favorites");
        if (cached) {
          setFavorites(JSON.parse(cached));
        }
        return;
      }

      // Succès : mets à jour le cache local
      if (data?.data) {
        setFavorites(data.data);
        await AsyncStorage.setItem("favorites", JSON.stringify(data.data));
      }
    } catch (err) {
      // En cas d'erreur, récupère depuis le cache local
      const cached = await AsyncStorage.getItem("favorites");
      if (cached) {
        setFavorites(JSON.parse(cached));
      }
      console.error("Erreur fetch favorites:", err);
    }
  };

  const addFavorite = async (address) => {
    try {
      const updatedFavorites = [...favoritesAddresses, address];
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  return (
    <NavigationModeContext.Provider
      value={{
        mode,
        favoritesAddresses,
        setMode,
        fetchFavorites,
        addFavorite,
      }}
    >
      {children}
    </NavigationModeContext.Provider>
  );
};

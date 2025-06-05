import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { EXPO_GATEWAY_SERVICE_URL } from "@env"; // Assurez-vous que cette variable d'environnement est définie dans votre fichier .env
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Au démarrage, vérifie si l'utilisateur est déjà connecté
  useEffect(() => {
    const loadUser = async () => {
      const userData = await SecureStore.getItemAsync("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    };
    loadUser();
  }, []);

  const login = async (userData) => {
    console.log("Login pressed", userData);
    await SecureStore.setItemAsync("user", JSON.stringify(userData));
    setUser(userData);
  };
  const logout = async () => {
    const response = await fetch(`${EXPO_GATEWAY_SERVICE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-type": "mobile", // Indique que la requête provient d'une application mobile
        authorization: `Bearer ${user?.accessToken}`, // Utilise le token de l'utilisateur
      },
      body: JSON.stringify({ refreshToken: user?.refreshToken }), // Envoie le refresh token pour la déconnexion
    });

    if (!response.ok) {
      console.log("Erreur lors de la déconnexion :", response.status);
      console.error("Erreur lors de la déconnexion ");
      await SecureStore.deleteItemAsync("user");
      setUser(null);
      return true;
    }

    // Supprime les données de l'utilisateur du stockage sécurisé
    await SecureStore.deleteItemAsync("user");
    setUser(null);
    return true;
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import * as Application from "expo-application";
import * as Device from "expo-device";
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

    if (userData && userData.id) {
      const deviceId =
        Application.getAndroidId ||
        (await Application.getIosIdForVendorAsync()) ||
        Device.osInternalBuildId ||
        "unknown";
      await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/pushToken/attach-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, userId: user.id }),
        },
        { protected: true }
      );
    }
  };
  const logout = async () => {
    fetch(`${EXPO_GATEWAY_SERVICE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-type": "mobile", // Indique que la requête provient d'une application mobile
        authorization: `Bearer ${user?.accessToken}`, // Utilise le token de l'utilisateur
      },
      body: JSON.stringify({ refreshToken: user?.refreshToken }), // Envoie le refresh token pour la déconnexion
    });

    await SecureStore.deleteItemAsync("user");
    setUser(null);
    return true;
  };

  return (
    <UserContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

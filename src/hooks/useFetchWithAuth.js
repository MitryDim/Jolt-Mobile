import { useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { UserContext } from "../context";
import { EXPO_AUTH_SERVICE_URL } from "@env"; // Assurez-vous que cette variable d'environnement est définie dans votre fichier .env
export function useFetchWithAuth() {
  const { user, logout } = useContext(UserContext);
  const fetchWithAuth = async (url, options = {}, opts = {}) => {
    // Si la route est protégée, vérifie le user
    if (opts.protected && (!user || !user.accessToken)) {
      throw new Error("Utilisateur non connecté");
    }

    // Prépare les headers
    const headers = {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "x-client-type" : "mobile", // Indique que la requête provient d'une application mobile
    };
    if (opts.protected && user?.accessToken) {
      headers.Authorization = `Bearer ${user.accessToken}`;
    }

    // Première requête
    let response = await fetch(url, { ...options, headers });

    // Si token invalide et route protégée, tente refresh
    if (
      opts.protected &&
      (response.status === 401 || response.status === 403)
    ) {
      console.warn("Token invalide, tentative de rafraîchissement...");
      const userData = await SecureStore.getItemAsync("user");
      const storedUser = userData ? JSON.parse(userData) : null; 
      const refreshRes = await fetch(
        `${EXPO_AUTH_SERVICE_URL}/auth/refreshToken`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "mobile",
            Authorization: `Bearer ${storedUser?.refreshToken}`, // Utilise l'ancien token pour la requête de rafraîchissement
          } 
        }
      );

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        console.log("Nouveau token reçu :", refreshData);
        const newAccessToken = refreshData?.data?.accessToken;
        console.log("Nouveau accessToken :", newAccessToken);
        const newRefreshToken =
          refreshData?.data?.refreshToken || storedUser.refreshToken;

        // Mets à jour SecureStore
        const newUser = {
          ...storedUser,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        };
        await SecureStore.setItemAsync("user", JSON.stringify(newUser));

        // Relance la requête initiale avec le nouveau token
        headers.Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        await logout();
        throw new Error("Session expirée, veuillez vous reconnecter.");
      }
    }
    console.log("Response status:", response);
    return response;
  };

  return fetchWithAuth;
}

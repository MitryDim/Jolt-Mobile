import { useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { UserContext } from "../context/AuthContext";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import * as Network from "expo-network";

export function useFetchWithAuth() {
  const { user, logout, setUser } = useContext(UserContext);

  const fetchWithAuth = async (url, options = {}, opts = {}) => {
    try {
      // Vérifie la connexion réseau
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        return { data: null, error: "Pas de connexion Internet", status: 0 };
      }

      // Vérifie l'utilisateur pour les routes protégées
      if (opts.protected && (!user || !user.accessToken)) {
        return { data: null, error: "Utilisateur non connecté", status: 401 };
      }

      // Prépare les headers
      const headers = {
        ...(options.headers || {}),
        "x-client-type": "mobile",
      };

      // Ajoute Content-Type seulement si ce n'est pas du FormData
      if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      if (user?.accessToken) {
        headers.Authorization = `Bearer ${user.accessToken}`;
      }

      // Première requête
      let response = await fetch(url, { ...options, headers });

      // Si token invalide et route protégée, tente refresh
      if (
        (opts.protected || user?.accessToken) &&
        (response.status === 401 || response.status === 403)
      ) {
        console.warn("Token invalide, tentative de rafraîchissement");
        const userData = await SecureStore.getItemAsync("user");
        const storedUser = userData ? JSON.parse(userData) : null;
        headers.Authorization = `Bearer ${storedUser?.refreshToken}`;
        const refreshRes = await fetch(
          `${EXPO_GATEWAY_SERVICE_URL}/auth/refreshToken`,
          {
            method: "POST",
            headers: headers,
          }
        );

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData?.data?.accessToken;
          const newRefreshToken =
            refreshData?.data?.refreshToken || storedUser.refreshToken;

          // Mets à jour SecureStore
          const newUser = {
            ...storedUser,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          };
          await SecureStore.setItemAsync("user", JSON.stringify(newUser));
          setUser(newUser); // Met à jour le contexte utilisateur
          // Relance la requête initiale avec le nouveau token
          headers.Authorization = `Bearer ${newAccessToken}`;
          console.log("Token rafraîchi, relance de la requête initiale");
          console.log("newAccessToken:", newAccessToken);
          console.log("headers:", headers);
          response = await fetch(url, { ...options, headers });
        } else {
          console.warn("Échec du rafraîchissement du token, déconnexion");
          await logout();
          return {
            data: null,
            error: "Session expirée, veuillez vous reconnecter.",
            status: 401,
          };
        }
      }

      // Tente de parser la réponse
      let data = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        // Peut arriver si la réponse n'est pas du JSON
        data = null;
      }

      if (!response.ok) {
        return {
          data,
          error: data?.message || "Erreur lors de la requête",
          status: response.status,
        };
      }

      return {
        data,
        error: null,
        status: response.status,
        rawResponse: response,
      };
    } catch (err) {
      // Erreur réseau ou autre
      return {
        data: null,
        error: err.message || "Erreur inconnue",
        status: 0,
      };
    }
  };

  return fetchWithAuth;
}

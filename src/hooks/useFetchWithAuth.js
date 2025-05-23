import { useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { UserContext } from "../context";

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
      const userData = await SecureStore.getItemAsync("user");
      const storedUser = userData ? JSON.parse(userData) : null;
      const refreshRes = await fetch(
        "http://192.168.1.188:5000/auth/refreshToken",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedUser?.refreshToken }),
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

        // Relance la requête initiale avec le nouveau token
        headers.Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        await logout();
        throw new Error("Session expirée, veuillez vous reconnecter.");
      }
    }

    return response;
  };

  return fetchWithAuth;
}

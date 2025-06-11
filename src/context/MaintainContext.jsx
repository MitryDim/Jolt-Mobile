import React, { useContext, useEffect, useRef, useState } from "react";
import { createContext } from "react";
import { UserContext } from "./AuthContext";
import { createSocket } from "../utils/socket"; // ton instance de socket.io-client
import * as SecureStore from "expo-secure-store";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";

export const MaintainContext = createContext();

export const MaintainProvider = ({ children }) => {
  const fetchWithAuth = useFetchWithAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [vehicle, setVehicle] = useState(null);
  const { user,setUser } = useContext(UserContext);
  const socketRef = useRef(null);

  useEffect(() => {
    const restoreVehicle = async () => {
      if (!user) return;
      const savedVehicle = await SecureStore.getItemAsync("selectedVehicle");
      if (savedVehicle) {
        setVehicle(savedVehicle);
      }
    };

    const setupSocket = async () => {
      if (!user) return;
      const jwt = user.accessToken;
      if (!jwt) return;

      // Crée le socket avec le token
      socketRef.current = createSocket(jwt);

      socketRef.current.emit("join", user.id);

      socketRef.current.on("maintain:update", (data) => {
        setPendingCount(data.pendingCount);
      });

      // Gestion du JWT expiré
      socketRef.current.on("unauthorized", async () => {
        console.warn("JWT expiré ou non autorisé, tentative de rafraîchissement...");
        // Tente de refresh le token
        const userData = await SecureStore.getItemAsync("user");
        const storedUser = userData ? JSON.parse(userData) : null;
        if (!storedUser?.refreshToken) {
          logout();
          return;
        }
        // Appel API pour refresh
        const { data, error } = await fetchWithAuth(
          `${process.env.EXPO_GATEWAY_SERVICE_URL}/auth/refreshToken`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-client-type": "mobile",
              Authorization: `Bearer ${storedUser.refreshToken}`,
            },
          }
        );
        console.log("Refresh token response:", data, error);
        if (data?.data?.accessToken) {
          // Mets à jour le user dans SecureStore
          const newUser = {
            ...storedUser,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken || storedUser.refreshToken,
          };
          await SecureStore.setItemAsync("user", JSON.stringify(newUser));
          setUser(newUser); // Met à jour le contexte utilisateur
          // Reconnecte le socket avec le nouveau JWT
          socketRef.current.disconnect();
          socketRef.current = createSocket(newUser.accessToken);
          socketRef.current.emit("join", user.id);
        } else {
          logout();
        }
      });
    };
    restoreVehicle();
    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("maintain:update");
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.emit("vehicle:change", {
        userId: user.id,
        vehicle: vehicle,
      });
    }
  }, [vehicle]);

  const changeVehicle = async (id) => {
    console.log("Changing vehicle to:", id);
    if (user && id) {
      setVehicle(id);
      await SecureStore.setItemAsync("selectedVehicleId", id);
    }
  };

  return (
    <MaintainContext.Provider value={{ pendingCount, changeVehicle, vehicle }}>
      {children}
    </MaintainContext.Provider>
  );
};

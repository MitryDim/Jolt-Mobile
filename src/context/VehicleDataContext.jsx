import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import * as SecureStore from "expo-secure-store";
import { createSocket } from "../utils/socket";
import { UserContext } from "./AuthContext";
export const VehicleDataContext = createContext();

export const VehicleDataProvider = ({ children }) => {
  const fetchWithAuth = useFetchWithAuth();
  const [vehicles, setVehicles] = useState([]);
  const [maintenances, setMaintenances] = useState({});
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vehicleSelected, setVehicleSelected] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const socketRef = useRef(null);
  const { user, setUser, logout } = useContext(UserContext);

  useEffect(() => {
    const restoreVehicle = async () => {
      if (!user) return;
      const savedVehicle = await SecureStore.getItemAsync("selectedVehicle");
      if (savedVehicle) {
        setVehicleSelected(savedVehicle);
      }
    };

    const setupSocket = async () => {
      if (!user) return;
      const jwt = user.accessToken;
      if (!jwt) return;

      socketRef.current = createSocket(jwt, user.id);

      socketRef.current.on("maintain:update", (data) => {
        console?.log("Socket maintain:update received:", data);
        if (data?.pendingCount !== undefined)
          setPendingCount(data.pendingCount);
      });

      // socketRef.current.on("unauthorized", async () => {
      //   // Gestion du JWT expiré
      //   const userData = await SecureStore.getItemAsync("user");
      //   const storedUser = userData ? JSON.parse(userData) : null;
      //   if (!storedUser?.refreshToken) {
      //     // logout(); // à adapter selon ton app
      //     return;
      //   }
      //   const { data, error } = await fetchWithAuth(
      //     `${EXPO_GATEWAY_SERVICE_URL}/auth/refreshToken`,
      //     {
      //       method: "POST",
      //       headers: {
      //         "x-client-type": "mobile",
      //         Authorization: `Bearer ${storedUser.refreshToken}`,
      //       },
      //     }
      //   );
      //   if (data?.data?.accessToken) {
      //     const newUser = {
      //       ...storedUser,
      //       accessToken: data.data.accessToken,
      //       refreshToken: data.data.refreshToken || storedUser.refreshToken,
      //     };
      //     await SecureStore.setItemAsync("user", JSON.stringify(newUser));
      //     setUser(newUser);
      //     socketRef.current.disconnect();
      //     setupSocket();
      //   } else {
      //     logout();
      //   }
      // });
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

  // Fonction pour changer de véhicule
  const changeVehicle = async (vehicle) => {
    if (!vehicle || !user) return;
    setVehicleSelected(vehicle);
    await SecureStore.setItemAsync("selectedVehicle", vehicle);
  };

  useEffect(() => {
    if (socketRef.current) {
      if (!vehicleSelected && !user) return;
      socketRef.current.emit("vehicle:change", {
        userId: user.id,
        vehicle: vehicleSelected,
      });
    }
  }, [vehicleSelected]);

  const fetchAndUpdateVehicles = async () => {
    if (!user) {
      setVehicles([]);
      setVehicleSelected(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/vehicle`,
        { method: "GET" },
        { protected: true }
      );
      console?.log("status:", status, data, error);
      if (status === 0) {
        setLoading(false);
        return;
      }
      if (error) {
        console?.log("Error fetching vehicles:", error);
        setError(error);
        setLoading(false);
        setVehicles([]);
        setVehicleSelected(null);
        return;
      }
      const vehiclesList =
        data?.data?.map((item) => ({
          id: item._id,
          add: false,
          img: item.image,
          title: `${item.brand} ${item.model}`,
          mileage: item.mileage,
          maintains: "",
          firstPurchaseDate: item?.firstPurchaseDate,
          isFavorite: item.isFavorite || false,
        })) || [];

      const vehicleIds = vehiclesList.map((v) => v.id);
      const { data: maintData } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/maintain/count`,
        {
          method: "POST",
          body: JSON.stringify({ vehicleIds }),
        },
        { protected: true }
      );

      const vehiclesWithMaint = vehiclesList.map((vehicle) => {
        const found = maintData?.find((m) => m.vehicleId === vehicle.id);
        return {
          ...vehicle,
          maintains: found ? found.pendingMaintenances : 0,
        };
      });
      vehiclesWithMaint.sort(
        (a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
      );

      setVehicles(vehiclesWithMaint);
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  };

  // Méthodes pour mettre à jour chaque type de donnée
  const updateVehicles = (data) => setVehicles(data);
  const updateMaintenances = (vehicleId, data) =>
    setMaintenances((prev) => ({ ...prev, [vehicleId]: data }));
  const updateHistory = (vehicleId, data) =>
    setHistory((prev) => ({ ...prev, [vehicleId]: data }));

  return (
    <VehicleDataContext.Provider
      value={{
        vehicles,
        vehicleSelected,
        changeVehicle,
        maintenances,
        history,
        updateVehicles,
        updateMaintenances,
        updateHistory,
        fetchAndUpdateVehicles,
        loading,
        error,
        pendingCount,
      }}
    >
      {children}
    </VehicleDataContext.Provider>
  );
};

// Hook d'accès rapide
export const useVehicleData = () => useContext(VehicleDataContext);

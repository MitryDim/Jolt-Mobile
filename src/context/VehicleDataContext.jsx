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
import { UserContext } from "./AuthContext";
import { useVehiclesQuery } from "../queries/useVehiclesQueries";

export const VehicleDataContext = createContext();

export const VehicleDataProvider = ({ children }) => {
  const fetchWithAuth = useFetchWithAuth();
  const [maintenances, setMaintenances] = useState({});
  const [history, setHistory] = useState({});
  const { data: vehicles = [], isLoading, error, refetch } = useVehiclesQuery();
  const [vehicleSelected, setVehicleSelected] = useState(null);
  const [pendingCount, setPendingCount] = useState();

  const { user, setUser, logout } = useContext(UserContext);

  // Fonction pour changer de véhicule
  const changeVehicle = async (vehicle) => {
    if (!vehicle || !user) return;
    setVehicleSelected(vehicle);
  };

  useEffect(() => {
    if (vehicles.length > 0) {
      //recupérer le nombre de maintenances pour tous les véhicules
      const maintainCounts = vehicles.reduce(
        (acc, vehicle) => ({
          ...acc,
          [vehicle.id]: vehicle.maintains || 0,
        }),
        {}
      );
      // Mettre à jour le nombre de maintenances en attente
      const totalPendingCount = Object.values(maintainCounts).reduce(
        (sum, count) => sum + count,
        0
      );
      setPendingCount(totalPendingCount);
    }
  }, [vehicles]);

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
        fetchAndUpdateVehicles: refetch,
        loading: isLoading,
        error,
        pendingCount,
        setPendingCount,
      }}
    >
      {children}
    </VehicleDataContext.Provider>
  );
};

export const useVehicleData = () => useContext(VehicleDataContext);

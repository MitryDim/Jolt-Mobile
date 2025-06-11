import { useState, useCallback } from "react";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";

export function useVehicles() {
  const fetchWithAuth = useFetchWithAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Récupère les véhicules
      const { data, error } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/vehicle`,
        { method: "GET" },
        { protected: true }
      );
      if (error) {
        setError(error);
        setVehicles([]);
        setLoading(false);
        return;
      }
      console.log("🚀 ~ file: useVehicles.js:20 ~ fetchVehicles ~ data:", data);
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

      // 2. Récupère le nombre de maintenances pour chaque véhicule
      const vehicleIds = vehiclesList.map((v) => v.id);
      const { data: maintData } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/maintain/count`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleIds }),
        },
        { protected: true }
      );

      // 3. Associe le nombre de maintenances à chaque véhicule
      const vehiclesWithMaint = vehiclesList.map((vehicle) => {
        const found = maintData?.find((m) => m.vehicleId === vehicle.id);
        return {
          ...vehicle,
          maintains: found ? found.pendingMaintenances : 0,
        };
      });
      // Trie pour mettre le favori en premier
      vehiclesWithMaint.sort(
        (a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
      );

      setVehicles(vehiclesWithMaint);
    } catch (e) {
      setError(e);
      setVehicles([]);
    }
    setLoading(false);
  }, [fetchWithAuth]);

  return { vehicles, loading, error, fetchVehicles };
}

import { useQuery } from "@tanstack/react-query";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";

export const useVehicles = () => {
  const fetchWithAuth = useFetchWithAuth();

  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      // 1. Récupère les véhicules
      const { data, error, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/vehicle`,
        { method: "GET" },
        { protected: true }
      );

      if (error || status !== 200) {
        throw new Error(error || "Erreur lors du chargement des véhicules");
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

      // 2. Récupère les maintenances associées
      const vehicleIds = vehiclesList.map((v) => v.id);
      const { data: maintData, error: maintError } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/maintain/count`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleIds }),
        },
        { protected: true }
      );

      if (maintError) {
        throw new Error(maintError);
      }

      // 3. Associe les maintenances
      const vehiclesWithMaint = vehiclesList.map((vehicle) => {
        const found = maintData?.find((m) => m.vehicleId === vehicle.id);
        return {
          ...vehicle,
          maintains: found ? found.pendingMaintenances : 0,
        };
      });

      // Trie pour mettre les favoris en premier
      vehiclesWithMaint.sort(
        (a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
      );

      return vehiclesWithMaint;
    },
    staleTime: 5 * 60 * 1000,
  });
};

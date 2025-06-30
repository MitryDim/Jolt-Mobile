import { useQuery } from "@tanstack/react-query";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";

export const useNavigateQuery = (params = "", options = {}) => {
  const fetchWithAuth = useFetchWithAuth();
  return useQuery({
    queryKey: ["navigate", params],
    queryFn: async ({ signal }) => {
      // Vérifie si les paramètres sont valides
      if (params && typeof params !== "string") {
        throw new Error("Les paramètres doivent être une chaîne de caractères");
      }

      const { data, error, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate${params}`,
        { method: "GET" }
      );

      if (error || status !== 200) {
        throw new Error(error || "Erreur lors du chargement des navigations");
      }

      return data?.data?.navigations || [];
    },
    staleTime: 0,
    initialData: [],
    keepPreviousData: true,
    ...options,
  });
};

import { useQuery } from "@tanstack/react-query";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";

export const useNavigateQuery = (params = "") => {
  const fetchWithAuth = useFetchWithAuth();

  return useQuery({
    queryKey: ["navigate", params],
    queryFn: async ({ signal }) => {
      const { data, error, status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate${params}`,
        { protected: true }
      );

      if (error || status !== 200) {
        throw new Error(error || "Erreur lors du chargement des navigations");
      }

      return data?.data?.navigations || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes de cache local par appareil
    initialData: [],
    keepPreviousData: true,
  });
};

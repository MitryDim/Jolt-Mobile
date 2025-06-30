import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVehicleData } from "../context/VehicleDataContext";

const groupByMileage = (history) => {
  const grouped = {};
  history.forEach((item) => {
    if (!grouped[item.mileage]) grouped[item.mileage] = [];
    grouped[item.mileage].push(item);
  });
  return Object.entries(grouped)
    .sort((a, b) => b[0] - a[0])
    .map(([mileage, items]) => ({ mileage, items }));
};

const MaintainHistoryScreen = ({ route }) => {
  const { vehicle } = route.params;
  const fetchWithAuth = useFetchWithAuth();
  const { history, updateHistory } = useVehicleData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const { data,status } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/maintainHistory?vehicleId=${vehicle.id}`,
        { method: "GET" },
        { protected: true }
      );
      if (status === 304 && history[vehicle.id]) {
        // On garde l'historique déjà en mémoire
        setLoading(false);
        return;
      }
      if (data?.data) {
        updateHistory(vehicle.id, data.data); // Mets à jour le contexte
      }
      setLoading(false);
    };
    if (vehicle?.id) fetchHistory();
  }, [vehicle]);

  if (loading) {
    return <ActivityIndicator className="mt-10" />;
  }

  const historyData = history[vehicle.id] || [];
  if (!historyData.length) {
    return <Text className="text-center mt-10">Aucun historique trouvé.</Text>;
  }

  const groupedHistory = groupByMileage(historyData);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={groupedHistory}
        keyExtractor={(item) => item.mileage.toString()}
        renderItem={({ item }) => (
          <View className="bg-gray-100 rounded-xl p-4 mb-6 shadow-sm">
            <Text className="font-bold text-lg text-gray-800 mb-2">
              À {item.mileage} km
            </Text>
            <View className="h-px bg-gray-300 mb-3" />
            {item.items.map((maint, idx) => (
              <View key={maint._id || idx}>
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-base text-gray-700">
                    {maint.type?.name || "Type inconnu"}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {new Date(maint.date || maint.createdAt).toLocaleDateString(
                      "fr-FR"
                    )}
                  </Text>
                </View>
                {idx < item.items.length - 1 && (
                  <View className="h-px bg-gray-200 my-2" />
                )}
              </View>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default MaintainHistoryScreen;

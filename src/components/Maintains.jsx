import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState, useCallback } from "react";
import Card from "./Cards";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import WearBar from "./WearBar";
import { useVehicleData } from "../context/VehicleDataContext";
const Maintains = ({ vehicle }) => {
  const navigation = useNavigation();
  const fetchWithAuth = useFetchWithAuth();
  const { maintenances, updateMaintenances } = useVehicleData();
  const [loading, setLoading] = useState(false);

  // Récupère les maintenances du contexte
  const maintains = maintenances[vehicle?.id] || [];

  const fetchMaintains = async () => {
    if (!vehicle?.id) return;
    setLoading(true);
    const { data, status } = await fetchWithAuth(
      `${EXPO_GATEWAY_SERVICE_URL}/maintain?vehicleId=${vehicle.id}`,
      { method: "GET" },
      { protected: true }
    );
    if (status === 200 && data?.data) {
      updateMaintenances(vehicle.id, data.data); // Mets à jour le contexte
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchMaintains();
    }, [vehicle])
  );

  const maintainsToDo = maintains.filter(
    (m) => Math.round(m.wearPercentage) >= 100
  );
  const maintainsIncoming = maintains.filter(
    (m) => Math.round(m.wearPercentage) < 100
  );

  return (
    <ScrollView className="flex ">
      {/* Section Entretiens à faire */}
      {maintainsToDo.length > 0 && (
        <>
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 16,
              marginTop: 10,
            }}
          >
            Entretiens à faire
          </Text>
          <ScrollView
            horizontal
            style={{ height: 170, marginTop: 10 }}
            showsHorizontalScrollIndicator={false}
          >
            {loading ? (
              <Text style={{ margin: 20 }}>Chargement...</Text>
            ) : maintainsToDo.length === 0 ? (
              <Text style={{ margin: 20 }}>Aucun entretien à faire</Text>
            ) : (
              maintainsToDo.map((maintain, idx) => (
                <Card
                  key={maintain._id || idx}
                  cardWidth={150}
                  cardHeight={150}
                  add={false}
                  onPress={() => {
                    navigation.navigate("MaintainDetail", {
                      maintain,
                      vehicle,
                    });
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          top: 6,
                          textAlign: "center",
                        }}
                      >
                        {maintain.name || "Entretien"}
                      </Text>
                      <View
                        style={{
                          width: "100%",
                          height: 90,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <WearBar percent={maintain.wearPercentage || 0} />
                      </View>
                    </View>
                    {/* Séparateur */}
                    <View
                      style={{
                        borderTopWidth: 1,
                        borderColor: "#eee",
                        marginTop: 4,
                      }}
                    />
                    {/* Bouton voir */}
                    <TouchableOpacity
                      key={maintain._id || idx}
                      style={{ alignItems: "center", paddingVertical: 4 }}
                    >
                      <Text
                        style={{
                          color: "#007bff",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        voir
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* Section Entretiens à venir */}
      <Text
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 16,
          marginTop: 20,
        }}
      >
        Entretiens à venir
      </Text>
      <View style={{ marginTop: 10 }}>
        {loading ? (
          <Text style={{ margin: 20 }}>Chargement...</Text>
        ) : maintainsIncoming.length === 0 ? (
          <Text style={{ margin: 20 }}>Aucun entretien à venir</Text>
        ) : (
          maintainsIncoming.map((maintain, idx) => (
            <TouchableOpacity
              key={maintain._id || idx}
              onPress={() =>
                navigation.navigate("MaintainDetail", { maintain, vehicle })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderColor: "#eee",
                backgroundColor: "#fff",
              }}
            >
              <Text style={{ fontWeight: "600", flex: 1 }}>
                {maintain.name || "Entretien"}
              </Text>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <WearBar percent={maintain.wearPercentage || 0} />
              </View>

              <Text style={{ fontSize: 20, color: "#888", marginLeft: 8 }}>
                {">"}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default Maintains;

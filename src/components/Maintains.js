import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import Card from "./Cards";
import { useNavigation } from "@react-navigation/native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useFetchWithAuth } from "../hooks/useFetchWithAuth";
import { MaintainContext } from "../context/MaintainContext";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";

const Maintains = ({ vehicle }) => {
  const navigation = useNavigation();
  const fetchWithAuth = useFetchWithAuth(); 
  const [maintains, setMaintains] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMaintains = async () => {
      if (!vehicle?.id) return;
      setLoading(true);
      const { data } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/maintain?vehicleId=${vehicle.id}`,
        { method: "GET" },
        { protected: true }
      );
      if (data?.data) setMaintains(data.data);
      setLoading(false);
    };
    fetchMaintains();
  }, [vehicle]);
  function WearBar({ percent }) {
    const colors = ["#00cc44", "#ffaa00", "#ff3333"];
    const rectWidth = 30;
    const totalWidth = rectWidth * colors.length;

    const clampedPercent = Math.max(0, Math.min(100, percent));

    // pourcentage couvert par un rectangle
    const percentPerRect = 100 / colors.length;

    return (
      <View
        style={{ alignItems: "center", marginVertical: 8, width: totalWidth }}
      >
        {/* Flèche */}
        <View style={{ height: 22, width: "100%", position: "relative" }}>
          <Text
            style={{
              position: "absolute",
              left: (clampedPercent / 100) * totalWidth - 10,
              fontSize: 20,
              zIndex: 1,
              width: 20,
              textAlign: "center",
            }}
          >
            ▼
          </Text>
        </View>

        {/* Rectangles avec remplissage */}
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          {colors.map((color, i) => {
            // Pourcentage atteint dans ce rectangle
            const minPercent = i * percentPerRect;
            const maxPercent = (i + 1) * percentPerRect;

            let fillPercent = 0;
            if (clampedPercent >= maxPercent) {
              fillPercent = 100;
            } else if (clampedPercent > minPercent) {
              fillPercent =
                ((clampedPercent - minPercent) / percentPerRect) * 100;
            }

            return (
              <View
                key={i}
                style={{
                  width: rectWidth,
                  height: 18,
                  backgroundColor: "#ccc",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: "#999",
                  overflow: "hidden",
                  marginHorizontal: 0,
                }}
              >
                <View
                  style={{
                    width: `${fillPercent}%`,
                    height: "100%",
                    backgroundColor: color,
                  }}
                />
              </View>
            );
          })}
        </View>

        {/* Texte du pourcentage */}
        <Text style={{ marginTop: 6, fontWeight: "bold" }}>
          {Math.round(clampedPercent)} %
        </Text>
      </View>
    );
  }

  function getProgressColor(percent) {
    const p = Math.round(percent);
    if (p >= 100) {
      return "rgb(255,0,0)";
    }
    if (p <= 50) {
      const ratio = p / 50;
      const r = Math.round(255 * ratio);
      const g = Math.round(255 - 85 * ratio);
      return `rgb(${r},${g},0)`;
    } else {
      const ratio = (p - 50) / 50;
      const r = 255;
      const g = Math.round(170 - 170 * ratio);
      return `rgb(${r},${g},0)`;
    }
  }

  const maintainsToDo = maintains.filter(
    (m) => Math.round(m.wearPercentage) >= 100
  );
  const maintainsIncoming = maintains.filter(
    (m) => Math.round(m.wearPercentage) < 100
  );

  // Fonction pour remettre à zéro (à adapter selon ton API)
  const resetMaintain = async (maintainId) => {
    // Exemple d'appel API pour reset
    await fetchWithAuth(
      `${EXPO_GATEWAY_SERVICE_URL}/maintain/reset/${maintainId}`,
      { method: "POST" },
      { protected: true }
    );
    // Refresh la liste
    const { data } = await fetchWithAuth(
      `${EXPO_GATEWAY_SERVICE_URL}/maintain?vehicleId=${vehicle.id}`,
      { method: "GET" },
      { protected: true }
    );
    if (data?.data) setMaintains(data.data);
  };

  return (
    <ScrollView className="flex " >
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
                      onPress={() => resetMaintain(maintain._id)}
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
              onPress={() => resetMaintain(maintain._id)}
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

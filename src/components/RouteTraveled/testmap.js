import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Modal,
  PanResponder,
} from "react-native";
import { formatDistance, formatElapsedTime } from "./utils";
import MapView, { Polyline, Marker } from "react-native-maps";
import IconComponent from "../Icons";
import { CenterRegion } from "./functions";

import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import ChartWithSlider from "../ChartWithSlider";

const TrackingDetailsScreen = ({ route }) => {
  const { data } = route.params;
  const trackingData = data;

  const points = Array.isArray(trackingData.gpxPoints)
    ? trackingData.gpxPoints.map((pt) => ({
        latitude: pt.lat ?? pt.latitude,
        longitude: pt.lon ?? pt.longitude,
        speed: pt.speed ?? pt.vitesse ?? 0,
        altitude: pt.altitude ?? 0,
      }))
    : [];

  let elapsedTime = 0;
  if (trackingData.startTime && trackingData.endTime) {
    elapsedTime =
      (new Date(trackingData.endTime).getTime() -
        new Date(trackingData.startTime).getTime()) /
      1000;
  }

  // Pour les courbes
  const speedArr = points.map((pt) => pt.speed ?? 0);
  const altitudeArr = points.map((pt) => pt.altitude ?? 0);

  // Modal & Tabs
  const [modalVisible, setModalVisible] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [routes] = useState([
    { key: "speed", title: "Courbe de vitesse" },
    { key: "altitude", title: "Courbe d'altitude" },
  ]);

  const renderScene = SceneMap({
    speed: () => (
      <View style={{ flex: 1 }}>
        <ChartWithSlider
          label={"speed"}
          data={speedArr}
          color="#2563eb"
          unit="km/h"
        />
      </View>
    ),
    altitude: () => (
      <View style={{ flex: 1 }}>
        <ChartWithSlider
          label={"altitude"}
          data={altitudeArr}
          color="#22c55e"
          unit="m"
        />
      </View>
    ),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ flexDirection: "column", flex: 1 }}>
        <View style={styles.container}>
          {trackingData ? (
            <>
              <View style={styles.row}>
                <IconComponent
                  icon="map-marker-distance"
                  library="MaterialCommunityIcons"
                  size={30}
                  color="#000"
                />
                <Text style={styles.value}>
                  {formatDistance(trackingData?.totalDistance)}
                </Text>
              </View>
              <View style={styles.row}>
                <IconComponent
                  library={"Ionicons"}
                  name="timer-outline"
                  size={30}
                  color="#000"
                />
                <Text style={styles.value}>
                  {formatElapsedTime(elapsedTime)}
                </Text>
              </View>
              <View style={styles.row}>
                <IconComponent
                  library={"MaterialCommunityIcons"}
                  name="speedometer"
                  size={30}
                  color="#000"
                />
                <Text style={styles.value}>
                  {trackingData?.speedMax
                    ? `${Math.round(trackingData.speedMax)} KM/H`
                    : ""}
                </Text>
              </View>
              <View style={styles.row}>
                <IconComponent
                  library={"AntDesign"}
                  name="calendar"
                  size={30}
                  color="#000"
                />
                <Text style={styles.value}>
                  {trackingData?.startTime
                    ? new Date(trackingData.startTime).toLocaleString()
                    : ""}
                </Text>
              </View>
              <View style={styles.row}>
                <IconComponent
                  library={"AntDesign"}
                  name="calendar"
                  size={30}
                  color="#000"
                />
                <Text style={styles.value}>
                  {trackingData?.endTime
                    ? new Date(trackingData.endTime).toLocaleString()
                    : ""}
                </Text>
              </View>
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Voir les courbes</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginBottom: 16 }}>
          {points.length > 0 && (
            <MapView style={styles.map} initialRegion={CenterRegion(points)}>
              <Marker coordinate={points[0]} title="Départ" pinColor="green" />
              <Marker
                coordinate={points[points.length - 1]}
                title="Arrivée"
                pinColor="red"
              />
              <Polyline
                coordinates={points}
                strokeWidth={3}
                strokeColor="#2563eb"
              />
            </MapView>
          )}
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TabView
                style={{ flex: 1, width: "100%", height: "100%" }}
                navigationState={{ index: tabIndex, routes }}
                renderScene={renderScene}
                onIndexChange={setTabIndex}
                renderTabBar={(props) => (
                  <TabBar
                    {...props}
                    indicatorStyle={{ backgroundColor: "#2563eb" }}
                    style={{
                      backgroundColor: "#f1f5f9",
                      borderRadius: 16,
                      margin: 8,
                    }}
                    activeColor="#2563eb"
                    inactiveColor="#6b7280"
                    renderIndicator={() => null}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setTabIndex(0);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default TrackingDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    width: Dimensions.get("window").width / 3 - 20,
  },
  value: { marginLeft: 10, fontSize: 16 },
  map: {
    height: 220,
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 24,
    margin: 16,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30,41,59,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 0.9,
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 16,
  },
  chartContainer: {
    position: "relative",
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  chartTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#2563eb",
    marginBottom: 8,
    textAlign: "center",
  },
  chart: {
    borderRadius: 16,
  },
  animatedDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#f59e42",
    borderWidth: 2,
    borderColor: "#fff",
    position: "absolute",
  },
  maxDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#fff",
    position: "absolute",
  },
  tooltip: {
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 8,
    position: "absolute",
    top: -32,
    left: -16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tooltipText: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 14,
  },
  sliderLabel: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
  },
});

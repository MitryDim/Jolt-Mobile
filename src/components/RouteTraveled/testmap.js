import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { formatDistance, formatElapsedTime } from "./utils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Polyline, Marker } from "react-native-maps";
import IconComponent from "../Icons";
import { CenterRegion } from "./functions";

const TrackingDetailsScreen = ({ route }) => {
  const { data } = route.params; // Récupérer l'élément passé en paramètre
  const trackingData = data;
  const insets = useSafeAreaInsets();

  //TODO REPLACE THIS WITH REAL DATA

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
                  {formatDistance(trackingData?.distance)}
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
                  {formatElapsedTime(trackingData?.elapsedTime)}
                </Text>
              </View>
              <View style={styles.row}>
                <IconComponent
                  library={"MaterialCommunityIcons"}
                  name="speedometer"
                  size={30}
                  color="#000"
                />
                <Text style={styles.value}>{trackingData?.maxSpeed} KM/H</Text>
              </View>
              <View style={styles.row}>
                <IconComponent
                  library={"AntDesign"}
                  name="calendar"
                  size={30}
                  color="#000"
                />
                <Text style={styles.value}>{trackingData?.startTime}</Text>
              </View>
              <View style={styles.row}>
                <IconComponent
                  library={"AntDesign"}
                  name="calendar"
                  size={30}
                  color="#000"
                />
                <Text style={styles.value}>{trackingData?.stopTime}</Text>
              </View>
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          {trackingData && trackingData.positions && (
            <MapView // Ajustez le style selon vos besoins
              style={{ flex: 1, height: "100%" }}
              initialRegion={CenterRegion(trackingData.positions)}
            >
              {/* Ajouter un marqueur de départ */}
              <Marker
                coordinate={{
                  latitude: trackingData.positions[0].latitude,
                  longitude: trackingData.positions[0].longitude,
                }}
                title="Départ"
                description="Point de départ du trajet"
                pinColor="green" // Couleur du marqueur
              />

              {/* Ajouter un marqueur d'arrivée */}
              <Marker
                coordinate={{
                  latitude:
                    trackingData.positions[trackingData.positions.length - 1]
                      .latitude,
                  longitude:
                    trackingData.positions[trackingData.positions.length - 1]
                      .longitude,
                }}
                title="Arrivée"
                description="Point d'arrivée du trajet"
                pinColor="red" // Couleur du marqueur
              />
              <Polyline
                coordinates={trackingData.positions.map((pos) => ({
                  latitude: pos.latitude,
                  longitude: pos.longitude,
                }))}
                strokeWidth={3}
                strokeColor="#00F" // Couleur de la ligne du trajet
              />
            </MapView>
          )}n   
        </View>
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
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    width: Dimensions.get("window").width / 3 - 20,
  },
  label: {
    fontWeight: "bold",
    marginRight: 10,
  },
  value: { marginLeft: 10, fontSize: 16 },
  map: {
    height: "100%", // Ajustez la hauteur de la carte selon vos besoins
  },
});

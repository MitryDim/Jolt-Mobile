import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
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
        <View className="p-6">
          {trackingData ? (
            <>
              <View style={styles.row}>
                <IconComponent
                  icon="timer-sand"
                  library="MaterialCommunityIcons"
                  size={20}
                />

                <Text style={styles.label}>Distance parcouru :</Text>
                <Text style={styles.value}>
                  {formatDistance(trackingData?.distance)}
                </Text>
              </View>
              <View style={styles.row}>
                <IconComponent
                  icon="map-marker-distance"
                  library="MaterialCommunityIcons"
                  size={20}
                />
                <Text style={styles.label}>Temps du ride :</Text>
                <Text style={styles.value}>
                  {formatElapsedTime(trackingData?.elapsedTime)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Vitesse max atteinte :</Text>
                <Text style={styles.value}>{trackingData?.maxSpeed} KM/H</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date et heure de départ :</Text>
                <Text style={styles.value}>{trackingData?.startTime}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date et heure de d'arrivée :</Text>
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
          )}
        </View>

        {/* <View className="absolute top-16 left-4  border-2 border-gray-500 rounded-full bg-white ">
          <IconComponent
            library="AntDesign"
            name="arrowleft"
            color="grey"
            style={{ borderRadius: 20, overflow: "hidden" }}
            size={30}
            onPress={() => navigation.goBack()}
          />
        </View> */}
      </View>
    </SafeAreaView>
  );
};

export default TrackingDetailsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginRight: 10,
  },
  value: {},
  map: {
    height: "100%", // Ajustez la hauteur de la carte selon vos besoins
  },
});

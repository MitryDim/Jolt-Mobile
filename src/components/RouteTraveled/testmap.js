import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { formatDistance, formatElapsedTime } from "./utils";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Polyline, Marker } from "react-native-maps";
import IconComponent from "../Icons";
import { useNavigation } from "@react-navigation/native";

const TrackingDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Simuler des données si trackingData est null
  const trackingData = {
    distance: Math.random() * 100, // Distance aléatoire entre 0 et 100
    elapsedTime: Math.floor(Math.random() * 3600), // Temps écoulé aléatoire entre 0 et 3600 secondes
    maxSpeed: Math.floor(Math.random() * 50), // Vitesse maximale aléatoire entre 0 et 50 km/h
    startTime: new Date().toLocaleString(), // Date et heure actuelles
    stopTime: new Date().toLocaleString(), // Date et heure actuelles
    positions: [
      {
        latitude: 37.7749 + Math.random() * 0.1, // Latitude aléatoire autour de San Francisco
        longitude: -122.4194 + Math.random() * 0.1, // Longitude aléatoire autour de San Francisco
      },
      {
        latitude: 37.7749 + Math.random() * 0.1,
        longitude: -122.4194 + Math.random() * 0.1,
      },
      // Ajoutez plus de positions si nécessaire
    ],
  };

  console.log("trackingData1 ", JSON.stringify(trackingData));

  return (
    <View style={{ flex: 1, marginBottom: 60, paddingBottom: insets.bottom }}>
      {/* <View style={styles.container}>
          {trackingData ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Distance parcouru :</Text>
                <Text style={styles.value}>
                  {formatDistance(trackingData?.distance)}
                </Text>
              </View>
              <View style={styles.row}>
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
        </View> */}
      {trackingData && trackingData.positions && (
        <>
          <MapView
            style={styles.map} // Ajustez le style selon vos besoins
            initialRegion={{
              // Définissez la région initiale de la carte
              latitude: trackingData.positions[0].latitude,
              longitude: trackingData.positions[0].longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
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
          <Pressable
            className="absolute top-16 left-4 border-2 border-gray-500 rounded-full w-10 h-10"
            onPress={() => navigation.goBack()}
          >
            <IconComponent
              library="AntDesign"
              name="arrowleft"
              color="grey"
              className="bg-white rounded-full"
              size={30}
            />
          </Pressable>
        </>
      )}
    </View>
  );
};

export default TrackingDetailsScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Utilisé pour permettre le défilement
    marginBottom: 130,
  },
  container: {
    flex: 1,
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
  map: {
    flex: 1,
    height: "100%", // Ajustez la hauteur de la carte selon vos besoins
  },
});

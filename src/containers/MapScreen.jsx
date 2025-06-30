import React, { useRef, useState, useEffect, useMemo, use } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import MapContainer from "../components/Maps/MapContainer";
import AddressBottomSheet from "../components/AddressBottomSheet";
import LoadingOverlay from "../components/LoadingOverlay";
import ItineraryBottomSheet from "../components/Maps/BottomSheet/ItineraryBottomSheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigationMode } from "../context/NavigationModeContext";
import { AnimatedPositionContext } from "../context/AnimatedPositionContext";
const SCREEN_HEIGHT = Dimensions.get("window").height;
const BASE_REFERENCE_HEIGHT = 1920; // référence pour un écran complet sans bottomsheet

const MapScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [sheetIndex, setSheetIndex] = useState(0);
  const {
    mode = "address",
    fromAddress = "",
    initialRouteOptions = [],
    userSpeed = 0,
    currentRegion = null,
    showManeuver = false,
    isLoading = false,
    arrivalTimeStr,
    remainingTimeInSeconds,
    currentInstruction,
    distance,
    infoTravelAnimatedStyle,
    isNavigating = true,
    socketId,
  } = route.params || {};
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const bottomSheetRef = useRef(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(
    route.params?.selectedRouteIndex || 0
  );
  const { setMode } = useNavigationMode();
  const animatedPositionRef = useRef(null);

  const handleComponent = ({ animatedPosition: ap }) => {
    animatedPositionRef.current = ap;
  };

  useEffect(() => {
    console.log("MapScreen mode changed to:", mode);
    setMode(mode);
  }, [mode]);
  useEffect(() => {
    console.log("MapScreen rendered with mode:", mode);

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let location = await Location.getLastKnownPositionAsync({
        requiredAccuracy: Location.Accuracy.BestForNavigation,
        maxAge: 5000,
      });
      if (!location)
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });

      setUserLocation(location.coords);


    })();

    // return () => subscription?.remove();
  }, []);

  const handleSheetChange = (open) => {
    if (!open) {
      bottomSheetRef.current?.snapToIndex(0); // Ouvre au premier snap point
    } else {
      bottomSheetRef.current?.close(); // Ferme le sheet
    }
  };

  const onSheetChange = (index) => {
    setSheetIndex(index);
    const windowHeight = Dimensions.get("window").height;

    // Padding dynamique selon la position du BottomSheet
    let bottomPadding = 80;
    let topPadding = 100;

    if (index === 1) {
      // 50%
      bottomPadding = windowHeight * 0.25;
      topPadding = 60;
    }
    if (index === 2) {
      // 95%
      bottomPadding = windowHeight * 0.50;
      topPadding = 20;
    }

    if (mapRef.current && initialRouteOptions.length > 0) {
      const allCoords = initialRouteOptions.map((r) => r.coordinates).flat();
      mapRef.current.fitToCoordinates(allCoords, {
        edgePadding: {
          top: topPadding,
          right: 80,
          bottom: bottomPadding,
          left: 80,
        },
        animated: true,
      });
    }
  };
  // Fonction utilitaire pour convertir un décalage en pixels en latitude
  function getOffsetLatitude(latitude, offsetY, windowHeight) {
    // 1° de latitude ≈ 111km, donc 1px ≈ (region.latitudeDelta / windowHeight) degrés
    // On décale vers le nord (haut) donc on ajoute
    const latitudeDeltaPerPixel = 0.01 / windowHeight;
    return latitude + latitudeDeltaPerPixel * offsetY;
  }
  const renderModeSpecificUI = () => {
    if (mode === "address") {
      return (
        <AddressBottomSheet
          userLocation={userLocation}
          bottomSheetRef={bottomSheetRef}
          onSelectAddress={(routeLabel, routeOptions) => {
            navigation.navigate("MapScreen", {
              key: String(Date.now()),
              mode: "itinerary",
              initialRouteOptions: routeOptions,
              fromAddress: routeLabel,
              isNavigating: false,
            });
          }}
          handleComponent={handleComponent}
          //onSheetHeightChange={(height) => setSheetHeight(height)}
          navigation={navigation}
        />
      );
    }

    if (mode === "itinerary") {
      return (
        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
        >
          <ItineraryBottomSheet
            routes={initialRouteOptions}
            selectedRouteIndex={selectedRouteIndex}
            onRouteSelect={setSelectedRouteIndex}
            bottomSheetRef={bottomSheetRef}
            handleGoButtonPress={() => {
              // Navigation vers le mode travel avec les options nécessaires
              navigation.navigate("MapScreen", {
                key: String(Date.now()),
                mode: "travel",
                initialRouteOptions: initialRouteOptions,
                selectedRouteIndex: selectedRouteIndex,
                showManeuver: true,
                isNavigating: true,
                // Ajoute ici d'autres paramètres si besoin
              });
            }}
            onChange={onSheetChange}
          />
        </View>
      );
    }

    if (mode === "travel") {
      return (
        <View style={StyleSheet.absoluteFill}>
          {isLoading && (
            <LoadingOverlay>
              <Text style={{ color: "white" }}>
                Recherche d’un nouvel itinéraire…
              </Text>
            </LoadingOverlay>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white">
      <AnimatedPositionContext.Provider value={animatedPositionRef}>
        <View
          className={`flex ${
            mode == "itinerary" || mode == "travel" ? "" : "mb-[60px]"
          }`}
        >
          <MapContainer
            ref={mapRef}
            key={mode}
            mode={mode}
            initialRouteOptions={initialRouteOptions}
            selectedRouteIndex={selectedRouteIndex}
            isNavigating={isNavigating}
            currentRegion={userLocation}
            showManeuver={showManeuver}
            styleMaps={styles.map}
            onPolylineSelect={(index) =>
              console.log("Polyline selected:", index)
            }
            handleSheetClose={handleSheetChange}
            sheetOffsetValue={sheetHeight}
            bottomSheetRef={bottomSheetRef}
            infoTravelAnimatedStyle={infoTravelAnimatedStyle}
            handleComponent={handleComponent}
            socketId={socketId}
          />
          {renderModeSpecificUI()}
        </View>
      </AnimatedPositionContext.Provider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 75 },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default MapScreen;

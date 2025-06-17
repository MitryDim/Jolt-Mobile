import React, { useRef, useState, useEffect, useMemo, use } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Location from "expo-location";
import MapContainer from "../components/Maps/MapContainer";
import AddressBottomSheet from "../components/AddressBottomSheet";
import ItinerarySuggestions from "../components/Maps/ItinerarySuggestions";
import ManeuverOverlay from "../components/Maps/ManeuverOverlay";
import LoadingOverlay from "../components/LoadingOverlay";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import ItineraryBottomSheet from "../components/Maps/BottomSheet/ItineraryBottomSheet";
import HeaderMap from "../components/Maps/HeaderMap";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigationMode } from "../context/NavigationModeContext";
const SCREEN_HEIGHT = Dimensions.get("window").height;
const BASE_REFERENCE_HEIGHT = 1920; // référence pour un écran complet sans bottomsheet

const MapScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const snapPoints = useMemo(() => ["10%", "25%", "95%"], []);
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
  } = route.params || {};

  const [userLocation, setUserLocation] = useState(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const bottomSheetRef = useRef(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(
    route.params?.selectedRouteIndex || 0
  );
  const { setMode } = useNavigationMode();
  useEffect(() => {
    setMode(mode);
  }, [mode]);
  useEffect(() => {
    console.log("MapScreen rendered with mode:", mode);
    let subscription;
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

      // subscription = await Location.watchPositionAsync(
      //   {
      //     accuracy: Location.Accuracy.Highest,
      //     timeInterval: 1000,
      //     distanceInterval: 2,
      //   },
      //   (location) => {
      //     setUserLocation(location.coords);
      //   }
      // );
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
  const screenHeightRatio = useMemo(() => {
    if (!sheetHeight || sheetHeight < 50) {
      return SCREEN_HEIGHT / BASE_REFERENCE_HEIGHT;
    }
    return (SCREEN_HEIGHT - sheetHeight) / SCREEN_HEIGHT;
  }, [sheetHeight]);

  const renderModeSpecificUI = () => {
    if (mode === "address") {
      return (
        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
        >
          <AddressBottomSheet
            userLocation={userLocation}
            bottomSheetRef={bottomSheetRef}
            onSelectAddress={(item, routeOptions) => {
              navigation.navigate("MapScreen", {
                mode: "itinerary",
                initialRouteOptions: routeOptions,
                fromAddress: item.properties.label,
                isNavigating:false
              });
            }}
            onSheetHeightChange={(height) => setSheetHeight(height)}
          />
        </View>
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
                mode: "travel",
                initialRouteOptions: initialRouteOptions,
                selectedRouteIndex: selectedRouteIndex,
                showManeuver: true,
                isNavigating: true,
                // Ajoute ici d'autres paramètres si besoin
              });
            }}
          />
        </View>
      );
    }

    if (mode === "travel") {
      return (
        <View style={StyleSheet.absoluteFill}>
          {/* {showManeuver && currentInstruction && (
            <ManeuverOverlay
              currentInstruction={currentInstruction}
              distance={distance}
              arrivalTimeStr={arrivalTimeStr}
              remainingTimeInSeconds={remainingTimeInSeconds}
              infoTravelAnimatedStyle={infoTravelAnimatedStyle}
              handleSheetClose={() => {}}
            />
          )} */}
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
    <SafeAreaView
      className={`flex ${
        mode == "itinerary" || mode == "travel" ? "" : "mb-[60px]"
      }`}
    >
      <View>
        <MapContainer
          mode={mode}
          initialRouteOptions={initialRouteOptions}
          selectedRouteIndex={selectedRouteIndex}
          isNavigating={mode === "travel" || mode === "address"}
          screenHeightRatio={screenHeightRatio}
          currentRegion={userLocation}
          showManeuver={showManeuver}
          styleMaps={styles.map}
          onPolylineSelect={(index) => console.log("Polyline selected:", index)}
          handleSheetClose={handleSheetChange}
          sheetOffsetValue={sheetHeight}
          infoTravelAnimatedStyle={infoTravelAnimatedStyle}
        />
        {renderModeSpecificUI()}
      </View>
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

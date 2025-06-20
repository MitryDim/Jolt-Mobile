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
    isNavigating = true,
  } = route.params || {};
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
  // const screenHeightRatio = useMemo(() => {
  //   if (!sheetHeight || sheetHeight < 50) {
  //     return SCREEN_HEIGHT / BASE_REFERENCE_HEIGHT;
  //   }
  //   return (SCREEN_HEIGHT - sheetHeight) / SCREEN_HEIGHT;
  // }, [sheetHeight]);

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
                key: String(Date.now()),
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
    <AnimatedPositionContext.Provider value={animatedPositionRef}>
      <SafeAreaView
        className={`flex ${
          mode == "itinerary" || mode == "travel" ? "" : "mb-[60px]"
        }`}
      >
        <View>
          <MapContainer
            key={mode}
            mode={mode}
            initialRouteOptions={initialRouteOptions}
            selectedRouteIndex={selectedRouteIndex}
            isNavigating={isNavigating}
           // screenHeightRatio={screenHeightRatio}
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
          />
          {renderModeSpecificUI()}
        </View>
      </SafeAreaView>
    </AnimatedPositionContext.Provider>
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

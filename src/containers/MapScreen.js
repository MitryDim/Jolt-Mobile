import React, { useRef, useState, useEffect, useMemo } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Location from "expo-location";
import MapContainer from "../components/Maps/MapContainer";
import AddressBottomSheet from "../components/AddressBottomSheet";
import ItinerarySuggestions from "../components/Maps/ItinerarySuggestions";
import ManeuverOverlay from "../components/Maps/ManeuverOverlay";
import LoadingOverlay from "../components/LoadingOverlay";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import { GestureHandlerRootView } from "react-native-gesture-handler";
const SCREEN_HEIGHT = Dimensions.get("window").height;
const BASE_REFERENCE_HEIGHT = 1920; // référence pour un écran complet sans bottomsheet

const MapScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const snapPoints = useMemo(() => ["10%", "25%", "95%"]);
  const {
    mode = "address",
    initialRouteOptions = [],
    selectedRouteIndex = 0,
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

  useEffect(() => {
    let subscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 2,
        },
        (location) => {
          setUserLocation(location.coords);
        }
      );
    })();

    return () => subscription?.remove();
  }, []);

  const screenHeightRatio = useMemo(() => {
    if (!sheetHeight || sheetHeight < 50) {
      return SCREEN_HEIGHT / BASE_REFERENCE_HEIGHT;
    }
    return (SCREEN_HEIGHT - sheetHeight) / SCREEN_HEIGHT;
  }, [sheetHeight]);

  const renderModeSpecificUI = () => {
    console.log("mode:", mode);
    if (mode === "address") {
      console.log("Rendering AddressBottomSheet");
      return (
        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
        >
          <AddressBottomSheet userLocation={userLocation}
          bottomSheetRef={bottomSheetRef}
          onSelectAddress=
          {(item, routeOptions) => {
            navigation.navigate("MapScreen", {
              mode: "itinerary",
              initialRouteOptions: routeOptions,
              fromAddress: item.properties.label,
            });
          }}
          onSheetHeightChange={(height) => setSheetHeight(height)}
          />
        </View>
      );
    }

    if (mode === "itinerary") {
        console.log("Rendering ItinerarySuggestions",initialRouteOptions);
      return (
        <View
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          position: "absolute",
        }}
      >
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={["25%", "50%", "85%"]}
          onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}
          enablePanDownToClose={false}
        >
          <ItinerarySuggestions
            routes={initialRouteOptions}
            onSelect={(route, index) => {
              navigation.navigate("MapScreen", {
                mode: "travel",
                initialRouteOptions: [route],
                selectedRouteIndex: index,
                showManeuver: true,
              });
            }}
          />
        </BottomSheet>
        </View>
      );
    }

    if (mode === "travel") {
      return (
        <View style={StyleSheet.absoluteFill}>
          {showManeuver && currentInstruction && (
            <ManeuverOverlay
              currentInstruction={currentInstruction}
              distance={distance}
              arrivalTimeStr={arrivalTimeStr}
              remainingTimeInSeconds={remainingTimeInSeconds}
              infoTravelAnimatedStyle={infoTravelAnimatedStyle}
              handleSheetClose={() => {}}
            />
          )}
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
    <View style={styles.container}>
      <MapContainer
        mode={mode}
        initialRouteOptions={initialRouteOptions}
        selectedRouteIndex={selectedRouteIndex}
        userSpeed={userSpeed}
        isNavigating={mode === "travel" || mode === "address"}
        screenHeightRatio={screenHeightRatio}
        currentRegion={userLocation}
        showManeuver={showManeuver}
        styleMaps={styles.map}
        onPolylineSelect={(index) => console.log("Polyline selected:", index)}
        handleSheetClose={() => console.log("Sheet closed")}
        sheetOffsetValue={sheetHeight}
        infoTravelAnimatedStyle={infoTravelAnimatedStyle}
      />
      {renderModeSpecificUI()}
    </View>
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

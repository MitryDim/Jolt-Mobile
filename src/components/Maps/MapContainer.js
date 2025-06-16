import React, { useRef, useState, useEffect, useCallback } from "react";
import MapView from "react-native-maps";
import { View, Text } from "react-native";
import * as Location from "expo-location";
import MapRoutes from "./MapRoutes";
import UserMarker from "./UserMarker";
import NavigationMarker from "./NavigationMarker";
import ManeuverOverlay from "./ManeuverOverlay";
import { useNavigationLogic } from "./useNavigationLogic";
import LoadingOverlay from "../LoadingOverlay";
import HeaderMap from "./HeaderMap";

const MapContainer = ({
  styleMaps,
  initialRouteOptions,
  selectedRouteIndex,
  onPolylineSelect,
  currentRegion,
  userSpeed,
  isNavigating,
  screenHeightRatio,
  showManeuver,
  handleSheetClose,
  sheetOffsetValue,
  infoTravelAnimatedStyle,
  mode,
}) => {
  const mapRef = useRef(null);
  const isTravel = mode === "travel";
  const routesToShow = isTravel
    ? [initialRouteOptions[selectedRouteIndex]]
    : initialRouteOptions;
  const {
    coordinates,
    heading,
    currentInstruction,
    updateCamera,
    handleLocationUpdate,
    routeOptions,
    isLoading,
    arrivalTimeStr,
    remainingTimeInSeconds,
    distance,
  } = useNavigationLogic({
    initialRouteOptions: initialRouteOptions[selectedRouteIndex],
    isNavigating,
    screenHeightRatio,
    showManeuver,
    userSpeed,
    mode,
  });



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
        (location) => handleLocationUpdate(location, mapRef.current)
      );
    })();
    return () => subscription?.remove();
  }, [handleLocationUpdate]);

  useEffect(() => {
    if (
      (mode === "address") &&
      currentRegion &&
      mapRef.current &&
      typeof handleLocationUpdate === "function"
    ) {
      updateCamera(mapRef.current, currentRegion, currentRegion.heading);
    }
    // Si on est en mode itinerary (choix d'itinéraire) et qu'on a des routes
    if (
      mode === "itinerary" &&
      initialRouteOptions &&
      initialRouteOptions.length > 0 &&
      mapRef.current
    ) {
      // Récupère tous les points de toutes les routes
      const allCoords = initialRouteOptions
        .map((route) => route.coordinates)
        .flat();

      if (allCoords.length > 0) {
        mapRef.current.fitToCoordinates(allCoords, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
      }
    }
  }, [mode, initialRouteOptions]);

  return (
    <>
      <MapView ref={mapRef} style={styleMaps}>
        <MapRoutes
          routes={routesToShow}
          isNavigating={isNavigating}
          selectedRouteIndex={isTravel ? 0 : selectedRouteIndex}
          onPolylineSelect={onPolylineSelect}
          showManeuver={showManeuver}
          currentRegion={currentRegion}
        />

        {!isNavigating ? (
          <UserMarker currentRegion={currentRegion} />
        ) : (
          <NavigationMarker coordinates={coordinates} heading={heading} />
        )}
      </MapView>
      {console.log(
        "MapContainer render",
        isNavigating,
        showManeuver,
        currentInstruction
      )}
      {isNavigating && showManeuver && currentInstruction && (
        <ManeuverOverlay
          currentInstruction={currentInstruction}
          distance={distance}
          arrivalTimeStr={arrivalTimeStr}
          remainingTimeInSeconds={remainingTimeInSeconds}
          infoTravelAnimatedStyle={infoTravelAnimatedStyle}
          handleSheetClose={handleSheetClose}
        />
      )}

      {isLoading && (
        <LoadingOverlay>
          <Text style={{ color: "white" }}>
            Recherche d'un nouvel itinéraire...
          </Text>
        </LoadingOverlay>
      )}
    </>
  );
};

export default MapContainer;

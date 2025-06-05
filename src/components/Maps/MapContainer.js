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
  mode
}) => {
  const mapRef = useRef(null);
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
    initialRouteOptions,
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

  return (
    <>
      <MapView ref={mapRef} style={styleMaps}>
        <MapRoutes
          routes={routeOptions}
          isNavigating={isNavigating}
          selectedRouteIndex={selectedRouteIndex}
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

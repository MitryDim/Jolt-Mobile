import React, { useRef, useState, useEffect, useCallback } from "react";
import MapView from "react-native-maps";
import { View, Text, Dimensions } from "react-native";
import * as Location from "expo-location";
import MapRoutes from "./MapRoutes";
import UserMarker from "./UserMarker";
import NavigationMarker from "./NavigationMarker";
import ManeuverOverlay from "./ManeuverOverlay";
import { useNavigationLogic } from "./useNavigationLogic";
import LoadingOverlay from "../LoadingOverlay";
import OptionBottomSheet from "./BottomSheet/OptionButtomSheet";
import IconComponent from "../Icons";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";
import NavigationBottomSheet from "./BottomSheet/NavigateBottomSheet";

import { useNavigation } from "@react-navigation/native";
import SpeedBubble from "./SpeedBubble";
import { useAnimatedPosition } from "../../context/AnimatedPositionContext";
const MapContainer = ({
  styleMaps,
  initialRouteOptions,
  selectedRouteIndex,
  onPolylineSelect,
  currentRegion,
  isNavigating,
  screenHeightRatio,
  showManeuver,
  handleSheetClose,
  sheetOffsetValue,
  bottomSheetRef,
  infoTravelAnimatedStyle,
  mode,
}) => {
  const navigation = useNavigation();
  const [isCameraLocked, setIsCameraLocked] = useState(false);
  const isCameraLockedRef = useRef(false);
  const cameraTimeoutRef = useRef(null);
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
    speedValue,
  } = useNavigationLogic({
    initialRouteOptions: initialRouteOptions[selectedRouteIndex],
    isNavigating,
    screenHeightRatio,
    showManeuver,
    mode,
    isCameraLockedRef,
  });
  console.log("MapContainer rendered with mode:", mode);
  const windowHeight = Dimensions.get("window").height;
  const animatedPositionRef = useAnimatedPosition();
  const animatedPosition = animatedPositionRef?.current;

  const speedBubbleAnimatedStyle = useAnimatedStyle(() => {
    if (!animatedPosition) return {};

    const translateY = interpolate(
      animatedPosition.value,
      [windowHeight, 0],
      [0, -windowHeight],
      {
        extrapolateLeft: "extend",
        extrapolateRight: "extend",
      }
    );
    console.log(
      "SpeedBubble translateY:",
      translateY,
      "  animatedPosition.value",
      animatedPosition.value,
    );
    const zIndex = translateY < -windowHeight / 2 ? 0 : 10;
    const display = translateY < -windowHeight / 2 ? "none" : "flex";

    return {
      transform: [{ translateY }],
      zIndex,
      display,
    };
  });

  const handleUserPan = () => {
    if (isNavigating) {
      console.log("User panned the map, locking camera.");
      setIsCameraLocked(true);
      isCameraLockedRef.current = true;
      // setIsCameraLocked(true);
      // Optionnel : relance la caméra auto après 5s d'inactivité
      if (cameraTimeoutRef.current) clearTimeout(cameraTimeoutRef.current);
      cameraTimeoutRef.current = setTimeout(
        () => {
          isCameraLockedRef.current = false;
          setIsCameraLocked(false);
        }, //setIsCameraLocked(false),
        10000
      );
    }
  };

  useEffect(() => {
    if (!isNavigating) return;
    handleSheetClose(isCameraLocked);
  }, [isCameraLocked]);

  useFocusEffect(
    React.useCallback(() => {
      let subscription;
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
          },
          (location) => {
            if (mode == "itinerary") return;
            handleLocationUpdate(location, mapRef.current);
          }
        );
      })();
      return () => {
        subscription?.remove();
      };
    }, [mode, initialRouteOptions])
  );

  useEffect(() => {
    // if (
    //   mode === "address" &&
    //   currentRegion &&
    //   mapRef.current &&
    //   typeof handleLocationUpdate === "function"
    // ) {
    //   updateCamera(mapRef.current, currentRegion, currentRegion.heading);
    // }
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
      <MapView
        ref={mapRef}
        style={styleMaps}
        onPanDrag={handleUserPan}
        //onRegionChange={handleUserPan}
        showsUserLocation={true}
      >
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

      {isNavigating && showManeuver && currentInstruction && (
        <View
          className="absolute top-0 left-0 right-0 z-10 h-full"
          pointerEvents="box-none"
        >
          <ManeuverOverlay
            currentInstruction={currentInstruction}
            distance={distance}
            arrivalTimeStr={arrivalTimeStr}
            remainingTimeInSeconds={remainingTimeInSeconds}
            infoTravelAnimatedStyle={infoTravelAnimatedStyle}
            handleSheetClose={handleSheetClose}
          />
          <NavigationBottomSheet
            bottomSheetRef={bottomSheetRef}
            currentInstruction={currentInstruction}
            distance={distance}
            arrivalTimeStr={arrivalTimeStr}
            remainingTimeInSeconds={remainingTimeInSeconds}
            onStop={() => {
              navigation.navigate("MapScreen", {
                mode: "address",
                fromAddress: "",
                initialRouteOptions: [],
                userSpeed: 0,
                currentRegion: null,
                showManeuver: false,
                isLoading: false,
                arrivalTimeStr: "",
                remainingTimeInSeconds: 0,
                currentInstruction: null,
                distance: 0,
              });
              // Action pour arrêter la navigation
            }}
          />
        </View>
      )}

      {isNavigating && (
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              zIndex: 20,
            },
            speedBubbleAnimatedStyle,
          ]}
        >
          <SpeedBubble speed={speedValue} />
        </Animated.View>
      )}

      {isLoading && (
        <LoadingOverlay>
          <Text style={{ color: "white" }}>
            Recherche d'un nouvel itinéraire...
          </Text>
        </LoadingOverlay>
      )}

      {isNavigating && isCameraLocked && (
        <OptionBottomSheet
          visible={isCameraLocked}
          onRecenterPress={() => {
            isCameraLockedRef.current = false;
            cameraTimeoutRef.current = null;
            setIsCameraLocked(false);
          }}
          remainingTimeInSeconds={remainingTimeInSeconds}
        ></OptionBottomSheet>
      )}
    </>
  );
};

export default MapContainer;

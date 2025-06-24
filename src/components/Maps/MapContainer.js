import React, { useRef, useState, useEffect, useCallback } from "react";
import MapView from "react-native-maps";
import {
  View,
  Text,
  Dimensions,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
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
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { useNavigation } from "@react-navigation/native";
import SpeedBubble from "./SpeedBubble";
import { useAnimatedPosition } from "../../context/AnimatedPositionContext";
import { getDistance } from "geolib";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import { useFetchWithAuth } from "../../hooks/useFetchWithAuth";
const MapContainer = ({
  styleMaps,
  initialRouteOptions,
  selectedRouteIndex,
  onPolylineSelect,
  currentRegion,
  isNavigating,
  showManeuver,
  handleSheetClose,
  sheetOffsetValue,
  bottomSheetRef,
  infoTravelAnimatedStyle,
  mode,
  handleComponent,
}) => {
  const fetchWithAuth = useFetchWithAuth();
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
    gpxPoints,
  } = useNavigationLogic({
    initialRouteOptions: initialRouteOptions[selectedRouteIndex],
    isNavigating,
    showManeuver,
    mode,
    isCameraLockedRef,
  });
  const windowHeight = Dimensions.get("window").height;
  const [isMapReady, setIsMapReady] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const animatedPositionRef = useAnimatedPosition();
  const animatedPosition = animatedPositionRef?.current;
  const speedBubbleAnimatedStyle = useAnimatedStyle(() => {
    if (!animatedPosition) return {};

    const translateY = interpolate(
      animatedPosition.value,
      [windowHeight - tabBarHeight, 0],
      [0, -windowHeight + tabBarHeight],
      {
        extrapolateLeft: "extend",
        extrapolateRight: "extend",
      }
    );

    const bottom = 30;
    const zIndex = translateY < -windowHeight / 2 ? 0 : 10;
    const display = translateY < -windowHeight / 2 ? "none" : "flex";

    return {
      transform: [{ translateY }],
      zIndex,
      display,
      bottom,
    };
  });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [tripName, setTripName] = useState("");
  const [pendingTripData, setPendingTripData] = useState(null);

  const handleStop = () => {
    const endTime = new Date();
    const startTime = gpxPoints[0]?.time ? new Date(gpxPoints[0].time) : null;
    const totalDistance = gpxPoints.reduce((acc, point, idx, arr) => {
      if (idx === 0) return 0;
      return (
        acc +
        getDistance(
          { latitude: arr[idx - 1].lat, longitude: arr[idx - 1].lon },
          { latitude: point.lat, longitude: point.lon }
        )
      );
    }, 0);
    const speedMax = Math.max(...gpxPoints.map((p) => p.speed || 0));
    const altitude =
      gpxPoints.reduce((acc, p) => acc + (p.alt || 0), 0) / gpxPoints.length;

    // Stocke les données du trajet en attente
    setPendingTripData({
      startTime,
      endTime,
      totalDistance,
      speedMax,
      altitude,
      gpxPoints,
    });
    setTripName(`trajet du ${new Date().toLocaleDateString()}`);
    setShowSaveModal(true);
  };

  const saveTrip = async () => {
    if (!tripName.trim()) return;
    try { 
      await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: tripName,
            ...pendingTripData,
          }),
        },
        { protected: true }
      );
      setShowNameModal(false);
      setPendingTripData(null);
      // Navigation ou reset ici si besoin
      navigation.navigate("MapScreen", {
        key: String(Date.now()),
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
    } catch (e) {
      alert("Erreur lors de l'enregistrement du trajet.");
    }
  };

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
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useFocusEffect(
    React.useCallback(() => {
      let subscription;
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        subscription = await Location.watchPositionAsync(
          {
            timeInterval: 1200, // Met à jour toutes les  2 secondes
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 3, // Met à jour si le déplacement est supérieur à 1 mètre
          },
          (location) => {
            // Utilise la valeur à jour
            // if (modeRef.current === "itinerary") return;
            console.log("Location updated:", modeRef.current);
            handleLocationUpdate(location, mapRef.current);
          }
        );
      })();
      return () => {
        subscription?.remove();
      };
    }, [initialRouteOptions]) // plus besoin de mettre [mode] ici
  );

  useEffect(() => {
    console.log("MapContainer useEffect: mode changed to", mode);
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
      console.log("MapContainer useEffect: mode is itinerary");
      // Récupère tous les points de toutes les routes
      const allCoords = initialRouteOptions
        .map((route) => route.coordinates)
        .flat();
      console.log("All coordinates:", allCoords);
      if (allCoords.length > 0) {
        mapRef.current.fitToCoordinates(allCoords, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
      }
    }
  }, [mode, initialRouteOptions, isMapReady]);

  return (
    <>
      <MapView
        ref={mapRef}
        style={styleMaps}
        onPanDrag={handleUserPan}
        onMapReady={() => setIsMapReady(true)}
        //onRegionChange={handleUserPan}
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

      {isNavigating && showManeuver && currentInstruction && !showSaveModal && (
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
        </View>
      )}

      {isNavigating && animatedPosition && (
        <Animated.View
          style={
            ({
              bottom: 0, // Décale du haut de la TabBar si elle est présente
              left: 0,
              right: 0,
              alignItems: "center",
              zIndex: 20,
            },
            [speedBubbleAnimatedStyle])
          }
        >
          <SpeedBubble speed={speedValue} />
        </Animated.View>
      )}
      {mode == "travel" && !showSaveModal && !showNameModal && (
        <View
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
        >
          <NavigationBottomSheet
            bottomSheetRef={bottomSheetRef}
            currentInstruction={currentInstruction}
            distance={distance}
            arrivalTimeStr={arrivalTimeStr}
            remainingTimeInSeconds={remainingTimeInSeconds}
            handleComponent={handleComponent}
            onStop={() => {
              handleStop();

              // Action pour arrêter la navigation
            }}
          />
        </View>
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
      {showSaveModal && (
        <View style={{ flex: 1, padding: 24 }}>
          <Modal animationType="fade" transparent visible={showSaveModal}>
            <View style={modalStyles.overlay}>
              <View style={modalStyles.content}>
                <Text style={{ fontSize: 18, marginBottom: 16 }}>
                  Voulez-vous enregistrer ce trajet ?
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={[modalStyles.button, { backgroundColor: "#007aff" }]}
                    onPress={() => {
                      setShowSaveModal(false);
                      setShowNameModal(true);
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Oui</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyles.button, { backgroundColor: "#eee" }]}
                    onPress={() => {
                      setShowSaveModal(false);
                      setPendingTripData(null);
                      // Navigation ou reset ici si besoin
                      navigation.navigate("MapScreen", {
                        key: String(Date.now()),
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
                    }}
                  >
                    <Text style={{ color: "#333" }}>Non</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}

      {showNameModal && (
        <View style={{ flex: 1, padding: 24 }}>
          <Modal transparent visible animationType="fade">
            <View style={modalStyles.overlay}>
              <View style={modalStyles.content}>
                <Text style={{ fontSize: 18, marginBottom: 16 }}>
                  Nom du trajet
                </Text>
                <TextInput
                  style={modalStyles.input}
                  value={tripName}
                  onChangeText={setTripName}
                  placeholder="Nom du trajet"
                />
                <TouchableOpacity
                  style={[
                    modalStyles.button,
                    { backgroundColor: "#007aff", width: "100%" },
                  ]}
                  onPress={saveTrip}
                >
                  <Text style={{ color: "#fff" }}>Enregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    modalStyles.button,
                    { backgroundColor: "#eee", width: "100%" },
                  ]}
                  onPress={() => setShowNameModal(false)}
                >
                  <Text style={{ color: "#333" }}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",

    zIndex: 1000,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    alignItems: "center",
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
    width: "100%",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
    marginBottom: 8,
    minWidth: 80,
  },
});

export default MapContainer;

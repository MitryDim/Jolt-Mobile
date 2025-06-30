import React, { useRef, useState, useEffect, useCallback, use } from "react";
import MapView, { AnimatedRegion, MarkerAnimated } from "react-native-maps";
import {
  View,
  Text,
  Dimensions,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import * as Location from "expo-location";
import MapRoutes from "./MapRoutes";
import UserMarker from "./UserMarker";
import NavigationMarker from "./NavigationMarker";
import ManeuverOverlay from "./ManeuverView/ManeuverOverlay";
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
  useSharedValue,
  withTiming,
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
import Svg, { Circle } from "react-native-svg";
import { useTripSocket } from "../../hooks/useSocketTrip";
import { UserContext } from "../../context/AuthContext";
import { AnimatedMapView } from "react-native-maps/lib/MapView";
import { useNetwork } from "../../context/networkContext";
const MapContainer = ({
  ref: mapRef,
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
  socketId,
}) => {
  const fetchWithAuth = useFetchWithAuth();
  const { isConnected } = useNetwork();
  const { user } = React.useContext(UserContext);
  const [otherUsersPosition, setOtherUsersPosition] = useState({});
  const [otherUsersAnimated, setOtherUsersAnimated] = useState({});
  const [userProfiles, setUserProfiles] = useState({});

  const navigation = useNavigation();
  const [isCameraLocked, setIsCameraLocked] = useState(false);
  const isCameraLockedRef = useRef(false);
  const cameraTimeoutRef = useRef(null);
  const isTravel = mode === "travel";
  const [routesToShow, setRoutesToShow] = useState(
    isTravel ? [initialRouteOptions[selectedRouteIndex]] : initialRouteOptions
  );
  const locationRef = useRef();

  let sendPosition = () => {};
  if (mode === "travel" && isConnected && socketId && user?.id) {
    ({ sendPosition } = useTripSocket(
      socketId,
      user?.id,
      user?.profilePicture,
      (userId, position, profilePicture, isRemove) => {
        if (isRemove) {
          setOtherUsersPosition((prev) => {
            const copy = { ...prev };
            delete copy[userId];
            return copy;
          });
          setUserProfiles((prev) => {
            const copy = { ...prev };
            delete copy[userId];
            return copy;
          });
          setOtherUsersAnimated((prev) => {
            const copy = { ...prev };
            delete copy[userId];
            return copy;
          });
        } else {
          setOtherUsersPosition((prev) => ({ ...prev, [userId]: position }));
          setUserProfiles((prev) => ({
            ...prev,
            [userId]: profilePicture,
          }));
        }
      }
    ));
  }

  useEffect(() => {
    Object.entries(otherUsersPosition).forEach(([id, pos]) => {
      if (!otherUsersAnimated[id]) {
        // Première position : création de l'AnimatedRegion
        setOtherUsersAnimated((prev) => ({
          ...prev,
          [id]: new AnimatedRegion({
            latitude: pos.latitude,
            longitude: pos.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }),
        }));
      } else {
        // Animation vers la nouvelle position
        otherUsersAnimated[id]
          .timing({
            latitude: pos.latitude,
            longitude: pos.longitude,
            duration: 1000,
            useNativeDriver: false,
          })
          .start();
      }
    });
  }, [otherUsersPosition]);

  const handleRouteOptionsChange = (newOptions) => {
    setRoutesToShow([newOptions]);
  };
  const {
    coordinates,
    heading,
    currentInstruction,
    updateCamera,
    handleLocationUpdate,
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
    handleRouteOptionsChange,
  });
  const windowHeight = Dimensions.get("window").height;
  const [isMapReady, setIsMapReady] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const animatedPositionRef = useAnimatedPosition();
  const animatedPosition = animatedPositionRef?.current;
  const speedBubbleX = useSharedValue(0);
  const recenterIconX = useSharedValue(-80); // hors écran à gauche

  useEffect(() => {
    if (locationRef.current && !isCameraLocked) {
      updateCamera(
        mapRef.current,
        locationRef.current?.coords,
        isCameraLockedRef,
        locationRef.current?.coords?.heading
      );
    }

    if (isCameraLocked) {
      speedBubbleX.value = withTiming(-120); // slide out
      recenterIconX.value = withTiming(0); // slide in
    } else {
      speedBubbleX.value = withTiming(0); // slide in
      recenterIconX.value = withTiming(-120); // slide out
    }
    if (!isNavigating || mode !== "travel") return;
    handleSheetClose(isCameraLocked);
  }, [isCameraLocked]);

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

    const translateX = speedBubbleX.value;
    let bottom = 0;
    if (mode === "travel") {
      bottom = 60;
    }
    const zIndex = translateY < -windowHeight / 2 ? 0 : 10;
    const display = translateY < -windowHeight / 2 ? "none" : "flex";

    return {
      transform: [{ translateY }, { translateX }],
      zIndex,
      display,
      bottom,
      position: "absolute",
      left: 5,
    };
  });

  const recenterIconAnimatedStyle = useAnimatedStyle(() => {
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

    const translateX = recenterIconX.value;

    let bottom = 0;
    if (mode === "travel") {
      bottom = 60;
    }
    const zIndex = translateY < -windowHeight / 2 ? 0 : 10;
    const display = translateY < -windowHeight / 2 ? "none" : "flex";

    return {
      transform: [{ translateY }, { translateX }],
      zIndex,
      display,
      bottom,
      position: "absolute",
      left: 5,
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
      if (isCameraLocked) return; // Ignore les mouvements de la carte si la caméra est verrouillée
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
            timeInterval: 1200,
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 3,
          },
          (location) => {
            locationRef.current = location;
            if (!location || !location.coords) return;
            sendPosition({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
            handleLocationUpdate(location, mapRef.current);
          }
        );
      })();
      return () => {
        subscription?.remove();
      };
    }, [initialRouteOptions])
  );

  useEffect(() => {
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
  }, [mode, initialRouteOptions, isMapReady]);

  return (
    <>
      <AnimatedMapView
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

        {Object.entries(otherUsersAnimated).map(([id, animatedRegion]) => {
          return (
            <MarkerAnimated
              key={id}
              coordinate={animatedRegion}
              zIndex={1000}
              className={"w-[44px] h-[44px]"}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: 22,
                    padding: 2,
                    borderWidth: 2,
                    borderColor: "#FFA500",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={
                      userProfiles?.[id]
                        ? { uri: userProfiles[id] }
                        : require("../../../assets/avatar.png")
                    }
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      resizeMode: "cover",
                    }}
                  />
                </View>
              </View>
            </MarkerAnimated>
          );
        })}
      </AnimatedMapView>

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
        <>
          <Animated.View style={[speedBubbleAnimatedStyle]}>
            {<SpeedBubble speed={speedValue} />}
          </Animated.View>

          <Animated.View style={recenterIconAnimatedStyle}>
            <TouchableOpacity
              className="justify-center items-center"
              onPress={() => {
                isCameraLockedRef.current = false;
                setIsCameraLocked(false);
              }}
            >
              <Svg width={120} height={120}>
                <Circle
                  cx={60}
                  cy={60}
                  r={35}
                  fill="rgba(0,0,0,0.85)"
                  stroke="#000"
                  strokeWidth={1}
                />
              </Svg>
              <View className="justify-center items-center absolute">
                <IconComponent
                  icon="gps-fixed"
                  library="MaterialIcons"
                  size={32}
                  color="white"
                />
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => {
                setIsCameraLocked(false);
              }}
              style={{
                backgroundColor: "#fff",
                borderRadius: 30,
                width: 60,
                height: 60,
                alignItems: "center",
                justifyContent: "center",
                elevation: 4,
              }}
            >
              <IconComponent
                icon="gps-fixed"
                library="MaterialIcons"
                size={32}
                color="#007aff"
              />
            </TouchableOpacity> */}
          </Animated.View>
        </>
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

      {/* {isNavigating && isCameraLocked && (
        <OptionBottomSheet
          visible={isCameraLocked}
          onRecenterPress={() => {
            isCameraLockedRef.current = false;
            cameraTimeoutRef.current = null;
            setIsCameraLocked(false);
          }}
          remainingTimeInSeconds={remainingTimeInSeconds}
        ></OptionBottomSheet>
      )} */}
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

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import MapView, {
  Polyline,
  Marker,
  AnimatedRegion,
  UrlTile,
} from "react-native-maps";
// import * as Location from "expo-location";
//import ScrollBottomSheet from "react-native-scroll-bottom-sheet";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// import * as api from "../../helpers/Api";
import LoadingOverlay from "../components/LoadingOverlay";


// import {
//   locationPermission,
//   getCurrentLocation,
//   startTrackingLocation,
//   stopTrackingLocation,
// } from "../../helpers/HelperFunctions";

import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

import ManeuverView from "../components/ManeuverView"; 

import {
  getDistance,
  findNearest,
  getRhumbLineBearing,
  getCompassDirection,
  isPointInPolygon,
} from "geolib";
import { getDefaultHeaderHeight } from "@react-navigation/elements";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// import * as utils from "../../utils/Utils";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ConfirmModal from "../components/ConfirmModal";
import Maps from "../components/Maps";

const screen = Dimensions.get("window");
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.001;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const screenHeight = Dimensions.get("window").height;

const TravelScreen = (route) => {
  console.log("route", route);  
  const frame = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const [mapWidth, setMapWidth] = useState(0);

  const headerheight = getDefaultHeaderHeight(frame, false, insets.top);
  const [mapHeight, setMapHeight] = useState(frame.height);
  const markerRef = useRef(null);
  const markerReftest = useRef(null);
  const circleRef = useRef(null);
  const mapRef = useRef(null);
  const bottomSheetRef = useRef(null);

  const sheetOffset = useSharedValue(0);
  const snapPoints = useMemo(() => [150]);
  const positions = useRef([]);
  const lastLocation = useRef(null);
  const distanceTraveled = useRef(0);
  const maxSpeed = useRef(0);
  const speed = useRef(0);

  const { navigate } = useNavigation();

  const [state, setState] = useState({
    destinationCords: {},
    isLoading: false,
    coordinate: new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
    coordinatetest: new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
    startTime: null,
    time: 0,
    distance: 0,
    urlTemplate: "http://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    center: true,
    currentInstruction: { closestInstruction: null, distaneRest: 0 },
    instructions: [],
    routeOptions: [],
    bottomSheetClose: true,
    exitConfirmation: false,
  });

  const {
    startTime,
    distance,
    isLoading,
    coordinate,
    coordinatetest,
    center,
    currentInstruction,
    routeOptions,
    bottomSheetClose,
    exitConfirmation,
  } = state;

  const updateState = (data) => setState((state) => ({ ...state, ...data }));

 // let countIncorrectPath = 0;

  // const getCurrentInstruction = (
  //   currentPosition,
  //   instructions,
  //   routeCoordinates,
  //   heading
  // ) => {
  //   const nearestPoint = findNearest(currentPosition, routeCoordinates);
  //   const indexCoordinates = getIndexCoordinates(
  //     routeCoordinates,
  //     nearestPoint
  //   );
  //   let allDistanceRes = 0;
  //   let lastIndexCoordinates = 0;

  //   if (indexCoordinates === 0) {
  //     let distanceRest = 0;

  //     for (
  //       let i = instructions[0].way_points[0];
  //       i <= instructions[0].way_points[1];
  //       i++
  //     ) {
  //       countIncorrectPath = 0;
  //       const coordinates = routeCoordinates[i];
  //       distanceRest += getDistance(currentPosition, coordinates);
  //     }
  //     allDistanceRes = getAllDistanceRest(
  //       routeCoordinates,
  //       instructions[0].way_points[1]
  //     );
  //     allDistanceRes += distanceRest;
  //     // updateState({ distance: allDistanceRes });

  //     if (distanceRest > instructions[1].distance - 6) {
  //       return {
  //         closestInstruction: getInstructionByCoordinates(
  //           routeCoordinates,
  //           instructions,
  //           instructions[0].way_points[1]
  //         ),
  //         distanceRest: distanceRest,
  //         distance: allDistanceRes,
  //       };
  //     } else {
  //       return {
  //         closestInstruction: instructions[0],
  //         distanceRest: distanceRest,
  //         distance: allDistanceRes,
  //       };
  //     }
  //   } else {
  //     const inFront = IsInFront(currentPosition, nearestPoint, heading);

  //     const instruction = instructions.find((item) => {
  //       const [start, end] = item.way_points;
  //       return (
  //         (inFront && indexCoordinates > start && indexCoordinates <= end) ||
  //         (!inFront && indexCoordinates >= start && indexCoordinates < end)
  //       );
  //     });

  //     if (instruction) {
  //       let distanceRest = 0;
  //       let inFront = false;
  //       for (
  //         let i = instruction.way_points[0];
  //         i <= instruction.way_points[1];
  //         i++
  //       ) {
  //         const coordinates = routeCoordinates[i];
  //         const inFrontOfPosition = IsInFront(
  //           currentPosition,
  //           coordinates,
  //           heading
  //         );
  //         const inFrontOfPositionPrecise = IsInFrontPrecise(
  //           currentPosition,
  //           coordinates,
  //           heading
  //         );
  //         if (inFrontOfPosition) {
  //           distanceRest += getDistance(currentPosition, coordinates);
  //           lastIndexCoordinates = i;
  //         }
  //         if (inFrontOfPositionPrecise) inFront = true;
  //       }
  //       allDistanceRes = getAllDistanceRest(
  //         routeCoordinates,
  //         lastIndexCoordinates
  //       );
  //       console.log("allDistanceRes", allDistanceRes);
  //       allDistanceRes += distanceRest;
  //       // updateState({ distance: allDistanceRes });

  //       const instructionByCoordinates = getInstructionByCoordinates(
  //         routeCoordinates,
  //         instructions,
  //         instruction.way_points[1]
  //       );

  //       const bearingBefore = instructionByCoordinates.maneuver.bearing_before;
  //       if (sameDirection(heading, bearingBefore) && inFront) {
  //         console.log("HEADING OKKKKK");
  //         countIncorrectPath = 0;
  //       } else {
  //         console.log("HEADING NOKKKKK");
  //         if (
  //           instructionByCoordinates.maneuver.bearing_before == 0 &&
  //           instructionByCoordinates.maneuver.bearing_after == 0
  //         ) {
  //           let pos1 = 0;
  //           let pos2 = 0;
  //           const wayPoint = instruction.way_points[1];

  //           pos1 = routeCoordinates[wayPoint - 1];
  //           pos2 = routeCoordinates[wayPoint];

  //           const headingPoly = getRhumbLineBearing(pos1, pos2);
  //           if (sameDirection(heading, headingPoly) && inFront) {
  //             console.log("same direction");
  //             countIncorrectPath = 0;
  //           } else {
  //             console.log("not same direction +1 ");
  //             countIncorrectPath += 1;
  //           }
  //           console.log("headingPoly", headingPoly);
  //         } else {
  //           console.log("HEADING NOKKKKK +1 ");
  //           countIncorrectPath += 1;
  //         }
  //       }

  //       return {
  //         closestInstruction: instructionByCoordinates,
  //         distanceRest: distanceRest,
  //         distance: allDistanceRes,
  //       };
  //     } else {
  //       return {
  //         closestInstruction: null,
  //         distanceRest: 0,
  //         distance: 0,
  //       };
  //     }
  //   }
  // };

  // function getAllDistanceRest(coordinates, i) {
  //   let allDistance = 0;
  //   for (var i = i; i < coordinates.length - 1; i++) {
  //     allDistance += getDistance(coordinates[i], coordinates[i + 1]);
  //   }
  //   return allDistance;
  // }

  // function sameDirection(currentBearing, targetBearing) {
  //   return (
  //     targetBearing <= currentBearing + 90 &&
  //     targetBearing >= currentBearing - 90
  //   );
  // }

  // function IsInFront(currentPosition, targetPosition, heading) {
  //   const pointHeading = getRhumbLineBearing(currentPosition, targetPosition);
  //   return pointHeading <= heading + 90 && pointHeading >= heading - 90;
  // }

  // function IsInFrontPrecise(currentPosition, targetPosition, heading) {
  //   const pointHeading = getRhumbLineBearing(currentPosition, targetPosition);
  //   return pointHeading <= heading + 20 && pointHeading >= heading - 20;
  // }

  // const getInstructionByCoordinates = (coordinates, instructions, index) => {
  //   const targetCoordinate = coordinates[index];
  //   const instruction = instructions.find((item) => {
  //     const maneuverLocation = item.maneuver?.location;
  //     if (maneuverLocation) {
  //       const [longitude, latitude] = maneuverLocation;
  //       return (
  //         longitude === targetCoordinate.longitude &&
  //         latitude === targetCoordinate.latitude
  //       );
  //     }
  //     return false;
  //   });

  //   if (instruction) {
  //     return instruction;
  //   } else if (targetCoordinate === coordinates[coordinates.length - 1]) {
  //     return instructions[instructions.length - 1];
  //   } else {
  //     return null;
  //   }
  // };

  // const getIndexCoordinates = (routeCoordinates, targetCoordinates) => {
  //   for (let i = 0; i < routeCoordinates.length; i++) {
  //     const routeCoordinate = routeCoordinates[i];
  //     if (
  //       routeCoordinate.latitude === targetCoordinates.latitude &&
  //       routeCoordinate.longitude === targetCoordinates.longitude
  //     ) {
  //       return i;
  //     }
  //   }
  //   console.log("Aucune correspondance trouvée.");
  //   return null;
  // };

  // const getInstruction = async (curLoc, heading, speed) => {
  //   let instruction = null;
  //   let newRouteOptions = null;
  //   if (route.route?.params?.instructions) {
  //     if (countIncorrectPath > 4) {
  //       updateState({
  //         isLoading: true,
  //       });
  //       countIncorrectPath = 0;

  //       const endsCoords =
  //         route.route?.params?.coordinates[
  //           route.route?.params?.coordinates?.length - 1
  //         ];

  //       endsCoordsLatitude = endsCoords.latitude;
  //       endsCoordsLongitude = endsCoords.longitude;

  //       const routes = await api.calculateRoute(
  //         curLoc,
  //         [endsCoordsLongitude, endsCoordsLatitude],
  //         ["recommended"],
  //         1,
  //         [[heading, 15]]
  //       );

  //       const routeOptions = {
  //         id: 0,
  //         coordinates: routes[0].coordinates,
  //         instructions: routes[0].instructions,
  //         routeDistance: routes[0].routeDistance,
  //         duration: routes[0].duration,
  //       };

  //       route.route.params = routeOptions;

  //       updateState({
  //         routeOptions: routeOptions,
  //         isLoading: false,
  //       });
  //     }
  //     instruction = getCurrentInstruction(
  //       curLoc,
  //       route.route?.params?.instructions,
  //       route.route?.params?.coordinates,
  //       heading
  //     );
  //     //updateState({ currentInstruction: instruction });
  //   }
  //   let allDistanceCalculate = 0;

  //   console.log("maxSpeed.current", maxSpeed.current);

  //   if (lastLocation.current) {
  //     if (speed > 0) {
  //       allDistanceCalculate = getDistance(lastLocation.current, curLoc);
  //     }
  //   }
  //   distanceTraveled.current = distanceTraveled.current + allDistanceCalculate;
  //   speed.current = speed;

  //   updateState({
  //     currentInstruction: instruction,
  //     distance: instruction.distance,
  //   });
  // };

  //  useFocusEffect(
  //   React.useCallback(() => {
  //     if (route.route.params) {
  //       updateState({
  //         instructions: route.route.params.instructions,
  //         routeOptions: route.route.params,
  //         startTime: Date.now(),
  //       });
  //     }

  //     let subscription = null; // Pour stocker la subscription

  //     const startTracking = async () => {
  //       const { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status !== "granted") {
  //         console.warn("Permission to access location was denied");
  //         return;
  //       }

  //       if (!subscription) {
  //         subscription = await startTrackingLocation(async (cords) => {
  //           const { latitude, longitude, heading } = cords;

  //           positions.current = [...positions.current, { latitude, longitude }];
  //           maxSpeed.current = Math.max(maxSpeed.current, cords.speed);
  //           speed.current = cords.speed;
  //           console.log("speed : ", cords.speed);
  //           getInstruction({ latitude, longitude }, heading, cords.speed);
  //           lastLocation.current = { latitude, longitude };
  //           animate(latitude, longitude, heading);
  //         });
  //       }
  //     };

  //     startTracking();

  //     // Nettoyer la subscription et l'intervalle lorsque le composant est démonté
  //     return () => {
  //       if (subscription) {
  //         stopTrackingLocation(subscription);
  //       }
  //     };
  //   }, [])
  // );

//   const saveTrackingData = async () => {
//     try {
//       // Create an object with the data to save
//       const currentTime = Date.now();
//       const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
//       const data = [
//         {
//           name: "suivi " + utils.formattedDate(startTime),
//           startTime: utils.formattedDate(startTime),
//           distance: distanceTraveled.current,
//           maxSpeed: Math.floor(maxSpeed.current * 3.6),
//           elapsedTime: elapsedSeconds,
//           stopTime: utils.formattedDate(Date.now()),
//           positions: JSON.stringify(positions.current),
//         },
//       ];
//       await DataTraveled.insert(data);
//       console.log("Data saved successfully!");
//     } catch (error) {
//       console.log("Error saving data:", error);
//     }
//   };

  // const animate = async (latitude, longitude, headingParam) => {
  //   const newCoordinate = {
  //     latitude,
  //     longitude,
  //     latitudeDelta: LATITUDE_DELTA,
  //     longitudeDelta: LONGITUDE_DELTA,
  //   };
  //   if (mapRef.current) {
  //     const earthRadius = 6371000; // Rayon de la Terre en mètres (environ)
  //     const screenHeight =
  //       Dimensions.get("window").height -
  //       (Dimensions.get("window").height - mapHeight);
  //     const screenCenterY = screenHeight / 2; // Y-coordinate du centre de l'écran
  //     const distanceFromCenter = screenCenterY + mapHeight / 2; // Distance du point au centre de l'écran

  //     // Convertissez l'angle de direction (heading) en radians
  //     const headingRad = (headingParam * Math.PI) / 180;

  //     // Calcul de la latitude en fonction de la direction
  //     const newLat =
  //       latitude + (distanceFromCenter / earthRadius) * Math.cos(headingRad);

  //     // Calcul de la longitude en fonction de la direction
  //     const newLng =
  //       longitude +
  //       (distanceFromCenter / (earthRadius * Math.cos(latitude))) *
  //         Math.sin(headingRad);

  //     // Arrondir les coordonnées à 5 chiffres après la virgule
  //     const roundedNewLat = Number(newLat);
  //     const roundedNewLng = Number(newLng);

  //     const newCoordinatetest = {
  //       latitude: roundedNewLat,
  //       longitude: roundedNewLng,
  //       latitudeDelta: LATITUDE_DELTA,
  //       longitudeDelta: LONGITUDE_DELTA,
  //     };
  //     // console.log(JSON.stringify(newCoordinatetest), newLat, latitude);
  //     coordinatetest.timing(newCoordinatetest, { duration: 0 }).start();
  //     coordinate.timing(newCoordinate, { duration: 0 }).start();

  //     if (center) {
  //       mapRef.current.animateCamera(
  //         {
  //           center: {
  //             latitude: roundedNewLat,
  //             longitude: roundedNewLng,
  //             latitudeDelta: LATITUDE_DELTA,
  //             longitudeDelta: LONGITUDE_DELTA,
  //           },
  //           zoom: 23,
  //           altitude: 20,
  //           heading: headingParam,
  //           pitch: 60,
  //         },
  //         { duration: 0 }
  //       );
  //     }
  //   }
  // };

  // const onCenter = () => {
  //   mapRef.current.animateToRegion({
  //     latitude: curLoc.latitude,
  //     longitude: curLoc.longitude,
  //     latitudeDelta: LATITUDE_DELTA,
  //     longitudeDelta: LONGITUDE_DELTA,
  //   });
  // };

  // const handleCancelCenter = () => {
  //   updateState({ center: false });
  // };

  const handleSheetClose = () => {
    console.log(bottomSheetClose);
    if (bottomSheetClose == true) bottomSheetRef.current?.expand();
    else bottomSheetRef.current?.close();
  };

  const handleSheetChanges = useCallback((index) => {
    console.log("Index : ", index);
    if (index >= 0) updateState({ bottomSheetClose: false });
    else updateState({ bottomSheetClose: true });
  }, []);

  const routesToDisplay = routeOptions;

  // const maxZoomFactor = 0.01; // Facteur de zoom maximum
  // const minZoomFactor = 0.0002; // Facteur de zoom minimum
  // const zoomFactorRange = maxZoomFactor - minZoomFactor;
  // const normalizedSpeed = Math.min(Math.max(speed, 0), 20); // Normaliser la vitesse entre 0 et 20 km/h

  // Calcul du temps écoulé en secondes depuis le début du voyage
  // const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
  // const allDistanceRoute = parseInt(routesToDisplay.routeDistance, 10);
  //Calcul de la distance parcouru
  // const DistanceInMeters =
  //   Math.max(allDistanceRoute, distance) - Math.min(allDistanceRoute, distance);

  // const averageSpeed =
  //   speed.current > 0 ? DistanceInMeters / elapsedTimeInSeconds : 25;

  // Calcul du temps restant (en secondes)
  // const remainingTimeInSeconds = distance / averageSpeed;

  // Calcul de l'heure d'arrivée
  // const estimatedArrivalTime = new Date(
  //   startTime + remainingTimeInSeconds * 1000
  // );
  // const arrivalHour = estimatedArrivalTime.getHours(); // Obtenez l'heure (0-23)
  // const arrivalMinute = estimatedArrivalTime.getMinutes(); // Obtenez les minutes (0-59)

  // Créez une chaîne de caractères pour l'heure au format HH:MM
  // const arrivalTimeStr = `${arrivalHour
  //   .toString()
  //   .padStart(2, "0")}:${arrivalMinute.toString().padStart(2, "0")}`;

  // const infoTravelAnimatedStyle = useAnimatedStyle(() => {
  //   let bottomValue = 0;
  //   let heightValue = 80;
  //   console.log("sheetOffset.value :", sheetOffset.value);
  //   bottomValue = frame.height - sheetOffset.value - 175;
  //   if (bottomValue < 0) {
  //     bottomValue = 0;
  //     heightValue = 100;
  //   }

  //   return {
  //     bottom: bottomValue,
  //     height: heightValue,
  //   };
  // });

  const cancelModal = () => {
    updateState({ exitConfirmation: false });
  };

  const saveTravelAndQuit = () => {
   /// saveTrackingData();
    navigate("ChoiceAddress");
  };

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {/* <UrlTile
              urlTemplate="http://192.168.0.58:8080/tile/{z}/{x}/{y}.png"
              zIndex={99}
              tileSize={256}
            /> */}
          {/* <MapView
            ref={mapRef}
            mapPadding={{ top: 20, bottom: 20, right: 20, left: 20 }}
            onMoveShouldSetResponderCapture={handleCancelCenter}
            onPinchEnd={handleCancelCenter}
            style={styles.map}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setMapWidth(width);
              setMapHeight(height);
            }}
            showsUserLocation={false}
            followsUserLocation={false}
            zoomEnabled={true}
            zoomControlEnabled={true}
            zoomTapEnabled={true}
            pitchEnabled={true}
            mapType={"none"}
          >
            <Polyline
              zIndex={3}
              coordinates={routesToDisplay.coordinates}
              strokeColor={"purple"} // Highlight the first route with a different color
              strokeWidth={10}
              lineCap={"round"}
            />
            <Marker.Animated
              ref={markerRef}
              coordinate={coordinate}
              flat={false}
            >
              <Animated.Image
                source={require("../../../assets/arrow.png")}
                style={[
                  {
                    backgroundColor: "#252525",
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{ rotateX: 60 + "deg" }],
                  },
                ]}
              />
            </Marker.Animated>
            <Marker.Animated
              ref={markerReftest}
              coordinate={coordinatetest}
              flat={false}
            >
              <Animated.Image
                source={require("../../../assets/arrow.png")}
                style={[
                  {
                    backgroundColor: "#252525",
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{ rotateX: 60 + "deg" }],
                  },
                ]}
              />
            </Marker.Animated>
          </MapView> */}
          <Maps
            styleMaps={styles.map}
            initialRouteOptions={route}
            selectedRouteIndex={null}
            onPolylineSelect={() => {}}
            currentRegion={null}
            userSpeed={null}
            isNavigating={true}
            showManeuver={true}
          ></Maps>
          {/* <ManeuverView
            step={currentInstruction}
            fontFamily={"Akkurat-Light"}
            fontFamilyBold={"Akkurat-Bold"}
          ></ManeuverView> */}
          <View style={{ flex: 1 }}>
            {/* Conteneur principal */}
            <View style={{ flex: 1 }}>
              <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                position={"bottom"}
                animateOnMount={true}
                enablePanDownToClose={true}
                onChange={handleSheetChanges}
                animatedPosition={sheetOffset}
              >
                <View
                  style={{
                    height: 80,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 10,
                    backgroundColor: "white",
                    borderColor: "#C1C1C1",
                    borderTopWidth: 1,
                    bottom: 0,
                  }}
                >
                  <Pressable
                    style={{
                      height: 50,
                      width: 100,
                      borderColor: "#C1C1C1",
                      backgroundColor: "#d61e02",
                      borderWidth: 1,
                      borderRadius: 40,
                      marginRight: 0,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      if (positions.current.length > 0)
                        updateState({ exitConfirmation: true });
                    }}
                  >
                    <Text style={{ color: "black" }}>Arrêter</Text>
                  </Pressable>
                  <Pressable
                    style={{
                      height: 50,
                      width: 125,
                      borderColor: "#C1C1C1",
                      backgroundColor: "#3498db",
                      borderWidth: 1,
                      borderRadius: 40,
                      marginRight: 0,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="export-variant"
                      style={{ color: "black", marginLeft: 0 }}
                      size={15}
                    >
                      <Text style={{ color: "black" }}>Partager</Text>
                    </MaterialCommunityIcons>
                  </Pressable>

                  <Pressable
                    style={{
                      height: 50,
                      width: 125,
                      borderColor: "#C1C1C1",
                      backgroundColor: "#3498db",
                      borderWidth: 1,
                      borderRadius: 40,
                      marginRight: 0,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => handleSheetClose()}
                  >
                    <Text style={{ color: "black" }}>Reprendre</Text>
                  </Pressable>
                </View>
              </BottomSheet>
              {/* <Animated.View
                style={[
                  {
                    position: "absolute",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 10,
                    backgroundColor: "white",
                    borderColor: "#C1C1C1",
                    borderTopWidth: 1,
                    left: 0,
                    right: 0,
                    borderTopLeftRadius: 10, // Rayon du coin supérieur gauche
                    borderTopRightRadius: 10, // Rayon du coin supérieur droit
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                    elevation: 4,
                  },
                  infoTravelAnimatedStyle,
                ]}
              >
                <Text style={{ color: "black" }}></Text>
                <Text style={{ color: "black" }}>
                  {utils.formatDistance(distance)}
                </Text>
                <Text
                  style={{ color: "black", fontWeight: "bold", fontSize: 25 }}
                >
                  {arrivalTimeStr}
                </Text>
                <Text style={{ color: "black" }}>
                  {utils.formatElapsedTime(remainingTimeInSeconds)}
                </Text>
                <Pressable
                  style={{ borderRadius: 40, backgroundColor: "lightgray" }}
                  onPress={() => handleSheetClose()}
                >
                  <MaterialCommunityIcons
                    name={bottomSheetClose ? "chevron-up" : "chevron-down"}
                    style={{
                      color: "white", // Couleur de l'icône
                      marginLeft: 0,
                      padding: 2, // Marge autour de l'icône
                    }}
                    size={20} // Taille de l'icône
                  ></MaterialCommunityIcons>
                </Pressable>
              </Animated.View> */}
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
      {isLoading && (
        <LoadingOverlay>
          <Text style={{ color: "white" }}>
            Recherche d'un nouvel itinéraire...
          </Text>
        </LoadingOverlay>
      )}
      <View>
        <ConfirmModal
          visible={exitConfirmation}
          text="Voulez-vous sauvegarder votre parcours ?"
          onConfirm={saveTravelAndQuit}
          onNotConfirm={() => navigate("ChoiceAddress")}
          onCancel={cancelModal}
        ></ConfirmModal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  speedContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 5,
  },
  speedText: {
    fontSize: 16,
  },

  item: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
export default TravelScreen;

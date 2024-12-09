import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  Pressable,
  Animated as animated2,
  Alert,
  useAnimatedValue,
} from "react-native";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import MapView, {
  Polyline,
  Marker,
  AnimatedRegion,
  MarkerAnimated,
} from "react-native-maps";
import * as utils from "../utils/Utils";
import { AnimatedMapView } from "react-native-maps/lib/MapView";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import Arrow from "../components/Arrow";
import ManeuverView from "./ManeuverView/index";
import { useFocusEffect } from "@react-navigation/native";
import * as api from "../helpers/Api";
import {
  getDistance,
  findNearest,
  getRhumbLineBearing,
  getCompassDirection,
  isPointInPolygon,
} from "geolib";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import LoadingOverlay from "./LoadingOverlay";

const Maps = ({
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
}) => {
  const frame = useSafeAreaFrame();
  const sheetOffset = useSharedValue(
    sheetOffsetValue > 0 ? sheetOffsetValue : 0
  );
  const mapRef = useRef(null);
  const lastLocation = useRef(null);
  const distanceTraveled = useRef(0);
  const maxSpeed = useRef(0);
  const speed = useRef(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState({
    currentStep: 0,
    destinationCords: {},
    isLoading: false,
    startTime: null,
    time: 0,
    distance: 0,
    urlTemplate: "http://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
    center: true,
    currentInstruction: { closestInstruction: null, distanceRest: 0 },
    instructions: [],
    routeOptions: initialRouteOptions ? initialRouteOptions : [],
    bottomSheetClose: true,
    exitConfirmation: false,
    heading: useAnimatedValue(0),
    coordinates: new AnimatedRegion({
      latitude: 0,
      longitude: 0,
    }),
  });

  const {
    startTime,
    distance,
    isLoading,
    center,
    currentInstruction,
    routeOptions,
    bottomSheetClose,
    exitConfirmation,
    heading,
    coordinates,
  } = state;
  const deviationThreshold = 20; // Seuil de déviation en mètres

  const updateState = (data) =>
    setState((prevState) => ({ ...prevState, ...data }));
  let countIncorrectPath = 0;

  const MERCATOR_OFFSET = Math.pow(2, 28);
  const MERCATOR_RADIUS = MERCATOR_OFFSET / Math.PI;
  const { width, height } = Dimensions.get("window");
  const SCREEN_HEIGHT_RATIO = screenHeightRatio
    ? screenHeightRatio
    : height / 1920; // 1920 est un exemple de hauteur d'écran de référence

  const routesToDisplay =
    isNavigating && routeOptions && selectedRouteIndex !== null
      ? [routeOptions[selectedRouteIndex]]
      : routeOptions;

  const route = routeOptions;

  let zoomFactor = 0;

  if (routesToDisplay?.length > 0 && !isNavigating) {
    // Calculate the center point between start and end coordinates
    const startCoords = routesToDisplay[0]?.coordinates[0];
    const endCoords =
      routesToDisplay[0]?.coordinates[
        routesToDisplay[0]?.coordinates.length - 1
      ];
    const centerLatitude = (startCoords.latitude + endCoords.latitude) / 2;
    const centerLongitude = (startCoords.longitude + endCoords.longitude) / 2;

    // Calculate the necessary latitude and longitude deltas for displaying the whole route
    const distanceLatitude = Math.abs(
      startCoords.latitude - endCoords.latitude
    );
    const distanceLongitude = Math.abs(
      startCoords.longitude - endCoords.longitude
    );
    const zoomFactor = Math.max(distanceLatitude, distanceLongitude) * 2;
  }

  const maxZoomFactor = 0.01; // Facteur de zoom maximum
  const minZoomFactor = 0.0002; // Facteur de zoom minimum
  const zoomFactorRange = maxZoomFactor - minZoomFactor;
  const normalizedSpeed = Math.min(Math.max(userSpeed, 0), 25); // Normaliser la vitesse entre 0 et 20 km/h
  const adjustedZoomFactor =
    minZoomFactor + (normalizedSpeed / 25) * zoomFactorRange;

  const tooltipCoordinates = {
    latitude: 0,
    longitude: 0,
  };

  let arrivalTimeStr = "00:00";
  let remainingTimeInSeconds = 0;

  if (isNavigating && showManeuver && routesToDisplay?.length > 0) {
    // Calcul du temps écoulé en secondes depuis le début du voyage
    const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
    const allDistanceRoute = parseInt(routesToDisplay?.routeDistance, 10);
    //Calcul de la distance parcouru
    const DistanceInMeters =
      Math.max(allDistanceRoute, distance) -
      Math.min(allDistanceRoute, distance);

    const averageSpeed =
      speed.current > 0 ? DistanceInMeters / elapsedTimeInSeconds : 25;

    // Calcul du temps restant (en secondes)
    remainingTimeInSeconds = distance / averageSpeed;

    // Calcul de l'heure d'arrivée
    const estimatedArrivalTime = new Date(
      startTime + remainingTimeInSeconds * 1000
    );
    const arrivalHour = estimatedArrivalTime.getHours(); // Obtenez l'heure (0-23)
    const arrivalMinute = estimatedArrivalTime.getMinutes(); // Obtenez les minutes (0-59)

    // Créez une chaîne de caractères pour l'heure au format HH:MM
    arrivalTimeStr = `${arrivalHour.toString().padStart(2, "0")}:${arrivalMinute
      .toString()
      .padStart(2, "0")}`;
  }
  //const screenCoordinates = mapRef.current?.getMapPosition(tooltipCoordinates);
  const getOffset = (zoom, heading, screenRatio) => {
    const BASE_OFFSET = -0.005 * screenRatio; // Ajuster   si nécessaire

    const offset = BASE_OFFSET / Math.pow(2, zoom); // Ajustement basé sur le zoom
    const radHeading = heading * (Math.PI / 180); // Convertir le heading en radians

    // Calculer le décalage basé sur le heading
    const offsetLatitude = offset * Math.cos(radHeading);
    const offsetLongitude = offset * Math.sin(radHeading);

    // Inverser le décalage pour le garder en bas de l'écran
    return {
      offsetLatitude: -offsetLatitude,
      offsetLongitude: -offsetLongitude,
    };
  };

  // Navigation
  function sameDirection(currentBearing, targetBearing) {
    return (
      targetBearing <= currentBearing + 90 &&
      targetBearing >= currentBearing - 90
    );
  }

  function getAllDistanceRest(coordinates, i) {
    let allDistance = 0;
    for (var i = i; i < coordinates?.length - 1; i++) {
      allDistance += getDistance(coordinates?.[i], coordinates?.[i + 1]);
    }
    return allDistance;
  }

  function IsInFront(currentPosition, targetPosition, heading) {
    const pointHeading = getRhumbLineBearing(currentPosition, targetPosition);
    return pointHeading <= heading + 90 && pointHeading >= heading - 90;
  }

  function IsInFrontPrecise(currentPosition, targetPosition, heading) {
    const pointHeading = getRhumbLineBearing(currentPosition, targetPosition);
    return pointHeading <= heading + 20 && pointHeading >= heading - 20;
  }

  const getInstructionByCoordinates = (coordinates, instructions, index) => {
    if (!coordinates || !instructions) return null;
    const targetCoordinate = coordinates?.[index];
    const instruction = instructions.find((item) => {
      const maneuverLocation = item.maneuver?.location;
      if (maneuverLocation) {
        const [longitude, latitude] = maneuverLocation;
        return (
          longitude === targetCoordinate.longitude &&
          latitude === targetCoordinate.latitude
        );
      }
      return false;
    });

    if (instruction) {
      return instruction;
    } else if (targetCoordinate === coordinates[coordinates.length - 1]) {
      return instructions[instructions.length - 1];
    } else {
      return null;
    }
  };

  const getIndexCoordinates = (routeCoordinates, targetCoordinates) => {
    for (let i = 0; i < routeCoordinates.length; i++) {
      const routeCoordinate = routeCoordinates[i];
      if (
        routeCoordinate.latitude === targetCoordinates.latitude &&
        routeCoordinate.longitude === targetCoordinates.longitude
      ) {
        return i;
      }
    }
    console.log("Aucune correspondance trouvée.");
    return null;
  };

  //TTEST

  const initializeStartingPoint = (position) => {
    if (!route?.coordinates || !position) return;

    const coordinates = route?.coordinates;
    const closestPointIndex = coordinates.reduce(
      (closestIndex, point, index) => {
        const distance = getDistance(position, {
          latitude: point.latitude,
          longitude: point.longitude,
        });
        return distance <
          getDistance(position, {
            latitude: coordinates[closestIndex].latitude,
            longitude: coordinates[closestIndex].longitude,
          })
          ? index
          : closestIndex;
      },
      0
    );
    console.log("====================================");
    console.log("closestPointIndex", closestPointIndex);
    console.log("====================================");
    setCurrentStep(closestPointIndex);
    return closestPointIndex;
  };

  const checkIfOffRoute = (position) => {
    if (!route?.coordinates || !position) return;

    const steps = route?.coordinates;
    const closestPoint = steps.reduce(
      (closest, point) => {
        const distance = getDistance(position, {
          latitude: point.latitude,
          longitude: point.longitude,
        });
        return distance < closest.distance ? { point, distance } : closest;
      },
      { point: null, distance: Infinity }
    );

    if (closestPoint.distance > deviationThreshold) {
      console.log("Attention", "Vous vous écartez du trajet prévu !");
    }
  };

  const handleNavigationUpdate = (position) => {
    if (!route?.coordinates || !position) return;
    console.log("====================================");
    console.log("currentStep", currentStep);
    const steps = route?.instructions;
    const nextStep = steps[currentStep];
    const nextPoint = route?.coordinates[nextStep.way_points[1]];

    const distanceToNextPoint = getDistance(
      { latitude: position.latitude, longitude: position.longitude },
      { latitude: nextPoint.latitude, longitude: nextPoint.longitude }
    );
    console.log("====================================");
    console.log("distanceToNextPoint", distanceToNextPoint);
    console.log("====================================");
    if (distanceToNextPoint <= 10) {
      console.log("====================================");
      console.log("nextStep", nextStep);
      console.log(nextStep.instruction);
      setCurrentStep(currentStep + 1);
      return currentStep + 1;
      //setCurrentStep(currentStep + 1); // Passer à l'étape suivante
    }
  };

  //TEST

  const getInstruction = async (curLoc, heading, speed) => {
    let instruction = null;
    let newRouteOptions = null;
    if (!route?.instructions) return;
    if (route?.instructions) {
      if (countIncorrectPath > 4) {
        updateState({
          isLoading: true,
        });
        countIncorrectPath = 0;

        const endsCoords = route?.coordinates[route?.coordinates?.length - 1];

        endsCoordsLatitude = endsCoords.latitude;
        endsCoordsLongitude = endsCoords.longitude;

        const routes = await api.calculateRoute(
          curLoc,
          [endsCoordsLongitude, endsCoordsLatitude],
          ["recommended"],
          1,
          [[heading, 15]]
        );

        const routeOptions = {
          id: 0,
          coordinates: routes[0].coordinates,
          instructions: routes[0].instructions,
          routeDistance: routes[0].routeDistance,
          duration: routes[0].duration,
        };

        route = routeOptions;

        updateState({
          routeOptions: routeOptions,
          isLoading: false,
        });
      }
      instruction = getCurrentInstruction(
        curLoc,
        route?.instructions,
        route?.coordinates,
        heading
      );
      //updateState({ currentInstruction: instruction });
    }
    let allDistanceCalculate = 0;

    if (lastLocation.current) {
      if (speed > 0) {
        allDistanceCalculate = getDistance(lastLocation.current, curLoc);
      }
    }
    distanceTraveled.current = distanceTraveled.current + allDistanceCalculate;
    speed.current = speed;

    updateState({
      currentInstruction: instruction,
      distance: instruction.distance,
    });
  };

  const getCurrentInstruction = (
    currentPosition,
    instructions,
    routeCoordinates,
    heading
  ) => {
    if (!currentPosition || !instructions || !routeCoordinates) {
      console.error("Invalid input parameters");
      return null;
    }

    const nearestPoint = findNearest(currentPosition, routeCoordinates);
    const indexCoordinates = getIndexCoordinates(
      routeCoordinates,
      nearestPoint
    );
    let allDistanceRes = 0;
    let lastIndexCoordinates = 0;

    if (indexCoordinates === 0) {
      let distanceRest = 0;

      for (
        let i = instructions[0].way_points[0];
        i <= instructions[0].way_points[1];
        i++
      ) {
        countIncorrectPath = 0;
        const coordinates = routeCoordinates[i];
        distanceRest += getDistance(currentPosition, coordinates);
      }
      allDistanceRes = getAllDistanceRest(
        routeCoordinates,
        instructions[0].way_points[1]
      );
      allDistanceRes += distanceRest;

      if (distanceRest > instructions[1].distance - 6) {
        return {
          closestInstruction: getInstructionByCoordinates(
            routeCoordinates,
            instructions,
            instructions[0].way_points[1]
          ),
          distanceRest: distanceRest,
          distance: allDistanceRes,
        };
      } else {
        return {
          closestInstruction: instructions[0],
          distanceRest: distanceRest,
          distance: allDistanceRes,
        };
      }
    } else {
      const inFront = IsInFront(currentPosition, nearestPoint, heading);

      const instruction = instructions.find((item) => {
        const [start, end] = item.way_points;
        return (
          (inFront && indexCoordinates > start && indexCoordinates <= end) ||
          (!inFront && indexCoordinates >= start && indexCoordinates < end)
        );
      });

      if (instruction) {
        let distanceRest = 0;
        let inFront = false;
        for (
          let i = instruction.way_points[0];
          i <= instruction.way_points[1];
          i++
        ) {
          const coordinates = routeCoordinates[i];
          const inFrontOfPosition = IsInFront(
            currentPosition,
            coordinates,
            heading
          );
          const inFrontOfPositionPrecise = IsInFrontPrecise(
            currentPosition,
            coordinates,
            heading
          );
          if (inFrontOfPosition) {
            distanceRest += getDistance(currentPosition, coordinates);
            lastIndexCoordinates = i;
          }
          if (inFrontOfPositionPrecise) inFront = true;
        }
        allDistanceRes = getAllDistanceRest(
          routeCoordinates,
          lastIndexCoordinates
        );
        allDistanceRes += distanceRest;

        const instructionByCoordinates = getInstructionByCoordinates(
          routeCoordinates,
          instructions,
          instruction.way_points[1]
        );

        const bearingBefore = instructionByCoordinates.maneuver.bearing_before;
        if (sameDirection(heading, bearingBefore) && inFront) {
          countIncorrectPath = 0;
        } else {
          if (
            instructionByCoordinates.maneuver.bearing_before == 0 &&
            instructionByCoordinates.maneuver.bearing_after == 0
          ) {
            let pos1 = 0;
            let pos2 = 0;
            const wayPoint = instruction.way_points[1];

            pos1 = routeCoordinates[wayPoint - 1];
            pos2 = routeCoordinates[wayPoint];

            const headingPoly = getRhumbLineBearing(pos1, pos2);
            if (sameDirection(heading, headingPoly) && inFront) {
              console.log("same direction");
              countIncorrectPath = 0;
            } else {
              console.log("not same direction +1 ");
              countIncorrectPath += 1;
            }
            console.log("headingPoly", headingPoly);
          } else {
            console.log("HEADING NOKKKKK +1 ");
            countIncorrectPath += 1;
          }
        }

        return {
          closestInstruction: instructionByCoordinates,
          distanceRest: distanceRest,
          distance: allDistanceRes,
        };
      } else {
        return {
          closestInstruction: null,
          distanceRest: 0,
          distance: 0,
        };
      }
    }
  };

  const updateCamera = useCallback(
    (map, coordinates, heading, screenRatio) => {
      if (!coordinates || !map) return;
      const { latitude, longitude, heading: coordHeading } = coordinates;
      if (isNaN(latitude) || isNaN(longitude) || isNaN(coordHeading)) {
        console.error("Invalid coordinates:", coordinates);
        return;
      }

      const { latitudeDelta, longitudeDelta } = mercatorDegreeDeltas(
        coordinates?.latitude,
        coordinates?.longitude,
        width,
        height,
        Platform.OS === "ios" ? 20 : 19
      );
      const { offsetLatitude, offsetLongitude } = getOffset(
        Platform.OS === "ios" ? 3 : 2,
        coordinates?.heading,
        screenRatio
      );

      if (
        map !== null &&
        map !== undefined &&
        coordinates?.latitude !== null &&
        coordinates?.longitude !== null
      ) {
        map?.animateCamera(
          {
            center: {
              latitude: coordinates.latitude + offsetLatitude,
              longitude: coordinates.longitude + offsetLongitude,
            },
            heading: coordinates?.heading,
            pitch: Platform.OS === "ios" ? 60 : 75,
            altitude: Platform.OS === "ios" ? 90 : 70,
            zoom: Platform.OS === "ios" ? 0 : 19,
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta,
          },
          { duration: 300 }
        );

        setTimeout(async () => {
          const cam = await map?.getCamera();
          animated2
            .timing(heading, {
              toValue:
                coordinates?.heading - cam?.center ? cam?.center?.heading : 0,
              duration: 300,
              useNativeDriver: true,
            })
            .start();
        }, 300);
      }
    },
    [coordinates, heading]
  );

  function mercatorLatitudeToY(latitude) {
    return Math.round(
      MERCATOR_OFFSET -
        (MERCATOR_RADIUS *
          Math.log(
            (1 + Math.sin(latitude * (Math.PI / 180))) /
              (1 - Math.sin(latitude * (Math.PI / 180)))
          )) /
          2
    );
  }

  function mercatorLongitudeToX(longitude) {
    return Math.round(
      MERCATOR_OFFSET + (MERCATOR_RADIUS * longitude * Math.PI) / 180
    );
  }

  function mercatorXToLongitude(x) {
    return (((x - MERCATOR_OFFSET) / MERCATOR_RADIUS) * 180) / Math.PI;
  }

  function mercatorYToLatitude(y) {
    return (
      ((Math.PI / 2 -
        2 * Math.atan(Math.exp((y - MERCATOR_OFFSET) / MERCATOR_RADIUS))) *
        180) /
      Math.PI
    );
  }

  function mercatorAdjustLatitudeByOffsetAndZoom(latitude, offset, zoom) {
    return mercatorYToLatitude(
      mercatorLatitudeToY(latitude) + (offset << (21 - zoom))
    );
  }

  function mercatorAdjustLongitudeByOffsetAndZoom(longitude, offset, zoom) {
    return mercatorXToLongitude(
      mercatorLongitudeToX(longitude) + (offset << (21 - zoom))
    );
  }

  function mercatorDegreeDeltas(latitude, longitude, width, height, zoom) {
    if (!zoom) {
      zoom = 20;
    }

    const deltaX = width / 2;
    const deltaY = height / 4;

    const northLatitude = mercatorAdjustLatitudeByOffsetAndZoom(
      latitude,
      deltaY * -1,
      zoom
    );
    const westLongitude = mercatorAdjustLongitudeByOffsetAndZoom(
      longitude,
      deltaX * -1,
      zoom
    );
    const southLatitude = mercatorAdjustLatitudeByOffsetAndZoom(
      latitude,
      deltaY,
      zoom
    );
    const eastLongitude = mercatorAdjustLongitudeByOffsetAndZoom(
      longitude,
      deltaY,
      zoom
    );

    const latitudeDelta = Math.abs(northLatitude - southLatitude);
    const longitudeDelta = Math.abs(eastLongitude - westLongitude);

    return { latitudeDelta, longitudeDelta };
  }

  //TODO: MOVE TO ANOTHER FILE ^
  const findClosestPointOnPolyline = async (
    currentPosition,
    polylineCoordinates
  ) => {
    return findNearest(
      {
        longitude: currentPosition?.longitude,
        latitude: currentPosition?.latitude,
      },
      polylineCoordinates
    );
  };

  useEffect(() => {
    let locationSubscription;
    if (isNavigating) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log("status", status, Platform.OS === "ios");
        if (status !== "granted") {
          return;
        }

        if (!locationSubscription) {
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation,
              timeInterval: 1000,
              distanceInterval: 5,
            },
            (newLocation) => {
              let { coords } = newLocation;
              const map = mapRef.current;

              let closestPoint = coords;

              if (routesToDisplay && routesToDisplay?.coordinates) {
                // Trouver le point le plus proche sur la polyline
                const findClosetPoint = findClosestPointOnPolyline(
                  coords,
                  routesToDisplay.coordinates
                );
                if (findClosetPoint) {
                  closestPoint = findClosetPoint;
                }
              }

              if (
                coordinates.latitude !== coords.latitude &&
                coordinates.longitude !== coords.longitude
              ) {
                coordinates
                  .timing({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                  })
                  .start();
              }

              updateCamera(map, coords, heading, SCREEN_HEIGHT_RATIO);
              if (isNavigating && showManeuver) {
                const newPosition = {
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                };
                console.log("====================================");
                console.log("currentStep", currentStep);
                console.log("====================================");
                if (currentStep === 0) {
                  initializeStartingPoint(newPosition);
                } else {
                  handleNavigationUpdate(newPosition);
                  checkIfOffRoute(newPosition);
                }

                // getInstruction(
                //   {
                //     latitude: coords.latitude,
                //     longitude: coords.longitude,
                //   },
                //   coords.heading,
                //   coords.speed
                // );
              }
            }
          );
        }
      })();
    }
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [SCREEN_HEIGHT_RATIO]);

  useEffect(() => {
    if (!isNavigating && currentRegion) {
      const map = mapRef.current;
      if (map && currentRegion.latitude && currentRegion.longitude) {
        map.animateToRegion(currentRegion, 1000); // 1000 ms pour l'animation
      }
    }
  }, [currentRegion, isNavigating]);

  return (
    <>
      <AnimatedMapView
        ref={mapRef}
        showsMyLocationButton={false}
        showsUserLocation={false}
        followsUserLocation={false}
        zoomEnabled={true}
        zoomControlEnabled={true}
        zoomTapEnabled={false}
        pitchEnabled={true}
        showsBuildings={true}
        style={styleMaps}
      >
        {routesToDisplay?.length > 0 &&
          routesToDisplay?.map(
            (routeCoordinates, index) =>
              routeCoordinates?.coordinates &&
              routeCoordinates.coordinates.length > 0 &&
              !showManeuver && (
                <React.Fragment key={index}>
                  {console.log(
                    "routeCoordinates",
                    routeCoordinates?.coordinates
                  )}
                  <Polyline
                    onPress={() => onPolylineSelect(index)}
                    coordinates={routeCoordinates?.coordinates}
                    strokeColor={
                      selectedRouteIndex === index
                        ? "blue"
                        : "rgba(242, 135, 138, 0.5)" // Permet de mettre en bleu la route choisi sinon en rouge transparent
                    }
                    strokeWidth={5}
                  />
                  <Marker
                    coordinate={
                      routeCoordinates?.coordinates[
                        Math.floor(routeCoordinates?.coordinates?.length / 2)
                      ]
                    }
                    zIndex={99}
                    anchor={{ x: 0, y: -15 }}
                    centerOffset={{ x: 0, y: -20 }}
                    rotation={currentRegion?.heading}
                  >
                    {/* Contenu du Callout (tooltip) */}
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        name="tooltip"
                        size={70}
                        style={{
                          color: "white",
                          transform: [{ scaleY: 0.6 }],
                        }}
                      ></MaterialCommunityIcons>
                      <Text style={{ position: "absolute" }}>
                        {routeCoordinates?.duration}
                      </Text>
                    </View>
                  </Marker>
                </React.Fragment>
              )
          )}
        {!isNavigating ? (
          <>
            <Marker
              coordinate={{
                latitude: currentRegion?.latitude,
                longitude: currentRegion?.longitude,
              }}
              rotation={currentRegion?.heading}
            >
              <Image
                source={
                  isNavigating
                    ? require("../../assets/arrow.png")
                    : require("../../assets/Oval.png")
                }
                style={{ width: 50, height: 50 }}
              />
            </Marker>
          </>
        ) : (
          <>
            {showManeuver && routesToDisplay?.coordinates && (
              <Polyline
                coordinates={routesToDisplay.coordinates}
                strokeColor={"purple"} // Highlight the first route with a different color
                strokeWidth={10}
                lineCap={"round"}
              />
            )}

            <MarkerAnimated
              coordinate={coordinates}
              flat={false}
              anchor={{ x: 0.5, y: 0.2 }}
            >
              <animated2.View
                style={{
                  transform: [
                    {
                      rotate: heading.interpolate({
                        inputRange: [0, 360],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                }}
              >
                <Arrow />
              </animated2.View>
            </MarkerAnimated>
          </>
        )}
      </AnimatedMapView>

      {isNavigating && showManeuver && currentInstruction && (
        <>
          <View
            className="absolute top-0 left-0 right-0 z-10 h-full"
            pointerEvents="box-none"
          >
            <ManeuverView
              step={currentInstruction}
              fontFamily={"Akkurat-Light"}
              fontFamilyBold={"Akkurat-Bold"}
            ></ManeuverView>

            <Animated.View
              pointerEvents="box-none"
              style={[
                {
                  display: "flex",
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "white",
                  padding: 20,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.5,
                  shadowRadius: 4,
                  elevation: 4,
                  zIndex: 10, // Ensure it is above the map
                },
                infoTravelAnimatedStyle,
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
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
                  onPress={handleSheetClose} // TODO handleSheetClose()}
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
              </View>
            </Animated.View>
          </View>
        </>
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

const styles = StyleSheet.create({
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
  tooltipContainer: {
    top: -20,
    left: "50%",
    transform: [{ translateX: "-50%" }, { translateY: "-100%" }],
    padding: 10,
    color: "#000000",
    backgroundColor: "#66CCCC",
    fontWeight: "normal",
    fontSize: 13,
    borderRadius: 8,
    position: "absolute",
    zIndex: 99999999,
    borderColor: "#000000", // Ajoutez une couleur de bordure si nécessaire
    borderWidth: 1, // Ajoutez une largeur de bordure si nécessaire
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 8,
    shadowColor: "rgba(0,0,0,0.5)",
    shadowOpacity: 1,
    elevation: 8, // Pour l'ombre sur Android
    visibility: "visible",
    opacity: 1,
    transition: "opacity 0.8s",
    // Autres styles de personnalisation du tooltip
  },
});

export default Maps;

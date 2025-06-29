import { useRef, useState, useCallback, useEffect } from "react";
import { Dimensions, Platform, useAnimatedValue } from "react-native";
import { AnimatedRegion } from "react-native-maps";
import {
  getDistance,
  findNearest,
  getGreatCircleBearing,
  computeDestinationPoint,
} from "geolib";
import * as Speech from "expo-speech";
import * as api from "../../helpers/Api";
import { runOnUI, useSharedValue, withSpring } from "react-native-reanimated";
import simplify from "simplify-js";
import debounce from "lodash.debounce";
import { useNetwork } from "../../context/networkContext";
const MERCATOR_OFFSET = Math.pow(2, 28);
const MERCATOR_RADIUS = MERCATOR_OFFSET / Math.PI;
let speedHistory = [];
const DEFAULT_SPEED = 10; // km/h
const ROUTE_DEVIATION_THRESHOLD = 10; // mètres

export const useNavigationLogic = ({
  initialRouteOptions,
  isNavigating,
  showManeuver,
  mode,
  isCameraLockedRef,
  handleRouteOptionsChange,
}) => {
  const { isConnected } = useNetwork();
  const { width, height } = Dimensions.get("window");
  const SCREEN_RATIO = height / 1920;
  const [gpxPoints, setGpxPoints] = useState([]);
  const lastCoords = useRef(null);
  const lastHeading = useRef(null);
  const lastSpeed = useRef(null);
  const lastGpxPointTime = useRef(null);
  const speedTimeoutRef = useRef(null);
  const [currentInstruction, setCurrentInstruction] = useState(null);
  const hasCameraBeenInitialized = useRef(false);
  const [distance, setDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [arrivalTimeStr, setArrivalTimeStr] = useState("00:00");
  const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(0);
  const [speedValue, setSpeedValue] = useState(0);
  const lastUpdateTime = useRef(Date.now());
  const routeOptions = useRef(initialRouteOptions || []);

  const coordinates = useRef(
    new AnimatedRegion({ latitude: 0, longitude: 0 })
  ).current;
  const heading = useSharedValue(0);

  const lastLocation = useRef(null);
  const speedRef = useRef(0);
  const distanceTraveled = useRef(0);
  // =============================
  //       UTILITY FUNCTIONS
  // =============================

  useEffect(() => {
    //reinitialiser les valeurs si le mode change
    console.log("Resetting navigation logic for mode:", mode, isNavigating);
    lastCoords.current = null;
    lastHeading.current = null;
    lastSpeed.current = null;
    lastLocation.current = null;
    lastGpxPointTime.current = null;
    distanceTraveled.current = 0;
    hasCameraBeenInitialized.current = false;
    // coordinates.setValue({ latitude: 0, longitude: 0 });
    heading.value = withSpring(0, { damping: 10, stiffness: 100 });
    setCurrentInstruction(null);
    //setRouteOptions(initialRouteOptions || []);
    setDistance(0);
    setArrivalTimeStr("00:00");
    setRemainingTimeInSeconds(0);
    setSpeedValue(0);
    setIsLoading(false);
    lastUpdateTime.current = Date.now();
    setGpxPoints([]);
  }, [mode]);

  useEffect(() => {
    return () => {
      if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
    };
  }, []);

  const mercatorLatitudeToY = (latitude) =>
    Math.round(
      MERCATOR_OFFSET -
        (MERCATOR_RADIUS *
          Math.log(
            (1 + Math.sin(latitude * (Math.PI / 180))) /
              (1 - Math.sin(latitude * (Math.PI / 180)))
          )) /
          2
    );
  const updateInstructionsFromRoute = (route) => {
    if (!route || route.length === 0) return;

    // Exemple : récupère la première instruction ou la plus proche
    const firstInstruction = route[0].instructions?.[0];
    console.log("updateInstructionsFromRoute", firstInstruction);
    if (firstInstruction) {
      setCurrentInstruction(firstInstruction);
      // Optionnel : vocaliser immédiatement
      if (showManeuver) {
        Speech.speak(firstInstruction.message || firstInstruction.instruction, {
          rate: 0.9,
          pitch: 1.2,
          language: "fr-FR",
        });
      }
    }
  };

  const findClosestPointOnPolyline = (polyline, point) => {
    if (polyline.length < 2) {
      return {
        closestPoint: polyline[0],
        minDistance: getDistance(point, polyline[0]),
        closestIndex: 0,
      };
    }

    let closestPoint = null;
    let minDistance = Number.MAX_SAFE_INTEGER;
    let closestIndex = -1;

    for (let i = 0; i < polyline.length - 1; i++) {
      const start = polyline[i];
      const end = polyline[i + 1];

      const segmentDistance = getDistance(start, end);
      const toPointDistance = getDistance(start, point);
      const bearingStartToEnd = getGreatCircleBearing(start, end);
      const bearingStartToPoint = getGreatCircleBearing(start, point);

      const angleDiff = Math.abs(bearingStartToEnd - bearingStartToPoint);
      const projectionDistance =
        toPointDistance * Math.cos(angleDiff * (Math.PI / 180));

      if (projectionDistance >= 0 && projectionDistance <= segmentDistance) {
        const projectedPoint = computeDestinationPoint(
          start,
          projectionDistance,
          bearingStartToEnd
        );
        const distanceToProjectedPoint = getDistance(point, projectedPoint);

        if (distanceToProjectedPoint < minDistance) {
          minDistance = distanceToProjectedPoint;
          closestPoint = projectedPoint;
          closestIndex = i;
        }
      } else {
        // Aux extrémités du segment
        const distanceToStart = getDistance(point, start);
        const distanceToEnd = getDistance(point, end);

        if (distanceToStart < minDistance) {
          minDistance = distanceToStart;
          closestPoint = start;
          closestIndex = i;
        }
        if (distanceToEnd < minDistance) {
          minDistance = distanceToEnd;
          closestPoint = end;
          closestIndex = i + 1;
        }
      }
    }

    return {
      closestPoint,
      minDistance,
      closestIndex,
    };
  };

  const mercatorLongitudeToX = (longitude) =>
    Math.round(MERCATOR_OFFSET + (MERCATOR_RADIUS * longitude * Math.PI) / 180);

  const mercatorXToLongitude = (x) =>
    (((x - MERCATOR_OFFSET) / MERCATOR_RADIUS) * 180) / Math.PI;

  const mercatorYToLatitude = (y) =>
    ((Math.PI / 2 -
      2 * Math.atan(Math.exp((y - MERCATOR_OFFSET) / MERCATOR_RADIUS))) *
      180) /
    Math.PI;

  const mercatorAdjustLatitudeByOffsetAndZoom = (lat, offset, zoom) =>
    mercatorYToLatitude(mercatorLatitudeToY(lat) + (offset << (21 - zoom)));

  const mercatorAdjustLongitudeByOffsetAndZoom = (lon, offset, zoom) =>
    mercatorXToLongitude(mercatorLongitudeToX(lon) + (offset << (21 - zoom)));

  const mercatorDegreeDeltas = (lat, lon, width, height, zoom = 20) => {
    const deltaX = width / 2;
    const deltaY = height / 4;

    const northLatitude = mercatorAdjustLatitudeByOffsetAndZoom(
      lat,
      -deltaY,
      zoom
    );
    const southLatitude = mercatorAdjustLatitudeByOffsetAndZoom(
      lat,
      deltaY,
      zoom
    );
    const westLongitude = mercatorAdjustLongitudeByOffsetAndZoom(
      lon,
      -deltaX,
      zoom
    );
    const eastLongitude = mercatorAdjustLongitudeByOffsetAndZoom(
      lon,
      deltaX,
      zoom
    );

    const latitudeDelta = Math.abs(northLatitude - southLatitude);
    const longitudeDelta = Math.abs(eastLongitude - westLongitude);

    return { latitudeDelta, longitudeDelta };
  };

  // useEffect(() => {
  //   console.log(
  //     "Route options updated:",
  //     isLoading,
  //     "test1",
  //     isLoading && routeOptions?.coordinates?.length > 0,
  //     "test3",
  //     routeOptions
  //   );
  //   if (isLoading && routeOptions?.coordinates?.length > 0) {
  //     if (routeOptions && routeOptions?.coordinates?.length > 0) {
  //       const { closestIndex, closestPoint, minDistance } =
  //         findClosestPointOnPolyline(
  //           routeOptions.coordinates,
  //           lastCoords.current
  //         );
  //       console.log(
  //         "Closest point on route:",
  //         closestPoint,
  //         "at index:",
  //         closestIndex,
  //         "with distance:",
  //         minDistance
  //       );
  //       // updateInstructionsFromRoute(routeOptions);
  //     }
  //     setIsLoading(false);
  //   }
  // }, [routeOptions]);

  const getOffset = (zoom, heading, screenRatio, mode, currentLatitude) => {
    // Ajustement plus agressif si en navigation
    const factor = 0.005;
    const BASE_OFFSET = -factor * screenRatio;
    const offset = BASE_OFFSET / Math.pow(2, zoom);
    const radHeading = heading * (Math.PI / 180);
    // Ajuster la longitude en fonction de la latitude actuelle
    const latitudeCorrection = 1 / Math.cos(currentLatitude * (Math.PI / 180));

    return {
      offsetLatitude: -offset * Math.cos(radHeading),
      offsetLongitude: -offset * Math.sin(radHeading) * latitudeCorrection,
    };
  };

  function filtrerInstructions(instructions) {
    if (instructions.length <= 2) return instructions;

    const debut = instructions[0];
    const fin = instructions[instructions.length - 1];

    const entreDeux = instructions
      .slice(1, -1)
      .filter((instr) => instr.type !== 10 && instr.type !== 11);

    return [debut, ...entreDeux, fin];
  }

  const recalculateRoute = async (
    departure,
    destination,
    preference,
    maxNBRoute,
    bearing,
    allCoords = null,
    continueStraight = null
  ) => {
    try {
      const response = await api.calculateRoute(
        departure,
        destination,
        preference,
        maxNBRoute,
        bearing,
        allCoords,
        continueStraight
      );

      if (!response || response.length === 0) {
        alert("Aucun itinéraire trouvé pour ce trajet.");
        return;
      }
      //    console.log("Recalcul de l'itinéraire réussi :", response[0]);
      const newRoute = response;
      routeOptions.current = newRoute[0];
      const steps = response[0].segments.flatMap((segment) =>
        segment.steps.map((step) => ({
          distance: step.distance,
          duration: step.duration,
          instruction: step.instruction,
          bearing_after: step.maneuver.bearing_after,
          bearing_before: step.maneuver.bearing_before,
          location: step.maneuver.location,
          name: step.name,
          type: step.type,
          way_points: step.way_points,
        }))
      );

      routeOptions.current.instructions = filtrerInstructions(steps);

      if (handleRouteOptionsChange) handleRouteOptionsChange(newRoute[0]);

      return response;
    } catch (error) {
      console.error("Erreur lors du recalcul de l'itinéraire :", error);
      setIsLoading(false);
      throw error; // Propager l'erreur pour la gestion ultérieure
    } finally {
      setIsLoading(false);
    }
  };

  // =============================
  //         CAMERA LOGIC
  // =============================

  const updateCamera = useCallback(
    (map, coords, isCameraLockedRef, headingValue, elapsed = 0) => {
      if (isCameraLockedRef.current) return;
      if (!coords || !map) return;
       let location = coords;

      if (location.latitude === 0 && location.longitude === 0) return;

 
      const zoomLevel = Platform.OS === "ios" ? 1 : 19;
      const { latitudeDelta, longitudeDelta } = mercatorDegreeDeltas(
        location.latitude,
        location.longitude,
        width,
        height,
        zoomLevel
      );
      if (!hasCameraBeenInitialized.current) {
        map.animateCamera(
          {
            center: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            zoom: Platform.OS === "ios" ? 1 : 19,
            altitude: 1000,
          },
          { duration: 0, useNativeDriver: false }
        );
        hasCameraBeenInitialized.current = true;
        return; // On ne fait pas l'animation avec pitch/heading tout de suite
      }
      // Ou, pour forcer une valeur par défaut :
      const hasValidHeading =
        typeof coords.heading === "number" && coords.heading > 0;

      console.log(hasValidHeading, coords.heading);

      const { offsetLatitude, offsetLongitude } = getOffset(
        Platform.OS === "ios" ? 2 : 2,
        coords.heading,
        SCREEN_RATIO,
        mode,
        location.latitude
      );

      map.animateCamera(
        {
          ...(hasValidHeading
            ? {
                heading: coords.heading,
                pitch: Platform.OS === "ios" ? 75 : 75,
                center: {
                  latitude: location.latitude + offsetLatitude,
                  longitude: location.longitude + offsetLongitude,
                },
                altitude: 50,
                latitudeDelta,
                longitudeDelta,
                zoom: Platform.OS === "ios" ? 1 : 19,
              }
            : {
                center: {
                  latitude: location.latitude,
                  longitude: location.longitude,
                },
                longitudeDelta: 0.01,
                latitudeDelta: 0.01,
                altitude: 1000,
              }),
        },
        { duration: 1000, useNativeDriver: false }
      );

      const now = Date.now();

      if (lastLocation.current) {
        const distanceMeters = getDistance(lastLocation.current, coords);
        const timeSeconds = (now - lastUpdateTime.current) / 1000;

        if (timeSeconds > 0 && distanceMeters > 5) {
          const computedSpeed = (distanceMeters / timeSeconds) * 3.6;
          setSpeedValue(computedSpeed);
        }
      }
      runOnUI((coords, now) => {
        "worklet";
        const alpha = 0.4;
        heading.value =
          heading.value + alpha * (coords.heading - heading.value);
      })(location, Date.now());
    },
    [SCREEN_RATIO, isCameraLockedRef]
  );

  // =============================
  //       NAVIGATION LOGIC
  // =============================

  function updateSpeed(currentSpeed) {
    if (currentSpeed > 2) {
      speedHistory.push(currentSpeed);
      if (speedHistory.length > 10) speedHistory.shift();
    }
  }

  function getEstimatedSpeed() {
    if (speedHistory.length === 0) return DEFAULT_SPEED;
    return speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;
  }

  function calculateETA(distanceRemainingKm) {
    let speed = getEstimatedSpeed();
    let timeHours = distanceRemainingKm / speed;
    return timeHours * 60; // minutes
  }

  const getAllDistanceRest = (coords, i) => {
    let d = 0;
    for (let j = i; j < coords.length - 1; j++) {
      d += getDistance(coords[j], coords[j + 1]);
    }
    return d;
  };

  const IsInFront = (currentPosition, targetPosition, heading) => {
    const angleToTarget = getGreatCircleBearing(
      currentPosition,
      targetPosition
    );
    const diff = Math.abs(heading - angleToTarget);

    // On considère que si la différence angulaire est inférieure à 90°, c'est devant
    return diff <= 90 || diff >= 270;
  };

  const getInstruction = (closestIndex, curLoc, headingValue, speed) => {
    if (!routeOptions.current?.instructions) return;

    const { instructions, coordinates: coords } = routeOptions.current;

    // Trouver l'instruction en cours via l'index
    const instruction = instructions.find(
      (i) => i.way_points[0] > closestIndex
    );
    if (!instruction) {
      setCurrentInstruction(null);
      setDistance(0);
      return;
    }

    // Distance restante sur l'instruction courante
    let distanceRest = 0;
    let lastIdx = closestIndex;
    for (let i = closestIndex + 1; i <= instruction.way_points[1]; i++) {
      const point = coords[i];
      if (IsInFront(curLoc, point, headingValue)) {
        distanceRest += getDistance(curLoc, point);
        curLoc = point;
        lastIdx = i;
      }
    }

    // Distance totale restante jusqu'à la fin
    let totalDistance = distanceRest;
    for (let i = lastIdx; i < coords.length - 1; i++) {
      totalDistance += getDistance(coords[i], coords[i + 1]);
    }

    setCurrentInstruction({
      closestInstruction: instruction,
      distanceRest: distanceRest,
      distance: totalDistance,
    });
    setDistance(totalDistance);

    // if (lastLocation.current && speed > 0) {
    //   distanceTraveled.current += getDistance(lastLocation.current, curLoc);
    // }

    if (showManeuver && isNavigating) {
      const remainingMinutes = calculateETA(totalDistance / 1000);
      setRemainingTimeInSeconds(remainingMinutes * 60);

      const eta = new Date(Date.now() + remainingMinutes * 60 * 1000);
      setArrivalTimeStr(
        `${eta.getHours().toString().padStart(2, "0")}:${eta
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    }
  };

  const handleLocationUpdate = useCallback(
    debounce(async (location, map, force = false) => {
      const now = Date.now();
      const elapsed = now - (lastUpdateTime.current || now); // en ms
      const {
        latitude,
        longitude,
        heading: hd,
        altitude,
        speed,
      } = location.coords;
      const currentCoords = { latitude, longitude };
      const currentSpeedKmh = speed != null ? speed * 3.6 : 0;
      speedRef.current = currentSpeedKmh;

      // 🎯 Seuils de filtrage
      const MIN_DISTANCE_CHANGE = __DEV__ ? 7 : 5; // mètres
      const MIN_SPEED_CHANGE = 0.5; // m/s
      const MIN_TIME_BETWEEN_POINTS = 5000; // ms
      const MIN_MOVEMENT_SPEED = 0.5;
      const dynamicHeadingThreshold = speed < 3 ? 15 : 7;
      const distanceMoved = lastCoords.current
        ? getDistance(lastCoords.current, currentCoords)
        : Infinity;
      const headingChange = Math.abs(hd - (lastHeading.current ?? 0));
      const speedChange = Math.abs(speed - (lastSpeed.current ?? 0));

      const shouldSavePoint =
        !lastCoords.current ||
        distanceMoved >= MIN_DISTANCE_CHANGE ||
        headingChange >= dynamicHeadingThreshold ||
        speedChange >= MIN_SPEED_CHANGE;

      const enoughTimeElapsed =
        !lastGpxPointTime.current ||
        now - lastGpxPointTime.current >= MIN_TIME_BETWEEN_POINTS;

      const newLocation = location.coords;
      let closestI = null;
      if (
        isNavigating &&
        routeOptions.current?.coordinates &&
        routeOptions.current?.coordinates.length > 0 &&
        !isLoading
      ) {
        const { closestPoint, minDistance, closestIndex } =
          findClosestPointOnPolyline(
            routeOptions.current?.coordinates,
            newLocation
          );

        if (minDistance > ROUTE_DEVIATION_THRESHOLD) {
          setIsLoading(true);
          if (isConnected) {
            Speech.speak(
              "Vous vous êtes éloigné de l'itinéraire, recalcul en cours.",
              {
                rate: 1.0,
                pitch: 1.0,
                language: "fr-FR",
              }
            );
          } else {
            Speech.speak("Veuillez rejoindre l'itinéraire. ", {
              rate: 1.0,
              pitch: 1.0,
              language: "fr-FR",
            });
          }

          if (!isLoading && isConnected) {
            const failedIndex = closestIndex;

            // Prendre tous les points restants jusqu'à la fin
            const remainingPoints =
              routeOptions.current?.coordinates.slice(failedIndex);

            const formattedPoints = remainingPoints.map((pt) => [
              pt.longitude,
              pt.latitude,
            ]);

            const simplifiedPoints = simplify(formattedPoints, 0.01);

            //ajouter la position actuelle au début du tableau
            simplifiedPoints.unshift([longitude, latitude]);

            // Départ = position actuelle
            const departure = [latitude, longitude];
            // Destination = dernier point du tableau
            const destination = formattedPoints[formattedPoints.length - 1];

            const bearing = [
              [hd || 0, 20], // Utiliser la dernière direction connue
              ...Array(simplifiedPoints.length - 1).fill([]),
            ];

            recalculateRoute(
              departure,
              destination,
              simplifiedPoints.length > 2 ? ["shortest"] : ["recommended"],
              1,
              bearing,
              simplifiedPoints,
              simplifiedPoints.length > 2 ? true : null,
              hd,
              speed
            );
          }

          closestI = null; // Pas de closest index puisqu'on n'est plus sur l'itinéraire
        } else {
          closestI = closestIndex;
          newLocation.latitude = closestPoint.latitude;
          newLocation.longitude = closestPoint.longitude;
          newLocation.altitude = closestPoint.altitude ?? altitude ?? 0;
        }
        // 📌 Ajout du point GPX uniquement si pertinent
        if (
          mode === "travel" &&
          shouldSavePoint &&
          enoughTimeElapsed &&
          currentSpeedKmh > MIN_MOVEMENT_SPEED
        ) {
          setGpxPoints((prev) => [
            ...prev,
            {
              lat: latitude,
              lon: longitude,
              alt: newLocation.altitude || 0,
              time: now,
              speed: currentSpeedKmh,
            },
          ]);
          lastGpxPointTime.current = now;
        }
      }
      lastCoords.current = {
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      };
      lastHeading.current = hd;
      lastSpeed.current = speed;

      coordinates
        .timing({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          duration: 1000,
          useNativeDriver: false,
        })
        .start();
console.log("isNavigating", isNavigating);
      if (isNavigating) {
        updateCamera(map, newLocation, isCameraLockedRef, heading, elapsed);
        updateSpeed(speedRef.current);
        if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
        speedTimeoutRef.current = setTimeout(() => {
          setSpeedValue(0);
        }, 3000);

        if (closestI === null) {
          setCurrentInstruction(null);
          setDistance(0);
        } else getInstruction(closestI, newLocation, hd, speed);
      }

      if (lastLocation.current) {
        distanceTraveled.current += getDistance(
          lastLocation.current,
          newLocation
        );
      }
      lastLocation.current = newLocation;
      lastUpdateTime.current = now;
    }, 600), // 1 seconde de debounce
    [
      isNavigating,
      isLoading,
      isCameraLockedRef,
      mode,
      SCREEN_RATIO,
      width,
      height,
    ]
  );

  return {
    coordinates,
    heading,
    currentInstruction,
    distance,
    arrivalTimeStr,
    remainingTimeInSeconds,
    isLoading,
    updateCamera,
    handleLocationUpdate,
    speedValue,
    gpxPoints,
  };
};

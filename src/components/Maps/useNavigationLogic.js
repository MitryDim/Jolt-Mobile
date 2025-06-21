import { useRef, useState, useCallback, useEffect } from "react";
import { Dimensions, Platform, useAnimatedValue } from "react-native";
import { AnimatedRegion } from "react-native-maps";
import {
  getDistance,
  findNearest,
  getGreatCircleBearing,
  computeDestinationPoint,
} from "geolib";

import * as api from "../../helpers/Api";
import { runOnUI, useSharedValue, withSpring } from "react-native-reanimated";

const MERCATOR_OFFSET = Math.pow(2, 28);
const MERCATOR_RADIUS = MERCATOR_OFFSET / Math.PI;
let speedHistory = [];
const DEFAULT_SPEED = 15; // km/h
const INSTRUCTION_LOOKAHEAD_DISTANCE = 10; // mètres
const ROUTE_DEVIATION_THRESHOLD = 30; // mètres

export const useNavigationLogic = ({
  initialRouteOptions,
  isNavigating,
  showManeuver,
  mode,
  isCameraLockedRef,
}) => {
  const { width, height } = Dimensions.get("window");
  const SCREEN_RATIO = height / 1920;
  const isUpdatingRef = useRef(false);

  const lastCoords = useRef(null);
  const lastHeading = useRef(null);
  const lastSpeed = useRef(null);

  const [currentInstruction, setCurrentInstruction] = useState(null);
  const [routeOptions, setRouteOptions] = useState(initialRouteOptions || []);
  const [distance, setDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [arrivalTimeStr, setArrivalTimeStr] = useState("00:00");
  const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(0);
  const [speedValue, setSpeedValue] = useState(0);
  const lastUpdateTime = useRef(Date.now());

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
    distanceTraveled.current = 0;
   // coordinates.setValue({ latitude: 0, longitude: 0 });
    heading.value = withSpring(0, { damping: 10, stiffness: 100 });
    setCurrentInstruction(null);
    setRouteOptions(initialRouteOptions || []);
    setDistance(0);
    setArrivalTimeStr("00:00");
    setRemainingTimeInSeconds(0);
    setSpeedValue(0);
    setIsLoading(false);
    lastUpdateTime.current = Date.now();
  }, [mode]);

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

  // =============================
  //         CAMERA LOGIC
  // =============================

  const updateCamera = useCallback(
    (map, coords, isCameraLockedRef, headingValue) => {
      if (isCameraLockedRef.current) return;
      if (!coords || !map) return;

      let location = coords;

      // const positionChange = getDistance(lastLocation.current, coords) > 1; // seuil de 1m avant d'animer
      // const headingChange = Math.abs(lastHeading.current - coords.heading) > 3; // seuil de 3°
      const zoomLevel = Platform.OS === "ios" ? 20 : 19;
      const { latitudeDelta, longitudeDelta } = mercatorDegreeDeltas(
        location.latitude,
        location.longitude,
        width,
        height,
        zoomLevel
      );

      const { offsetLatitude, offsetLongitude } = getOffset(
        Platform.OS === "ios" ? 3 : 2,
        coords.heading,
        SCREEN_RATIO,
        mode,
        location.latitude
      );
      // if (positionChange || headingChange) {
      map.animateCamera(
        {
          center: {
            latitude: location.latitude + offsetLatitude,
            longitude: location.longitude + offsetLongitude,
          },
          heading: coords.heading,
          pitch: Platform.OS === "ios" ? 60 : 75,
          zoom: Platform.OS === "ios" ? 0 : 19,
          altitude: 70,
          latitudeDelta,
          longitudeDelta,
        },
        { duration: 200 }
      );

      // lastLocation.current = coords;
      // lastHeading.current = coords.heading;
      //  }
      const now = Date.now();

      if (lastLocation.current) {
        const distanceMeters = getDistance(lastLocation.current, coords);
        const timeSeconds = (now - lastUpdateTime.current) / 1000;

        if (timeSeconds > 0 && distanceMeters > 5) {
          const computedSpeed = (distanceMeters / timeSeconds) * 3.6;
          setSpeedValue(computedSpeed);
        }
      }
      lastUpdateTime.current = now;
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
    if (!initialRouteOptions?.instructions) return;

    const { instructions, coordinates: coords } = initialRouteOptions;

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
      // const elapsed = (Date.now() - startTime) / 1000;
      // const routeDistance = routeOptions[0]?.routeDistance || 1;

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

  const handleLocationUpdate = async (location, map) => {
    if (isUpdatingRef.current) return;

    const { latitude, longitude, heading: hd, speed } = location.coords;
    const currentCoords = { latitude, longitude };

    // 🎯 Seuils de filtrage
    const MIN_DISTANCE_CHANGE = 2; // en mètres
    const MIN_HEADING_CHANGE = 5; // en degrés
    const MIN_SPEED_CHANGE = 0.5; // en m/s
    speedRef.current = speed != null ? speed * 3.6 : 0;

    const shouldIgnore =
      lastCoords.current &&
      getDistance(lastCoords.current, currentCoords) < MIN_DISTANCE_CHANGE &&
      Math.abs(hd - (lastHeading.current ?? 0)) < MIN_HEADING_CHANGE &&
      Math.abs(speed - (lastSpeed.current ?? 0)) < MIN_SPEED_CHANGE;

    //if (shouldIgnore) return;
    // if (initialRouteOptions?.coordinates) {
    //   const distanceToRoute = getNearestDistanceToPolyline(
    //     location.coords,
    //     initialRouteOptions.coordinates
    //   );
    //   console.log("Distance to route:", distanceToRoute);
    //   if (distanceToRoute > 30) {
    //     console.log("Hors itinéraire, recalcul en cours...");
    //     // déclenchement éventuel d'un recalcul via api
    //   }
    // }

    isUpdatingRef.current = true;

    try {
      const newLocation = location.coords;
      let closestI = null;
      if (
        initialRouteOptions?.coordinates &&
        initialRouteOptions?.coordinates.length > 0
      ) {
        const { closestPoint, minDistance, closestIndex } =
          findClosestPointOnPolyline(
            initialRouteOptions?.coordinates,
            newLocation
          );

        if (minDistance > ROUTE_DEVIATION_THRESHOLD) {
          console.warn(`Location deviated too far from route: ${minDistance}m`);
          // Optionnel : Recalculer l'itinéraire ou notifier l'utilisateur
        }
        closestI = closestIndex;
        newLocation.latitude = closestPoint.latitude;
        newLocation.longitude = closestPoint.longitude;
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
          duration: 200,
        })
        .start();
      console.log("isNavigating:", isNavigating);
      if (isNavigating) {
        updateCamera(map, newLocation, isCameraLockedRef, heading);
        updateSpeed(speedRef.current);
        getInstruction(closestI, newLocation, hd, speed);
      }

      if (lastLocation.current) {
        distanceTraveled.current += getDistance(
          lastLocation.current,
          newLocation
        );
      }
      lastLocation.current = newLocation;
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 200); // anti-concurrence
    }
  };

  return {
    coordinates,
    heading,
    currentInstruction,
    routeOptions,
    distance,
    arrivalTimeStr,
    remainingTimeInSeconds,
    isLoading,
    updateCamera,
    handleLocationUpdate,
    speedValue,
  };
};

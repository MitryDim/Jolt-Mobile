import { useRef, useState, useCallback } from "react";
import { Dimensions, Platform, useAnimatedValue } from "react-native";
import { AnimatedRegion } from "react-native-maps";
import { getDistance, findNearest, getRhumbLineBearing } from "geolib";
import * as api from "../../helpers/Api";
import { runOnUI, useSharedValue } from "react-native-reanimated";

const MERCATOR_OFFSET = Math.pow(2, 28);
const MERCATOR_RADIUS = MERCATOR_OFFSET / Math.PI;

export const useNavigationLogic = ({
  initialRouteOptions,
  isNavigating,
  screenHeightRatio,
  showManeuver,
  userSpeed,
  mode,
}) => {
  const { width, height } = Dimensions.get("window");
  const SCREEN_RATIO = screenHeightRatio || height / 1920;
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

  const coordinates = useRef(
    new AnimatedRegion({ latitude: 0, longitude: 0 })
  ).current;
  const heading = useSharedValue(0);

  const lastLocation = useRef(null);
  const speedRef = useRef(0);
  const distanceTraveled = useRef(0);
  const currentStep = useRef(0);

  // =============================
  //       UTILITY FUNCTIONS
  // =============================

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
  const getOffset = (zoom, heading, screenRatio, mode) => {
    // Ajustement plus agressif si en navigation
    const factor = mode === "travel" ? 0.01 : 0.005;
    const BASE_OFFSET = -factor * screenRatio;
    const offset = BASE_OFFSET / Math.pow(2, zoom);
    const radHeading = heading * (Math.PI / 180);
    return {
      offsetLatitude: -offset * Math.cos(radHeading),
      offsetLongitude: -offset * Math.sin(radHeading),
    };
  };

  // =============================
  //         CAMERA LOGIC
  // =============================

  const updateCamera = useCallback(
    (map, coords, headingValue) => {
      if (!coords || !map) return;

      const zoomLevel = Platform.OS === "ios" ? 20 : 19;
      const { latitudeDelta, longitudeDelta } = mercatorDegreeDeltas(
        coords.latitude,
        coords.longitude,
        width,
        height,
        zoomLevel
      );

      const { offsetLatitude, offsetLongitude } = getOffset(
        Platform.OS === "ios" ? 3 : 2,
        coords.heading,
        SCREEN_RATIO,
        mode
      );

      map.animateCamera(
        {
          center: {
            latitude: coords.latitude + offsetLatitude,
            longitude: coords.longitude + offsetLongitude,
          },
          heading: coords.heading,
          pitch: Platform.OS === "ios" ? 60 : 75,
          zoom: Platform.OS === "ios" ? 0 : 19,
          altitude: 70,
          latitudeDelta,
          longitudeDelta,
        },
        { duration: 400 }
      );
      runOnUI(() => {
        "worklet";

        const alpha = 0.2;
        heading.value =
          heading.value + alpha * (coords.heading - heading.value);
      })();
    },
    [SCREEN_RATIO]
  );

  // =============================
  //       NAVIGATION LOGIC
  // =============================

  const getAllDistanceRest = (coords, i) => {
    let d = 0;
    for (let j = i; j < coords.length - 1; j++) {
      d += getDistance(coords[j], coords[j + 1]);
    }
    return d;
  };

  const getInstructionByCoordinates = (coordinates, instructions, index) => {
    const target = coordinates[index];
    const found = instructions.find((i) => {
      const [lng, lat] = i.maneuver.location;
      return lng === target.longitude && lat === target.latitude;
    });
    return found || instructions[instructions.length - 1] || null;
  };

  const IsInFront = (a, b, heading) => {
    const angle = getRhumbLineBearing(a, b);
    return angle <= heading + 90 && angle >= heading - 90;
  };

  const getCurrentInstruction = (
    currentPosition,
    instructions,
    coords,
    heading
  ) => {
    const nearest = findNearest(currentPosition, coords);
    const idx = coords.findIndex(
      (c) =>
        c.latitude === nearest.latitude && c.longitude === nearest.longitude
    );

    let totalDistance = 0;
    let lastIdx = 0;
    let instruction = null;

    for (let i = 0; i < instructions.length; i++) {
      const [start, end] = instructions[i].way_points;
      if (idx >= start && idx <= end) {
        instruction = instructions[i];
        break;
      }
    }

    if (!instruction)
      return { closestInstruction: null, distanceRest: 0, distance: 0 };

    let distanceRest = 0;
    for (
      let i = instruction.way_points[0];
      i <= instruction.way_points[1];
      i++
    ) {
      const point = coords[i];
      if (IsInFront(currentPosition, point, heading)) {
        distanceRest += getDistance(currentPosition, point);
        lastIdx = i;
      }
    }

    totalDistance = getAllDistanceRest(coords, lastIdx) + distanceRest;
    const foundInstruction = getInstructionByCoordinates(
      coords,
      instructions,
      instruction.way_points[1]
    );

    return {
      closestInstruction: foundInstruction,
      distanceRest,
      distance: totalDistance,
    };
  };

  const getInstruction = async (curLoc, headingValue, speed) => {
    if (!routeOptions?.[0]?.instructions) return;

    const { instructions, coordinates: coords } = routeOptions[0];
    const inst = getCurrentInstruction(
      curLoc,
      instructions,
      coords,
      headingValue
    );

    setCurrentInstruction(inst);
    setDistance(inst.distance);

    if (lastLocation.current && speed > 0) {
      distanceTraveled.current += getDistance(lastLocation.current, curLoc);
    }

    speedRef.current = speed;

    if (showManeuver && isNavigating) {
      const elapsed = (Date.now() - startTime) / 1000;
      const routeDistance = routeOptions[0]?.routeDistance || 1;
      const avgSpeed = speed > 0 ? distanceTraveled.current / elapsed : 25;
      const remaining = inst.distance / avgSpeed;
      setRemainingTimeInSeconds(remaining);
      const eta = new Date(startTime + remaining * 1000);
      setArrivalTimeStr(
        `${eta.getHours().toString().padStart(2, "0")}:${eta
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    }

    lastLocation.current = curLoc;
  };

  const handleLocationUpdate = async (location, map) => {
    if (isUpdatingRef.current) return;

    const { latitude, longitude, heading: hd, speed } = location.coords;
    const currentCoords = { latitude, longitude };

    // 🎯 Seuils de filtrage
    const MIN_DISTANCE_CHANGE = 2; // en mètres
    const MIN_HEADING_CHANGE = 5; // en degrés
    const MIN_SPEED_CHANGE = 0.5; // en m/s

    const shouldIgnore =
      lastCoords.current &&
      getDistance(lastCoords.current, currentCoords) < MIN_DISTANCE_CHANGE &&
      Math.abs(hd - (lastHeading.current ?? 0)) < MIN_HEADING_CHANGE &&
      Math.abs(speed - (lastSpeed.current ?? 0)) < MIN_SPEED_CHANGE;

    if (shouldIgnore) return;

    isUpdatingRef.current = true;

    try {
      lastCoords.current = currentCoords;
      lastHeading.current = hd;
      lastSpeed.current = speed;

      coordinates.timing({ latitude, longitude, duration: 500 }).start();
      updateCamera(map, location.coords, heading);
      getInstruction(currentCoords, hd, speed);
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 300); // anti-concurrence
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
  };
};

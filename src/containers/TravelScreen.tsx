import React, { useEffect, useRef, useState } from "react";
import { Alert, Text, Vibration, View, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline, AnimatedRegion } from "react-native-maps";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
import * as FileSystem from "expo-file-system";
import { getDistance, getDistanceFromLine, findNearest } from "geolib";
import { GeolibGeoJSONPoint } from "geolib/es/types";

type Coord = { latitude: number; longitude: number };

const TOLERANCE_BASE = 15;

export default function VeloNavigation({ route }) {
  const [polyline, setPolyline] = useState<Coord[]>([]);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Coord | null>(null);
  const [realTrace, setRealTrace] = useState<Coord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const mapRef = useRef<MapView>(null);
  const lastPosition = useRef<any>(null);
  const alertShown = useRef(false);
  const lastInstructionIndex = useRef<number | null>(null);
  const [currentInstruction, setCurrentInstruction] = useState<string | null>(
    null
  );
  const announcedDistances = useRef<number[]>([]);
  const [score, setScore] = useState<string>("0");

  const animatedRegion = useRef(
    new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    })
  ).current;
  function isGeoJSONPoint(point: any): point is GeolibGeoJSONPoint {
    return (
      Array.isArray(point) && point.length >= 2 && typeof point[0] !== "object"
    );
  }

  const getSnappedPosition = (location: Coord) => {
    const nearest = findNearest(location, polyline);

    if (!nearest) return location;

    if ("lat" in nearest && "lng" in nearest) {
      return { latitude: Number(nearest.lat), longitude: Number(nearest.lng) };
    }

    if ("latitude" in nearest && "longitude" in nearest) {
      return {
        latitude: Number(nearest.latitude),
        longitude: Number(nearest.longitude),
      };
    }

    if (isGeoJSONPoint(nearest)) {
      const geo = nearest as GeolibGeoJSONPoint;
      return {
        latitude: Number(geo[1]),
        longitude: Number(geo[0]),
      };
    }

    return location;
  };

  useEffect(() => {
    (async () => {
      if (!route.params) {
        Alert.alert("Erreur", "Aucune donnée de trajet disponible.");
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Active la localisation pour continuer."
        );
        return;
      }

      let loc = await Location.getLastKnownPositionAsync();
      if (!loc)
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      setPolyline(route.params.coordinates);
      setInstructions(route.params.instructions);

      animatedRegion.setValue({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  useEffect(() => {
    if (polyline.length === 0) return;

    const subscriber = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, distanceInterval: 8 },
      (location) => {
        const { latitude, longitude, heading } = location.coords;
        const now = Date.now();
        const newPosition = { latitude, longitude };

        setCurrentLocation(newPosition);
        setRealTrace((prev) => [...prev, newPosition]);

        //   animatedRegion.animate({ latitude, longitude }, { duration: 500 });

        // animatedRegion
        //   .timing(
        //     {
        //       latitude,
        //       longitude,
        //       duration: 500,
        //       useNativeDriver: false,
        //     } as any // <-- Ajoute ce cast temporaire si besoin
        //   )
        //   .start();
        //   if (mapRef.current) {
        //     mapRef.current.animateCamera(
        //       {
        //         center: {
        //           latitude,
        //           longitude,
        //         },
        //         pitch: 45, // inclinaison caméra pour effet 3D (à ajuster)
        //         heading: heading || 0, // orientation selon la direction (boussole)
        //         zoom: 16, // zoom plus proche que delta de base
        //       },
        //       { duration: 500 }
        //     );
        //   }

        if (lastPosition.current) {
          const distance = getDistance(
            newPosition,
            lastPosition.current.coords
          );
          const timeDiff = (now - lastPosition.current.timestamp) / 1000;
          const speed = distance / timeDiff;
          const dynamicTolerance = speed < 2 ? 20 : speed < 5 ? 25 : 35;

          checkPositionOnRoute(newPosition, dynamicTolerance);
        } else {
          checkPositionOnRoute(newPosition, TOLERANCE_BASE);
        }

        lastPosition.current = { coords: newPosition, timestamp: now };
      }
    );

    return () => {
      subscriber.then((sub) => sub.remove());
    };
  }, [polyline]);

  function getHeading(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    let brng = Math.atan2(y, x);
    brng = toDeg(brng);
    return (brng + 360) % 360;
  }
  

  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;

    // Exemple : zoom plus serré (plus petit delta)
    const zoomLevel = 0.005; // zoom élevé (moins visible du "delta")

    // Inclinaison Waze-style
    const pitch = 60;

    // On peut aussi calculer heading entre dernière et nouvelle position
    let heading = 0;
    if (lastPosition.current) {
      const prev = lastPosition.current.coords;
      const curr = currentLocation;
      heading = getHeading(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }

    // On décale la caméra pour que la position soit vers le bas de l'écran (par exemple 70% vers le bas)
    mapRef.current.animateCamera(
      {
        center: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        pitch,
        heading,
        altitude: 0, // optionnel selon plateforme
        zoom: 18, // alternative au delta, zoom plus fort
      },
      { duration: 500 }
    );
  }, [currentLocation]);

  const checkPositionOnRoute = (location: Coord, tolerance: number) => {
    if (polyline.length === 0) return;

    const { minDistance, closestIndex } = findClosestPolylineSegment(location);

    if (minDistance > tolerance) {
      if (!alertShown.current) {
        Vibration.vibrate(500);
        alertShown.current = true;
        console.warn("Hors parcours : recalcul en cours...");

        // 📌 Ici on pourrait appeler une API de recalcul d'itinéraire
        // Exemple : recalculateRoute(location);
      }
    } else {
      alertShown.current = false;
    }

    if (closestIndex > currentIndex) {
      setCurrentIndex(closestIndex);
      announcedDistances.current = [];
    }

    const nextStep = instructions.find(
      (instr) => instr.way_points[0] >= closestIndex
    );

    if (nextStep) {
      const targetPoint = polyline[nextStep.way_points[0]];
      const distanceToNext = getDistance(location, targetPoint);

      const thresholds = [500, 200, 50, 5];
      for (const threshold of thresholds) {
        if (
          distanceToNext <= threshold &&
          !announcedDistances.current.includes(threshold)
        ) {
          let message = "";

          if (threshold === 5) {
            message = `Dans ${distanceToNext.toFixed(0)} mètres, tourner ${
              nextStep.instruction
            }`;
          } else {
            message = `Dans ${threshold} mètres, ${nextStep.instruction}`;
          }

          setCurrentInstruction(message);
          Speech.speak(message, {
            rate: 0.9,
            pitch: 1.2,
            language: "fr-FR",
          });

          announcedDistances.current.push(threshold);
          break;
        }
      }
    }

    const currentScore = deviationScore();
    setScore(currentScore);
  };

  const findClosestPolylineSegment = (location: Coord) => {
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < polyline.length - 1; i++) {
      const start = polyline[i];
      const end = polyline[i + 1];
      const distance = getDistanceFromLine(location, start, end);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i + 1;
      }
    }

    return { minDistance, closestIndex };
  };

  const saveTraceAsGPX = async () => {
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="VeloNav">
  <trk><name>Trace Vélo</name><trkseg>\n`;

    realTrace.forEach((point) => {
      gpx += `    <trkpt lat="${point.latitude}" lon="${point.longitude}"></trkpt>\n`;
    });

    gpx += `  </trkseg></trk>\n</gpx>`;

    const fileUri = FileSystem.documentDirectory + "trace.gpx";
    await FileSystem.writeAsStringAsync(fileUri, gpx);
    Alert.alert("GPX sauvegardé", `Fichier : ${fileUri}`);
  };

  const deviationScore = () => {
    if (realTrace.length === 0) return "0";
    const total = realTrace.reduce((acc, pos) => {
      const { minDistance } = findClosestPolylineSegment(pos);
      return acc + minDistance;
    }, 0);
    return (total / realTrace.length).toFixed(2);
  };

  return (
    <View style={{ flex: 1 }}>
      {polyline.length > 0 && (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          showsCompass={false}
          pitchEnabled
          rotateEnabled
          zoomEnabled
        >
          <Polyline
            coordinates={polyline}
            strokeColor="#0080ff"
            strokeWidth={5}
          />
          <Polyline
            coordinates={realTrace}
            strokeColor="rgba(255,0,0,0.7)"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
          {currentLocation && (
            <Marker
              coordinate={getSnappedPosition(currentLocation)}
              pinColor="green"
            />
          )}
        </MapView>
      )}

      {currentInstruction && (
        <View
          style={{
            position: "absolute",
            top: 50,
            left: 20,
            right: 20,
            padding: 15,
            backgroundColor: "rgba(0,0,0,0.8)",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, textAlign: "center" }}>
            {currentInstruction}
          </Text>
        </View>
      )}

      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#0080ff",
            padding: 12,
            borderRadius: 8,
          }}
          onPress={saveTraceAsGPX}
        >
          <Text style={{ color: "#fff" }}>Sauvegarder trace</Text>
        </TouchableOpacity>

        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff" }}>Score : {score}m</Text>
        </View>
      </View>
    </View>
  );
}

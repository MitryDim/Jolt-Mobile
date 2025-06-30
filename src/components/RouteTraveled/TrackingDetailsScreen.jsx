import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Share,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import IconComponent from "../Icons";
import ChartWithSlider from "../ChartWithSlider";
import { CenterRegion } from "./functions";
import { UserContext } from "../../context/AuthContext";
import { useFetchWithAuth } from "../../hooks/useFetchWithAuth";
import { EXPO_GATEWAY_SERVICE_URL } from "@env";
import { calculateRoute } from "../../helpers/Api";
import * as Location from "expo-location";
import { useSharedValue } from "react-native-reanimated";
import RouteChoiceBottomSheet from "../Maps/BottomSheet/RouteChoiceBottomSheet";
import simplify from "simplify-js";
import { StackActions } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import { navigate } from "../Navigation/NavigationService";
import {
  getDistance,
  formatDistance,
  formatElapsedTime,
} from "../../utils/Utils";
import { Rating } from "react-native-ratings";
import * as Linking from "expo-linking";

const TrackingDetailsScreen = ({ route, navigation }) => {
  // Sécurise route.params dès le début
  const params = route?.params || {};
  const { data: trackingData, tripId: routeTripId } = params;
  // Gère aussi les query parameters pour la compatibilité
  const tripId = routeTripId || params.id;
  const { user } = useContext(UserContext);
  const fetchWithAuth = useFetchWithAuth();

  // États initialisés avec des valeurs par défaut sûres
  const [sharedTrackingData, setSharedTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRatingMode, setIsRatingMode] = useState(false);
  const [userNote, setUserNote] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Références et valeurs partagées
  const mapRef = useRef(null);
  const isOpen = useSharedValue(false);

  // Routes pour TabView
  const [routes] = useState([
    { key: "infos", title: "Infos" },
    { key: "charts", title: "Graphiques" },
  ]);

  // Données de tracking actuelles (shared ou normale)
  const currentTrackingData = sharedTrackingData || trackingData;

  // Calculs dérivés sécurisés
  const notes = currentTrackingData?.notes || [];
  const globalRating =
    notes.length > 0
      ? notes.reduce((sum, n) => sum + (n.rating || 0), 0) / notes.length
      : 0;

  const estimatedDuration = currentTrackingData?.totalDistance
    ? (currentTrackingData.totalDistance / 1000 / 15) * 3600
    : 0;

  const points = (currentTrackingData?.gpxPoints || []).map((pt) => ({
    latitude: pt.lat ?? pt.latitude,
    longitude: pt.lon ?? pt.longitude,
    speed: pt.speed ?? pt.vitesse ?? 0,
    altitude: pt.altitude ?? 0,
  }));

  const elapsedTime =
    currentTrackingData?.startTime && currentTrackingData?.endTime
      ? (new Date(currentTrackingData.endTime) -
          new Date(currentTrackingData.startTime)) /
        1000
      : 0;

  const speedArr = points.map((p) => p.speed);
  const altitudeArr = points.map((p) => p.altitude);

  // Effect pour charger un trajet partagé
  useEffect(() => {
    if (tripId && !trackingData) {
      loadSharedTrip(tripId);
    }
  }, [tripId, trackingData]);

  // Effect pour mettre à jour isPublic
  useEffect(() => {
    if (currentTrackingData?.isPublic !== undefined) {
      setIsPublic(currentTrackingData.isPublic);
    }
  }, [currentTrackingData]);

  // Effect pour mettre à jour userNote
  useEffect(() => {
    if (user?.id && currentTrackingData?.notes) {
      const foundNote = currentTrackingData.notes.find(
        (n) => n.user?.toString() === user.id
      );
      setUserNote(foundNote);
    }
  }, [user, currentTrackingData]);

  const loadSharedTrip = async (id) => {
    setLoading(true);
    try {
      const { data, error } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate/${id}`,
        { method: "GET" }
      );

      if (!error && data?.data) {
        setSharedTrackingData(data.data);
      } else {
        alert("Trajet non trouvé ou privé");
        navigation.goBack();
      }
    } catch (err) {
      console.error("Erreur lors du chargement du trajet:", err);
      alert("Erreur lors du chargement du trajet");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const toggleSheet = () => {
    isOpen.value = !isOpen.value;
  };

  const handleChoice = (choice, step) => {
    handleCalculateRoute(choice, step);
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

  const handleCalculateRoute = async (choice, step) => {
    if (
      !currentTrackingData?.gpxPoints ||
      currentTrackingData.gpxPoints.length === 0
    ) {
      alert("Aucun point GPS disponible pour calculer l'itinéraire.");
      return;
    }

    let currentPosition = null;
    let currentBearing = null;

    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      currentBearing = coords.heading ?? 0;
      currentPosition = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    } catch (error) {
      console.error(
        "Erreur lors de l'obtention de la position actuelle :",
        error
      );
      alert("Impossible d'obtenir votre position actuelle.");
      return;
    }

    try {
      let gpxPoints = currentTrackingData.gpxPoints.map((pt) => [
        pt.lon ?? pt.longitude,
        pt.lat ?? pt.latitude,
      ]);

      let minDist = Infinity;
      let minIndex = 0;
      for (let i = 0; i < gpxPoints.length; i++) {
        const dist = getDistance(
          currentPosition.latitude,
          currentPosition.longitude,
          gpxPoints[i][1],
          gpxPoints[i][0]
        );
        if (dist < minDist) {
          minDist = dist;
          minIndex = i;
        }
      }

      const threshold = 100;
      let pointsWithCurrentPosition;
      if (minDist > threshold) {
        pointsWithCurrentPosition = [
          [currentPosition.longitude, currentPosition.latitude],
          ...gpxPoints,
        ];
      } else {
        pointsWithCurrentPosition = gpxPoints.slice(minIndex);
      }

      let departure, destination, bearings, filteredInstructions;

      if (choice === "destination") {
        departure = [
          pointsWithCurrentPosition[0][0],
          pointsWithCurrentPosition[0][1],
        ];
        destination = [
          pointsWithCurrentPosition[pointsWithCurrentPosition.length - 1][0],
          pointsWithCurrentPosition[pointsWithCurrentPosition.length - 1][1],
        ];
        bearings = [[currentBearing, 20]];
        gpxPoints = null;
      } else if (choice === "complete") {
        const points = currentTrackingData.gpxPoints.map((pt) => ({
          x: pt.lon ?? pt.longitude,
          y: pt.lat ?? pt.latitude,
        }));

        const tolerance = 0.00001;
        const simplified = simplify(points, tolerance, true);
        const cleanedGpxPoints = simplified.map((p) => [p.x, p.y]);

        departure = [cleanedGpxPoints[0][0], cleanedGpxPoints[0][1]];
        destination = [
          cleanedGpxPoints[cleanedGpxPoints.length - 1][0],
          cleanedGpxPoints[cleanedGpxPoints.length - 1][1],
        ];
        bearings = [];
        gpxPoints = cleanedGpxPoints;
      } else {
        alert("Choix d'itinéraire invalide.");
        return;
      }

      const response = await calculateRoute(
        departure,
        destination,
        ["shortest"],
        1,
        bearings,
        gpxPoints,
        true
      );

      if (!response || response.length === 0) {
        alert("Aucun itinéraire trouvé pour ce trajet.");
        return;
      }

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

      if (choice === "complete" && !step) {
        filteredInstructions = filtrerInstructions(steps);
      } else {
        filteredInstructions = steps;
      }

      response[0].instructions = filteredInstructions;

      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: "Home" },
            {
              name: "Navigate",
              state: {
                routes: [
                  {
                    name: "MapScreen",
                    params: {
                      key: String(Date.now()),
                      mode: "travel",
                      initialRouteOptions: response,
                      isNavigating: true,
                      selectedRouteIndex: 0,
                      showManeuver: true,
                      socketId: currentTrackingData?.isGroup
                        ? currentTrackingData?.id || currentTrackingData?._id
                        : null,
                    },
                  },
                ],
              },
            },
          ],
        })
      );
    } catch (error) {
      console.error("Erreur lors du calcul de l'itinéraire :", error);
      alert(
        "Impossible de calculer l'itinéraire. Veuillez réessayer plus tard."
      );
    }
  };

  const handleToggleVisibility = async () => {
    const newStatus = !isPublic;
    const { error } = await fetchWithAuth(
      `${EXPO_GATEWAY_SERVICE_URL}/navigate/${currentTrackingData?._id}/visibility`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      },
      { protected: true }
    );
    if (!error) {
      alert(`Trajet désormais ${newStatus ? "public" : "privé"}`);
      setIsPublic(newStatus);
    } else {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    const { error } = await fetchWithAuth(
      `${EXPO_GATEWAY_SERVICE_URL}/navigate/${currentTrackingData._id}`,
      { method: "DELETE" },
      { protected: true }
    );
    if (!error) {
      alert("Trajet supprimé");
      navigation.goBack();
    } else {
      alert("Erreur lors de la suppression");
    }
  };

  const handleRatingSubmit = async (rating) => {
    try {
      const { data, error } = await fetchWithAuth(
        `${EXPO_GATEWAY_SERVICE_URL}/navigate/${currentTrackingData._id}/rate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating }),
        },
        { protected: true }
      );

      if (!error) {
        const updatedUserNote = { user: user.id, rating };
        setUserNote(updatedUserNote);
        if (currentTrackingData.notes) {
          currentTrackingData.notes.push(updatedUserNote);
        }
        setIsRatingMode(false);
      } else {
        alert("Erreur lors de l'envoi de votre note.");
      }
    } catch (err) {
      console.error("Erreur rating :", err);
      alert("Impossible d'enregistrer la note.");
    }
  };

  const handleShare = async () => {
    try {
      const tripId = currentTrackingData._id;
      const deepLink = Linking.createURL(`navigate/trip/${tripId}`);

      const webLink = `${process.env.EXPO_URL_JOLT_WEBSITE_SCHEME}://${process.env.EXPO_URL_JOLT_WEBSITE_HOST}:${process.env.EXPO_URL_JOLT_WEBSITE_PORT}/navigate/trip?id=${tripId}`;

      console.log("Deep Link:", deepLink);
      console.log("Web Link (query):", webLink);

      const shareMessage = `🚴‍♂️ Découvrez ce trajet !
  
  🔗 Ouvrir dans l'app : ${deepLink}
  
  🌐 Voir sur le web : ${webLink}
  
 
  
  Distance : ${formatDistance(currentTrackingData.totalDistance || 0)}
  Note : ${globalRating.toFixed(1)}/5 ⭐️`;

      const result = await Share.share({
        message: shareMessage,
        title: "Partager ce trajet",
        url: webLink,
      });

      if (result.action === Share.sharedAction) {
        console.log("Trajet partagé avec succès");
      } else if (result.action === Share.dismissedAction) {
        console.log("Partage annulé");
      }
    } catch (error) {
      console.error("Erreur lors du partage:", error);
      alert(`Lien de partage:
      
  🔗 Deep Link: ${Linking.createURL(`navigate/trip/${currentTrackingData._id}`)}
  
  🌐 Web: ${process.env.EXPO_URL_JOLT_WEBSITE_SCHEME}://${
        process.env.EXPO_URL_JOLT_WEBSITE_HOST
      }:${process.env.EXPO_URL_JOLT_WEBSITE_PORT}/navigate/trip?id=${
        currentTrackingData._id
      }
 `);
    }
  };

  const renderInfos = () => (
    <ScrollView style={{ padding: 16 }}>
      {currentTrackingData?.totalDistance && (
        <InfoRow
          icon="map-marker-distance"
          text={formatDistance(currentTrackingData.totalDistance)}
        />
      )}

      {currentTrackingData?.owner === user?.id ? (
        elapsedTime > 0 && (
          <InfoRow icon="timer-outline" text={formatElapsedTime(elapsedTime)} />
        )
      ) : (
        <InfoRow
          icon="timer-outline"
          text={
            estimatedDuration > 0
              ? formatElapsedTime(estimatedDuration)
              : "Durée estimée inconnue"
          }
        />
      )}

      {currentTrackingData?.owner === user?.id &&
        currentTrackingData?.speedMax && (
          <InfoRow
            icon="speedometer"
            text={`${Math.round(currentTrackingData.speedMax)} km/h`}
          />
        )}

      {currentTrackingData?.owner === user?.id &&
        currentTrackingData?.startTime && (
          <InfoRow
            icon="calendar"
            text={new Date(currentTrackingData.startTime).toLocaleString()}
          />
        )}

      {currentTrackingData?.owner === user?.id &&
        currentTrackingData?.endTime && (
          <InfoRow
            icon="calendar"
            text={new Date(currentTrackingData.endTime).toLocaleString()}
          />
        )}

      <View style={{ alignItems: "center", marginVertical: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
          Note du trajet :
        </Text>

        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 24, marginRight: 8 }}>
            {globalRating.toFixed(1)} / 5 ⭐️
          </Text>
          <Text style={{ fontSize: 14, color: "gray" }}>
            {notes.length > 0
              ? `(${notes.length} note${notes.length > 1 ? "s" : ""})`
              : "Aucune note"}
          </Text>
        </View>

        {user?.id &&
          currentTrackingData?.owner !== user?.id &&
          !userNote &&
          (isRatingMode ? (
            <Rating
              startingValue={0}
              imageSize={30}
              onFinishRating={handleRatingSubmit}
              style={{ paddingVertical: 10 }}
            />
          ) : (
            <TouchableOpacity onPress={() => setIsRatingMode(true)}>
              <Text style={{ fontSize: 14, color: "blue", marginTop: 8 }}>
                Donner votre note
              </Text>
            </TouchableOpacity>
          ))}

        {user?.id && currentTrackingData?.owner !== user?.id && userNote && (
          <Text style={{ fontSize: 14, color: "gray", marginTop: 8 }}>
            Vous avez noté ce trajet : {userNote.rating} / 5
          </Text>
        )}
      </View>
    </ScrollView>
  );

  const renderCharts = () => (
    <ScrollView style={{ flex: 1, marginBottom: 10 }}>
      {user?.id && currentTrackingData?.owner === user?.id && (
        <ChartWithSlider
          label="Graphique de vitesse"
          data={speedArr}
          color="#2563eb"
          unit="km/h"
        />
      )}

      <ChartWithSlider
        label="Graphique d'altitude"
        data={altitudeArr}
        color="#22c55e"
        unit="m"
      />
    </ScrollView>
  );

  const renderScene = SceneMap({
    infos: renderInfos,
    charts: renderCharts,
  });

  // États de chargement et d'erreur
  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Chargement du trajet...</Text>
      </SafeAreaView>
    );
  }

  if (!currentTrackingData) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Trajet non trouvé</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={styles.map}
          onLayout={() =>
            points.length > 0 &&
            mapRef.current?.fitToCoordinates(points, {
              edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
              animated: true,
            })
          }
          initialRegion={CenterRegion(points)}
          moveOnMarkerPress={false}
          zoomControlEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {points.length > 0 && (
            <>
              <Polyline
                coordinates={points}
                strokeWidth={3}
                strokeColor="#2563eb"
              />
              <Marker coordinate={points[0]} title="Départ" pinColor="green" />
              <Marker
                coordinate={points[points.length - 1]}
                title="Arrivée"
                pinColor="red"
              />
            </>
          )}
        </MapView>

        <TabView
          navigationState={{ index: tabIndex, routes }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={{ backgroundColor: "#2563eb" }}
              style={{ backgroundColor: "#f1f5f9" }}
              activeColor="#2563eb"
              inactiveColor="#6b7280"
              labelStyle={{ fontWeight: "bold" }}
            />
          )}
        />

        {tabIndex === 0 && (
          <View
            style={{
              position: "absolute",
              right: 24,
              bottom: 24,
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <TouchableOpacity
              style={[
                styles.fab,
                {
                  backgroundColor:
                    currentTrackingData?.owner === user?.id
                      ? "#f87171"
                      : "#2563eb",
                  marginBottom: 16,
                },
              ]}
              onPress={
                currentTrackingData?.owner === user?.id
                  ? handleDelete
                  : handleShare
              }
            >
              <IconComponent
                library="Feather"
                icon={
                  currentTrackingData?.owner === user?.id
                    ? "trash-2"
                    : "share-2"
                }
                size={24}
                color={currentTrackingData?.owner === user?.id ? "red" : "#fff"}
              />
            </TouchableOpacity>

            {currentTrackingData?.owner === user?.id && (
              <TouchableOpacity
                style={[
                  styles.fab,
                  {
                    backgroundColor: isPublic ? "#10b981" : "#f59e0b",
                    marginBottom: 16,
                  },
                ]}
                onPress={handleToggleVisibility}
              >
                <IconComponent
                  library="Feather"
                  icon={isPublic ? "eye" : "eye-off"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.fab, { backgroundColor: "#3b82f6" }]}
              onPress={toggleSheet}
            >
              <IconComponent
                library="Feather"
                icon="navigation"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        )}

        <RouteChoiceBottomSheet
          isOpen={isOpen}
          toggleSheet={toggleSheet}
          onSelect={handleChoice}
        />
      </View>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, text }) => (
  <View style={styles.row}>
    <IconComponent
      library="MaterialCommunityIcons"
      icon={icon}
      size={26}
      color="#2563eb"
    />
    <Text style={styles.value}>{text}</Text>
  </View>
);

export default TrackingDetailsScreen;

const styles = StyleSheet.create({
  map: {
    height: 300,
    borderRadius: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  value: {
    marginLeft: 12,
    fontSize: 16,
    color: "#0f172a",
  },
  fab: {
    borderRadius: 32,
    padding: 16,
    elevation: 4,
  },
});

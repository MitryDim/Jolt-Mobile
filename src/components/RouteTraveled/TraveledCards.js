import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Directions,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { formatDistance } from "../../utils/Utils";
import IconComponent from "../Icons";
import MapView, { Marker, Overlay, Polyline } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { useContext, useEffect, useRef, useState } from "react";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { CenterRegion } from "./functions";
import * as Location from "expo-location";
import { UserContext } from "../../context/AuthContext";
import { Rating } from "react-native-ratings";
const TraveledCards = ({
  data,
  width,
  height = 250,
  swipeable = true,
  index,
  handleDeleteItem,
  ...props
}) => {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [swiped, setSwiped] = useState(false);
  const [startCity, setStartCity] = useState("");
  const [endCity, setEndCity] = useState("");
  const mapRef = useRef(null);
  if (!data) return null;


  const notes = Array.isArray(data.notes) ? data.notes : [];
  const globalRating =
    notes.length > 0
      ? notes.reduce((sum, n) => sum + (n.rating || 0), 0) / notes.length
      : 0;

      const points = Array.isArray(data.gpxPoints)
        ? data.gpxPoints.map((pt) => ({
            latitude: pt.lat ?? pt.latitude,
            longitude: pt.lon ?? pt.longitude,
          }))
        : Array.isArray(data.positions)
        ? data.positions
        : [];

  let elapsedTime = 0;
  if (data.startTime && data.endTime) {
    elapsedTime =
      (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) /
      1000;
  }

  function getRegionForCoordinates(points) {
    let minLat, maxLat, minLng, maxLng;
    points.forEach((p) => {
      minLat = minLat !== undefined ? Math.min(minLat, p.latitude) : p.latitude;
      maxLat = maxLat !== undefined ? Math.max(maxLat, p.latitude) : p.latitude;
      minLng =
        minLng !== undefined ? Math.min(minLng, p.longitude) : p.longitude;
      maxLng =
        maxLng !== undefined ? Math.max(maxLng, p.longitude) : p.longitude;
    });

    const latitude = (minLat + maxLat) / 2;
    const longitude = (minLng + maxLng) / 2;
    const latitudeDelta = (maxLat - minLat) * 1.3 || 0.01;
    const longitudeDelta = (maxLng - minLng) * 1.3 || 0.01;

    return { latitude, longitude, latitudeDelta, longitudeDelta };
  }


  const renderLeftActions = (item) => {
    return (
      <TouchableOpacity
        className="justify-center p-5 bg-white border-2 border-red-600 rounded-xl m-2"
        onPress={() => handleDeleteItem(item)} // Appeler la fonction de suppression
      >
        <IconComponent
          className="text-red-600"
          icon="delete"
          library="MaterialIcons"
          color="rgb(220 38 38)"
          size={30}
        />
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    setSwiped(false);
    const fetchCities = async () => {
      if (points.length > 1) {
        // Point de départ
        const start = await Location.reverseGeocodeAsync(points[0]);
        // Point d'arrivée
        const end = await Location.reverseGeocodeAsync(
          points[points.length - 1]
        );
        setStartCity(start[0]?.city || "");
        setEndCity(end[0]?.city || "");
      }
    };

    fetchCities();
  }, [data]);


  useEffect(() => {
    if (mapRef.current && points.length > 1) {
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
        animated: false,
      });
    }
  }, [points, mapRef.current]);
 
  
  const CardContent = (
    <TouchableOpacity
      onPress={() => {
        if (!swiped) {
          navigation.navigate("TrackingDetailsScreen", { data });
        }
      }}
      className="bg-white rounded-lg border border-[#70E575]"
      style={{ width, minHeight: height }}
    >
      <View className="flex  justify-between items-center">
        <View className="flex flex-row items-center justify-between w-full p-2">
          <View className="flex flex-row items-center">
            <IconComponent
              library={"Feather"}
              icon={"map-pin"}
              color={"black"}
              size={18}
              style={{ marginLeft: 3 }}
            />
            <Text className="font-bold ml-2">
              {startCity && endCity ? `${startCity} → ${endCity}` : ""}
            </Text>
          </View>
          {user && user.id === data.owner ? (
            <Text>
              {data?.startTime
                ? new Date(data.startTime).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: undefined, // pas de secondes
                  })
                : ""}
            </Text>
          ) : (
            <Rating
              startingValue={globalRating}
              imageSize={20}
              fractions={1}
              readonly
            />
          )}
        </View>
        <View className="flex flex-row items-center justify-between w-full p-2">
          {data.isGroup ? (
            <Text className="font-bold mr-2.5 flex flex-row items-center">
              <IconComponent
                icon="clock-outline"
                library="MaterialCommunityIcons"
                size={20}
              />
              {data?.startTime
                ? " " +
                  new Date(data.startTime).toLocaleTimeString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",

                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </Text>
          ) : (
            elapsedTime > 0 && (
              <Text className="font-bold mr-2.5">
                <IconComponent
                  icon="timer-sand"
                  library="MaterialCommunityIcons"
                  size={20}
                />
                {elapsedTime > 0
                  ? new Date(elapsedTime * 1000).toISOString().substr(11, 8)
                  : ""}
              </Text>
            )
          )}

          <Text>
            <IconComponent
              icon="map-marker-distance"
              library="MaterialCommunityIcons"
              size={20}
            />
            {formatDistance(data?.totalDistance ? data.totalDistance : 0)}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        {points.length > 0 && (
          <MapView
            ref={mapRef}
            style={{ width: "100%", height: "100%" }}
            //  region={region}
            moveOnMarkerPress={false}
            zoomTapEnabled={false}
            scrollEnabled={false}
            zoomControlEnabled={false}
            zoomEnabled={false}
 
          >
            {/* Marqueur de départ */}
            <Marker coordinate={points[0]} pinColor="green" />
            {/* Marqueur d'arrivée */}
            <Marker coordinate={points[points.length - 1]} pinColor="red" />
            <Polyline coordinates={points} strokeWidth={3} strokeColor="#00F" />
          </MapView>
        )}
      </View>
    </TouchableOpacity>
  );

  if (swipeable) {
    return (
      <Swipeable renderRightActions={renderLeftActions} {...props}>
        {CardContent}
      </Swipeable>
    );
  }
  return CardContent;
};
export default TraveledCards;

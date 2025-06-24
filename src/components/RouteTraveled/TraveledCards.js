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
import { useEffect, useState } from "react";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { CenterRegion } from "./functions";

const TraveledCards = ({
  data,
  width = 250,
  height = 250,
  swipeable = true,
  ...props
}) => {
  const navigation = useNavigation();
  const [swiped, setSwiped] = useState(false);

  const points = data.gpxPoints
    ? data.gpxPoints.map((pt) => ({
        latitude: pt.lat ?? pt.latitude,
        longitude: pt.lon ?? pt.longitude,
      }))
    : data.positions || [];

  let elapsedTime = 0;
  if (data.startTime && data.endTime) {
    elapsedTime =
      (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) /
      1000;
  }

  const handleDeleteItem = async (item) => {
    //TODO FONCTION DE SUPPRESSION
    console.log("Delete item", item);
  };

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
  }, [data]);

  const CardContent = (
    <TouchableOpacity
      onPress={() => {
        if (!swiped) {
          navigation.navigate("TrackingDetailsScreen", { data });
        }
      }}
      className="bg-white m-2 rounded-xl"
      style={{ width, minHeight: height }}
    >
      <View style={{ flex: 1 }}>
        {points.length > 0 && (
          <MapView
            style={{ width: "100%", height: height - 40 }}
            initialRegion={CenterRegion(points)}
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
        <LinearGradient
          style={{
            position: "absolute", // Position absolue
            top: 0, // Positionné en haut
            left: 0, // Positionné à gauche
            right: 0, // Positionné à droite
            height: 50, // Hauteur de votre choix
          }}
          colors={["rgba(0,0,0,0.7)", "transparent"]}
        >
          <Text style={{ textAlign: "center", color: "white" }}>
            {data.name}
          </Text>
        </LinearGradient>
      </View>
      <View className="flex flex-row justify-between items-center">
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
        <Text>
          <IconComponent
            icon="map-marker-distance"
            library="MaterialCommunityIcons"
            size={20}
          />
          {formatDistance(data?.totalDistance ? data.totalDistance : 0)}
        </Text>
        <IconComponent
          library={"MaterialCommunityIcons"}
          icon="chevron-right"
          size={40}
          className="font-bold ml-2.5"
        />
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

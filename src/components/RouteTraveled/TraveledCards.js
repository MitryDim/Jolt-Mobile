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
        {data && data.positions && (
          <MapView
            style={{ width: "100%", height: height - 40 }}
            initialRegion={CenterRegion(data.positions)}
            moveOnMarkerPress={false}
            zoomTapEnabled={false}
            scrollEnabled={false}
            zoomControlEnabled={false}
            zoomEnabled={false}
          >
            {/* Ajouter un marqueur de départ */}
            {data.positions.length > 0 && (
              <Marker
                coordinate={{
                  latitude: data.positions[0]?.latitude,
                  longitude: data.positions[0]?.longitude,
                }}
                pinColor="green" // Couleur du marqueur
              />
            )}

            {/* Ajouter un marqueur d'arrivée */}
            {data.positions.length > 0 && (
              <Marker
                coordinate={{
                  latitude: data.positions[data.positions.length - 1]?.latitude,
                  longitude:
                    data.positions[data.positions.length - 1]?.longitude,
                }}
                pinColor="red" // Couleur du marqueur
              />
            )}

            <Polyline
              coordinates={data.positions.map((pos) => ({
                latitude: pos.latitude,
                longitude: pos.longitude,
              }))}
              strokeWidth={3}
              strokeColor="#00F" // Couleur de la ligne du trajet
            />
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
          {new Date(data.elapsedTime * 1000).toISOString().substr(11, 8)}
        </Text>
        <Text>
          <IconComponent
            icon="map-marker-distance"
            library="MaterialCommunityIcons"
            size={20}
          />
          {formatDistance(data?.distance ? data.distance : 0)}
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
    return <Swipeable renderRightActions={renderLeftActions} {...props}>{CardContent}</Swipeable>;
  }
  return CardContent;
};
export default TraveledCards;

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Directions,
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { formatDistance } from "../../utils/Utils";
import IconComponent from "../Icons";
import MapView, { Marker, Overlay, Polyline } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";

const TraveledCards = ({ data }) => {
  const navigation = useNavigation();
  const [swiped, setSwiped] = useState(false);


  
  const handleDeleteItem = async (item) => {
    //TODO FONCTION DE SUPPRESSION
  };

  const renderLeftActions = (item) => {

    return (
      <TouchableOpacity
        className="justify-center p-5 bg-red-500 rounded-xl m-2"
        onPress={() => handleDeleteItem(item)} // Appeler la fonction de suppression
      >
        <Text className="text-white font-bold">Supprimer</Text>
      </TouchableOpacity>
    );
  };

  const CenterRegion = (coordinates) => {
    if (coordinates.length === 0) {
      return {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    const minLat = Math.min(...coordinates.map((pos) => pos.latitude));
    const maxLat = Math.max(...coordinates.map((pos) => pos.latitude));
    const minLon = Math.min(...coordinates.map((pos) => pos.longitude));
    const maxLon = Math.max(...coordinates.map((pos) => pos.longitude));
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: (maxLat - minLat + 0.01) * 1.5,
      longitudeDelta: (maxLon - minLon + 0.01) * 1.5,
    };
  };
useEffect(() => {
  setSwiped(false);
}, [data]); 

  return (
    <Swipeable
      onSwipeableWillOpen={() => {
        console.log("Open");
         setSwiped(true);
      }}
      onSwipeableWillClose={() => {
        console.log("Close");
        setSwiped(false);
      }}
      renderRightActions={() => renderLeftActions(data)}
    >
      <TouchableOpacity
        onPress={() => {
          console.log("swiped:", swiped);
          console.log("navigation:", navigation);
          if (!swiped) {
            navigation.navigate("TrackingDetailsScreen");
          }
        }} // Naviguer vers les détails avec l'élément en paramètre
        className="bg-white m-2 rounded-b-xl"
      >
        <View style={{ flex: 1 }}>
          {data && data.positions && (
            <MapView // Ajustez le style selon vos besoins
              style={{ flex: 1, height: 200 }}
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
                    latitude:
                      data.positions[data.positions.length - 1]?.latitude,
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
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Utilisez flex pour occuper tout l'espace vertical disponible
    marginBottom: 130,
  },
  item: {
    backgroundColor: "#B8DFDD",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginRight: 10,
  },
  value: {},
  valueContainer: {
    flexDirection: "row", // Aligner l'icône et le texte horizontalement
    alignItems: "center",
  },
  chevron: {
    fontWeight: "bold",
    marginLeft: 5,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    backgroundColor: "red",
    borderRadius: 15,
    marginRight: 10,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
export default TraveledCards;

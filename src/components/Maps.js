import { View, Text, Image, StyleSheet } from "react-native";
import React,{useRef} from "react";
import MapView, { Polyline, Marker,Callout } from "react-native-maps";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Maps = ({
  styleMaps,
  routeOptions,
  selectedRouteIndex,
  onPolylineSelect,
  currentRegion,
  userSpeed,
  EndPathCoordinates,
  isNavigating,
}) => {


  
  const mapRef = useRef(null);
  const routesToDisplay = isNavigating
    ? [routeOptions[selectedRouteIndex]]
    : routeOptions;

    let zoomFactor = 0;

    let initialRegion = currentRegion




if (routeOptions.length > 0) {
  // Calculate the center point between start and end coordinates
  const startCoords = routesToDisplay[0].coordinates[0];
  const endCoords =
    routesToDisplay[0].coordinates[routesToDisplay[0].coordinates.length - 1];
  const centerLatitude = (startCoords.latitude + endCoords.latitude) / 2;
  const centerLongitude = (startCoords.longitude + endCoords.longitude) / 2;

  // Calculate the necessary latitude and longitude deltas for displaying the whole route
  const distanceLatitude = Math.abs(startCoords.latitude - endCoords.latitude);
  const distanceLongitude = Math.abs(
    startCoords.longitude - endCoords.longitude
  );
  const zoomFactor = Math.max(distanceLatitude, distanceLongitude) * 2;

   initialRegion = {
    latitude: centerLatitude,
    longitude: centerLongitude,
    latitudeDelta: zoomFactor,
    longitudeDelta: zoomFactor,
  };
}


  const maxZoomFactor = 0.01; // Facteur de zoom maximum
  const minZoomFactor = 0.0002; // Facteur de zoom minimum
  const zoomFactorRange = maxZoomFactor - minZoomFactor;
  const normalizedSpeed = Math.min(Math.max(userSpeed, 0), 20); // Normaliser la vitesse entre 0 et 20 km/h
  const adjustedZoomFactor =
    minZoomFactor + (normalizedSpeed / 20) * zoomFactorRange;

  // Adjusting zoom for displaying the entire route
  const defaultRegion = {
    ...currentRegion,
    latitudeDelta: zoomFactor,
    longitudeDelta: zoomFactor,
  };

const tooltipCoordinates = {
  latitude: 0,
  longitude: 0,
};
  //const screenCoordinates = mapRef.current?.getMapPosition(tooltipCoordinates);

  return (
    <MapView
      ref={mapRef}
      style={styleMaps}
      initialRegion={defaultRegion}
      region={
        isNavigating
          ? {
              ...currentRegion,
              latitudeDelta: adjustedZoomFactor,
              longitudeDelta: adjustedZoomFactor,
              latitude: currentRegion.latitude, // Ajoutez ceci pour centrer la carte sur l'utilisateur
              longitude: currentRegion.longitude,
            }
          : initialRegion
      }
      showsUserLocation={false}
      followsUserLocation={isNavigating}
      zoomEnabled={true}
      zoomControlEnabled={true}
      zoomTapEnabled={true}
    >
      {routesToDisplay?.map((routeCoordinates, index) => (
        <React.Fragment key={index}>
          <Polyline
            onPress={() => onPolylineSelect(index)}
            coordinates={routeCoordinates.coordinates}
            strokeColor={
              selectedRouteIndex === index ? "blue" : "rgba(242, 135, 138, 0.5)" // Permet de mettre en bleu la route choisi sinon en rouge transparent
            }
            strokeWidth={5}
          />
          <Marker
            coordinate={
              routeCoordinates.coordinates[
                Math.floor(routeCoordinates.coordinates.length / 2)
              ]
            }
            zIndex={99}
            anchor={{ x: 0, y: -15 }}
            centerOffset={{ x: 0, y: -20 }}
            rotation={currentRegion.heading}
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
                {routeCoordinates.duration}
              </Text>
            </View>
          </Marker>
        </React.Fragment>
      ))}

      <Marker
        coordinate={{
          latitude: currentRegion.latitude,
          longitude: currentRegion.longitude,
        }}
        rotation={currentRegion.heading}
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
    </MapView>
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

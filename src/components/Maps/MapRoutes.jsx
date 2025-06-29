import React from "react";
import { Polyline, Marker } from "react-native-maps";
import { View, Text } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const MapRoutes = ({
  routes,
  isNavigating,
  selectedRouteIndex,
  onPolylineSelect,
  showManeuver,
  currentRegion,
}) => {
  if (!routes?.length) return null;

  return routes.map((route, index) => {
    const isSelected = index === selectedRouteIndex;
    const shouldRender =
      (!isNavigating && !showManeuver) || (isNavigating && isSelected);

    if (!route?.coordinates?.length || !shouldRender) return null;

    return (
      <React.Fragment key={index}>
        <Polyline
          lineCap={"round"}
          onPress={() => !isNavigating && onPolylineSelect(index)} // désactive sélection en navigation
          coordinates={route.coordinates}
          strokeWidth={6}
          zIndex={99}
          tappable={!isNavigating}
          strokeColor={isSelected ? "purple" : "blue"}
        />
        {!isNavigating && (
          <Marker
            coordinate={
              route.coordinates[Math.floor(route.coordinates.length / 2)]
            }
            zIndex={99}
            anchor={{ x: 0, y: -15 }}
            centerOffset={{ x: 0, y: -20 }}
            rotation={currentRegion?.heading}
          >
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="tooltip"
                size={70}
                style={{ color: "white", transform: [{ scaleY: 0.6 }] }}
              />
              <Text style={{ position: "absolute" }}>{route.duration}</Text>
            </View>
          </Marker>
        )}
      </React.Fragment>
    );
  });
};

export default MapRoutes;

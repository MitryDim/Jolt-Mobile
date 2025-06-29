import React from "react";
import { Marker } from "react-native-maps";
import { Image } from "react-native";

const UserMarker = ({ currentRegion }) => {
  if (!currentRegion) return null;

  return (
    <Marker
      coordinate={{
        latitude: currentRegion.latitude,
        longitude: currentRegion.longitude,
      }}
      rotation={currentRegion.heading}
    >
      <Image
        source={require("../../../assets/Oval.png")}
        style={{ width: 50, height: 50 }}
      />
    </Marker>
  );
};

export default UserMarker;

import React, { useEffect, useRef } from "react";
import { MarkerAnimated } from "react-native-maps";
import { useAnimatedStyle } from "react-native-reanimated";
import Arrow from "../Arrow";
import { Animated } from "react-native";

const NavigationMarker = ({ coordinates, heading }) => {
  return (
    <MarkerAnimated
      coordinate={coordinates}
      flat={false}
      anchor={{ x: 0.39, y: 0.28 }}
      zIndex={1000}
    >
      <Arrow />
    </MarkerAnimated>
  );
};

export default NavigationMarker;

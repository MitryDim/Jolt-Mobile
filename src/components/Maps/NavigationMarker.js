import React from "react";
import { MarkerAnimated } from "react-native-maps";
import { useAnimatedStyle } from "react-native-reanimated";
import Arrow from "../Arrow";
import { Animated } from "react-native";

const NavigationMarker = ({ coordinates, heading }) => {
    console.log("NavigationMarker rendered with coordinates:", coordinates, "and heading:", heading);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${heading.value}deg`, // heading est un sharedValue
        },
      ],
    };
  });

  return (
    <MarkerAnimated coordinate={coordinates} flat={false} anchor={{ x: 0.5, y: 0.2 }}>
      <Animated.View style={animatedStyle}>
        <Arrow />
      </Animated.View>
    </MarkerAnimated>
  );
};

export default NavigationMarker;

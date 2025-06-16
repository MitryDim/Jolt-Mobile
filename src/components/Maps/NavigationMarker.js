import React, { useEffect, useRef } from "react";
import { MarkerAnimated } from "react-native-maps";
import { useAnimatedStyle } from "react-native-reanimated";
import Arrow from "../Arrow";
import { Animated } from "react-native";

const NavigationMarker = ({ coordinates, heading }) => {
  // const animatedHeading = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   Animated.timing(animatedHeading, {
  //     toValue: heading.value,
  //     duration: 300,
  //     useNativeDriver: true,
  //   }).start();
  // }, [heading.value]);

  // const animatedStyle = {
  //   transform: [
  //     {
  //       rotate: animatedHeading.interpolate({
  //         inputRange: [0, 360],
  //         outputRange: ["0deg", "360deg"],
  //       }),
  //     },
  //   ],
  // };

  return (
    <MarkerAnimated
      coordinate={coordinates}
      flat={false} 
    >
      <Arrow />
    </MarkerAnimated>
  );
};

export default NavigationMarker;

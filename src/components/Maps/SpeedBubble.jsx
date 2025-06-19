import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { G, Line, Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
} from "react-native-reanimated";

const AnimatedLine = Animated.createAnimatedComponent(Line);

const SpeedBubble = ({ speed }) => {
  const SIZE = 120;
  const CENTER = SIZE / 2;
  const RADIUS = 50;
  const TICK_COUNT = 60;
  const speedLimit = 25;
  const TICK_LENGTH = 2;
  const INSIDE_OFFSET = 15;

  const percentage = Math.min(speed / speedLimit, 1);
  const targetTickCount = Math.round(percentage * TICK_COUNT);

  // 👇 valeur animée pour le nombre de ticks actifs
  const animatedTickCount = useSharedValue(0);

  useEffect(() => {
    animatedTickCount.value = withTiming(targetTickCount, { duration: 400 });
  }, [targetTickCount]);

  const getColor = () => {
    const ratio = speed / speedLimit;
    if (ratio < 0.5) return "#70E575";
    if (ratio < 0.8) return "#F1C40F";
    return "#E74C3C";
  };

  const ticks = Array.from({ length: TICK_COUNT }).map((_, i) => {
    const angle = (i * 360) / TICK_COUNT;

    const animatedProps = useAnimatedProps(() => {
      const ratio = speed / speedLimit;
      let color = "#70E575";
      if (ratio >= 0.8) color = "#E74C3C";
      else if (ratio >= 0.5) color = "#F1C40F";
      return {
        stroke: i < animatedTickCount.value ? color : "#C3C3C3",
      };
    });

    return (
      <AnimatedLine
        key={i}
        x1={CENTER}
        y1={CENTER - RADIUS + INSIDE_OFFSET}
        x2={CENTER}
        y2={CENTER - RADIUS + INSIDE_OFFSET + TICK_LENGTH}
        strokeWidth={2.5}
        transform={`rotate(${angle}, ${CENTER}, ${CENTER})`}
        animatedProps={animatedProps}
        strokeLinecap="round"
      />
    );
  });

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={35}
          fill="rgba(0,0,0,0.85)"
          stroke="#000"
          strokeWidth={1}
        />
        <G>{ticks}</G>
      </Svg>

      <View style={styles.labelContainer}>
        <Text style={styles.speedText}>{Math.round(speed)}</Text>
        <Text style={styles.unitText}>km/h</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 130,
    height: 0,
    justifyContent: "center",
    alignItems: "center", 
  },
  labelContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  speedText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  unitText: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.8,
  },
});

export default SpeedBubble;

import React, { useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withSpring,
} from "react-native-reanimated";
import { formatElapsedTime, formatDistance } from "../../../utils/Utils";

export default function NavigationBottomSheet({
  remainingTimeInSeconds,
  arrivalTimeStr,
  distance,
  onStop,
  bottomSheetRef,
}) { 
  const snapPoints = useMemo(() => [56, "50%", "80%"]);
  const animatedIndex = useSharedValue(1);

  const animatedFooterStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [0, 1, 2, 3],
      [0, 0.5, 0.8, 1],
      Extrapolate.CLAMP
    ),
    transform: [
      {
        translateY: interpolate(
          animatedIndex.value,
          [0, 1, 2, 3],
          [40, 20, 10, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));
  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-2 bg-white border-b border-gray-200 max-h-16">
      <View className="flex-1 items-center">
        <Text className="text-2xl font-bold">{arrivalTimeStr}</Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-sm text-gray-600">
            {formatElapsedTime(remainingTimeInSeconds)}
          </Text>
          <Text className="text-sm text-gray-600 mx-2">•</Text>
          <Text className="text-sm text-gray-600">
            {formatDistance(distance)}
          </Text>
        </View>
      </View>
    </View>
  );
  // Footer fixe en bas du BottomSheet via footerComponent
  const renderFooter = (footerProps) => (
    <BottomSheetFooter {...footerProps} bottomInset={0}>
      <Animated.View style={[styles.footer, animatedFooterStyle]}>
        <TouchableOpacity
          style={styles.button}
          onPress={onStop}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Arrêter</Text>
        </TouchableOpacity>
      </Animated.View>
    </BottomSheetFooter>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      index={0}
      onAnimate={(_, toIndex) => {
        animatedIndex.value = withSpring(toIndex);
      }}
      footerComponent={renderFooter}
      handleComponent={renderHeader}
    >
      <BottomSheetView>
        <View style={styles.content}>
          <Text style={styles.title}>Navigation en cours...</Text>
          <Text style={styles.subtitle}>
            Vous pouvez reprendre ou arrêter la navigation.
          </Text>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
  },
  footer: {
    width: "100%",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#3498db",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  arrivalTime: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  remainingTime: {
    fontSize: 14,
    color: "#666",
  },
  headerRight: {
    position: "absolute",
    right: 16,
    alignItems: "flex-end",
  },
  distance: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
});

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { formatElapsedTime } from "../../../utils/Utils";
import IconComponent from "../../Icons";
const OptionBottomSheet = ({
  visible,
  onRecenterPress,
  remainingTimeInSeconds,
}) => {
  const translateY = useSharedValue(300);

  React.useEffect(() => {
    translateY.value = visible
      ? withSpring(0, { damping: 20 })
      : withSpring(300, { damping: 20 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

 

  return (
    <Animated.View style={[styles.bottomSheet, animatedStyle]}>
      <Pressable onPress={onRecenterPress} style={styles.recenterButton}>
        {/* Icone MaterialIcons à la place du logo */}
        <IconComponent icon="gps-fixed" library="MaterialIcons" size={36} color="black" style={styles.icon} />
        {/* <MaterialIcons
          name="gps-fixed"
          size={36}
          color="#fff"
          style={styles.icon}
        /> */}
        <View style={styles.textContainer}>
          <Text style={styles.recenterText}>Recentrer</Text>
          <Text style={styles.timeText}>
            {formatElapsedTime(remainingTimeInSeconds)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default OptionBottomSheet;

const styles = StyleSheet.create({
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 100,
    backgroundColor: "#d8d7cd",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
    justifyContent: "center",
  },
  recenterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flexDirection: "column",
  },
  recenterText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
  },
  timeText: {
    color: "gray",
    fontSize: 14,
    marginTop: 4,
  },
});

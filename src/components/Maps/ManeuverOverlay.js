import React from "react";
import { View, Text, Pressable } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Animated from "react-native-reanimated";
import ManeuverView from "../ManeuverView";
import * as utils from "../../utils/Utils";

const ManeuverOverlay = ({
  currentInstruction,
  distance,
  arrivalTimeStr,
  remainingTimeInSeconds,
  infoTravelAnimatedStyle,
  handleSheetClose,
}) => {
  return (
    <View
      className="absolute top-0 left-0 right-0 z-10 h-full"
      pointerEvents="box-none"
    >
      <ManeuverView
        step={currentInstruction}
        fontFamily={"Akkurat-Light"}
        fontFamilyBold={"Akkurat-Bold"}
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          {
            display: "flex",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
            padding: 20,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 4,
            zIndex: 10,
          },
          infoTravelAnimatedStyle,
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "black" }}></Text>
          <Text style={{ color: "black" }}>
            {utils.formatDistance(distance)}
          </Text>
          <Text style={{ color: "black", fontWeight: "bold", fontSize: 25 }}>
            {arrivalTimeStr}
          </Text>
          <Text style={{ color: "black" }}>
            {utils.formatElapsedTime(remainingTimeInSeconds)}
          </Text>
          <Pressable
            style={{ borderRadius: 40, backgroundColor: "lightgray" }}
            onPress={handleSheetClose}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              style={{ color: "white", marginLeft: 0, padding: 2 }}
              size={20}
            />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

export default ManeuverOverlay;

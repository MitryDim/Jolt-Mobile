import React, { useRef } from "react";
import { View, Text, Pressable } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import ManeuverView from "../ManeuverView";
import * as utils from "../../utils/Utils";
import NavigationBottomSheet from "./BottomSheet/NavigateBottomSheet";

const ManeuverOverlay = ({
  currentInstruction,
  distance,
  arrivalTimeStr,
  remainingTimeInSeconds,
  handleSheetClose,
}) => {
  const snapPoints = ["15%", "40%"];
  const bottomSheetRef = useRef(null);

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
      <NavigationBottomSheet
        currentInstruction={currentInstruction}
        distance={distance}
        arrivalTimeStr={arrivalTimeStr}
        remainingTimeInSeconds={remainingTimeInSeconds}
        onStop={() => {
          // Action pour arrêter la navigation
        }}
      />
    </View>
  );
};

export default ManeuverOverlay;

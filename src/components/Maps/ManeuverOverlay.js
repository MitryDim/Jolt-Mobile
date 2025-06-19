import React, { useRef } from "react";
import { View, Text, Pressable } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import ManeuverView from "../ManeuverView";
import * as utils from "../../utils/Utils"; 
const ManeuverOverlay = ({
  currentInstruction,
  distance,
  arrivalTimeStr,
  remainingTimeInSeconds,
  handleSheetClose,
}) => { 
  return (
  
      <ManeuverView
        step={currentInstruction}
        fontFamily={"Akkurat-Light"}
        fontFamilyBold={"Akkurat-Bold"}
      />

  );
};

export default ManeuverOverlay;

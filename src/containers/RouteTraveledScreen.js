import { View, Text } from "react-native";
import React from "react";
import TraveledCards from "../components/RouteTraveled/TraveledCards";
import { SafeAreaView } from "react-native-safe-area-context";

const RouteTraveledScreen = () => {
  const props = {
    start: "Start",
    end: "End",
  };

  return (
    <SafeAreaView className="flex justify-center items-center mb-[60px]">
      <Text className="mt-4 text-base text-center font-bold">
        Route Traveled Screen
      </Text>
      <TraveledCards props={props} />
    </SafeAreaView>
  );
};

export default RouteTraveledScreen;

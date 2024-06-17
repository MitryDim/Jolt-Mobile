import { View, Text, FlatList } from "react-native";
import React from "react";
import TraveledCards from "../components/RouteTraveled/TraveledCards";
import { SafeAreaView } from "react-native-safe-area-context";
import items from "../Data/traveled";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const RouteTraveledScreen = () => {
  console.log(items);
  return (
    <SafeAreaView style={{ flex: 1, marginBottom: "60px" }}>
      <Text className="mt-4 text-base text-center font-bold">
        Route Traveled Screen
      </Text>
      <GestureHandlerRootView className="flex">
        <FlatList
          className="flex"
          data={items}
          renderItem={({ item }) => <TraveledCards data={item} />}
          keyExtractor={(item) => item.id}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default RouteTraveledScreen;

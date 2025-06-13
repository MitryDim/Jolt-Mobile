import { View, Text, FlatList } from "react-native";
import React from "react";
import TraveledCards from "../components/RouteTraveled/TraveledCards";
import { SafeAreaView } from "react-native";
import items from "../Data/traveled";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Separator from "../components/Separator";
const RouteTraveledScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, marginBottom: "60px" }}>
      <Text className="mt-4 text-xl text-center font-bold">Route Traveled</Text>
      <Separator />
      <GestureHandlerRootView>
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <TraveledCards width={"100%"} data={item} />
          )}
          keyExtractor={(item) => item.id}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default RouteTraveledScreen;

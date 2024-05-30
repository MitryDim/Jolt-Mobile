import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RouteTraveledScreen from "../../../containers/RouteTraveledScreen";
import TrackingDetailsScreen from "../../RouteTraveled/testmap";
import { View, Text, StyleSheet, ScrollView } from "react-native";
const Stack = createNativeStackNavigator();

function RouteTraveledNavigator() {
  return (
    <Stack.Navigator initialRouteName="TravelScreen">
      <Stack.Screen
        name="TravelScreen"
        component={RouteTraveledScreen}
        options={{
          title: "Ride",
        }}
      />
      <Stack.Screen
        name="TrackingDetailsScreen"
        component={TrackingDetailsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default RouteTraveledNavigator;

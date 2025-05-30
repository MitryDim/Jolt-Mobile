import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RouteTraveledScreen from "../../../containers/RouteTraveledScreen";
import TrackingDetailsScreen from "../../RouteTraveled/testmap";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { cardStyleInterpolator } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
const Stack = createNativeStackNavigator();

function RouteTraveledNavigator() {
  return (
    <Stack.Navigator initialRouteName="TravelScreen">
      <Stack.Screen
        name="TravelScreen"
        component={RouteTraveledScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="TrackingDetailsScreen"
        component={TrackingDetailsScreen}
        options={({ navigation }) => ({
          headerLeft: () => (
            <View>
              <Text onPress={() => navigation.goBack()}>Fermer</Text>
            </View>
          ),
          headerTitleAlign: "center",
          headerShown: true,
          animation: "slide_from_bottom",
          presentation: "fullScreenModal",
          navigationBarColor: "#FFFFFF",
        })}
      />
    </Stack.Navigator>
  );
}

export default RouteTraveledNavigator;

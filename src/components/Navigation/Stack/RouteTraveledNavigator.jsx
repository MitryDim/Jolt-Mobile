import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RouteTraveledScreen from "../../../containers/RouteTraveledScreen";
import TrackingDetailsScreen from "../../RouteTraveled/TrackingDetailsScreen";
import { HeaderBackButton } from "@react-navigation/elements";
import MyTripsScreen from "../../../containers/MyTripsScreen";
const Stack = createNativeStackNavigator();

function RouteTraveledNavigator({ navigation }) {
  return (
    <Stack.Navigator initialRouteName="TravelScreen">
      <Stack.Screen
        name="TravelScreen"
        options={{
          headerShown: false,
          animation: "slide_from_right",
          presentation: "card",
          navigationBarColor: "#FFFFFF",
        }}
        component={RouteTraveledScreen}
      />

      <Stack.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{
          headerShown: false,
          animation: "slide_from_right",
          presentation: "card",
          navigationBarColor: "#FFFFFF",
        }}
      />
      <Stack.Screen
        name="TrackingDetailsScreen"
        component={TrackingDetailsScreen}
        options={({ navigation }) => ({
          headerLeft: () => (
            <HeaderBackButton
              title="Fermer"
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            />
          ),
          headerTitleAlign: "center",
          headerShown: true,
          title: "Détails du trajet",
          animation: "slide_from_bottom",
          presentation: "fullScreenModal",
          navigationBarColor: "#FFFFFF",
        })}
      />
    </Stack.Navigator>
  );
}

export default RouteTraveledNavigator;

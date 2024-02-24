import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RouteTraveledScreen from "../../../containers/RouteTraveledScreen";
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
    </Stack.Navigator>
  );
}

export default RouteTraveledNavigator;

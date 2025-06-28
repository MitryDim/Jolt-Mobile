import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../../../containers/HomeScreen";
import MaintainsScreen from "../../../containers/MaintainsScreen";
import AddScooterForm from "../../AddScooter";
import { HeaderBackButton } from "@react-navigation/elements";
import TrackingDetailsScreen from "../../RouteTraveled/testmap";
import VehicleDetailScreen from "../../../containers/VehicleDetailScreen";
const Stack = createNativeStackNavigator();

function HomeNavigator() {
  const config = {
    animation: "spring",
    config: {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  };

  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      options={{ navigationBarColor: "#FFFFFF", navigationBarHidden: true }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown: false,
          animation: "slide_from_right",
          presentation: "card",
          navigationBarColor: "#FFFFFF", 
        }}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddScooterForm}
        options={({ navigation }) => ({
          navigationBarColor: "#FFFFFF",
          headerShown: true,
          headerTitle: "Ajouter un Véhicule",
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: false,
          presentation: "fullScreenModal",
 
          headerLeft: (props) => (
            <HeaderBackButton
              title="Fermer"
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            />
          ),
        })}
      />

      <Stack.Screen
        name="Maintains"
        component={MaintainsScreen}
        options={({ navigation }) => ({
          navigationBarColor: "#FFFFFF",
          headerShown: true,
          headerTitle: "Mes Entretiens",
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: false,
          presentation: "card", 
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
        })}
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
          animation: "slide_from_bottom",
          presentation: "fullScreenModal",
          navigationBarColor: "#FFFFFF", 
        })}
      />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
    </Stack.Navigator>
  );
}

export default HomeNavigator;

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../../../containers/HomeScreen";
import SplashScreen from "../../../containers/SplashScreen";
import MaintainsScreen from "../../../containers/MaintainsScreen";
import { Button } from "react-native";
import AddScooterForm from "../../AddScooter"; 
import { HeaderBackButton } from "@react-navigation/elements";
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
    <Stack.Navigator initialRouteName="SplashScreen">
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          navigationBarColor: "#FFFFFF",
          headerShown: false,
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
          headerTitle: "Mes Entretients",
          headerBackButtonDisplayMode: "minimal",
          headerTransparent: false,
          presentation: "fullScreenModal",
          headerLeft: () => (
            <Button title="Fermer" onPress={() => navigation.goBack()} />
          ),
        })}
      />
    </Stack.Navigator>
  );
}

export default HomeNavigator;

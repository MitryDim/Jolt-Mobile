import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../../containers/HomeScreen";
import SplashScreen from "../../../containers/SplashScreen";
const Stack = createNativeStackNavigator();


function NavigateNavigator() {
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
        name="ChoiceAddress"
        component={HomeScreen}
        options={{ navigationBarColor: "#FFFFFF", headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default NavigateNavigator;
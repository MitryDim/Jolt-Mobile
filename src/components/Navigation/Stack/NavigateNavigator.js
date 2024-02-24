import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChoiceAddressScreen from "../../../containers/ChoiceAddressScreen";
const Stack = createNativeStackNavigator();


function NavigateNavigator() {
  return (
    <Stack.Navigator initialRouteName="ChoiceAddress">
      <Stack.Screen
        name="ChoiceAddress"
        component={ChoiceAddressScreen}
        options={{ navigationBarColor: "#FFFFFF", headerShown: false }}
      />
    </Stack.Navigator>
    // ChoiceItinerary 
    // Navigation
  );
}

export default NavigateNavigator;